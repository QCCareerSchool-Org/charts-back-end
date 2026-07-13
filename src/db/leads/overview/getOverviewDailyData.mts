import type { RowDataPacket } from 'mysql2';

import type { School } from '#src/domain/query.mjs';
import { pool } from '#src/pool2.mjs';

interface DailyResult extends RowDataPacket {
  count: number;
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
