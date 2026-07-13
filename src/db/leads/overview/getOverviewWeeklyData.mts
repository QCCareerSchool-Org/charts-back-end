import type { RowDataPacket } from 'mysql2';

import type { School } from '#src/domain/query.mjs';
import { pool } from '#src/pool2.mjs';

interface WeeklyResult extends RowDataPacket {
  count: number;
  w: number;
};

export const getOverviewWeeklyData = async (start: Date, school?: School): Promise<WeeklyResult[]> => {
  await using connection = await pool.getConnection();
  if (school) {
    const [ rows ] = await connection.query<WeeklyResult[]>(sqlOneSchool, [ start, school, school, start, school ]);
    return rows;
  }
  const [ rows ] = await connection.query<WeeklyResult[]>(sqlAllSchools, [ start, start ]);
  return rows;
};

const sqlAllSchools = `
SELECT COUNT(*) \`count\`, YEARWEEK(created) w
FROM leads.leads
WHERE created >= ? AND NOT emailAddress LIKE '%@qccareerschool.com'
GROUP BY w
ORDER BY w`;

const sqlOneSchool = `
SELECT COUNT(*) \`count\`, YEARWEEK(created) w
FROM leads.leads
WHERE created >= ? AND schoolName = ? AND NOT emailAddress LIKE '%@qccareerschool.com'
GROUP BY w
ORDER BY w`;
