import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { buildWeeklyReport, lastWeeks, weeklyAlerts } from "@/lib/report";
import { Badge, Card } from "@/components/ui";
import { ReportEmailButton } from "@/components/report-email-button";

function formatTime(ms: number): string {
  const m = Math.round(ms / 60000);
  if (m < 60) return `${m} min`;
  return `${Math.floor(m / 60)}h ${m % 60}min`;
}

export default async function ReportsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");
  if (session.user.role === "responsible") redirect("/painel");

  const weeks = lastWeeks(4).map((start) => {
    const end = new Date(start);
    end.setDate(end.getDate() + 7);
    return { start, end };
  });
  const firstStart = weeks[0].start;

  const student = await prisma.student.findUnique({
    where: { id: session.user.id },
    select: { name: true, email: true },
  });

  const [logs, mastered] = await Promise.all([
    prisma.exerciseLog.findMany({
      where: { studentId: session.user.id, createdAt: { gte: firstStart } },
      select: { isCorrect: true, timeTakenMs: true, createdAt: true },
    }),
    prisma.progress.findMany({
      where: {
        studentId: session.user.id,
        masteryScore: 100,
        lastReviewedAt: { gte: firstStart },
      },
      select: { masteryScore: true, lastReviewedAt: true },
    }),
  ]);

  const reports = weeks.map((w) => {
    const weekLogs = logs.filter(
      (l) => l.createdAt >= w.start && l.createdAt < w.end
    );
    const masteredInWeek = mastered.filter(
      (m) => m.lastReviewedAt && m.lastReviewedAt >= w.start && m.lastReviewedAt < w.end
    ).length;
    return buildWeeklyReport({ start: w.start, logs: weekLogs, masteredInWeek });
  });

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
            Relatórios semanais 📊
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Seu resumo das últimas 4 semanas — pratique e compare a evolução.
          </p>
        </div>
        <ReportEmailButton email={student?.email ?? ""} name={student?.name ?? ""} />
      </div>

      <div className="space-y-4">
        {reports.map((r) => (
          <Card key={r.weekLabel} className="p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="font-semibold text-slate-900 dark:text-slate-100">
                Semana {r.weekLabel}
              </h2>
              <Badge color={r.accuracy >= 60 ? "green" : r.total === 0 ? "gray" : "amber"}>
                {r.total === 0 ? "Sem atividade" : `${r.accuracy}% acerto`}
              </Badge>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2 text-center md:grid-cols-5">
              {[
                { label: "Exercícios", value: String(r.total) },
                { label: "Acertos", value: String(r.correct) },
                { label: "Tempo", value: formatTime(r.timeMs) },
                { label: "Dias com estudo", value: String(r.distinctDays) },
                { label: "Módulos dominados", value: String(r.masteredInWeek) },
              ].map((m) => (
                <div key={m.label} className="rounded-lg bg-slate-100 p-2 dark:bg-slate-800">
                  <p className="text-lg font-bold text-slate-900 dark:text-slate-100">{m.value}</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">{m.label}</p>
                </div>
              ))}
            </div>

            {weeklyAlerts(r).map((a, i) => (
              <p key={i} className="mt-3 text-sm text-amber-700 dark:text-amber-400">
                ⚠️ {a}
              </p>
            ))}
            {r.total === 0 && (
              <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
                Faça exercícios nesta semana para gerar seu resumo.
              </p>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}