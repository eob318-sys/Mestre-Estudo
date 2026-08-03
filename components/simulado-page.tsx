"use client";

import { useEffect, useState } from "react";
import { Button, Card } from "@/components/ui";
import type { SimExercise } from "@/lib/simulado";

type Subject = { slug: string; name: string; color: string };

type SimResult = {
  nota: number;
  correctCount: number;
  total: number;
  results: { exerciseId: string; correta: boolean; explicacao: string }[];
};

export function SimuladoPage({ subjects }: { subjects: Subject[] }) {
  const [subject, setSubject] = useState("portugues");
  const [exercises, setExercises] = useState<SimExercise[] | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SimResult | null>(null);
  const [starting, setStarting] = useState(false);

  const start = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    setAnswers({});
    try {
      const res = await fetch(`/api/simulado?subject=${subject}&count=10`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Falha ao montar o simulado.");
      setExercises(data.exercises);
      setSecondsLeft(data.durationSeconds);
      setStarting(true);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!starting || secondsLeft <= 0) return;
    const t = setInterval(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [starting, secondsLeft]);

  const finish = async (auto = false) => {
    if (!exercises) return;
    if (auto) setSecondsLeft(0);
    setStarting(false);
    setLoading(true);
    try {
      const res = await fetch("/api/simulado", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          subject,
          answers: exercises.map((e) => ({
            exerciseId: e.id,
            answer: answers[e.id] ?? "",
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Falha ao corrigir.");
      setResult(data);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (starting && secondsLeft <= 0) void finish(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secondsLeft, starting]);

  const mm = Math.floor(Math.max(0, secondsLeft) / 60);
  const ss = Math.max(0, secondsLeft) % 60;

  if (!exercises) {
    return (
      <Card className="mx-auto max-w-xl p-8 text-center">
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Simulado 📝</h2>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          10 questões sorteadas de toda a matéria, com cronômetro e correção na hora.
        </p>
        <div className="mt-6 grid gap-2">
          {subjects.map((s) => (
            <button
              key={s.slug}
              type="button"
              onClick={() => setSubject(s.slug)}
              aria-pressed={subject === s.slug}
              className={`rounded-xl border px-4 py-3 text-left font-medium transition ${
                subject === s.slug
                  ? "border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300"
                  : "border-slate-200 text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              }`}
            >
              {s.name}
            </button>
          ))}
        </div>
        {error && <p className="mt-3 text-sm text-rose-600 dark:text-rose-400">{error}</p>}
        <Button onClick={start} disabled={loading} className="mt-5">
          {loading ? "Montando…" : "Começar simulado"}
        </Button>
      </Card>
    );
  }

  if (result) {
    return (
      <Card className="mx-auto max-w-2xl p-8">
        <div className="text-center">
          <p className="text-5xl font-black text-slate-900 dark:text-slate-100">{result.nota}</p>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {result.correctCount} de {result.total} questões
          </p>
        </div>
        <div className="mt-6 space-y-3">
          {exercises.map((e, i) => {
            const r = result.results.find((x) => x.exerciseId === e.id);
            return (
              <div
                key={e.id}
                className={`rounded-xl border p-3 text-sm ${
                  r?.correta
                    ? "border-emerald-300 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/40"
                    : "border-rose-300 bg-rose-50 dark:border-rose-900 dark:bg-rose-950/40"
                }`}
              >
                <p className="font-medium text-slate-800 dark:text-slate-200">
                  {i + 1}. {e.prompt}
                </p>
                <p className={`mt-1 text-xs ${r?.correta ? "text-emerald-700 dark:text-emerald-400" : "text-rose-700 dark:text-rose-400"}`}>
                  {r?.correta ? "✓ Correta" : "✗ Incorreta"}
                </p>
                {r && !r.correta && <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">{r.explicacao}</p>}
              </div>
            );
          })}
        </div>
        <div className="mt-6 flex justify-center gap-2">
          <Button onClick={() => setExercises(null)}>Novo simulado</Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="mx-auto max-w-2xl p-6">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
          Questão {answers ? Object.keys(answers).length : 0}/{exercises.length}
        </p>
        <p className={`text-lg font-bold tabular-nums ${secondsLeft < 60 ? "text-rose-600" : "text-slate-900 dark:text-slate-100"}`}>
          ⏱ {String(mm).padStart(2, "0")}:{String(ss).padStart(2, "0")}
        </p>
      </div>
      <div className="mt-4 space-y-4">
        {exercises.map((e, i) => (
          <div key={e.id} className="rounded-xl border border-slate-200 p-4 dark:border-slate-700">
            <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
              {i + 1}. {e.prompt}
            </p>
            {e.options ? (
              <div className="mt-2 grid gap-1.5">
                {e.options.map((o) => (
                  <button
                    key={o.id}
                    type="button"
                    onClick={() => setAnswers((a) => ({ ...a, [e.id]: o.id }))}
                    className={`rounded-lg border px-3 py-2 text-left text-sm transition ${
                      answers[e.id] === o.id
                        ? "border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300"
                        : "border-slate-200 text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                    }`}
                  >
                    {o.text}
                  </button>
                ))}
              </div>
            ) : (
              <input
                value={answers[e.id] ?? ""}
                onChange={(ev) => setAnswers((a) => ({ ...a, [e.id]: ev.target.value }))}
                placeholder="Sua resposta…"
                className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />
            )}
          </div>
        ))}
      </div>
      <div className="mt-6 flex justify-center gap-2">
        <Button onClick={() => void finish(false)} disabled={loading}>
          {loading ? "Corrigindo…" : "Entregar simulado"}
        </Button>
      </div>
    </Card>
  );
}