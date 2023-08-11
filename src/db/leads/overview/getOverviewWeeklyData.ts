import { pool } from '../../../pool';
import { School } from '../../../schema';

type WeeklyResult = Array<{ count: number; w: number }>;

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
SELECT COUNT(*) \`count\`, YEARWEEK(created) w
FROM leads.leads
WHERE created >= ? AND NOT e.email_address LIKE '%@qccareerschool.com'
GROUP BY w
ORDER BY w`;

const sqlOneSchool = `
SELECT COUNT(*) \`count\`, YEARWEEK(created) w
FROM leads.leads
WHERE created >= ? AND schoolName = ? AND NOT e.email_address LIKE '%@qccareerschool.com'
GROUP BY w
ORDER BY w`;
