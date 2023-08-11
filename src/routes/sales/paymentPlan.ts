import * as HttpStatus from '@qccareerschool/http-status';

import { asyncWrapper } from '../../asyncWrapper';
import { getPaymentPlanDailyData } from '../../db/sales/paymentPlan/getPaymentPlanDailyData';
import { getPaymentPlanMonthlyData } from '../../db/sales/paymentPlan/getPaymentPlanMonthlyData';
import { getPaymentPlanQuarterlyData } from '../../db/sales/paymentPlan/getPaymentPlanQuarterlyData';
import { getPaymentPlanWeeklyData } from '../../db/sales/paymentPlan/getPaymentPlanWeeklyData';
import { getDateOfISOWeek } from '../../lib/getDateOfISOWeek';
import { lastMonday } from '../../lib/lastMonday';
import { today } from '../../lib/today';
import { overviewSchema, RequestBody, School } from '../../schema';

export const paymentPlan = asyncWrapper(async (req, res) => {
  // validate the request
  let query: RequestBody;
  try {
    query = await overviewSchema.validate(req.query);
  } catch (err) {
    if (err instanceof Error) {
      throw new HttpStatus.BadRequest(err.message);
    } else if (typeof err === 'string') {
      throw new HttpStatus.BadRequest(err);
    } else {
      throw new HttpStatus.BadRequest('unknown error');
    }
  }

  // send the response
  switch (query.period) {
    case 'daily':
      res.send(await paymentPlanDaily(query.school));
      break;
    case 'weekly':
      res.send(await paymentPlanWeekly(query.school));
      break;
    case 'monthly':
      res.send(await paymentPlanMonthly(query.school));
      break;
    case 'quarterly':
      res.send(await paymentPlanQuarterly(query.school));
      break;
    default:
      throw new HttpStatus.InternalServerError('Unrecognized period');
  }
});

type Results = Array<{ date: Date; full: number; part: number }>;
type QuarterlyResults = Array<{ label: string; full: number; part: number }>;

const paymentPlanDaily = async (school?: School): Promise<Results> => {
  // start 8 weeks ago
  const start = today();
  start.setDate(start.getDate() - (7 * 16));

  // get the data from the database
  const data = await getPaymentPlanDailyData(start, school);

  // create the reponse
  const result: Results = [];
  const date = start;
  for (const r of data) {
    // add empty rows as needed
    while (
      r.y > date.getFullYear() ||
      (r.y === date.getFullYear() && r.m > date.getMonth() + 1) ||
      (r.y === date.getFullYear() && r.m === date.getMonth() + 1 && r.d > date.getDate())
    ) { // we have no data for this day
      result.push({ date: new Date(date), full: 0, part: 0 });
      date.setDate(date.getDate() + 1);
    }

    // add a normal row
    result.push({ date: new Date(date), full: r.full, part: r.part });
    date.setDate(date.getDate() + 1);
  }

  return result;
};

const paymentPlanWeekly = async (school?: School): Promise<Results> => {
  // start 52 weeks from last monday
  const start = lastMonday();
  start.setDate(start.getDate() - (7 * 104)); // 104 weeks (~2 years) ago

  // get the data
  const data = await getPaymentPlanWeeklyData(start, school);

  // create the reponse
  const result: Results = [];
  const date = start;
  for (const r of data) {
    const year = parseInt(r.w.toString().substring(0, 4), 10);
    const week = parseInt(r.w.toString().substring(4), 10);
    const nextDate = getDateOfISOWeek(year, week);

    // add empty rows as needed
    // eslint-disable-next-line no-unmodified-loop-condition
    while (nextDate > date) { // we have no data for this day
      result.push({ date: new Date(date), full: 0, part: 0 });
      date.setDate(date.getDate() + 7);
    }

    // add a normal row
    result.push({ date: new Date(date), full: r.full, part: r.part });
    date.setDate(date.getDate() + 7);
  }

  return result;
};

const paymentPlanMonthly = async (school?: School): Promise<Results> => {
  // start 2012-06-01
  const start = new Date(2012, 6);

  // get the data
  const data = await getPaymentPlanMonthlyData(start, school);

  // create the reponse
  const result: Results = [];
  const date = start;
  for (const r of data) {
    const nextDate = new Date(r.y, r.m - 1);

    // add empty rows as needed
    // eslint-disable-next-line no-unmodified-loop-condition
    while (nextDate > date) { // we have no data for this day
      result.push({ date: new Date(date), full: 0, part: 0 });
      date.setMonth(date.getMonth() + 1);
    }

    // add a normal row
    result.push({ date: new Date(date), full: r.full, part: r.part });
    date.setMonth(date.getMonth() + 1);
  }

  return result;
};

const paymentPlanQuarterly = async (school?: School): Promise<QuarterlyResults> => {
  // start 2012-Q3
  const start = new Date(2012, 9);

  // get the data
  const data = await getPaymentPlanQuarterlyData(start, school);

  // create the reponse
  const result: QuarterlyResults = [];
  const date = start;
  for (const r of data) {
    const nextDate = new Date(r.y, (r.q - 1) * 3);

    // add empty rows as needed
    // eslint-disable-next-line no-unmodified-loop-condition
    while (nextDate > date) { // we have no data for this day
      result.push({ label: `${date.getFullYear()}-Q${(date.getMonth() / 3) + 1}`, full: 0, part: 0 });
      date.setMonth(date.getMonth() + 3);
    }

    // add a normal row
    result.push({ label: `${date.getFullYear()}-Q${(date.getMonth() / 3) + 1}`, full: r.full, part: r.part });
    date.setMonth(date.getMonth() + 3);
  }

  return result;
};
