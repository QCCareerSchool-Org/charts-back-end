import { pool } from '../../../pool';
import { School } from '../../../schema';

type DailyResult = Array<{ count: number; y: number; m: number; d: number }>;

export const getOverviewDailyData = async (start: Date, school?: School): Promise<DailyResult> => {
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
SELECT COUNT(*) \`count\`, YEAR(e.created) y, MONTH(e.created) m, DAY(e.created) d
FROM leads.leads
WHERE e.created >= ? AND NOT e.email_address LIKE '%@qccareerschool.com'
GROUP BY y, m, d
ORDER BY y, m, d`;

const sqlOneSchool = `
SELECT COUNT(*) \`count\`, YEAR(e.created) y, MONTH(e.created) m, DAY(e.created) d
FROM leads.leads
WHERE e.created >= ? AND schoolName = ? AND NOT e.email_address LIKE '%@qccareerschool.com'
GROUP BY y, m, d
ORDER BY y, m, d`;
