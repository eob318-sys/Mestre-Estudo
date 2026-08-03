"use client";

import { Card } from "@/components/ui";

export type KnowledgeSkill = { id: string; name: string; mastery: number };
export type KnowledgeSubject = {
  id: string;
  name: string;
  color: string;
  skills: KnowledgeSkill[];
};

const COLOR_HEX: Record<string, string> = {
  blue: "#3b82f6",
  green: "#10b981",
  orange: "#f97316",
};

function masteryColor(value: number): string {
  if (value >= 100) return "bg-emerald-500";
  if (value >= 50) return "bg-amber-500";
  if (value > 0) return "bg-rose-400";
  return "bg-slate-300 dark:bg-slate-700";
}

export function KnowledgeMap({ subjects }: { subjects: KnowledgeSubject[] }) {
  return (
    <Card className="mt-6">
      <h2 className="mb-1 font-semibold text-slate-900 dark:text-slate-100">
        🗺️ Mapa de conhecimento
      </h2>
      <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
        Cada barra é uma habilidade — cheia (100%) = dominada.
      </p>
      <div className="grid gap-6 md:grid-cols-3">
        {subjects.map((s) => (
          <div key={s.id}>
            <div className="mb-2 flex items-center gap-2">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: COLOR_HEX[s.color] ?? "#6366f1" }}
              />
              <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                {s.name}
              </span>
            </div>
            <ul className="space-y-1.5">
              {s.skills.map((sk) => (
                <li key={sk.id} className="flex items-center gap-2">
                  <span className="w-1/2 truncate text-xs text-slate-600 dark:text-slate-300">
                    {sk.name}
                  </span>
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                    <div
                      className={`h-full rounded-full transition-all ${masteryColor(sk.mastery)}`}
                      style={{ width: `${sk.mastery}%` }}
                    />
                  </div>
                  <span className="w-8 text-right text-xs font-medium text-slate-500 dark:text-slate-400">
                    {sk.mastery}%
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </Card>
  );
}
