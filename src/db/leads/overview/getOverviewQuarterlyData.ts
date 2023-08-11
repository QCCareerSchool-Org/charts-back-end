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
SELECT COUNT(*) \`count\`, YEAR(e.created) y, QUARTER(e.created) q
FROM leads.leads
WHERE e.created >= ? AND NOT e.email_address LIKE '%@qccareerschool.com'
GROUP BY y, q
ORDER BY y, q`;

const sqlOneSchool = `
SELECT COUNT(*) \`count\`, YEAR(e.created) y, QUARTER(e.created) q
FROM leads.leads
WHERE e.created >= ? AND schoolName = ? AND NOT e.email_address LIKE '%@qccareerschool.com'
GROUP BY y, q
ORDER BY y, q`;
