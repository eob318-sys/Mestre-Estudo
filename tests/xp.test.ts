import { describe, expect, it } from "vitest";
import {
  computeXp,
  correctedErrors,
  evaluateMissions,
  levelFromXp,
  maxCorrectStreak,
  type XpLog,
} from "../lib/xp";

function log(exerciseId: string, isCorrect: boolean): XpLog {
  return { exerciseId, isCorrect, createdAt: new Date() };
}

describe("computeXp", () => {
  it("soma acertos, rodadas e módulos", () => {
    expect(computeXp({ correctCount: 10, runs: 2, masteredModules: 1 })).toBe(400);
  });
});

describe("levelFromXp", () => {
  it("nível 1 com 0 XP e progresso 0", () => {
    const l = levelFromXp(0);
    expect(l.level).toBe(1);
    expect(l.progress).toBe(0);
  });
  it("400 XP atinge o nível 3", () => {
    const l = levelFromXp(400);
    expect(l.level).toBe(3);
  });
  it("progresso dentro do nível é proporcional", () => {
    expect(levelFromXp(100).level).toBe(2);
    expect(levelFromXp(250).progress).toBe(50);
  });
});

describe("maxCorrectStreak", () => {
  it("conta a maior sequência de acertos", () => {
    expect(
      maxCorrectStreak([
        log("a", true),
        log("b", false),
        log("c", true),
        log("d", true),
        log("e", true),
      ])
    ).toBe(3);
  });
  it("lista vazia retorna 0", () => {
    expect(maxCorrectStreak([])).toBe(0);
  });
});

describe("correctedErrors", () => {
  it("conta exercícios errados e depois acertados", () => {
    expect(
      correctedErrors([
        log("e1", false),
        log("e1", true),
        log("e2", false),
        log("e2", false),
        log("e3", true),
      ])
    ).toBe(1);
  });
});

describe("evaluateMissions", () => {
  it("deriva o estado de cada missão", () => {
    const missions = evaluateMissions({
      logs: [
        log("a", true),
        log("a", false),
        log("a", true),
        log("b", true),
        log("b", true),
      ],
      exercisesDone: 5,
      masteredModules: 1,
      diagnosticDone: true,
    });
    const byId = new Map(missions.map((m) => [m.id, m]));
    expect(byId.get("primeiros_passos")?.done).toBe(true);
    expect(byId.get("dez_exercicios")?.progress).toBe(5);
    expect(byId.get("em_chamas")?.progress).toBe(3);
    expect(byId.get("persistente")?.progress).toBe(1);
    expect(byId.get("dominador")?.done).toBe(true);
    expect(byId.get("diagnosticado")?.done).toBe(true);
  });
});
