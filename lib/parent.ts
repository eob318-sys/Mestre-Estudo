export interface ParentLog {
  exerciseId: string;
  isCorrect: boolean;
  timeTakenMs: number;
  createdAt: string | Date;
}

export interface ParentSkill {
  id: string;
  name: string;
  masteryScore: number;
  moduleTitle: string;
  subjectName: string;
}

export interface ParentReview {
  microSkillId: string;
  skillName: string;
  subjectName: string;
  moduleTitle: string;
}

export interface ParentSimulado {
  subjectName: string;
  correct: number;
  total: number;
  nota: number;
  createdAt: string | Date;
}

export interface ParentStudentSummary {
  id: string;
  name: string;
  email: string;
  diagnosticDone: boolean;
  exercises: number;
  accuracy: number;
  timeMs: number;
  modulesMastered: number;
  dueReviews: ParentReview[];
  strugglingSkills: ParentSkill[];
  alerts: string[];
  simulados: ParentSimulado[];
  updatedAt: string;
}

export function buildStudentSummary(input: {
  id: string;
  name: string;
  email: string;
  diagnosticDone: boolean;
  updatedAt: string | Date;
  logs: ParentLog[];
  skills: ParentSkill[];
  dueReviews: ParentReview[];
  totalModules: number;
  simulados?: ParentSimulado[];
}): ParentStudentSummary {
  const exercises = input.logs.length;
  const correct = input.logs.filter((l) => l.isCorrect).length;
  const accuracy = exercises === 0 ? 0 : Math.round((correct / exercises) * 100);
  const timeMs = input.logs.reduce((a, l) => a + l.timeTakenMs, 0);

  const masteredSet = new Set(input.skills.filter((s) => s.masteryScore >= 100).map((s) => s.id));
  const modulesMastered = masteredSet.size;

  const struggling = input.skills
    .filter((s) => s.masteryScore > 0 && s.masteryScore < 50)
    .sort((a, b) => a.masteryScore - b.masteryScore)
    .slice(0, 5);

  const recentWrong = input.logs.filter((l) => !l.isCorrect).slice(-5).length;
  const noActivity = input.logs.length === 0;

  const alerts: string[] = [];
  if (noActivity) {
    alerts.push("Ainda não fez exercícios. Incentive um primeiro estudo.");
  }
  if (struggling.length > 0) {
    alerts.push(
      `Com dificuldade em ${struggling.length} habilidade(s): ${struggling
        .map((s) => s.name)
        .join(", ")}.`
    );
  }
  if (recentWrong >= 3) {
    alerts.push(
      `Errou ${recentWrong} dos últimos 5 exercícios — talvez precise de ajuda.`
    );
  }
  if (input.dueReviews.length > 0) {
    alerts.push(`${input.dueReviews.length} revisão(ões) em atraso.`);
  }
  if (exercises === 0 || accuracy < 50) {
    alerts.push("Taxa de acerto baixa: considere revisar junto com o aluno.");
  }

  return {
    id: input.id,
    name: input.name,
    email: input.email,
    diagnosticDone: input.diagnosticDone,
    exercises,
    accuracy,
    timeMs,
    modulesMastered,
    dueReviews: input.dueReviews,
    strugglingSkills: struggling,
    alerts,
    simulados: input.simulados ?? [],
    updatedAt: new Date(input.updatedAt).toISOString(),
  };
}
