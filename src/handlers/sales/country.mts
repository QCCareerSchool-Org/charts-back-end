import type { RequestHandler } from 'express';

import type { School } from '#src/domain/query.mjs';
import { validateQuery } from '#src/domain/query.mjs';
import { getCountryDailyData } from '../../db/sales/country/getCountryDailyData.mjs';
import { getCountryMonthlyData } from '../../db/sales/country/getCountryMonthlyData.mjs';
import { getCountryQuarterlyData } from '../../db/sales/country/getCountryQuarterlyData.mjs';
import { getCountryWeeklyData } from '../../db/sales/country/getCountryWeeklyData.mjs';
import { getDateOfISOWeek } from '../../lib/getDateOfISOWeek.mjs';
import { lastMonday } from '../../lib/lastMonday.mjs';
import { today } from '../../lib/today.mjs';

export const country: RequestHandler = async (req, res) => {
  const queryResult = await validateQuery(req.query);
  if (!queryResult.success) {
    res.status(400).send(queryResult.error);
    return;
  }

  const query = queryResult.value;

  switch (query.period) {
    case 'daily':
      res.send(await countryDaily(query.school));
      break;
    case 'weekly':
      res.send(await countryWeekly(query.school));
      break;
    case 'monthly':
      res.send(await countryMonthly(query.school));
      break;
    case 'quarterly':
      res.send(await countryQuarterly(query.school));
      break;
    default:
      res.status(400).send('Unrecognized period');
  }
};

type Results = { date: Date; us: number; ca: number; gb: number; au: number; nz: number; other: number }[];
type QuarterlyResults = { label: string; us: number; ca: number; gb: number; au: number; nz: number; other: number }[];

const countryDaily = async (school?: School): Promise<Results> => {
  // start 8 weeks ago
  const start = today();
  start.setDate(start.getDate() - (7 * 16));

  // get the data from the database
  const data = await getCountryDailyData(start, school);

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
      result.push({ date: new Date(date), us: 0, ca: 0, gb: 0, au: 0, nz: 0, other: 0 });
      date.setDate(date.getDate() + 1);
    }

    // add a normal row
    result.push({ date: new Date(date), us: r.us, ca: r.ca, gb: r.gb, au: r.au, nz: r.nz, other: r.other });
    date.setDate(date.getDate() + 1);
  }

  return result;
};

const countryWeekly = async (school?: School): Promise<Results> => {
  // start 52 weeks from last monday
  const start = lastMonday();
  start.setDate(start.getDate() - (7 * 104)); // 104 weeks (~2 years) ago

  // get the data
  const data = await getCountryWeeklyData(start, school);

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
      result.push({ date: new Date(date), us: 0, ca: 0, gb: 0, au: 0, nz: 0, other: 0 });
      date.setDate(date.getDate() + 7);
    }

    // add a normal row
    result.push({ date: new Date(date), us: r.us, ca: r.ca, gb: r.gb, au: r.au, nz: r.nz, other: r.other });
    date.setDate(date.getDate() + 7);
  }

  return result;
};

const countryMonthly = async (school?: School): Promise<Results> => {
  // start 2012-06-01
  const start = new Date(2012, 6);

  // get the data
  const data = await getCountryMonthlyData(start, school);

  // create the reponse
  const result: Results = [];
  const date = start;
  for (const r of data) {
    const nextDate = new Date(r.y, r.m - 1);

    // add empty rows as needed
    // eslint-disable-next-line no-unmodified-loop-condition
    while (nextDate > date) { // we have no data for this day
      result.push({ date: new Date(date), us: 0, ca: 0, gb: 0, au: 0, nz: 0, other: 0 });
      date.setMonth(date.getMonth() + 1);
    }

    // add a normal row
    result.push({ date: new Date(date), us: r.us, ca: r.ca, gb: r.gb, au: r.au, nz: r.nz, other: r.other });
    date.setMonth(date.getMonth() + 1);
  }

  return result;
};

const countryQuarterly = async (school?: School): Promise<QuarterlyResults> => {
  // start 2012-Q3
  const start = new Date(2012, 9);

  // get the data
  const data = await getCountryQuarterlyData(start, school);

  // create the reponse
  const result: QuarterlyResults = [];
  const date = start;
  for (const r of data) {
    const nextDate = new Date(r.y, (r.q - 1) * 3);

    // add empty rows as needed
    // eslint-disable-next-line no-unmodified-loop-condition
    while (nextDate > date) { // we have no data for this day
      result.push({ label: `${date.getFullYear()}-Q${(date.getMonth() / 3) + 1}`, us: 0, ca: 0, gb: 0, au: 0, nz: 0, other: 0 });
      date.setMonth(date.getMonth() + 3);
    }

    // add a normal row
    result.push({ label: `${date.getFullYear()}-Q${(date.getMonth() / 3) + 1}`, us: r.us, ca: r.ca, gb: r.gb, au: r.au, nz: r.nz, other: r.other });
    date.setMonth(date.getMonth() + 3);
  }

  return result;
};
