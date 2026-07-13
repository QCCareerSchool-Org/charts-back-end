export const lastMonday = (): Date => {
  const date = new Date();
  date.setDate(date.getDate() - date.getDay() + 1);
  date.setHours(0, 0, 0, 0);
  return date;
};
