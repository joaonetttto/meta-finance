import { afterAll, describe, expect, it } from "vitest";
import { formatLocalDate, monthKey, parseLocalDate } from "@/lib/dates";

describe("local calendar dates", () => {
  it.each([
    ["2026-07-01", 2026, 6, 1],
    ["2026-07-31", 2026, 6, 31],
    ["2026-12-31", 2026, 11, 31],
    ["2027-01-01", 2027, 0, 1],
  ])("preserves the local calendar day of %s", (str, year, month, day) => {
    const date = parseLocalDate(str);
    expect(date.getFullYear()).toBe(year);
    expect(date.getMonth()).toBe(month);
    expect(date.getDate()).toBe(day);
    expect(formatLocalDate(date)).toBe(str);
    expect(monthKey(str)).toBe(str.slice(0, 7));
  });

  it.each(["2026-07-01T00:00:00", "2026-07-01T00:00:00Z", "2026-07-01T23:59:59-03:00"])("ignores the time suffix of %s", (str) => {
    expect(formatLocalDate(parseLocalDate(str))).toBe("2026-07-01");
  });

  it("serializes local late-night dates without advancing the day", () => {
    expect(formatLocalDate(new Date(2026, 11, 31, 23, 59))).toBe("2026-12-31");
  });

  it("preserves the existing numeric month rollover for installments", () => {
    expect(formatLocalDate(new Date(2026, 6, 1))).toBe("2026-07-01");
    expect(formatLocalDate(new Date(2026, 7, 1))).toBe("2026-08-01");
    expect(formatLocalDate(new Date(2026, 12, 1))).toBe("2027-01-01");
  });

  it("returns an invalid Date for malformed or impossible calendar dates", () => {
    expect(Number.isNaN(parseLocalDate("not-a-date").getTime())).toBe(true);
    expect(Number.isNaN(parseLocalDate("2026-02-30").getTime())).toBe(true);
  });
});

describe("America/Sao_Paulo regression", () => {
  const originalTZ = process.env.TZ;
  afterAll(() => {
    if (originalTZ === undefined) delete process.env.TZ;
    else process.env.TZ = originalTZ;
  });

  it("keeps July 1 in July and on day 1 in UTC-3", () => {
    process.env.TZ = "America/Sao_Paulo";
    const date = parseLocalDate("2026-07-01");
    expect(date.getMonth()).toBe(6);
    expect(date.getDate()).toBe(1);
    expect(formatLocalDate(date)).toBe("2026-07-01");
  });
});