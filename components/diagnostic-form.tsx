"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, Card, ProgressBar } from "@/components/ui";
import { accent } from "@/lib/accent";

export type DiagnosticSubject = {
  id: string;
  name: string;
  color: string;
  modules: { id: string; title: string }[];
  questions: {
    id: string;
    moduleId: string;
    prompt: string;
    options: { id: string; text: string }[];
  }[];
};

export function DiagnosticForm({
  subjects,
  studentName,
}: {
  subjects: DiagnosticSubject[];
  studentName: string;
}) {
  const router = useRouter();
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [positionedTitle, setPositionedTitle] = useState<string | null>(null);

  const subject = subjects[idx];
  const a = accent(subject.color);
  const isLast = idx === subjects.length - 1;

  const submit = async () => {
    setSubmitting(true);
    try {
      const res = await fetch("/api/diagnostic", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          subjectId: subject.id,
          answers: subject.questions
            .filter((q) => answers[q.id])
            .map((q) => ({ exerciseId: q.id, answer: answers[q.id] })),
          last: isLast,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        positionedModuleId?: string;
      };
      const mod = subject.modules.find((m) => m.id === data.positionedModuleId);
      setPositionedTitle(mod?.title ?? null);
      setDone(true);
    } catch {
      setPositionedTitle(null);
      setDone(true);
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <Card className="mx-auto w-full max-w-2xl text-center">
        <div className="animate-pop text-5xl">🎯</div>
        <h1 className="mt-3 text-2xl font-bold text-slate-900 dark:text-slate-100">
          {isLast ? "Diagnóstico concluído!" : `${subject.name} analisado!`}
        </h1>
        <p className="mx-auto mt-2 max-w-md text-slate-500 dark:text-slate-400">
          {positionedTitle
            ? `Você foi posicionado no módulo "${positionedTitle}". Comece por aí e domine com 100% de acerto!`
            : "Resultado registrado."}
        </p>
        <div className="mt-6">
          {isLast ? (
            <Button onClick={() => router.push("/dashboard")}>
              Ver meu dashboard →
            </Button>
          ) : (
            <Button
              onClick={() => {
                setIdx(idx + 1);
                setDone(false);
                setPositionedTitle(null);
              }}
            >
              Começar {subjects[idx + 1]?.name}
            </Button>
          )}
        </div>
      </Card>
    );
  }

  const totalQuestions = subject.questions.length;
  const answered = subject.questions.filter((q) => answers[q.id]).length;

  return (
    <div className="mx-auto w-full max-w-2xl">
      <Card>
        <div className="flex items-center justify-between">
          <h1 className={`text-2xl font-bold ${a.text}`}>
            Diagnóstico: {subject.name}
          </h1>
          <span className="text-sm text-slate-500 dark:text-slate-400">
            {idx + 1}/{subjects.length}
          </span>
        </div>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Olá, {studentName}! Responda as questões abaixo para sabermos onde
          você deve começar. Não se preocupe com erros — é só uma avaliação.
        </p>
        <div className="mt-3 flex items-center gap-3">
          <ProgressBar value={(answered / totalQuestions) * 100} className="flex-1" />
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {answered}/{totalQuestions}
          </span>
        </div>
      </Card>

      <div className="mt-4 space-y-4">
        {subject.modules.map((m) => {
          const questions = subject.questions.filter((q) => q.moduleId === m.id);
          if (questions.length === 0) return null;
          return (
            <Card key={m.id}>
              <p className={`mb-3 text-xs font-bold uppercase tracking-wide ${a.text}`}>
                {m.title}
              </p>
              <div className="space-y-5">
                {questions.map((q, qi) => (
                  <div key={q.id}>
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                      {qi + 1}. {q.prompt}
                    </p>
                    <div className="mt-2 grid gap-2 sm:grid-cols-2">
                      {q.options.map((opt) => {
                        const selected = answers[q.id] === opt.id;
                        return (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() =>
                              setAnswers((prev) => ({ ...prev, [q.id]: opt.id }))
                            }
                            className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-left text-sm transition ${
                              selected
                                ? "border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300"
                                : "border-slate-300 text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                            }`}
                          >
                            <span
                              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                                selected
                                  ? "bg-indigo-600 text-white"
                                  : "bg-slate-100 text-slate-500 dark:bg-slate-800"
                              }`}
                            >
                              {opt.id.toUpperCase()}
                            </span>
                            {opt.text}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          );
        })}
      </div>

      <div className="mt-6 flex justify-end">
        <Button
          onClick={submit}
          disabled={submitting || answered < totalQuestions}
        >
          {submitting
            ? "Analisando…"
            : `Enviar respostas${isLast ? " e concluir" : ""}`}
        </Button>
      </div>
    </div>
  );
}
