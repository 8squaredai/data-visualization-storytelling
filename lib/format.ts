export type MonthRow = { month: string; orders: number };

const number = new Intl.NumberFormat("en-US");

export const formatNumber = (n: number) => number.format(n);

// "2017-11-01" → "Nov 2017". Postgres dates arrive without a time zone, so read them as UTC.
export const formatMonth = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", { month: "short", year: "numeric", timeZone: "UTC" });
