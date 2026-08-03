export type ModuleStatus = "bloqueado" | "em_progresso" | "dominado";

/**
 * Regra de negócio mais crítica do produto:
 * o aluno só avança quando a rodada termina com 100% de acerto.
 * O domínio é monotônico: uma vez 100%, nunca regride.
 */
export function applyRunProgress(
  previous: number,
  correctCount: number,
  total: number
): number {
  if (total <= 0) return previous;
  const runPercent =
    correctCount >= total ? 100 : Math.round((correctCount / total) * 100);
  return Math.max(previous, runPercent);
}

/** Um módulo está dominado quando TODAS as micro-skills estão com 100%. */
export function isModuleMastered(
  microSkillMastery: Record<string, number>
): boolean {
  const values = Object.values(microSkillMastery);
  return values.length > 0 && values.every((v) => v === 100);
}

/**
 * Status de exibição de um módulo:
 * - bloqueado: módulo anterior ainda não foi dominado
 * - dominado: 100% em todas as micro-skills
 * - em_progresso: destravado (iniciado ou não)
 */
export function moduleStatus(opts: {
  previousMastered: boolean;
  mastered: boolean;
}): ModuleStatus {
  if (!opts.previousMastered) return "bloqueado";
  if (opts.mastered) return "dominado";
  return "em_progresso";
}

/** Domínio médio (%) de um módulo a partir do domínio das micro-skills. */
export function moduleMasteryPercent(
  microSkillMastery: Record<string, number>
): number {
  const values = Object.values(microSkillMastery);
  if (values.length === 0) return 0;
  return Math.round(values.reduce((a, b) => a + b, 0) / values.length);
}
