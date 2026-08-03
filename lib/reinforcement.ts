export interface ReinforcementLog {
  exerciseId: string;
  isCorrect: boolean;
  errorType: string | null;
}

export interface ReinforcementSkill {
  microSkillId: string;
  name: string;
  moduleId: string;
  moduleTitle: string;
  subjectSlug: string;
}

export interface ReinforcementSuggestion {
  microSkillId: string;
  skillName: string;
  moduleId: string;
  moduleTitle: string;
  subjectSlug: string;
  errorType: string;
  errorCount: number;
}

export const ERROR_TYPE_LABELS: Record<string, string> = {
  erro_calculo: "cálculo",
  erro_conceitual: "conceito",
  gramatical: "gramática",
  distracao: "atenção",
};

/** Tipo de erro mais frequente entre os logs (null se não houver erros marcados). */
export function dominantErrorType(types: (string | null)[]): string | null {
  const counts = new Map<string, number>();
  for (const t of types) {
    if (!t) continue;
    counts.set(t, (counts.get(t) ?? 0) + 1);
  }
  let best: string | null = null;
  let bestCount = 0;
  for (const [t, c] of Array.from(counts.entries())) {
    if (c > bestCount) {
      best = t;
      bestCount = c;
    }
  }
  return best;
}

/** Monta sugestões de reforço: skills com erros, agrupadas por tipo de erro dominante. */
export function buildReinforcement(
  logs: ReinforcementLog[],
  skillByExercise: Map<string, ReinforcementSkill>,
  limit = 5
): ReinforcementSuggestion[] {
  const bySkill = new Map<string, { skill: ReinforcementSkill; types: string[] }>();

  for (const l of logs) {
    if (l.isCorrect || !l.errorType) continue;
    const skill = skillByExercise.get(l.exerciseId);
    if (!skill) continue;
    const entry = bySkill.get(skill.microSkillId) ?? { skill, types: [] };
    entry.types.push(l.errorType);
    bySkill.set(skill.microSkillId, entry);
  }

  return Array.from(bySkill.values())
    .map(({ skill, types }) => ({
      microSkillId: skill.microSkillId,
      skillName: skill.name,
      moduleId: skill.moduleId,
      moduleTitle: skill.moduleTitle,
      subjectSlug: skill.subjectSlug,
      errorType: dominantErrorType(types) ?? "generico",
      errorCount: types.length,
    }))
    .sort((a, b) => b.errorCount - a.errorCount)
    .slice(0, limit);
}
