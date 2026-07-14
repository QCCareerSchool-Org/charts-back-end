import { today } from './today.mjs';

export const lastMonday = (): Date => {
  const date = today();
  date.setDate(date.getDate() - date.getDay() + 1);
  return date;
};
