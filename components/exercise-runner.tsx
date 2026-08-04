"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Button, Card, ProgressBar } from "@/components/ui";
import { HandwritingPad } from "@/components/handwriting-pad";
import { accent, STATUS_LABEL } from "@/lib/accent";
import type { ModuleDetail, ExerciseClient } from "@/lib/queries";

type RunResult = {
  exerciseId: string;
  nota: number;
  correta: boolean;
  explicacao: string;
  dica: string;
  tipoErro: string | null;
};

type ExtraExercise = ExerciseClient & { microSkillId: string };

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function ExerciseRunner({ module }: { module: ModuleDetail }) {
  const a = accent(module.color);
  const skills = module.microSkills;

  const [skillIdx, setSkillIdx] = useState(0);
  const [order, setOrder] = useState<string[]>(() =>
    shuffle(skills[0]?.exercises.map((e) => e.id) ?? [])
  );
  const [qIdx, setQIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [times, setTimes] = useState<Record<string, number>>({});
  const [phase, setPhase] = useState<"question" | "review" | "done">("question");
  const [results, setResults] = useState<RunResult[] | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [micActive, setMicActive] = useState(false);
  const [micSupported, setMicSupported] = useState(true);
  const [mastery, setMastery] = useState<Record<string, number>>(() =>
    Object.fromEntries(skills.map((s) => [s.id, s.mastery]))
  );
  const [extra, setExtra] = useState<ExtraExercise[]>([]);
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState<string | null>(null);

  const questionStart = useRef(Date.now());
  const recognitionRef = useRef<unknown>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const skill = skills[skillIdx];
  const exercises = useMemo(
    () => [
      ...order
        .map((id) => skill?.exercises.find((e) => e.id === id))
        .filter((e): e is NonNullable<typeof e> => Boolean(e)),
      ...extra.filter((e) => e.microSkillId === skill?.id),
    ],
    [order, skill, extra]
  );
  const current = exercises[qIdx];

  const moduleMastery = useMemo(() => {
    const values = Object.values(mastery);
    if (values.length === 0) return 0;
    return Math.round(values.reduce((x, y) => x + y, 0) / values.length);
  }, [mastery]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [phase, qIdx, submitting]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const SR = (
        window as unknown as {
          SpeechRecognition?: unknown;
          webkitSpeechRecognition?: unknown;
        }
      ).SpeechRecognition || (
        window as unknown as {
          SpeechRecognition?: unknown;
          webkitSpeechRecognition?: unknown;
        }
      ).webkitSpeechRecognition;
      if (!SR) setMicSupported(false);
    }
  }, []);

  if (!skill || exercises.length === 0) {
    return <Card>Este módulo ainda não tem exercícios.</Card>;
  }

  const startSkill = (idx: number) => {
    setSkillIdx(idx);
    setOrder(shuffle(skills[idx].exercises.map((e) => e.id)));
    setQIdx(0);
    setAnswers({});
    setTimes({});
    setResults(null);
    setPhase("question");
    questionStart.current = Date.now();
  };

  const recordAnswer = (exerciseId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [exerciseId]: value }));
  };

  const stopMic = () => {
    const r = recognitionRef.current as { stop?: () => void } | null;
    r?.stop?.();
    setMicActive(false);
  };

  const startMic = () => {
    if (!micSupported) return;
    const SR = (
      window as unknown as {
        SpeechRecognition?: new () => unknown;
        webkitSpeechRecognition?: new () => unknown;
      }
    ).SpeechRecognition || (
      window as unknown as {
        SpeechRecognition?: new () => unknown;
        webkitSpeechRecognition?: new () => unknown;
      }
    ).webkitSpeechRecognition;
    if (!SR || !current) return;

    stopMic();
    const rec = new SR() as {
      lang: string;
      interimResults: boolean;
      onresult: (e: {
        results: { [i: number]: { [j: number]: { transcript: string } } };
      }) => void;
      onend: () => void;
      onerror: () => void;
      start: () => void;
      stop: () => void;
    };
    rec.lang = "en-US";
    rec.interimResults = false;
    rec.onresult = (e) => {
      const transcript = e.results[0]?.[0]?.transcript ?? "";
      recordAnswer(current.id, transcript);
    };
    rec.onend = () => setMicActive(false);
    rec.onerror = () => setMicActive(false);
    recognitionRef.current = rec;
    try {
      rec.start();
      setMicActive(true);
    } catch {
      setMicActive(false);
    }
  };

  const addGenerated = async () => {
    if (generating || !skill) return;
    setGenerating(true);
    setGenError(null);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ microSkillId: skill.id }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        exercise?: ExerciseClient;
        error?: string;
      };
      if (!res.ok || !data.exercise) {
        throw new Error(data.error ?? "Não foi possível gerar o exercício.");
      }
      setExtra((prev) => [
        ...prev,
        { ...data.exercise!, microSkillId: skill.id },
      ]);
    } catch (err) {
      setGenError(err instanceof Error ? err.message : "Erro ao gerar exercício.");
    } finally {
      setGenerating(false);
    }
  };

  const confirmAnswer = () => {
    if (!current || submitting) return;
    const taken = Date.now() - questionStart.current;
    setTimes((prev) => ({ ...prev, [current.id]: taken }));
    if (qIdx < exercises.length - 1) {
      setQIdx(qIdx + 1);
      questionStart.current = Date.now();
    } else {
      void submitRun();
    }
  };

  const submitRun = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/run", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          microSkillId: skill.id,
          answers: exercises.map((e) => ({
            exerciseId: e.id,
            answer: answers[e.id] ?? "",
            timeTakenMs: times[e.id] ?? 0,
          })),
        }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error ?? "Erro ao enviar respostas.");
      }
      const data = (await res.json()) as {
        results: RunResult[];
        correctCount: number;
        total: number;
        mastered: boolean;
      };
      setResults(data.results);
      setPhase("review");
      setMastery((prev) => ({
        ...prev,
        [skill.id]: Math.max(prev[skill.id] ?? 0, Math.round((data.correctCount / data.total) * 100)),
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao enviar respostas.");
    } finally {
      setSubmitting(false);
    }
  };

  const nextSkillOrDone = () => {
    if (skillIdx < skills.length - 1) {
      startSkill(skillIdx + 1);
    } else {
      setPhase("done");
    }
  };

  const retry = () => {
    setOrder(shuffle(skill.exercises.map((e) => e.id)));
    setQIdx(0);
    setAnswers({});
    setTimes({});
    setResults(null);
    setPhase("question");
    questionStart.current = Date.now();
  };

  if (phase === "done") {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <div className="animate-pop text-6xl">🎉</div>
        <h1 className="mt-4 text-3xl font-bold text-slate-900 dark:text-slate-100">
          Módulo dominado!
        </h1>
        <p className="mt-2 text-slate-500 dark:text-slate-400">
          Você alcançou 100% de domínio em todas as habilidades de{" "}
          <strong>{module.title}</strong>.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link href={`/${module.subjectSlug}`}>
            <Button>Voltar para {module.subjectName}</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (phase === "review" && results) {
    const correctCount = results.filter((r) => r.correta).length;
    const mastered = correctCount === results.length;
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className={`text-sm font-medium ${a.text}`}>{module.subjectName}</p>
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              {module.title}
            </h1>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold">
              <span className={mastered ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}>
                {correctCount}/{results.length}
              </span>
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">acertos</p>
          </div>
        </div>

        <div className="space-y-3">
          {results.map((r) => {
            const exercise = exercises.find((e) => e.id === r.exerciseId);
            return (
              <Card
                key={r.exerciseId}
                className={`border-l-4 ${r.correta ? "border-l-emerald-500" : "border-l-rose-500"}`}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="font-medium text-slate-900 dark:text-slate-100">
                    {exercise?.prompt}
                  </p>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-bold ${
                      r.correta
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                        : "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300"
                    }`}
                  >
                    {r.correta ? "Acertou" : `Nota ${r.nota}`}
                  </span>
                </div>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                  {r.explicacao}
                </p>
                {r.dica && (
                  <p className="mt-1 text-sm text-indigo-600 dark:text-indigo-400">
                    💡 {r.dica}
                  </p>
                )}
              </Card>
            );
          })}
        </div>

        <div className="mt-6 flex justify-center gap-3">
          {mastered ? (
            <>
              <Button variant="success" onClick={nextSkillOrDone}>
                {skillIdx < skills.length - 1
                  ? "Continuar para a próxima habilidade →"
                  : "Concluir módulo 🎉"}
              </Button>
              <Link href={`/${module.subjectSlug}`}>
                <Button variant="secondary">Voltar</Button>
              </Link>
            </>
          ) : (
            <>
              <Button variant="danger" onClick={retry}>
                Refazer lista (acertou tudo = avança!)
              </Button>
              <Link href={`/${module.subjectSlug}`}>
                <Button variant="secondary">Sair do módulo</Button>
              </Link>
            </>
          )}
        </div>
        <div ref={bottomRef} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <p className={`text-sm font-medium ${a.text}`}>{module.subjectName}</p>
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              {module.title}
            </h1>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Domínio do módulo
            </p>
            <p className="text-lg font-bold text-slate-900 dark:text-slate-100">
              {moduleMastery}%
            </p>
          </div>
        </div>
        <ProgressBar value={moduleMastery} className="mt-3" />
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {skills.map((s, i) => {
          const done = (mastery[s.id] ?? 0) === 100;
          const active = i === skillIdx;
          return (
            <span
              key={s.id}
              className={`rounded-full px-3 py-1 text-xs font-medium ${
                done
                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                  : active
                    ? `${a.soft} ${a.text} border ${a.border}`
                    : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
              }`}
            >
              {done ? "✓ " : ""}
              {s.name}
            </span>
          );
        })}
      </div>

      <Card className="animate-fade-in-up" key={`${skill.id}-${qIdx}`}>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
          <span>
            Habilidade: <strong>{skill.name}</strong>
          </span>
          <span className="flex items-center gap-2">
            <span>
              Questão {qIdx + 1} de {exercises.length}
            </span>
            <Button
              variant="secondary"
              className="!py-1 !px-2 text-xs"
              onClick={addGenerated}
              disabled={generating}
              title="Gera um exercício extra para esta habilidade usando IA"
            >
              {generating ? "Gerando…" : "＋ Exercício novo (IA)"}
            </Button>
          </span>
        </div>
        {genError && (
          <p className="mb-3 rounded-lg bg-rose-50 p-2 text-xs text-rose-700 dark:bg-rose-950 dark:text-rose-300">
            {genError}
          </p>
        )}

        <p className="text-lg font-medium text-slate-900 dark:text-slate-100">
          {current.prompt}
        </p>

        <div className="mt-5">
          {current.type === "multipla_escolha" && (
            <div className="grid gap-2 sm:grid-cols-2">
              {(current.options ?? []).map((opt) => {
                const selected = answers[current.id] === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => recordAnswer(current.id, opt.id)}
                    className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm transition ${
                      selected
                        ? "border-indigo-500 bg-indigo-50 text-indigo-700 ring-2 ring-indigo-500/30 dark:bg-indigo-950 dark:text-indigo-300"
                        : "border-slate-300 bg-white text-slate-800 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                    }`}
                  >
                    <span
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                        selected
                          ? "bg-indigo-600 text-white"
                          : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                      }`}
                    >
                      {opt.id.toUpperCase()}
                    </span>
                    {opt.text}
                  </button>
                );
              })}
            </div>
          )}

          {current.type === "preenchimento" && (
            <input
              value={answers[current.id] ?? ""}
              onChange={(e) => recordAnswer(current.id, e.target.value)}
              placeholder="Digite sua resposta..."
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            />
          )}

          {current.type === "dissertativa" && (
            <textarea
              value={answers[current.id] ?? ""}
              onChange={(e) => recordAnswer(current.id, e.target.value)}
              placeholder="Escreva sua resposta..."
              rows={4}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            />
          )}

          {current.type === "escrita_mao" && (
            <div className="space-y-3">
              <HandwritingPad
                onChange={(dataUrl) => recordAnswer(current.id, dataUrl)}
                defaultImage={
                  answers[current.id]?.startsWith("data:image")
                    ? answers[current.id]
                    : undefined
                }
              />
              <p className="text-xs text-slate-400">
                Escreva a resposta com a caneta do tablet (ou com o dedo). Se errar, use
                desfazer ou limpar e tente de novo.
              </p>
            </div>
          )}

          {current.type === "fala" && (
            <div className="space-y-3">
              <div className="flex gap-2">
                <input
                  value={answers[current.id] ?? ""}
                  onChange={(e) => recordAnswer(current.id, e.target.value)}
                  placeholder="Fale no microfone ou digite sua fala em inglês..."
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-500/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                />
                {micSupported ? (
                  <button
                    type="button"
                    onClick={micActive ? stopMic : startMic}
                    className={`shrink-0 rounded-xl px-4 py-2 text-sm font-medium transition ${
                      micActive
                        ? "animate-pulse bg-orange-600 text-white"
                        : "border border-orange-300 bg-orange-50 text-orange-600 hover:bg-orange-100 dark:border-orange-900 dark:bg-orange-950 dark:text-orange-300"
                    }`}
                    title="Falar no microfone (Chrome/Edge)"
                  >
                    {micActive ? "Ouvindo…" : "🎤 Falar"}
                  </button>
                ) : null}
              </div>
              <p className="text-xs text-slate-400">
                Dica: o reconhecimento de voz funciona melhor no Chrome/Edge. Pode digitar também.
              </p>
            </div>
          )}
        </div>

        {error && (
          <p className="mt-4 rounded-lg bg-rose-50 p-3 text-sm text-rose-700 dark:bg-rose-950 dark:text-rose-300">
            {error}
          </p>
        )}

        <div className="mt-6 flex justify-end">
          <Button
            onClick={confirmAnswer}
            disabled={!answers[current.id] || submitting}
          >
            {submitting
              ? "Corrigindo…"
              : qIdx < exercises.length - 1
                ? "Responder e continuar"
                : "Finalizar lista"}
          </Button>
        </div>
      </Card>

      <div className="mt-4 text-center">
        <Link
          href={`/${module.subjectSlug}`}
          className="text-sm text-slate-500 underline-offset-2 hover:underline dark:text-slate-400"
        >
          ← Voltar para {module.subjectName} ({STATUS_LABEL.em_progresso})
        </Link>
      </div>
      <div ref={bottomRef} />
    </div>
  );
}
