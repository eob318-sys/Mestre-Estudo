import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { buildWeeklyReport, lastWeeks, weeklyAlerts } from "@/lib/report";
import { AutoPrint } from "@/components/auto-print";

function formatTime(ms: number): string {
  const m = Math.round(ms / 60000);
  if (m < 60) return `${m} min`;
  return `${Math.floor(m / 60)}h ${m % 60}min`;
}

function metric(label: string, value: string) {
  return { label, value };
}

export default async function ReportPrintPage() {
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

  const generatedAt = new Date().toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="bg-white p-8 text-slate-900">
      <AutoPrint />
      <div className="no-print mb-6">
        <Link
          href="/relatorios"
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          ← Voltar
        </Link>
        <p className="mt-2 text-xs text-slate-500">
          Na janela de impressão, escolha “Salvar como PDF” como destino.
        </p>
      </div>

      <div className="border-b border-slate-300 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600 text-sm font-bold text-white">
            ME
          </div>
          <div>
            <h1 className="text-2xl font-black">Relatório de desempenho — Mestre do Estudo</h1>
            <p className="text-sm text-slate-600">
              {student?.name ?? "Aluno"} · {student?.email ?? ""} · gerado em {generatedAt}
            </p>
          </div>
        </div>
      </div>

      <p className="my-4 text-sm text-slate-600">
        Resumo das últimas 4 semanas: exercícios, taxa de acerto, tempo de estudo,
        regularidade (dias) e módulos dominados.
      </p>

      <div className="space-y-6">
        {reports.map((r) => (
          <section key={r.weekLabel} className="rounded-lg border border-slate-300 p-4 print:border">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <h2 className="text-base font-bold">Semana {r.weekLabel}</h2>
              <span className="text-sm font-semibold">
                {r.total === 0 ? "Sem atividade" : `${r.accuracy}% de acerto`}
              </span>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3 text-center md:grid-cols-5">
              {[
                metric("Exercícios", String(r.total)),
                metric("Acertos", String(r.correct)),
                metric("Tempo", formatTime(r.timeMs)),
                metric("Dias com estudo", String(r.distinctDays)),
                metric("Módulos dominados", String(r.masteredInWeek)),
              ].map((m) => (
                <div key={m.label} className="rounded-md bg-slate-100 p-2">
                  <p className="text-lg font-bold">{m.value}</p>
                  <p className="text-[11px] text-slate-600">{m.label}</p>
                </div>
              ))}
            </div>
            {weeklyAlerts(r).length > 0 && (
              <ul className="mt-3 space-y-1">
                {weeklyAlerts(r).map((a, i) => (
                  <li key={i} className="text-xs text-amber-700">
                    ⚠️ {a}
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>

      <p className="mt-6 border-t border-slate-300 pt-3 text-[11px] text-slate-500">
        Mestre do Estudo — plataforma adaptativa de estudos · relatório gerado automaticamente
        para fins de acompanhamento pedagógico.
      </p>
    </div>
  );
}