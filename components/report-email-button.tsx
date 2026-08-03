"use client";

import { useState } from "react";
import { Button } from "@/components/ui";

export function ReportEmailButton({ email, name }: { email: string; name: string }) {
  const [state, setState] = useState<{ msg: string; ok: boolean } | null>(null);
  const [loading, setLoading] = useState(false);

  const send = async () => {
    setLoading(true);
    setState(null);
    try {
      const res = await fetch("/api/report/email", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = (await res.json()) as { ok?: boolean; mode?: string; error?: string; msg?: string };
      setState({
        ok: data.ok === true,
        msg: data.msg ?? data.error ?? "Falha ao enviar.",
      });
    } catch {
      setState({ ok: false, msg: "Falha de conexão." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-end gap-1">
      <Button variant="secondary" onClick={send} disabled={loading}>
        {loading ? "Enviando…" : "📧 Enviar por e-mail"}
      </Button>
      {state && (
        <p className={`max-w-xs text-right text-xs ${state.ok ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"}`}>
          {state.ok ? "Enviado para " + email + "." : state.msg}
        </p>
      )}
      <p className="text-[11px] text-slate-400">Destinatário: {email || name || "sua conta"}</p>
    </div>
  );
}