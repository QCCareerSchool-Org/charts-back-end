import { pool } from '../../pool';
import { School } from '../../schema';

type DailyResult = Array<{ full: number; part: number; y: number; m: number; d: number }>;

export const getPaymentPlanDailyData = async (start: Date, school?: School): Promise<DailyResult> => {
  const connection = await (await pool).getConnection();
  try {
    if (school) {
      return await connection.query(sqlOneSchool, [ start, school, school, start, school ]) as DailyResult;
    }
    return await connection.query(sqlAllSchools, [ start, start ]) as DailyResult;

  } finally {
    connection.release();
  }
};

const sqlAllSchools = `
SELECT
  SUM(CASE WHEN payment_plan = 'full' THEN 1 ELSE 0 END) \`full\`,
  SUM(CASE WHEN payment_plan = 'part' THEN 1 ELSE 0 END) \`part\`,
  y, m, d
FROM (
  (
    SELECT e.payment_plan, YEAR(e.start_time) y, MONTH(e.start_time) m, DAY(e.start_time) d
    FROM general.enrollments e
    LEFT JOIN general.enrollment_courses c ON c.enrollment_id = e.id
    WHERE NOT e.success = 0 AND e.voided = 0 AND e.start_time >= ? AND (c.cost > c.discount OR c.cost IS NULL) AND NOT e.email_address LIKE '%@qccareerschool.com'
  )
  UNION ALL
  (
    SELECT e.payment_plan, YEAR(e.created) y, MONTH(e.created) m, DAY(e.created) d
    FROM enrollments.enrollments e
    LEFT JOIN enrollments.courses c USING (enrollment_id)
    WHERE hidden = 0 AND NOT e.success = 0 AND e.voided = 0 AND e.created >= ? AND c.base_cost - c.discount - c.secondary_discount - c.campaign_discount > 0 AND NOT e.email_address LIKE '%@qccareerschool.com'
  )
) x
GROUP BY y, m, d
ORDER BY y, m, d`;

const sqlOneSchool = `
SELECT
  SUM(CASE WHEN payment_plan = 'full' THEN 1 ELSE 0 END) \`full\`,
  SUM(CASE WHEN payment_plan = 'part' THEN 1 ELSE 0 END) \`part\`,
  y, m, d
FROM (
  (
    SELECT e.payment_plan, YEAR(e.start_time) y, MONTH(e.start_time) m, DAY(e.start_time) d
    FROM general.enrollments e
    LEFT JOIN general.enrollment_courses ec ON ec.enrollment_id = e.id
    LEFT JOIN general.courses c ON c.code = ec.course_code
    LEFT JOIN general.courses c2 ON c2.code = e.course_code
    WHERE NOT e.success = 0 AND e.voided = 0 AND e.start_time >= ? AND (ec.cost > ec.discount OR ec.cost IS NULL) AND NOT e.email_address LIKE '%@qccareerschool.com' AND (c.school_name = ? OR c2.school_name = ?)
  )
  UNION ALL
  (
    SELECT e.payment_plan, YEAR(e.created) y, MONTH(e.created) m, DAY(e.created) d
    FROM enrollments.enrollments e
    LEFT JOIN enrollments.courses c USING (enrollment_id)
    LEFT JOIN general.courses z ON c.course_code = z.code
    WHERE hidden = 0 AND NOT e.success = 0 AND e.voided = 0 AND e.created >= ? AND c.base_cost - c.discount - c.secondary_discount - c.campaign_discount > 0 AND NOT e.email_address LIKE '%@qccareerschool.com' AND (z.school_name = ?)
  )
) x
GROUP BY y, m, d
ORDER BY y, m, d`;
