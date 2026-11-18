import { describe, it, expect } from "vitest";
import {
  calcPMT,
  calcFV,
  buildTimeline,
  calcYearsNeeded,
  buildScenarios,
  getRecommendedScenario,
} from "@/lib/projections";

describe("calcPMT / calcFV consistency", () => {
  it("calcFV(calcPMT(...)) ≈ fv with pv = 0", () => {
    const fv = 100_000;
    const rate = 0.07;
    const years = 10;
    const pmt = calcPMT(fv, rate, years, 0);
    expect(calcFV(pmt, rate, years, 0)).toBeCloseTo(fv, 2);
  });

  it("calcFV(calcPMT(...)) ≈ fv with pv > 0", () => {
    const fv = 250_000;
    const rate = 0.1;
    const years = 15;
    const pv = 20_000;
    const pmt = calcPMT(fv, rate, years, pv);
    expect(calcFV(pmt, rate, years, pv)).toBeCloseTo(fv, 2);
  });

  it("calcFV(calcPMT(...)) ≈ fv with rate = 0", () => {
    const fv = 12_000;
    const years = 2;
    const pmt = calcPMT(fv, 0, years, 0);
    expect(pmt).toBeCloseTo(500, 6);
    expect(calcFV(pmt, 0, years, 0)).toBeCloseTo(fv, 2);
  });

  it("calcPMT returns 0 when pv alone already covers the goal", () => {
    expect(calcPMT(10_000, 0.07, 5, 50_000)).toBe(0);
  });
});

describe("buildTimeline", () => {
  it("last point ≈ fv when pmt = calcPMT (pv = 0)", () => {
    const fv = 100_000;
    const rate = 0.07;
    const years = 10;
    const pmt = calcPMT(fv, rate, years, 0);
    const timeline = buildTimeline(pmt, rate, years, 0);
    const last = timeline[timeline.length - 1];
    expect(last.ano).toBe(years);
    expect(Math.abs(last.valor - fv)).toBeLessThanOrEqual(1);
  });

  it("last point ≈ fv when pmt = calcPMT (pv > 0)", () => {
    const fv = 200_000;
    const rate = 0.04;
    const years = 8;
    const pv = 30_000;
    const pmt = calcPMT(fv, rate, years, pv);
    const timeline = buildTimeline(pmt, rate, years, pv);
    const last = timeline[timeline.length - 1];
    expect(Math.abs(last.valor - fv)).toBeLessThanOrEqual(1);
  });

  it("never exceeds the goal at the final year when pmt = calcPMT", () => {
    const fv = 50_000;
    const rate = 0.1;
    const years = 5;
    const pmt = calcPMT(fv, rate, years, 0);
    const timeline = buildTimeline(pmt, rate, years, 0);
    expect(timeline[timeline.length - 1].valor).toBeLessThanOrEqual(fv + 1);
  });
});

describe("calcYearsNeeded", () => {
  it("≈ years when pmt = calcPMT(fv, rate, years)", () => {
    const fv = 100_000;
    const rate = 0.07;
    const years = 10;
    const pmt = calcPMT(fv, rate, years);
    const needed = calcYearsNeeded(fv, pmt, rate);
    expect(Math.abs(needed - years)).toBeLessThanOrEqual(1 / 12 + 1e-9);
  });

  it("returns Infinity when pmt <= 0 and pv <= 0", () => {
    expect(calcYearsNeeded(100_000, 0, 0.07)).toBe(Infinity);
    expect(calcYearsNeeded(100_000, -10, 0.07)).toBe(Infinity);
    expect(calcYearsNeeded(100_000, 0, 0)).toBe(Infinity);
  });

  it("never returns a negative value when rate = 0 and pv >= fv", () => {
    expect(calcYearsNeeded(10_000, 500, 0, 20_000)).toBe(0);
  });
});

describe("buildScenarios", () => {
  it("scenario without reduction ends with finalValue equal to the goal", () => {
    const valor = 100_000;
    const scenarios = buildScenarios(valor, 10, 0, false, false, false, 0);
    for (const s of scenarios) {
      expect(s.finalValue).toBe(valor);
    }
  });

  it("with reducedContrib the finalValue is below the goal", () => {
    const valor = 100_000;
    const scenarios = buildScenarios(valor, 10, 0, false, false, true, 0);
    for (const s of scenarios) {
      expect(s.finalValue).toBeLessThan(valor);
    }
  });

  it("delayStart uses effectiveYears = max(0.5, anos - 2)", () => {
    const long = buildScenarios(100_000, 10, 0, true, false, false, 0);
    for (const s of long) expect(s.effectiveYears).toBe(8);

    const short = buildScenarios(100_000, 2, 0, true, false, false, 0);
    for (const s of short) expect(s.effectiveYears).toBe(0.5);
  });
});

describe("getRecommendedScenario", () => {
  const base = (anos: number, aporteManual = 0) =>
    buildScenarios(100_000, anos, aporteManual, false, false, false, 0);

  it("anos <= 3 → conservador when aporteManual = 0", () => {
    expect(getRecommendedScenario(base(3), 0, 3)).toBe("conservador");
  });

  it("anos <= 10 → moderado when aporteManual = 0", () => {
    expect(getRecommendedScenario(base(10), 0, 10)).toBe("moderado");
  });

  it("anos > 10 → agressivo when aporteManual = 0", () => {
    expect(getRecommendedScenario(base(11), 0, 11)).toBe("agressivo");
  });

  it("aporte >= 90% of moderado pmt → moderado", () => {
    const anos = 10;
    const scenarios = base(anos);
    const mod = scenarios.find((s) => s.key === "moderado")!;
    const aporte = mod.pmt * 0.95;
    expect(getRecommendedScenario(base(anos, aporte), aporte, anos)).toBe("moderado");
  });

  it("aporte below 90% of moderado pmt → moderado (fallback)", () => {
    const anos = 20;
    const scenarios = base(anos);
    const mod = scenarios.find((s) => s.key === "moderado")!;
    const aporte = mod.pmt * 0.5;
    expect(getRecommendedScenario(base(anos, aporte), aporte, anos)).toBe("moderado");
  });
});
