export const REVIEW_INTERVALS_DAYS = [7, 14, 30, 30];

/** Dias até a próxima revisão com base no domínio e número de tentativas. */
export function daysUntilNextReview(masteryScore: number, attempts: number): number {
  if (masteryScore < 50) return 1;
  if (masteryScore < 100) return 3;
  const idx = Math.max(0, Math.min(attempts - 1, REVIEW_INTERVALS_DAYS.length - 1));
  return REVIEW_INTERVALS_DAYS[idx];
}

/** Calcula a data da próxima revisão a partir de uma data base. */
export function scheduleNextReview(masteryScore: number, attempts: number, from: Date): Date {
  const d = new Date(from);
  d.setDate(d.getDate() + daysUntilNextReview(masteryScore, attempts));
  return d;
}

/** Uma revisão está "vencida" quando a data de revisão já passou. */
export function isReviewDue(nextReviewAt: Date | null, now: Date = new Date()): boolean {
  return nextReviewAt !== null && nextReviewAt <= now;
}
