import type { RowDataPacket } from 'mysql2';

import type { School } from '#src/domain/query.mjs';
import { pool } from '#src/pool.mjs';

interface DailyResult extends RowDataPacket {
  sales: number;
  y: number;
  m: number;
  d: number;
};

export const getOverviewDailyData = async (start: Date, school?: School): Promise<DailyResult[]> => {
  await using connection = await pool.getConnection();
  if (school) {
    const [ rows ] = await connection.query<DailyResult[]>(sqlOneSchool, [ start, school, school, start, school ]);
    return rows;
  }
  const [ rows ] = await connection.query<DailyResult[]>(sqlAllSchools, [ start, start ]);
  return rows;
};

const sqlAllSchools = `
SELECT COUNT(*) sales, y, m, d
FROM (
  (
    SELECT YEAR(e.start_time) y, MONTH(e.start_time) m, DAY(e.start_time) d
    FROM general.enrollments e
    LEFT JOIN general.enrollment_courses c ON c.enrollment_id = e.id
    WHERE NOT e.success = 0 AND e.voided = 0 AND e.start_time >= ? AND (c.cost > c.discount OR c.cost IS NULL) AND NOT e.email_address LIKE '%@qccareerschool.com'
  )
  UNION ALL
  (
    SELECT YEAR(e.created) y, MONTH(e.created) m, DAY(e.created) d
    FROM enrollments.enrollments e
    LEFT JOIN enrollments.courses c USING (enrollment_id)
    WHERE hidden = 0 AND NOT e.success = 0 AND e.voided = 0 AND e.created >= ? AND c.base_cost - c.discount - c.secondary_discount - c.campaign_discount > 0 AND NOT e.email_address LIKE '%@qccareerschool.com'
  )
) x
GROUP BY y, m, d
ORDER BY y, m, d`;

const sqlOneSchool = `
SELECT COUNT(*) sales, y, m, d
FROM (
  (
    SELECT YEAR(e.start_time) y, MONTH(e.start_time) m, DAY(e.start_time) d
    FROM general.enrollments e
    LEFT JOIN general.enrollment_courses ec ON ec.enrollment_id = e.id
    LEFT JOIN general.courses c ON c.code = ec.course_code
    LEFT JOIN general.courses c2 ON c2.code = e.course_code
    WHERE NOT e.success = 0 AND e.voided = 0 AND e.start_time >= ? AND (ec.cost > ec.discount OR ec.cost IS NULL) AND NOT e.email_address LIKE '%@qccareerschool.com' AND (c.school_name = ? OR c2.school_name = ?)
  )
  UNION ALL
  (
    SELECT YEAR(e.created) y, MONTH(e.created) m, DAY(e.created) d
    FROM enrollments.enrollments e
    LEFT JOIN enrollments.courses c USING (enrollment_id)
    LEFT JOIN general.courses z ON c.course_code = z.code
    WHERE hidden = 0 AND NOT e.success = 0 AND e.voided = 0 AND e.created >= ? AND c.base_cost - c.discount - c.secondary_discount - c.campaign_discount > 0 AND NOT e.email_address LIKE '%@qccareerschool.com' AND (z.school_name = ?)
  )
) x
GROUP BY y, m, d
ORDER BY y, m, d`;
