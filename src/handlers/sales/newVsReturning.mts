import type { RequestHandler } from 'express';

import { type School, validateQuery } from '#src/domain/query.mjs';
import { getNewVsReturningDailyData } from '../../db/sales/newVsReturning/getNewVsReturningDailyData.mjs';
import { getNewVsReturningMonthlyData } from '../../db/sales/newVsReturning/getNewVsReturningMonthlyData.mjs';
import { getNewVsReturningQuarterlyData } from '../../db/sales/newVsReturning/getNewVsReturningQuarterlyData.mjs';
import { getNewVsReturningWeeklyData } from '../../db/sales/newVsReturning/getNewVsReturningWeeklyData.mjs';
import { getDateOfISOWeek } from '../../lib/getDateOfISOWeek.mjs';
import { lastMonday } from '../../lib/lastMonday.mjs';
import { today } from '../../lib/today.mjs';

export const newVsReturning: RequestHandler = async (req, res) => {
  const queryResult = await validateQuery(req.query);
  if (!queryResult.success) {
    res.status(400).send(queryResult.error);
    return;
  }

  const query = queryResult.value;

  switch (query.period) {
    case 'daily':
      res.send(await newVsReturningDaily(query.school));
      break;
    case 'weekly':
      res.send(await newVsReturningWeekly(query.school));
      break;
    case 'monthly':
      res.send(await newVsReturningMonthly(query.school));
      break;
    case 'quarterly':
      res.send(await newVsReturningQuarterly(query.school));
      break;
    default:
      res.status(400).send('Unrecognized period');
  }
};

type Results = { date: Date; new: number; returning: number }[];
type QuarterlyResults = { label: string; new: number; returning: number }[];

const newVsReturningDaily = async (school?: School): Promise<Results> => {
  // start 8 weeks ago
  const start = today();
  start.setDate(start.getDate() - (7 * 16));

  // get the data from the database
  const data = await getNewVsReturningDailyData(start, school);

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
      result.push({ date: new Date(date), new: 0, returning: 0 });
      date.setDate(date.getDate() + 1);
    }

    // add a normal row
    result.push({ date: new Date(date), new: r.new, returning: r.returning });
    date.setDate(date.getDate() + 1);
  }

  return result;
};

const newVsReturningWeekly = async (school?: School): Promise<Results> => {
  // start 52 weeks from last monday
  const start = lastMonday();
  start.setDate(start.getDate() - (7 * 104)); // 104 weeks (~2 years) ago

  // get the data
  const data = await getNewVsReturningWeeklyData(start, school);

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
      result.push({ date: new Date(date), new: 0, returning: 0 });
      date.setDate(date.getDate() + 7);
    }

    // add a normal row
    result.push({ date: new Date(date), new: r.new, returning: r.returning });
    date.setDate(date.getDate() + 7);
  }

  return result;
};

const newVsReturningMonthly = async (school?: School): Promise<Results> => {
  // start 2012-06-01
  const start = new Date(2012, 6);

  // get the data
  const data = await getNewVsReturningMonthlyData(start, school);

  // create the reponse
  const result: Results = [];
  const date = start;
  for (const r of data) {
    const nextDate = new Date(r.y, r.m - 1);

    // add empty rows as needed
    // eslint-disable-next-line no-unmodified-loop-condition
    while (nextDate > date) { // we have no data for this day
      result.push({ date: new Date(date), new: 0, returning: 0 });
      date.setMonth(date.getMonth() + 1);
    }

    // add a normal row
    result.push({ date: new Date(date), new: r.new, returning: r.returning });
    date.setMonth(date.getMonth() + 1);
  }

  return result;
};

const newVsReturningQuarterly = async (school?: School): Promise<QuarterlyResults> => {
  // start 2012-Q3
  const start = new Date(2012, 9);

  // get the data
  const data = await getNewVsReturningQuarterlyData(start, school);

  // create the reponse
  const result: QuarterlyResults = [];
  const date = start;
  for (const r of data) {
    const nextDate = new Date(r.y, (r.q - 1) * 3);

    // add empty rows as needed
    // eslint-disable-next-line no-unmodified-loop-condition
    while (nextDate > date) { // we have no data for this day
      result.push({ label: `${date.getFullYear()}-Q${(date.getMonth() / 3) + 1}`, new: 0, returning: 0 });
      date.setMonth(date.getMonth() + 3);
    }

    // add a normal row
    result.push({ label: `${date.getFullYear()}-Q${(date.getMonth() / 3) + 1}`, new: r.new, returning: r.returning });
    date.setMonth(date.getMonth() + 3);
  }

  return result;
};
