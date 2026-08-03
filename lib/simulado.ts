export interface SimExerciseOption {
  id: string;
  text: string;
}

export interface SimExercise {
  id: string;
  microSkillId: string | null;
  type: string;
  prompt: string;
  options: SimExerciseOption[] | null;
  difficulty: number;
}

export function shuffle<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function pickSimulado(exercises: SimExercise[], count: number): SimExercise[] {
  return shuffle(exercises).slice(0, Math.max(1, Math.min(count, exercises.length)));
}

/** Duração sugerida do simulado em segundos (2 min por questão). */
export function simuladoSeconds(count: number): number {
  return count * 120;
}

export function notaSimulado(correctCount: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((correctCount / total) * 100);
}