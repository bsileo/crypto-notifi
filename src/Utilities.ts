import { AlertDay } from '@/notifi_types';
export const prettyNumber = (val: number): string => {
  let res = "";
  if (val < 0.01 && val != 0) {
    res = val.toFixed(8);
  } else {
    //var commas = val.toLocaleString("en-US");
    const rounded = parseFloat(val.toFixed(2));
    res = rounded.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }
  return res;
};

export function roundToTwo(num: number): number {
  const val = num * 100;
  const res = Math.round(val);
  return res / 100;
}

export function nextDay(date: Date, day: AlertDay): Date {
  const result = new Date(date.getTime());
  const offset = ((day + 6 - date.getDay()) % 7) + 1;
  result.setDate(date.getDate() + offset);
  return result;
};