import { pool } from '../../pool';
import { School } from '../../schema';

type QuarterlyResult = Array<{ new: number; returning: number; y: number; q: number }>;

export const getNewVsReturningQuarterlyData = async (start: Date, school?: School): Promise<QuarterlyResult> => {
  const connection = await (await pool).getConnection();
  try {
    if (school) {
      return await connection.query(sqlOneSchool, [ start, school, school, start, school ]);
    }
    return await connection.query(sqlAllSchools, [ start, start ]);

  } finally {
    connection.release();
  }
};

const sqlAllSchools = `
SELECT
  SUM(CASE WHEN existing_student = 1 THEN 1 ELSE 0 END) \`returning\`,
  SUM(CASE WHEN existing_student = 0 THEN 1 ELSE 0 END) \`new\`,
  y, q
FROM (
  (
    SELECT 0 AS existing_student, YEAR(e.start_time) y, QUARTER(e.start_time) q
    FROM general.enrollments e
    LEFT JOIN general.enrollment_courses c ON c.enrollment_id = e.id
    WHERE NOT e.success = 0 AND e.start_time >= ? AND (c.cost > c.discount OR c.cost IS NULL) AND NOT e.email_address LIKE '%@qccareerschool.com'
  )
  UNION ALL
  (
    SELECT e.existing_student, YEAR(e.created) y, QUARTER(e.created) q
    FROM enrollments.enrollments e
    LEFT JOIN enrollments.courses c USING (enrollment_id)
    WHERE hidden = 0 AND NOT e.success = 0 AND e.created >= ? AND c.base_cost - c.discount - c.secondary_discount - c.campaign_discount > 0 AND NOT e.email_address LIKE '%@qccareerschool.com'
  )
) x
GROUP BY y, q
ORDER BY y, q`;

const sqlOneSchool = `

SELECT
  SUM(CASE WHEN existing_student = 1 THEN 1 ELSE 0 END) \`returning\`,
  SUM(CASE WHEN existing_student = 0 THEN 1 ELSE 0 END) \`new\`,
  y, q
FROM (
  (
    SELECT 0 AS existing_student, YEAR(e.start_time) y, QUARTER(e.start_time) q
    FROM general.enrollments e
    LEFT JOIN general.enrollment_courses ec ON ec.enrollment_id = e.id
    LEFT JOIN general.courses c ON c.code = ec.course_code
    LEFT JOIN general.courses c2 ON c2.code = e.course_code
    WHERE NOT e.success = 0 AND e.start_time >= ? AND (ec.cost > ec.discount OR ec.cost IS NULL) AND NOT e.email_address LIKE '%@qccareerschool.com' AND (c.school_name = ? OR c2.school_name = ?)
  )
  UNION ALL
  (
    SELECT e.existing_student, YEAR(e.created) y, QUARTER(e.created) q
    FROM enrollments.enrollments e
    LEFT JOIN enrollments.courses c USING (enrollment_id)
    LEFT JOIN general.courses z ON c.course_code = z.code
    WHERE NOT e.success = 0 AND e.created >= ? AND c.base_cost - c.discount - c.secondary_discount - c.campaign_discount > 0 AND NOT e.email_address LIKE '%@qccareerschool.com' AND z.school_name = ?
  )
) x
GROUP BY y, q
ORDER BY y, q`;
