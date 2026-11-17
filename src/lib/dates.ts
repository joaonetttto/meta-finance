/** Calendar dates are local days, not UTC instants. Ignore any time suffix. */
export function parseLocalDate(str: string): Date {
  const match = /^(\d{4})-(\d{2})-(\d{2})(?:T.*)?$/.exec(str);
  if (!match) return new Date(NaN);
  const year = Number(match[1]);
  const month = Number(match[2]) - 1;
  const day = Number(match[3]);
  const date = new Date(0);
  date.setFullYear(year, month, day);
  date.setHours(0, 0, 0, 0);
  if (date.getFullYear() !== year || date.getMonth() !== month || date.getDate() !== day) {
    return new Date(NaN);
  }
  return date;
}

export function formatLocalDate(d: Date): string {
  if (Number.isNaN(d.getTime())) throw new RangeError("Invalid date");
  return `${String(d.getFullYear()).padStart(4, "0")}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function monthKey(str: string): string {
  return formatLocalDate(parseLocalDate(str)).slice(0, 7);
}