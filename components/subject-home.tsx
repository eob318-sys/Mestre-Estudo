import Link from "next/link";
import { accent, STATUS_LABEL } from "@/lib/accent";
import { Badge, Card, ProgressBar } from "@/components/ui";
import type { SubjectSummary } from "@/lib/queries";

export function SubjectHome({ subject }: { subject: SubjectSummary }) {
  const a = accent(subject.color);
  const totalSkills = subject.modules.reduce(
    (acc, m) => acc + m.microSkills.length,
    0
  );
  const masteredSkills = subject.modules.reduce(
    (acc, m) =>
      acc + m.microSkills.filter((ms) => ms.mastery === 100).length,
    0
  );
  const overall =
    totalSkills === 0
      ? 0
      : Math.round(
          (subject.modules.reduce((acc, m) => acc + m.mastery, 0) /
            Math.max(1, subject.modules.length)) *
            100
        );

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-8">
        <h1 className={`text-3xl font-bold ${a.text}`}>{subject.name}</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Domínio geral: {overall}% · {masteredSkills}/{totalSkills} habilidades dominadas
        </p>
        <ProgressBar value={overall} className="mt-3 max-w-md" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {subject.modules.map((mod) => {
          const statusColor =
            mod.status === "dominado"
              ? "green"
              : mod.status === "bloqueado"
                ? "gray"
                : "indigo";
          return (
            <div key={mod.id}>
              {mod.status === "bloqueado" ? (
                <Card className="flex h-full items-start justify-between opacity-70">
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-400 dark:bg-slate-800">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="11" width="18" height="11" rx="2" />
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                      </svg>
                    </span>
                    <div>
                      <h2 className="font-semibold text-slate-700 dark:text-slate-300">
                        {mod.title}
                      </h2>
                      <p className="mt-1 text-xs text-slate-400">
                        Domine o módulo anterior com 100% para liberar.
                      </p>
                    </div>
                  </div>
                  <Badge color={statusColor}>{STATUS_LABEL[mod.status]}</Badge>
                </Card>
              ) : (
                <Link href={`/${subject.slug}/${mod.id}`}>
                  <Card className={`h-full transition hover:-translate-y-0.5 hover:shadow-md ${a.soft} ${a.border} border`}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-3">
                        <span className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-white ${a.bg}`}>
                          {mod.status === "dominado" ? (
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M20 6 9 17l-5-5" />
                            </svg>
                          ) : (
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M9 18h6m-5-4h4M10 10l1.5 1.5L15 8" />
                              <path d="M12 3a7 7 0 0 0-7 7v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6a7 7 0 0 0-7-7z" />
                            </svg>
                          )}
                        </span>
                        <div>
                          <h2 className="font-semibold text-slate-900 dark:text-slate-100">
                            {mod.title}
                          </h2>
                          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                            Dificuldade {mod.difficulty}/10 ·{" "}
                            {mod.microSkills.length}{" "}
                            {mod.microSkills.length === 1
                              ? "habilidade"
                              : "habilidades"}
                          </p>
                          <div className="mt-2 max-w-56">
                            <ProgressBar value={mod.mastery} />
                          </div>
                        </div>
                      </div>
                      <Badge color={statusColor}>{STATUS_LABEL[mod.status]}</Badge>
                    </div>
                  </Card>
                </Link>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
