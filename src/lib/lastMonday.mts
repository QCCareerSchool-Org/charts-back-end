import { addCalendarDays, DEFAULT_TIME_ZONE, getCalendarDateParts } from './calendarDate.mjs';
import { today } from './today.mjs';

export const lastMonday = (timeZone = DEFAULT_TIME_ZONE): Date => {
  const date = today(timeZone);
  const { year, month, day } = getCalendarDateParts(date, timeZone);
  const dayOfWeek = new Date(Date.UTC(year, month - 1, day)).getUTCDay();
  return addCalendarDays(date, dayOfWeek === 0 ? -6 : 1 - dayOfWeek, timeZone);
};
