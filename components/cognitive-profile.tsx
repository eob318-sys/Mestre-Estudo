"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui";

type Profile = {
  speed: number;
  accuracy: number;
  focus: number;
  memory: number;
  interpretation: number;
  logic: number;
  persistence: number;
  level: "inicial" | "em_desenvolvimento" | "consistente";
  feedback: string[];
  sampleSize: number;
};

type NumberKey = Exclude<keyof Profile, "level" | "feedback" | "sampleSize">;

const DIMS: { key: NumberKey; label: string }[] = [
  { key: "speed", label: "Velocidade" },
  { key: "accuracy", label: "Precisão" },
  { key: "focus", label: "Foco" },
  { key: "memory", label: "Memória" },
  { key: "interpretation", label: "Interpretação" },
  { key: "logic", label: "Lógica" },
  { key: "persistence", label: "Persistência" },
];

const LEVEL_LABEL: Record<Profile["level"], string> = {
  inicial: "Perfil inicial — praticando para conhecer você",
  em_desenvolvimento: "Perfil em desenvolvimento — bons sinais!",
  consistente: "Perfil consistente — você está no caminho certo!",
};

function barColor(value: number): string {
  if (value >= 80) return "bg-emerald-500";
  if (value >= 50) return "bg-amber-500";
  return "bg-rose-500";
}

export function CognitiveProfile() {
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    fetch("/api/cognitive")
      .then((r) => (r.ok ? r.json() : null))
      .then((p) => setProfile(p ?? null))
      .catch(() => setProfile(null));
  }, []);

  if (!profile || profile.sampleSize === 0) return null;

  return (
    <Card className="mt-6">
      <h2 className="mb-1 font-semibold text-slate-900 dark:text-slate-100">
        Perfil do aluno
      </h2>
      <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
        {LEVEL_LABEL[profile.level]} · baseado em {profile.sampleSize} exercício
        {profile.sampleSize === 1 ? "" : "s"}
      </p>

      <div className="grid gap-x-8 gap-y-3 sm:grid-cols-2">
        {DIMS.map((d) => (
          <div key={d.key}>
            <div className="mb-1 flex items-center justify-between text-sm">
              <span className="text-slate-600 dark:text-slate-300">{d.label}</span>
              <span className="font-semibold text-slate-900 dark:text-slate-100">
                {profile[d.key]}%
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
              <div
                className={`h-full rounded-full transition-all ${barColor(profile[d.key])}`}
                style={{ width: `${profile[d.key]}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {profile.feedback.length > 0 && (
        <ul className="mt-4 space-y-1.5 text-sm text-slate-600 dark:text-slate-300">
          {profile.feedback.map((f) => (
            <li key={f} className="flex gap-2">
              <span aria-hidden>💡</span>
              <span>{f}</span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
