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
SELECT COUNT(*) \`count\`, YEAR(created) y, MONTH(created) m, DAY(created) d
FROM leads.leads
WHERE created >= ? AND NOT emailAddress LIKE '%@qccareerschool.com'
GROUP BY y, m, d
ORDER BY y, m, d`;

const sqlOneSchool = `
SELECT COUNT(*) \`count\`, YEAR(created) y, MONTH(created) m, DAY(created) d
FROM leads.leads
WHERE created >= ? AND schoolName = ? AND NOT emailAddress LIKE '%@qccareerschool.com'
GROUP BY y, m, d
ORDER BY y, m, d`;
