"use client";

import { useEffect, useState } from "react";
import {
  FONT_SCALES,
  applyAccessibility,
  loadAccessibility,
  type ContrastMode,
  type FontScale,
} from "@/lib/accessibility";

export function AccessibilityMenu() {
  const [open, setOpen] = useState(false);
  const [contrast, setContrast] = useState<ContrastMode>("normal");
  const [fontScale, setFontScale] = useState<FontScale>("100");

  useEffect(() => {
    const loaded = loadAccessibility();
    setContrast(loaded.contrast);
    setFontScale(loaded.fontScale);
    applyAccessibility(loaded.contrast, loaded.fontScale);
  }, []);

  const setMode = (mode: ContrastMode) => {
    setContrast(mode);
    applyAccessibility(mode, fontScale);
  };
  const setScale = (scale: FontScale) => {
    setFontScale(scale);
    applyAccessibility(contrast, scale);
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-label="Opções de acessibilidade"
        className="rounded-lg px-2 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
      >
        ♿
      </button>
      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-64 rounded-xl border border-slate-200 bg-white p-4 shadow-lg dark:border-slate-700 dark:bg-slate-900">
          <p className="mb-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
            Acessibilidade
          </p>
          <fieldset className="mb-3">
            <legend className="mb-1 text-xs font-medium text-slate-500 dark:text-slate-400">
              Contraste
            </legend>
            <div className="flex gap-2">
              {(["normal", "high"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMode(m)}
                  aria-pressed={contrast === m}
                  className={`flex-1 rounded-lg border px-2 py-1.5 text-xs font-medium transition ${
                    contrast === m
                      ? "border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300"
                      : "border-slate-300 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                  }`}
                >
                  {m === "normal" ? "Padrão" : "Alto"}
                </button>
              ))}
            </div>
          </fieldset>
          <fieldset>
            <legend className="mb-1 text-xs font-medium text-slate-500 dark:text-slate-400">
              Tamanho da fonte
            </legend>
            <div className="flex gap-2">
              {FONT_SCALES.map((f) => (
                <button
                  key={f.value}
                  type="button"
                  onClick={() => setScale(f.value)}
                  aria-pressed={fontScale === f.value}
                  className={`flex-1 rounded-lg border px-2 py-1.5 text-xs font-medium transition ${
                    fontScale === f.value
                      ? "border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300"
                      : "border-slate-300 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </fieldset>
        </div>
      )}
    </div>
  );
}
