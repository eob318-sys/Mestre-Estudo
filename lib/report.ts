export interface ReportLog {
  isCorrect: boolean;
  timeTakenMs: number;
  createdAt: string | Date;
}

export interface WeeklyReport {
  weekLabel: string;
  range: { start: Date; end: Date };
  total: number;
  correct: number;
  accuracy: number;
  timeMs: number;
  distinctDays: number;
  masteredInWeek: number;
}

export function startOfWeek(date: Date = new Date()): Date {
  const d = new Date(date);
  const day = (d.getDay() + 6) % 7; // segunda-feira = 0
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - day);
  return d;
}

export function endOfWeek(date: Date = new Date()): Date {
  const end = startOfWeek(date);
  end.setDate(end.getDate() + 7);
  return end;
}

export function isoDayKey(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toISOString().slice(0, 10);
}

export function weekLabel(start: Date): string {
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  const fmt = (d: Date) => d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
  return `${fmt(start)}–${fmt(end)}`;
}

export function lastWeeks(count: number, now: Date = new Date()): Date[] {
  const results: Date[] = [];
  const current = startOfWeek(now);
  for (let i = 0; i < count; i++) {
    const start = new Date(current);
    start.setDate(start.getDate() - 7 * i);
    results.push(start);
  }
  return results;
}

/** Monta o resumo de uma semana para um aluno. Espera logs da semana + dominados da semana. */
export function buildWeeklyReport(input: {
  start: Date;
  logs: ReportLog[];
  masteredInWeek: number;
}): WeeklyReport {
  const total = input.logs.length;
  const correct = input.logs.filter((l) => l.isCorrect).length;
  const timeMs = input.logs.reduce((a, l) => a + l.timeTakenMs, 0);
  const days = new Set(input.logs.map((l) => isoDayKey(l.createdAt))).size;
  return {
    weekLabel: weekLabel(input.start),
    range: { start: input.start, end: endOfWeek(input.start) },
    total,
    correct,
    accuracy: total === 0 ? 0 : Math.round((correct / total) * 100),
    timeMs,
    distinctDays: days,
    masteredInWeek: input.masteredInWeek,
  };
}

export function weeklyAlerts(r: WeeklyReport): string[] {
  const alerts: string[] = [];
  if (r.total === 0) {
    alerts.push("Sem exercícios nesta semana — tente manter a regularidade.");
  } else {
    if (r.accuracy < 50) alerts.push("Taxa de acerto abaixo de 50%: repita os módulos com dificuldade.");
    if (r.distinctDays === 1 && r.total < 10)
      alerts.push("Estudo concentrado em um único dia. Espalhe as sessões na semana.");
  }
  if (r.masteredInWeek === 0 && r.total > 0)
    alerts.push("Nenhum módulo dominado na semana — revise as habilidades pendentes.");
  return alerts;
}