"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { BREAK_MINUTES, FOCUS_MINUTES, formatRemaining } from "@/lib/focus";
import { Button, Card } from "@/components/ui";

export default function FocusTimer() {
  const router = useRouter();
  const [phase, setPhase] = useState<"focus" | "break">("focus");
  const [running, setRunning] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(FOCUS_MINUTES * 60);
  const [totalSessionMs, setTotalSessionMs] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);
  const [saved, setSaved] = useState(false);
  const startRef = useRef<number | null>(null);

  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(t);
          if (phase === "focus") {
            setPhase("break");
            setSecondsLeft(BREAK_MINUTES * 60);
          } else {
            setRunning(false);
            setSaved(true);
            setSecondsLeft(0);
            const endMs = Date.now();
            const start = startRef.current ?? endMs;
            const dur = endMs - start;
            setTotalSessionMs(dur);
            saveSession(dur, true);
          }
          return 0;
        }
        return s - 1;
      });
      setElapsed((e) => e + 1000);
    }, 1000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, phase]);

  const saveSession = async (durationMs: number, completed: boolean) => {
    try {
      await fetch("/api/focus", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ durationMs, completed }),
      });
      router.refresh();
    } catch {
      // sessão não salva é melhor que travar o cronômetro
    }
  };

  const start = () => {
    if (startRef.current === null) startRef.current = Date.now();
    setRunning(true);
    setSaved(false);
  };
  const pause = () => setRunning(false);
  const reset = () => {
    setRunning(false);
    setPhase("focus");
    setSecondsLeft(FOCUS_MINUTES * 60);
    setElapsed(0);
    setSaved(false);
    if (startRef.current !== null) {
      const dur = Date.now() - startRef.current;
      setTotalSessionMs(dur);
      saveSession(dur, false);
      startRef.current = null;
    }
  };

  const toggleFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    } else {
      document.documentElement.requestFullscreen().catch(() => {});
    }
  };

  useEffect(() => {
    const onFs = () => setFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onFs);
    return () => document.removeEventListener("fullscreenchange", onFs);
  }, []);

  const isFocus = phase === "focus";
  const progressPct = isFocus
    ? ((FOCUS_MINUTES * 60 - secondsLeft) / (FOCUS_MINUTES * 60)) * 100
    : ((BREAK_MINUTES * 60 - secondsLeft) / (BREAK_MINUTES * 60)) * 100;

  return (
    <Card className="mx-auto w-full max-w-md p-8 text-center">
      <p
        className={`text-sm font-semibold uppercase tracking-widest ${
          isFocus
            ? "text-indigo-600 dark:text-indigo-400"
            : "text-emerald-600 dark:text-emerald-400"
        }`}
      >
        {isFocus ? "🧘 Foco" : "☕ Pausa"}
      </p>
      <p className="mt-4 text-7xl font-black tabular-nums text-slate-900 dark:text-slate-100">
        {formatRemaining(secondsLeft)}
      </p>

      <div className="mx-auto mt-5 h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
        <div
          className={`h-full rounded-full transition-all ${
            isFocus
              ? "bg-gradient-to-r from-indigo-500 to-violet-500"
              : "bg-emerald-500"
          }`}
          style={{ width: `${Math.max(2, progressPct)}%` }}
        />
      </div>

      <div className="mt-6 flex justify-center gap-2">
        {!running ? (
          <Button onClick={start}>{startRef.current !== null ? "Retomar" : "Iniciar foco"}</Button>
        ) : (
          <Button variant="secondary" onClick={pause}>
            Pausar
          </Button>
        )}
        <Button variant="secondary" onClick={reset}>
          Reiniciar
        </Button>
        <Button variant="secondary" onClick={toggleFullscreen}>
          {fullscreen ? "Sair da tela cheia" : "⛶ Tela cheia"}
        </Button>
      </div>

      {running && fullscreen && (
        <p className="mt-4 text-xs text-slate-500 dark:text-slate-400">
          Modo concentração ativo — mantenha o foco! 🔒
        </p>
      )}
      {saved && (
        <p className="mt-4 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
          🎉 Sessão concluída! +{Math.round(totalSessionMs / 60000) * 5} XP registrados.
        </p>
      )}
      {elapsed > 0 && running && (
        <p className="mt-4 text-xs text-slate-500 dark:text-slate-400">
          {Math.floor(elapsed / 60000)} min de foco nesta sessão
        </p>
      )}
    </Card>
  );
}
