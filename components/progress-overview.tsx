"use client";

import { Card } from "@/components/ui";
import type { Mission } from "@/lib/xp";

type Props = {
  xp: number;
  level: number;
  nextLevelXp: number;
  levelProgress: number;
  missions: Mission[];
};

const MISSION_ICON: Record<string, string> = {
  primeiros_passos: "🌱",
  dez_exercicios: "✏️",
  cinquenta_exercicios: "🏃",
  em_chamas: "🔥",
  persistente: "💪",
  dominador: "🏆",
  diagnosticado: "🧭",
};

export function ProgressOverview({ xp, level, nextLevelXp, levelProgress, missions }: Props) {
  const doneCount = missions.filter((m) => m.done).length;

  return (
    <div className="mt-6 grid gap-4 lg:grid-cols-2">
      <Card>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Seu nível
            </p>
            <p className="mt-1 text-3xl font-bold text-slate-900 dark:text-slate-100">
              Nível {level}
            </p>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400">{xp} XP</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {nextLevelXp - xp} XP para o nível {level + 1}
            </p>
          </div>
        </div>
        <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
          <div
            className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all"
            style={{ width: `${Math.max(2, levelProgress)}%` }}
          />
        </div>
        <p className="mt-1.5 text-right text-xs text-slate-500 dark:text-slate-400">
          {levelProgress}% do nível {level + 1}
        </p>
      </Card>

      <Card>
        <h2 className="mb-3 font-semibold text-slate-900 dark:text-slate-100">
          🎖️ Missões ({doneCount}/{missions.length})
        </h2>
        <ul className="space-y-2">
          {missions.map((m) => (
            <li key={m.id} className="flex items-center gap-3 text-sm">
              <span className="text-base" aria-hidden>
                {MISSION_ICON[m.id] ?? "🎯"}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`truncate font-medium ${
                      m.done
                        ? "text-emerald-700 dark:text-emerald-400"
                        : "text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    {m.title}
                    {m.done ? " ✓" : ""}
                  </span>
                  <span className="shrink-0 text-xs text-slate-500 dark:text-slate-400">
                    {Math.min(m.progress, m.target)}/{m.target}
                  </span>
                </div>
                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                  <div
                    className={`h-full rounded-full ${
                      m.done ? "bg-emerald-500" : "bg-indigo-500"
                    }`}
                    style={{ width: `${Math.min(100, (m.progress / m.target) * 100)}%` }}
                  />
                </div>
                <p className="mt-0.5 truncate text-xs text-slate-500 dark:text-slate-400">
                  {m.description}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
