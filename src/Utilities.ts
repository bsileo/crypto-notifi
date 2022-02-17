export const prettyNumber = (val: number): string => {
  let res = "";
  if (val < 0.01) {
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