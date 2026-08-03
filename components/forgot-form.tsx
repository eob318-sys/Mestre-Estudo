"use client";

import { useState, type FormEvent } from "react";
import { Button, Card, Input } from "@/components/ui";

export default function ForgotForm() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<{
    ok: boolean;
    msg: string;
    link?: string | null;
    warn?: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setState(null);
    const res = await fetch("/api/auth/esqueci", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = (await res.json().catch(() => ({}))) as {
      ok?: boolean;
      link?: string | null;
      warn?: string;
      error?: string;
    };
    setLoading(false);
    if (!res.ok) {
      setState({ ok: false, msg: data.error ?? "Erro ao solicitar." });
      return;
    }
    setState({
      ok: true,
      msg: "Se o email existir, o link de redefinição foi gerado.",
      link: data.link,
      warn: data.warn,
    });
  };

  return (
    <Card className="w-full max-w-md">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
        Esqueci minha senha
      </h1>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        Informe seu email e enviaremos um link para criar uma nova senha (válido por 1 hora).
      </p>
      <form onSubmit={submit} className="mt-6 space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Email
          </label>
          <Input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="voce@exemplo.com"
          />
        </div>
        {state?.ok && (
          <div className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
            <p>{state.msg}</p>
            {state.warn && <p className="mt-1 text-amber-600 dark:text-amber-400">{state.warn}</p>}
            {state.link && (
              <p className="mt-2 break-all text-xs">
                Link (modo desenvolvimento):{" "}
                <a href={state.link} className="font-medium underline">
                  abrir redefinição
                </a>
              </p>
            )}
          </div>
        )}
        {state && !state.ok && (
          <p className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700 dark:bg-rose-950 dark:text-rose-300">
            {state.msg}
          </p>
        )}
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Enviando…" : "Enviar link"}
        </Button>
      </form>
    </Card>
  );
}