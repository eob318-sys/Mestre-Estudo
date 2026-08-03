import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { focusXpForMinutes } from "@/lib/focus";
import FocusTimer from "@/components/focus-timer";

export default async function FocusPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");
  if (session.user.role !== "student") redirect("/dashboard");

  const agg = await prisma.focusSession.aggregate({
    where: { studentId: session.user.id },
    _sum: { durationMs: true },
    _count: true,
  });
  const totalMinutes = Math.round((agg._sum.durationMs ?? 0) / 60000);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
          Modo concentração 🧘
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {totalMinutes} min de foco acumulados · +{focusXpForMinutes(totalMinutes)} XP por
          concentração
        </p>
      </div>
      <FocusTimer />
      <div className="mx-auto mt-6 max-w-md rounded-lg bg-slate-100 p-4 text-sm text-slate-600 dark:bg-slate-800 dark:text-slate-300">
        <p className="font-semibold">Como funciona</p>
        <ul className="mt-1 list-inside list-disc space-y-1">
          <li>25 minutos de foco total, seguidos de 5 de pausa.</li>
          <li>Ative a tela cheia para reduzir distrações.</li>
          <li>Cada minuto de foco vale 5 XP (concluído ou não).</li>
          <li>Use o diagnóstico e os módulos recomendados durante o foco.</li>
        </ul>
      </div>
    </div>
  );
}
