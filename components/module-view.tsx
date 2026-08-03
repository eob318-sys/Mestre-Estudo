import Link from "next/link";
import { getModuleDetail } from "@/lib/queries";
import { ExerciseRunner } from "@/components/exercise-runner";
import { Button } from "@/components/ui";
import { accent } from "@/lib/accent";

export default async function ModuleView({
  subjectSlug,
  moduleId,
  studentId,
}: {
  subjectSlug: string;
  moduleId: string;
  studentId: string;
}) {
  const detail = await getModuleDetail(subjectSlug, moduleId, studentId);

  if (!detail) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center text-slate-500">
        Módulo não encontrado.
      </div>
    );
  }

  if (detail.status === "bloqueado") {
    const a = accent(detail.color);
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-slate-800">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </div>
        <h1 className={`text-2xl font-bold ${a.text}`}>Módulo bloqueado</h1>
        <p className="mx-auto mt-2 max-w-md text-slate-500 dark:text-slate-400">
          Para liberar <strong>{detail.title}</strong>, domine com 100% de
          acerto todos os módulos anteriores de {detail.subjectName}.
        </p>
        <div className="mt-6">
          <Link href={`/${subjectSlug}`}>
            <Button>Voltar para {detail.subjectName}</Button>
          </Link>
        </div>
      </div>
    );
  }

  return <ExerciseRunner module={detail} />;
}
