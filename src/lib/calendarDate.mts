export const DEFAULT_TIME_ZONE = 'America/Toronto';

interface CalendarDateParts {
  year: number;
  month: number;
  day: number;
};

export const getCalendarDateParts = (date: Date, timeZone = DEFAULT_TIME_ZONE): CalendarDateParts => {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  const parts = formatter.formatToParts(date);

  const year = getNumericPart(parts, 'year');
  const month = getNumericPart(parts, 'month');
  const day = getNumericPart(parts, 'day');

  return { year, month, day };
};

export const startOfDay = (year: number, month: number, day: number, timeZone = DEFAULT_TIME_ZONE): Date => {
  const target = Date.UTC(year, month, day);

  // Calculate twice because the first estimate may be on the other side of a
  // daylight-saving transition.
  const estimate = new Date(target - getOffsetMilliseconds(new Date(target), timeZone));
  return new Date(target - getOffsetMilliseconds(estimate, timeZone));
};

export const addCalendarDays = (date: Date, days: number, timeZone = DEFAULT_TIME_ZONE): Date => {
  const parts = getCalendarDateParts(date, timeZone);
  const target = new Date(Date.UTC(parts.year, parts.month - 1, parts.day + days));
  return startOfDay(target.getUTCFullYear(), target.getUTCMonth(), target.getUTCDate(), timeZone);
};

export const addCalendarMonths = (date: Date, months: number, timeZone = DEFAULT_TIME_ZONE): Date => {
  const parts = getCalendarDateParts(date, timeZone);
  const target = new Date(Date.UTC(parts.year, parts.month - 1 + months, 1));
  return startOfDay(target.getUTCFullYear(), target.getUTCMonth(), 1, timeZone);
};

const getNumericPart = (parts: Intl.DateTimeFormatPart[], type: Intl.DateTimeFormatPartTypes): number => {
  const value = parts.find(part => part.type === type)?.value;
  if (value === undefined) {
    throw Error(`Could not find ${type} date part`);
  }
  return Number(value);
};

const getOffsetMilliseconds = (date: Date, timeZone: string): number => {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone,
    timeZoneName: 'longOffset',
  });
  const offsetName = formatter.formatToParts(date).find(part => part.type === 'timeZoneName')?.value;
  if (offsetName === undefined) {
    throw Error('Could not determine time-zone offset');
  }
  if (offsetName === 'GMT') {
    return 0;
  }

  const match = /^GMT([+-])(\d{1,2})(?::(\d{2}))?$/u.exec(offsetName);
  if (match?.[1] === undefined || match[2] === undefined) {
    throw Error(`Could not parse time-zone offset: ${offsetName}`);
  }

  const hours = Number(match[2]);
  const minutes = Number(match[3] ?? 0);
  const sign = match[1] === '-' ? -1 : 1;
  return sign * ((hours * 60) + minutes) * 60 * 1000;
};
