import type { RequestHandler } from 'express';

import type { School } from '#src/domain/query.mjs';
import { validateQuery } from '#src/domain/query.mjs';
import { getOverviewDailyData } from '../../db/leads/overview/getOverviewDailyData.mjs';
import { getOverviewMonthlyData } from '../../db/leads/overview/getOverviewMonthlyData.mjs';
import { getOverviewQuarterlyData } from '../../db/leads/overview/getOverviewQuarterlyData.mjs';
import { getOverviewWeeklyData } from '../../db/leads/overview/getOverviewWeeklyData.mjs';
import { getDateOfISOWeek } from '../../lib/getDateOfISOWeek.mjs';
import { lastMonday } from '../../lib/lastMonday.mjs';
import { today } from '../../lib/today.mjs';

export const overview: RequestHandler = async (req, res) => {
  const queryResult = await validateQuery(req.query);
  if (!queryResult.success) {
    res.status(400).send(queryResult.error);
    return;
  }

  const query = queryResult.value;

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
      res.status(400).send('Unrecognized period');
  }
};

type Results = { date: Date; count: number }[];
type QuarterlyResults = { label: string; count: number }[];

const overviewDaily = async (school?: School): Promise<Results> => {
  // start 8 weeks ago
  const start = today();
  start.setDate(start.getDate() - (7 * 16));

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
      result.push({ date: new Date(date), count: 0 });
      date.setDate(date.getDate() + 1);
    }

    // add a normal row
    result.push({ date: new Date(date), count: r.count });
    date.setDate(date.getDate() + 1);
  }

  return result;
};

const overviewWeekly = async (school?: School): Promise<Results> => {
  // start 52 weeks from last monday
  const start = lastMonday();
  start.setDate(start.getDate() - (7 * 104)); // 104 weeks (~2 years) ago

  // get the data
  const data = await getOverviewWeeklyData(start, school);

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
      result.push({ date: new Date(date), count: 0 });
      date.setDate(date.getDate() + 7);
    }

    // add a normal row
    result.push({ date: new Date(date), count: r.count });
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
      result.push({ date: new Date(date), count: 0 });
      date.setMonth(date.getMonth() + 1);
    }

    // add a normal row
    result.push({ date: new Date(date), count: r.count });
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
      result.push({ label: `${date.getFullYear()}-Q${(date.getMonth() / 3) + 1}`, count: 0 });
      date.setMonth(date.getMonth() + 3);
    }

    // add a normal row
    result.push({ label: `${date.getFullYear()}-Q${(date.getMonth() / 3) + 1}`, count: r.count });
    date.setMonth(date.getMonth() + 3);
  }

  return result;
};
