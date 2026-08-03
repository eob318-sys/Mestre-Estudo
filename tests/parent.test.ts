import { describe, expect, it } from "vitest";
import { buildStudentSummary, type ParentLog, type ParentSkill } from "../lib/parent";

function log(isCorrect: boolean, timeTakenMs = 1000): ParentLog {
  return { exerciseId: "e", isCorrect, timeTakenMs, createdAt: new Date() };
}

function skill(name: string, mastery: number, subjectName = "Matemática"): ParentSkill {
  return {
    id: name,
    name,
    masteryScore: mastery,
    moduleTitle: "Módulo",
    subjectName,
  };
}

describe("buildStudentSummary", () => {
  it("calcula estatísticas e nenhum alerta com aluno saudável", () => {
    const s = buildStudentSummary({
      id: "s1",
      name: "Ana",
      email: "ana@x.com",
      diagnosticDone: true,
      updatedAt: new Date(),
      logs: [log(true), log(true), log(true), log(false), log(true)],
      skills: [skill("Soma", 100), skill("Leitura", 80)],
      dueReviews: [],
      totalModules: 2,
    });
    expect(s.exercises).toBe(5);
    expect(s.accuracy).toBe(80);
    expect(s.timeMs).toBe(5000);
    expect(s.modulesMastered).toBe(1);
    expect(s.alerts).toHaveLength(0);
    expect(s.strugglingSkills).toHaveLength(0);
  });

  it("alerta para dificuldade e erros recentes", () => {
    const s = buildStudentSummary({
      id: "s1",
      name: "Ana",
      email: "ana@x.com",
      diagnosticDone: true,
      updatedAt: new Date(),
      logs: [log(false), log(false), log(false), log(false), log(false)],
      skills: [skill("Divisão", 20), skill("Soma", 100)],
      dueReviews: [{ microSkillId: "m", skillName: "Soma", subjectName: "Mat", moduleTitle: "M" }],
      totalModules: 2,
    });
    expect(s.accuracy).toBe(0);
    expect(s.strugglingSkills.map((x) => x.name)).toEqual(["Divisão"]);
    expect(s.alerts.some((a) => a.includes("Divisão"))).toBe(true);
    expect(s.alerts.some((a) => a.includes("últimos 5"))).toBe(true);
    expect(s.alerts.some((a) => a.includes("revisão"))).toBe(true);
  });

  it("alerta para aluno sem atividade", () => {
    const s = buildStudentSummary({
      id: "s1",
      name: "Bia",
      email: "bia@x.com",
      diagnosticDone: false,
      updatedAt: new Date(),
      logs: [],
      skills: [],
      dueReviews: [],
      totalModules: 0,
    });
    expect(s.exercises).toBe(0);
    expect(s.alerts.some((a) => a.includes("primeiro estudo"))).toBe(true);
  });
});
