import { describe, expect, it } from "vitest";
import {
  BREAK_MINUTES,
  FOCUS_MINUTES,
  FOCUS_XP_PER_MINUTE,
  focusXpForMinutes,
  formatRemaining,
} from "../lib/focus";
import { computeXp, POINTS } from "../lib/xp";

describe("focus lib", () => {
  it("configura pomodoro 25/5", () => {
    expect(FOCUS_MINUTES).toBe(25);
    expect(BREAK_MINUTES).toBe(5);
  });
  it("converte XP por minuto de foco", () => {
    expect(FOCUS_XP_PER_MINUTE).toBe(5);
    expect(focusXpForMinutes(25)).toBe(125);
    expect(focusXpForMinutes(0)).toBe(0);
    expect(focusXpForMinutes(-10)).toBe(0);
  });
  it("formata tempo restante", () => {
    expect(formatRemaining(1500)).toBe("25:00");
    expect(formatRemaining(59)).toBe("00:59");
    expect(formatRemaining(-5)).toBe("00:00");
  });
});

describe("XP de foco no total", () => {
  it("soma os minutos de foco ao XP total", () => {
    expect(computeXp({ correctCount: 1, runs: 0, masteredModules: 0, focusMinutes: 10 })).toBe(
      10 + 50
    );
    expect(POINTS.focus).toBe(5);
  });
});
