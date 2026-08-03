import { describe, expect, it } from "vitest";
import {
  applyRunProgress,
  isModuleMastered,
  moduleMasteryPercent,
  moduleStatus,
} from "../lib/progression";

describe("applyRunProgress — só avança com 100%", () => {
  it("100% de acerto dá domínio completo", () => {
    expect(applyRunProgress(0, 3, 3)).toBe(100);
  });

  it("menos de 100% não dá domínio", () => {
    expect(applyRunProgress(0, 2, 3)).toBe(67);
    expect(applyRunProgress(0, 0, 3)).toBe(0);
  });

  it("domínio é monotônico: nunca regride depois de 100%", () => {
    expect(applyRunProgress(100, 1, 3)).toBe(100);
    expect(applyRunProgress(100, 0, 3)).toBe(100);
  });

  it("rodada perfeita depois de parcial eleva o domínio a 100%", () => {
    expect(applyRunProgress(50, 3, 3)).toBe(100);
  });

  it("lista vazia não altera o estado", () => {
    expect(applyRunProgress(42, 0, 0)).toBe(42);
  });
});

describe("isModuleMastered", () => {
  it("módulo só é dominado quando TODAS as micro-skills têm 100%", () => {
    expect(isModuleMastered({ a: 100, b: 100 })).toBe(true);
    expect(isModuleMastered({ a: 100, b: 67 })).toBe(false);
    expect(isModuleMastered({ a: 100 })).toBe(true);
    expect(isModuleMastered({})).toBe(false);
  });
});

describe("moduleStatus — cadeia de liberação", () => {
  it("primeiro módulo desbloqueado; próximos bloqueados até o anterior dominar", () => {
    expect(moduleStatus({ previousMastered: true, mastered: false })).toBe("em_progresso");
    expect(moduleStatus({ previousMastered: false, mastered: false })).toBe("bloqueado");
    expect(moduleStatus({ previousMastered: false, mastered: true })).toBe("bloqueado");
    expect(moduleStatus({ previousMastered: true, mastered: true })).toBe("dominado");
  });
});

describe("moduleMasteryPercent", () => {
  it("calcula a média do domínio das micro-skills", () => {
    expect(moduleMasteryPercent({ a: 100, b: 50 })).toBe(75);
    expect(moduleMasteryPercent({})).toBe(0);
  });
});
