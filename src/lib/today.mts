export const today = (timeZone = 'America/Toronto') => {
  const formatter = new Intl.DateTimeFormat('en-US', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit', timeZoneName: 'longOffset' });
  const parts = formatter.formatToParts(new Date());

  const year = parts.find(p => p.type === 'year')?.value;
  const month = parts.find(p => p.type === 'month')?.value;
  const day = parts.find(p => p.type === 'day')?.value;
  const timeZoneName = parts.find(p => p.type === 'timeZoneName')?.value;

  if (year === undefined || month === undefined || day === undefined || timeZoneName === undefined) {
    throw Error('Could not find date parts');
  }

  const match = /GMT([+-]\d+)/u.exec(timeZoneName);
  if (match?.[1] === undefined) {
    throw Error('Could not determine offset');
  }

  // midnight America/Toronto time
  const localIsoString = `${year}-${month}-${day}T00:00:00.000${match[1]}:00`;

  return new Date(localIsoString);
};
