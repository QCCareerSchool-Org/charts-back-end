import { failure, type Result, success } from 'generic-result-type';
import { z } from 'zod';

const periods = [ 'daily', 'weekly', 'monthly', 'quarterly' ] as const;
const schools = [ 'QC Makeup Academy', 'QC Event School', 'QC Design School', 'QC Pet Studies', 'QC Wellness Studies', 'Winghill Writing School' ] as const;

export type Period = typeof periods[number];
export type School = typeof schools[number];

export interface Query {
  period: Period;
  school?: School;
};

const overviewSchema: z.ZodType<Query> = z.object({
  period: z.enum(periods),
  school: z.enum(schools).optional(),
});

export const validateQuery = async (body: Record<string, unknown>): Promise<Result<Query>> => {
  const result = await overviewSchema.safeParseAsync(body);
  if (result.success) {
    return success(result.data);
  }
  return failure(Error(z.treeifyError(result.error).errors.join(',')));
};
