export const today = (): Date => {
  const torontoStr = new Date().toLocaleString('en-US', { timeZone: 'America/Toronto' });
  const date = new Date(torontoStr);
  date.setHours(0, 0, 0, 0);

  return date;
};
