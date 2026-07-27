import { DEFAULT_TIME_ZONE, getCalendarDateParts, startOfDay } from './calendarDate.mjs';

export const today = (timeZone = DEFAULT_TIME_ZONE): Date => {
  const { year, month, day } = getCalendarDateParts(new Date(), timeZone);
  return startOfDay(year, month - 1, day, timeZone);
};
