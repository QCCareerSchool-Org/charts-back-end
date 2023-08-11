import { pool } from '../../../pool';
import { School } from '../../../schema';

type MonthlyResult = Array<{ count: number; y: number; m: number }>;

export const getOverviewMonthlyData = async (start: Date, school?: School): Promise<MonthlyResult> => {
  const connection = await (await pool).getConnection();
  try {
    if (school) {
      return await connection.query(sqlOneSchool, [ start, school, school, start, school ]) as MonthlyResult;
    }
    return await connection.query(sqlAllSchools, [ start, start ]) as MonthlyResult;

  } finally {
    connection.release();
  }
};

const sqlAllSchools = `
SELECT COUNT(*) \`count\`, YEAR(e.created) y, MONTH(e.created) m
FROM leads.leads
WHERE e.created >= ? AND NOT e.email_address LIKE '%@qccareerschool.com'
GROUP BY y, m
ORDER BY y, m`;

const sqlOneSchool = `
SELECT COUNT(*) \`count\`, YEAR(e.created) y, MONTH(e.created) m
FROM leads.leads
WHERE e.created >= ? AND schoolName = ? AND NOT e.email_address LIKE '%@qccareerschool.com'
GROUP BY y, m
ORDER BY y, m`;
