import { DEFAULT_TIME_ZONE, startOfDay } from './calendarDate.mjs';

export const getDateOfISOWeek = (y: number, w: number, timeZone = DEFAULT_TIME_ZONE): Date => {
  const simple = new Date(Date.UTC(y, 0, 1 + ((w - 1) * 7)));
  const dow = simple.getUTCDay();
  const ISOweekStart = simple;
  if (dow <= 4) {
    ISOweekStart.setUTCDate(simple.getUTCDate() - simple.getUTCDay() + 1);
  } else {
    ISOweekStart.setUTCDate(simple.getUTCDate() + 8 - simple.getUTCDay());
  }
  return startOfDay(
    ISOweekStart.getUTCFullYear(),
    ISOweekStart.getUTCMonth(),
    ISOweekStart.getUTCDate(),
    timeZone,
  );
};
