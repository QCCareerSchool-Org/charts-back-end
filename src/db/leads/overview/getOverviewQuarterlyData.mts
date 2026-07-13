import type { RowDataPacket } from 'mysql2';

import type { School } from '#src/domain/query.mjs';
import { pool } from '#src/pool2.mjs';

interface QuarterlyResult extends RowDataPacket {
  count: number;
  y: number;
  q: number;
};

export const getOverviewQuarterlyData = async (start: Date, school?: School): Promise<QuarterlyResult[]> => {
  await using connection = await pool.getConnection();
  if (school) {
    const [ rows ] = await connection.query<QuarterlyResult[]>(sqlOneSchool, [ start, school, school, start, school ]);
    return rows;
  }
  const [ rows ] = await connection.query<QuarterlyResult[]>(sqlAllSchools, [ start, start ]);
  return rows;
};

const sqlAllSchools = `
SELECT COUNT(*) \`count\`, YEAR(created) y, QUARTER(created) q
FROM leads.leads
WHERE created >= ? AND NOT emailAddress LIKE '%@qccareerschool.com'
GROUP BY y, q
ORDER BY y, q`;

const sqlOneSchool = `
SELECT COUNT(*) \`count\`, YEAR(created) y, QUARTER(created) q
FROM leads.leads
WHERE created >= ? AND schoolName = ? AND NOT emailAddress LIKE '%@qccareerschool.com'
GROUP BY y, q
ORDER BY y, q`;
