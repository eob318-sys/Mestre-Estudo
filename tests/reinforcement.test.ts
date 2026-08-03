import { describe, expect, it } from "vitest";
import { buildReinforcement, dominantErrorType, type ReinforcementSkill } from "../lib/reinforcement";

const SKILL: ReinforcementSkill = {
  microSkillId: "ms1",
  name: "Soma de frações",
  moduleId: "m1",
  moduleTitle: "Frações",
  subjectSlug: "matematica",
};

describe("dominantErrorType", () => {
  it("retorna o tipo mais frequente", () => {
    expect(dominantErrorType(["erro_calculo", "erro_calculo", "distracao"])).toBe(
      "erro_calculo"
    );
  });
  it("ignora nulos e retorna null sem erros", () => {
    expect(dominantErrorType([null, null])).toBeNull();
    expect(dominantErrorType([])).toBeNull();
  });
});

describe("buildReinforcement", () => {
  it("agrupa erros por skill e ordena por contagem", () => {
    const skillByExercise = new Map([
      ["e1", SKILL],
      ["e2", { ...SKILL, microSkillId: "ms2", name: "Leitura" }],
    ]);
    const suggestions = buildReinforcement(
      [
        { exerciseId: "e1", isCorrect: false, errorType: "erro_calculo" },
        { exerciseId: "e1", isCorrect: false, errorType: "erro_calculo" },
        { exerciseId: "e2", isCorrect: false, errorType: "gramatical" },
        { exerciseId: "e1", isCorrect: true, errorType: null },
      ],
      skillByExercise
    );
    expect(suggestions).toHaveLength(2);
    expect(suggestions[0].microSkillId).toBe("ms1");
    expect(suggestions[0].errorCount).toBe(2);
    expect(suggestions[0].errorType).toBe("erro_calculo");
    expect(suggestions[1].errorType).toBe("gramatical");
  });

  it("ignora acertos, erros sem tipo e exercícios desconhecidos", () => {
    const suggestions = buildReinforcement(
      [
        { exerciseId: "e1", isCorrect: true, errorType: null },
        { exerciseId: "e2", isCorrect: false, errorType: null },
        { exerciseId: "x", isCorrect: false, errorType: "distracao" },
      ],
      new Map([["e1", SKILL]])
    );
    expect(suggestions).toHaveLength(0);
  });

  it("respeita o limite", () => {
    const skillByExercise = new Map([
      ["e1", SKILL],
      ["e2", { ...SKILL, microSkillId: "ms2" }],
      ["e3", { ...SKILL, microSkillId: "ms3" }],
    ]);
    const suggestions = buildReinforcement(
      [
        { exerciseId: "e1", isCorrect: false, errorType: "a" },
        { exerciseId: "e2", isCorrect: false, errorType: "a" },
        { exerciseId: "e3", isCorrect: false, errorType: "a" },
      ],
      skillByExercise,
      2
    );
    expect(suggestions).toHaveLength(2);
  });
});
