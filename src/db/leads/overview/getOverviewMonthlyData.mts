import type { RowDataPacket } from 'mysql2';

import type { School } from '#src/domain/query.mjs';
import { pool } from '#src/pool2.mjs';

interface MonthlyResult extends RowDataPacket {
  count: number;
  y: number;
  m: number;
};

export const getOverviewMonthlyData = async (start: Date, school?: School): Promise<MonthlyResult[]> => {
  await using connection = await pool.getConnection();
  if (school) {
    const [ rows ] = await connection.query<MonthlyResult[]>(sqlOneSchool, [ start, school, school, start, school ]);
    return rows;
  }
  const [ rows ] = await connection.query<MonthlyResult[]>(sqlAllSchools, [ start, start ]);
  return rows;
};

const sqlAllSchools = `
SELECT COUNT(*) \`count\`, YEAR(created) y, MONTH(created) m
FROM leads.leads
WHERE created >= ? AND NOT emailAddress LIKE '%@qccareerschool.com'
GROUP BY y, m
ORDER BY y, m`;

const sqlOneSchool = `
SELECT COUNT(*) \`count\`, YEAR(created) y, MONTH(created) m
FROM leads.leads
WHERE created >= ? AND schoolName = ? AND NOT emailAddress LIKE '%@qccareerschool.com'
GROUP BY y, m
ORDER BY y, m`;
