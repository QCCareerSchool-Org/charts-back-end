import { pool } from '../../../pool';
import { School } from '../../../schema';

type QuarterlyResult = Array<{ count: number; y: number; q: number }>;

export const getOverviewQuarterlyData = async (start: Date, school?: School): Promise<QuarterlyResult> => {
  const connection = await (await pool).getConnection();
  try {
    if (school) {
      return await connection.query(sqlOneSchool, [ start, school, school, start, school ]) as QuarterlyResult;
    }
    return await connection.query(sqlAllSchools, [ start, start ]) as QuarterlyResult;

  } finally {
    connection.release();
  }
};

const sqlAllSchools = `
SELECT COUNT(*) \`count\`, YEAR(created) y, QUARTER(created) q
FROM leads.leads
WHERE created >= ? AND NOT email_address LIKE '%@qccareerschool.com'
GROUP BY y, q
ORDER BY y, q`;

const sqlOneSchool = `
SELECT COUNT(*) \`count\`, YEAR(created) y, QUARTER(created) q
FROM leads.leads
WHERE created >= ? AND schoolName = ? AND NOT email_address LIKE '%@qccareerschool.com'
GROUP BY y, q
ORDER BY y, q`;
