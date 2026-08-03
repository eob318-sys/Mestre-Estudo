"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Badge, Card } from "@/components/ui";
import { ERROR_TYPE_LABELS } from "@/lib/reinforcement";

type Suggestion = {
  microSkillId: string;
  skillName: string;
  moduleId: string;
  moduleTitle: string;
  subjectSlug: string;
  errorType: string;
  errorCount: number;
};

const SUBJECT_LABEL: Record<string, string> = {
  portugues: "Português",
  matematica: "Matemática",
  ingles: "Inglês",
};

export function ReinforcementSuggestions() {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);

  useEffect(() => {
    fetch("/api/reinforcement")
      .then((r) => (r.ok ? r.json() : []))
      .then((s: Suggestion[]) => setSuggestions(s))
      .catch(() => setSuggestions([]));
  }, []);

  if (suggestions.length === 0) return null;

  return (
    <Card className="mt-6">
      <h2 className="mb-1 font-semibold text-slate-900 dark:text-slate-100">
        🎯 Trilha de reforço
      </h2>
      <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
        Exercícios extras baseados nos seus erros mais frequentes.
      </p>
      <ul className="space-y-2">
        {suggestions.map((s) => (
          <li key={s.microSkillId}>
            <Link
              href={`/${s.subjectSlug}/${s.moduleId}`}
              className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm transition hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800"
            >
              <span className="font-medium text-slate-800 dark:text-slate-200">
                {s.skillName}
                <span className="ml-2 text-xs font-normal text-slate-500 dark:text-slate-400">
                  {SUBJECT_LABEL[s.subjectSlug] ?? s.subjectSlug} · {s.moduleTitle}
                </span>
              </span>
              <span className="flex items-center gap-2">
                <Badge color="rose">
                  {s.errorCount} erro{s.errorCount === 1 ? "" : "s"} de{" "}
                  {ERROR_TYPE_LABELS[s.errorType] ?? s.errorType}
                </Badge>
                <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                  Reforçar →
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </Card>
  );
}
