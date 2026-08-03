export const FOCUS_XP_PER_MINUTE = 5;
export const FOCUS_MINUTES = 25;
export const BREAK_MINUTES = 5;

export function focusXpForMinutes(minutes: number): number {
  return Math.round(Math.max(0, minutes) * FOCUS_XP_PER_MINUTE);
}

export function formatRemaining(totalSeconds: number): string {
  const safe = Math.max(0, totalSeconds);
  const m = Math.floor(safe / 60);
  const s = safe % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}
