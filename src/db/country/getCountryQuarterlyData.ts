import { School } from '../../schema';
import { pool } from '../../pool';

type QuarterlyResult = Array<{ us: number, ca: number, gb: number, au: number, nz: number, other: number, y: number, q: number }>;

export const getCountryQuarterlyData = async (start: Date, school?: School): Promise<QuarterlyResult> => {
  const connection = await (await pool).getConnection();
  if (school) {
    return await connection.query(sqlOneSchool, [ start, school, school, start, school ]);
  } else {
    return await connection.query(sqlAllSchools, [ start, start ]);
  }
};

const sqlAllSchools = `
SELECT
	SUM(CASE WHEN country_code = 'US' THEN 1 ELSE 0 END) us,
	SUM(CASE WHEN country_code = 'CA' THEN 1 ELSE 0 END) ca,
	SUM(CASE WHEN country_code = 'GB' THEN 1 ELSE 0 END) gb,
	SUM(CASE WHEN country_code = 'AU' THEN 1 ELSE 0 END) au,
	SUM(CASE WHEN country_code = 'NZ' THEN 1 ELSE 0 END) nz,
	SUM(CASE WHEN country_code = 'US' OR country_code = 'CA' OR country_code = 'GB' OR country_code = 'AU' OR country_code = 'NZ' THEN 0 ELSE 1 END) other,
	y, q
FROM (
	(
		SELECT country_code, YEAR(e.start_time) y, QUARTER(e.start_time) q
		FROM general.enrollments e
		LEFT JOIN general.enrollment_courses c ON c.enrollment_id = e.id
		WHERE NOT e.success = 0 AND e.start_time >= ? AND (c.cost > c.discount OR c.cost IS NULL) AND NOT e.email_address LIKE '%@qccareerschool.com'
	)
	UNION ALL
	(
		SELECT country_code, YEAR(e.created) y, QUARTER(e.created) q
		FROM enrollments.enrollments e
		LEFT JOIN enrollments.courses c USING (enrollment_id)
		WHERE NOT e.success = 0 AND e.created >= ? AND c.base_cost - c.discount - c.secondary_discount - c.campaign_discount > 0 AND NOT e.email_address LIKE '%@qccareerschool.com'
	)
) x
GROUP BY y, q
ORDER BY y, q`;

const sqlOneSchool = `

SELECT
	SUM(CASE WHEN country_code = 'US' THEN 1 ELSE 0 END) us,
	SUM(CASE WHEN country_code = 'CA' THEN 1 ELSE 0 END) ca,
	SUM(CASE WHEN country_code = 'GB' THEN 1 ELSE 0 END) gb,
	SUM(CASE WHEN country_code = 'AU' THEN 1 ELSE 0 END) au,
	SUM(CASE WHEN country_code = 'NZ' THEN 1 ELSE 0 END) nz,
	SUM(CASE WHEN country_code = 'US' OR country_code = 'CA' OR country_code = 'GB' OR country_code = 'AU' OR country_code = 'NZ' THEN 0 ELSE 1 END) other,
	y, q
FROM (
	(
		SELECT country_code, YEAR(e.start_time) y, QUARTER(e.start_time) q
		FROM general.enrollments e
		LEFT JOIN general.enrollment_courses ec ON ec.enrollment_id = e.id
		LEFT JOIN general.courses c ON c.code = ec.course_code
		LEFT JOIN general.courses c2 ON c2.code = e.course_code
		WHERE NOT e.success = 0 AND e.start_time >= ? AND (ec.cost > ec.discount OR ec.cost IS NULL) AND NOT e.email_address LIKE '%@qccareerschool.com' AND (c.school_name = ? OR c2.school_name = ?)
	)
	UNION ALL
	(
		SELECT country_code, YEAR(e.created) y, QUARTER(e.created) q
		FROM enrollments.enrollments e
		LEFT JOIN enrollments.courses c USING (enrollment_id)
		LEFT JOIN general.courses z ON c.course_code = z.code
		WHERE NOT e.success = 0 AND e.created >= ? AND c.base_cost - c.discount - c.secondary_discount - c.campaign_discount > 0 AND NOT e.email_address LIKE '%@qccareerschool.com' AND z.school_name = ?
	)
) x
GROUP BY y, q
ORDER BY y, q`;
