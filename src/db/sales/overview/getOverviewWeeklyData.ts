import { pool } from '../../../pool.mjs';
import { School } from '../../../schema';

type WeeklyResult = Array<{ sales: number; w: number }>;

export const getOverviewWeeklyData = async (start: Date, school?: School): Promise<WeeklyResult> => {
  const connection = await (await pool).getConnection();
  try {
    if (school) {
      return await connection.query(sqlOneSchool, [ start, school, school, start, school ]) as WeeklyResult;
    }
    return await connection.query(sqlAllSchools, [ start, start ]) as WeeklyResult;

  } finally {
    connection.release();
  }
};

const sqlAllSchools = `
SELECT COUNT(*) sales, w
FROM (
  (
    SELECT YEARWEEK(e.start_time, 1) w
    FROM general.enrollments e
    LEFT JOIN general.enrollment_courses c ON c.enrollment_id = e.id
    WHERE NOT e.success = 0 AND e.voided = 0 AND e.start_time >= ? AND (c.cost > c.discount OR c.cost IS NULL) AND NOT e.email_address LIKE '%@qccareerschool.com'
  )
  UNION ALL
  (
    SELECT YEARWEEK(e.created, 1) w
    FROM enrollments.enrollments e
    LEFT JOIN enrollments.courses c USING (enrollment_id)
    WHERE hidden = 0 AND NOT e.success = 0 AND e.voided = 0 AND e.created >= ? AND c.base_cost - c.discount - c.secondary_discount - c.campaign_discount > 0 AND NOT e.email_address LIKE '%@qccareerschool.com'
  )
) x
GROUP BY w
ORDER BY w`;

const sqlOneSchool = `
SELECT COUNT(*) sales, w
FROM (
  (
    SELECT YEARWEEK(e.start_time, 1) w
    FROM general.enrollments e
    LEFT JOIN general.enrollment_courses ec ON ec.enrollment_id = e.id
    LEFT JOIN general.courses c ON c.code = ec.course_code
    LEFT JOIN general.courses c2 ON c2.code = e.course_code
    WHERE NOT e.success = 0 AND e.voided = 0 AND e.start_time >= ? AND (ec.cost > ec.discount OR ec.cost IS NULL) AND NOT e.email_address LIKE '%@qccareerschool.com' AND (c.school_name = ? OR c2.school_name = ?)
  )
  UNION ALL
  (
    SELECT YEARWEEK(e.created, 1) w
    FROM enrollments.enrollments e
    LEFT JOIN enrollments.courses c USING (enrollment_id)
    LEFT JOIN general.courses z ON c.course_code = z.code
    WHERE hidden = 0 AND NOT e.success = 0 AND e.voided = 0 AND e.created >= ? AND c.base_cost - c.discount - c.secondary_discount - c.campaign_discount > 0 AND NOT e.email_address LIKE '%@qccareerschool.com' AND z.school_name = ?
  )
) x
GROUP BY w
ORDER BY w`;
