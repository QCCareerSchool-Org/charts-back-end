import * as HttpStatus from '@qccareerschool/http-status';

import { asyncWrapper } from '../asyncWrapper';
import { getOverviewDailyData } from '../db/overview/getOverviewDailyData';
import { getOverviewMonthlyData } from '../db/overview/getOverviewMonthlyData';
import { getOverviewQuarterlyData } from '../db/overview/getOverviewQuarterlyData';
import { getOverviewWeeklyData } from '../db/overview/getOverviewWeeklyData';
import { getDateOfISOWeek } from '../lib/getDateOfISOWeek';
import { lastMonday } from '../lib/lastMonday';
import { today } from '../lib/today';
import { overviewSchema, RequestBody, School } from '../schema';

export const overview = asyncWrapper(async (req, res) => {
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
      res.send(await overviewDaily(query.school));
      break;
    case 'weekly':
      res.send(await overviewWeekly(query.school));
      break;
    case 'monthly':
      res.send(await overviewMonthly(query.school));
      break;
    case 'quarterly':
      res.send(await overviewQuarterly(query.school));
      break;
    default:
      throw new HttpStatus.InternalServerError('Unrecognized period');
  }
});

type Results = Array<{ date: Date; sales: number }>;
type QuarterlyResults = Array<{ label: string; sales: number }>;

const overviewDaily = async (school?: School): Promise<Results> => {
  // start 8 weeks ago
  const start = today();
  start.setDate(start.getDate() - (7 * 8));

  // get the data from the database
  const data = await getOverviewDailyData(start, school);

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
      result.push({ date: new Date(date), sales: 0 });
      date.setDate(date.getDate() + 1);
    }

    // add a normal row
    result.push({ date: new Date(date), sales: r.sales });
    date.setDate(date.getDate() + 1);
  }

  return result;
};

const overviewWeekly = async (school?: School): Promise<Results> => {
  // start 52 weeks from last monday
  const start = lastMonday();
  start.setDate(start.getDate() - (7 * 52)); // 52 weeks ago

  // get the data
  const data = await getOverviewWeeklyData(start, school);

  // create the reponse
  const result: Results = [];
  const date = start;
  for (const r of data) {
    const year = parseInt(r.w.toString().substr(0, 4), 10);
    const week = parseInt(r.w.toString().substr(4), 10);
    const nextDate = getDateOfISOWeek(year, week);

    // add empty rows as needed
    // eslint-disable-next-line no-unmodified-loop-condition
    while (nextDate > date) { // we have no data for this day
      result.push({ date: new Date(date), sales: 0 });
      date.setDate(date.getDate() + 7);
    }

    // add a normal row
    result.push({ date: new Date(date), sales: r.sales });
    date.setDate(date.getDate() + 7);
  }

  return result;
};

const overviewMonthly = async (school?: School): Promise<Results> => {
  // start 2012-06-01
  const start = new Date(2012, 6);

  // get the data
  const data = await getOverviewMonthlyData(start, school);

  // create the reponse
  const result: Results = [];
  const date = start;
  for (const r of data) {
    const nextDate = new Date(r.y, r.m - 1);

    // add empty rows as needed
    // eslint-disable-next-line no-unmodified-loop-condition
    while (nextDate > date) { // we have no data for this day
      result.push({ date: new Date(date), sales: 0 });
      date.setMonth(date.getMonth() + 1);
    }

    // add a normal row
    result.push({ date: new Date(date), sales: r.sales });
    date.setMonth(date.getMonth() + 1);
  }

  return result;
};

const overviewQuarterly = async (school?: School): Promise<QuarterlyResults> => {
  // start 2012-Q3
  const start = new Date(2012, 9);

  // get the data
  const data = await getOverviewQuarterlyData(start, school);

  // create the reponse
  const result: QuarterlyResults = [];
  const date = start;
  for (const r of data) {
    const nextDate = new Date(r.y, (r.q - 1) * 3);

    // add empty rows as needed
    // eslint-disable-next-line no-unmodified-loop-condition
    while (nextDate > date) { // we have no data for this day
      result.push({ label: `${date.getFullYear()}-Q${(date.getMonth() / 3) + 1}`, sales: 0 });
      date.setMonth(date.getMonth() + 3);
    }

    // add a normal row
    result.push({ label: `${date.getFullYear()}-Q${(date.getMonth() / 3) + 1}`, sales: r.sales });
    date.setMonth(date.getMonth() + 3);
  }

  return result;
};
