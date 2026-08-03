import { describe, expect, it } from "vitest";
import { computeCognitiveProfile, type CognitiveLog } from "../lib/cognitive";

function log(
  exerciseId: string,
  isCorrect: boolean,
  timeTakenMs: number,
  type: string | null = "dissertativa"
): CognitiveLog {
  return { exerciseId, type, isCorrect, timeTakenMs, errorType: null };
}

describe("computeCognitiveProfile", () => {
  it("sem logs retorna perfil neutro e nível inicial", () => {
    const p = computeCognitiveProfile([]);
    expect(p.level).toBe("inicial");
    expect(p.sampleSize).toBe(0);
    expect(p.feedback.length).toBeGreaterThan(0);
  });

  it("100% de acerto rápido e consistente gera nível consistente", () => {
    const logs = [
      log("e1", true, 10000, "preenchimento"),
      log("e2", true, 12000, "preenchimento"),
      log("e3", true, 11000, "dissertativa"),
      log("e4", true, 10500, "fala"),
    ];
    const p = computeCognitiveProfile(logs);
    expect(p.accuracy).toBe(100);
    expect(p.speed).toBeGreaterThanOrEqual(60);
    expect(p.logic).toBe(100);
    expect(p.interpretation).toBe(100);
    expect(p.level).toBe("consistente");
  });

  it("todos os erros geram precisão 0 e nível inicial", () => {
    const p = computeCognitiveProfile([
      log("e1", false, 50000),
      log("e2", false, 60000),
      log("e3", false, 55000),
    ]);
    expect(p.accuracy).toBe(0);
    expect(p.level).toBe("inicial");
    expect(p.feedback.some((f) => f.includes("precisão"))).toBe(true);
  });

  it("refazer e acertar melhora a memória", () => {
    const p = computeCognitiveProfile([
      log("e1", false, 30000),
      log("e1", true, 25000),
      log("e2", true, 20000),
    ]);
    expect(p.memory).toBe(100);
  });

  it("acerto lento demais derruba a velocidade", () => {
    const p = computeCognitiveProfile([log("e1", true, 150_000)]);
    expect(p.speed).toBe(0);
  });

  it("sem dados de um tipo usa a precisão como proxy", () => {
    const p = computeCognitiveProfile([
      log("e1", true, 20000, "multipla_escolha"),
      log("e2", false, 25000, "multipla_escolha"),
    ]);
    expect(p.logic).toBe(50);
    expect(p.interpretation).toBe(50);
  });
});
