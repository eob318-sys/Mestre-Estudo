import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { buildStudentSummary, type ParentStudentSummary } from "@/lib/parent";
import { Badge, Card } from "@/components/ui";
import LinkStudentForm from "@/components/link-student-form";

function formatTime(ms: number): string {
  const totalMin = Math.round(ms / 60000);
  if (totalMin < 60) return `${totalMin} min`;
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  return m === 0 ? `${h}h` : `${h}h ${m}min`;
}

export default async function ParentPanelPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");
  if (session.user.role !== "responsible") redirect("/dashboard");

  const links = await prisma.parentStudent.findMany({
    where: { parentId: session.user.id },
    include: {
      student: {
        include: {
          exerciseLogs: {
            orderBy: { createdAt: "desc" },
            select: { exerciseId: true, isCorrect: true, timeTakenMs: true, createdAt: true },
            take: 500,
          },
          progress: {
            include: {
              microSkill: {
                include: { module: { include: { subject: true } } },
              },
            },
          },
          cognitiveProfile: true,
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  const summaries: ParentStudentSummary[] = links.map((l) => {
    const s = l.student;
    const due = s.progress
      .filter((p) => p.nextReviewAt && p.nextReviewAt <= new Date())
      .map((p) => ({
        microSkillId: p.microSkillId,
        skillName: p.microSkill.name,
        subjectName: p.microSkill.module.subject.name,
        moduleTitle: p.microSkill.module.title,
      }));
    const skills = s.progress.map((p) => ({
      id: p.microSkillId,
      name: p.microSkill.name,
      masteryScore: p.masteryScore,
      moduleTitle: p.microSkill.module.title,
      subjectName: p.microSkill.module.subject.name,
    }));
    return buildStudentSummary({
      id: s.id,
      name: s.name,
      email: s.email,
      diagnosticDone: s.diagnosticDone,
      updatedAt: s.createdAt,
      logs: s.exerciseLogs.map((l) => ({
        exerciseId: l.exerciseId,
        isCorrect: l.isCorrect,
        timeTakenMs: l.timeTakenMs,
        createdAt: l.createdAt,
      })),
      skills,
      dueReviews: due,
      totalModules: skills.length,
    });
  });

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
            Painel do responsável 👨‍👩‍👧
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Acompanhe o progresso dos alunos vinculados a você.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <LinkStudentForm />
        </div>
      </div>

      {summaries.length === 0 ? (
        <Card className="border-indigo-300 bg-indigo-50 p-6 dark:border-indigo-900 dark:bg-indigo-950/40">
          <p className="text-sm text-indigo-800 dark:text-indigo-300">
            👆 Nenhum aluno vinculado ainda. Digite o email do aluno acima para
            começar a acompanhá-lo (o aluno precisa ter conta criada neste
            mesmo site).
          </p>
        </Card>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {summaries.map((st) => (
            <Card key={st.id} className="p-5">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                    {st.name}
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{st.email}</p>
                </div>
                {st.diagnosticDone ? (
                  <Badge color="green">Diagnóstico feito</Badge>
                ) : (
                  <Badge color="amber">Sem diagnóstico</Badge>
                )}
              </div>

              <div className="mt-4 grid grid-cols-4 gap-2 text-center">
                <div className="rounded-lg bg-slate-100 p-2 dark:bg-slate-800">
                  <p className="text-lg font-bold text-slate-900 dark:text-slate-100">{st.exercises}</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Exercícios</p>
                </div>
                <div className="rounded-lg bg-slate-100 p-2 dark:bg-slate-800">
                  <p className="text-lg font-bold text-slate-900 dark:text-slate-100">{st.accuracy}%</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Acerto</p>
                </div>
                <div className="rounded-lg bg-slate-100 p-2 dark:bg-slate-800">
                  <p className="text-lg font-bold text-slate-900 dark:text-slate-100">{formatTime(st.timeMs)}</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Tempo</p>
                </div>
                <div className="rounded-lg bg-slate-100 p-2 dark:bg-slate-800">
                  <p className="text-lg font-bold text-slate-900 dark:text-slate-100">{st.modulesMastered}</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Módulos</p>
                </div>
              </div>

              {st.alerts.length > 0 && (
                <div className="mt-4 rounded-lg border border-amber-300 bg-amber-50 p-3 dark:border-amber-900 dark:bg-amber-950/40">
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-400">
                    ⚠️ Alertas
                  </p>
                  <ul className="space-y-1 text-sm text-amber-800 dark:text-amber-300">
                    {st.alerts.map((a, i) => (
                      <li key={i}>{a}</li>
                    ))}
                  </ul>
                </div>
              )}

              {st.strugglingSkills.length > 0 && (
                <div className="mt-4">
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    Habilidades em dificuldade
                  </p>
                  <ul className="space-y-1">
                    {st.strugglingSkills.map((sk) => (
                      <li key={sk.id} className="flex items-center justify-between text-sm">
                        <span className="text-slate-700 dark:text-slate-300">
                          {sk.subjectName} · {sk.name}
                        </span>
                        <span className="font-medium text-rose-600 dark:text-rose-400">{sk.masteryScore}%</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {st.dueReviews.length > 0 && (
                <div className="mt-4">
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    🔁 Revisões em atraso ({st.dueReviews.length})
                  </p>
                  <ul className="space-y-1">
                    {st.dueReviews.map((r) => (
                      <li key={r.microSkillId} className="text-sm text-slate-700 dark:text-slate-300">
                        {r.subjectName} · {r.skillName}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
