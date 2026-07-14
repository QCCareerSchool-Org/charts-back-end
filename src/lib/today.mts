export const today = (): Date => {
  const utcDate = new Date();
  utcDate.setUTCHours(0, 0, 0, 0);

  const formatter = new Intl.DateTimeFormat('en-US', { timeZone: 'America/Toronto', timeZoneName: 'shortOffset' });
  const offsetString = formatter.formatToParts(utcDate).find(p => p.type === 'timeZoneName')?.value ?? 'GMT';

  // e.g., 'GMT-4' or 'GMT-5'
  const match = /GMT([+-]\d+)/u.exec(offsetString);
  const offsetHours = match?.[1] ? parseInt(match[1], 10) : 0;
  return new Date(utcDate.getTime() - (offsetHours * 60 * 60 * 1000));
};
