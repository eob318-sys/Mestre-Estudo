"use client";

import { avatarStageForLevel, nextAvatarStage } from "@/lib/avatar";

export function Avatar({ level, size = "md" }: { level: number; size?: "sm" | "md" | "lg" }) {
  const stage = avatarStageForLevel(level);
  const next = nextAvatarStage(level);
  const sizeClass =
    size === "lg"
      ? "h-24 w-24 text-5xl"
      : size === "sm"
        ? "h-8 w-8 text-base"
        : "h-16 w-16 text-3xl";

  return (
    <div className="inline-flex flex-col items-center gap-1" title={`${stage.name} — ${stage.description}`}>
      <div
        className={`flex ${sizeClass} items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-100 to-violet-200 ring-2 ring-indigo-300 dark:from-indigo-950 dark:to-violet-900 dark:ring-indigo-700`}
        role="img"
        aria-label={`Avatar: ${stage.name}`}
      >
        <span aria-hidden>{stage.emoji}</span>
      </div>
      {next && size === "lg" && (
        <p className="text-center text-xs text-slate-500 dark:text-slate-400">
          Nível {next.minLevel} → {next.emoji} {next.name}
        </p>
      )}
    </div>
  );
}
