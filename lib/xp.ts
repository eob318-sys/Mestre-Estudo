export interface XpLog {
  exerciseId: string;
  isCorrect: boolean;
  createdAt: string | Date;
}

export interface Mission {
  id: string;
  title: string;
  description: string;
  done: boolean;
  progress: number;
  target: number;
}

export const POINTS = {
  correct: 10,
  run: 50,
  module: 200,
  focus: 5,
};

/** XP total: acertos + rodadas completas + módulos dominados + minutos de foco. */
export function computeXp(input: {
  correctCount: number;
  runs: number;
  masteredModules: number;
  focusMinutes?: number;
}): number {
  return (
    input.correctCount * POINTS.correct +
    input.runs * POINTS.run +
    input.masteredModules * POINTS.module +
    (input.focusMinutes ?? 0) * POINTS.focus
  );
}

/** Nível e progresso (0-100%) para o próximo nível, com escala quadrática. */
export function levelFromXp(xp: number): {
  level: number;
  nextLevelXp: number;
  progress: number;
} {
  const level = Math.floor(Math.sqrt(xp / 100)) + 1;
  const current = (level - 1) ** 2 * 100;
  const next = level ** 2 * 100;
  const progress =
    xp >= next ? 100 : Math.floor(((xp - current) / (next - current)) * 100);
  return { level, nextLevelXp: next, progress };
}

/** Maior sequência de acertos consecutivos nos logs (em ordem cronológica). */
export function maxCorrectStreak(logs: XpLog[]): number {
  let streak = 0;
  let best = 0;
  for (const l of logs) {
    if (l.isCorrect) {
      streak++;
      best = Math.max(best, streak);
    } else {
      streak = 0;
    }
  }
  return best;
}

/** Quantos exercícios o aluno errou e depois refez até acertar. */
export function correctedErrors(logs: XpLog[]): number {
  const byExercise = new Map<string, XpLog[]>();
  for (const l of logs) {
    const arr = byExercise.get(l.exerciseId) ?? [];
    arr.push(l);
    byExercise.set(l.exerciseId, arr);
  }
  let count = 0;
  for (const arr of Array.from(byExercise.values())) {
    if (
      arr.length >= 2 &&
      arr.some((x) => !x.isCorrect) &&
      arr[arr.length - 1].isCorrect
    ) {
      count++;
    }
  }
  return count;
}

/** Lista de missões com progresso, derivadas dos dados do aluno. */
export function evaluateMissions(input: {
  logs: XpLog[];
  exercisesDone: number;
  masteredModules: number;
  diagnosticDone: boolean;
}): Mission[] {
  const streak = maxCorrectStreak(input.logs);
  const corrected = correctedErrors(input.logs);

  return [
    {
      id: "primeiros_passos",
      title: "Primeiros passos",
      description: "Complete seu primeiro exercício",
      done: input.exercisesDone >= 1,
      progress: Math.min(input.exercisesDone, 1),
      target: 1,
    },
    {
      id: "dez_exercicios",
      title: "Dez exercícios",
      description: "Complete 10 exercícios",
      done: input.exercisesDone >= 10,
      progress: Math.min(input.exercisesDone, 10),
      target: 10,
    },
    {
      id: "cinquenta_exercicios",
      title: "Maratona",
      description: "Complete 50 exercícios",
      done: input.exercisesDone >= 50,
      progress: Math.min(input.exercisesDone, 50),
      target: 50,
    },
    {
      id: "em_chamas",
      title: "Em chamas",
      description: "Acerto 5 exercícios seguidos",
      done: streak >= 5,
      progress: Math.min(streak, 5),
      target: 5,
    },
    {
      id: "persistente",
      title: "Persistente",
      description: "Refaça e acerte 5 exercícios que errou antes",
      done: corrected >= 5,
      progress: Math.min(corrected, 5),
      target: 5,
    },
    {
      id: "dominador",
      title: "Dominador",
      description: "Domine um módulo inteiro (100%)",
      done: input.masteredModules >= 1,
      progress: Math.min(input.masteredModules, 1),
      target: 1,
    },
    {
      id: "diagnosticado",
      title: "Posicionado",
      description: "Faça o diagnóstico inicial",
      done: input.diagnosticDone,
      progress: input.diagnosticDone ? 1 : 0,
      target: 1,
    },
  ];
}
