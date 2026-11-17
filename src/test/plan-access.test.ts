import { describe, expect, it } from "vitest";
import { canCreateGoal, canUseProjections } from "@/lib/plan-access";

describe("plan access", () => {
  it("allows three free goals but blocks the fourth", () => {
    expect(canCreateGoal("gratuito", 2)).toBe(true);
    expect(canCreateGoal("gratuito", 3)).toBe(false);
    expect(canCreateGoal("gratuito", 4)).toBe(false);
  });
  it("keeps Ouro goals unlimited", () => {
    expect(canCreateGoal("ouro", 10000)).toBe(true);
  });
  it("keeps Diamante goals unlimited", () => {
    expect(canCreateGoal("diamante", 10000)).toBe(true);
  });
  it("blocks free projections", () => {
    expect(canUseProjections("gratuito")).toBe(false);
  });
  it("allows Ouro projections", () => {
    expect(canUseProjections("ouro")).toBe(true);
  });
  it("allows Diamante projections", () => {
    expect(canUseProjections("diamante")).toBe(true);
  });
});