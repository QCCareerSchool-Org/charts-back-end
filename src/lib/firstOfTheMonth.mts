import { DEFAULT_TIME_ZONE, getCalendarDateParts, startOfDay } from './calendarDate.mjs';

export const firstOfTheMonth = (year?: number, month?: number, timeZone = DEFAULT_TIME_ZONE): Date => {
  if (year === undefined && month === undefined) {
    const current = getCalendarDateParts(new Date(), timeZone);
    return startOfDay(current.year, current.month - 1, 1, timeZone);
  }
  if (year === undefined || month === undefined) {
    throw Error('Both year and month are required');
  }
  return startOfDay(year, month, 1, timeZone);
};
