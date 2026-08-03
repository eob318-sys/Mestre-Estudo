"use client";

import { Suspense, useState, type FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button, Card, Input } from "@/components/ui";

function ResetFormInner() {
  const params = useSearchParams();
  const token = params.get("token") ?? "";
  const [password, setPassword] = useState("");
  const [state, setState] = useState<{ ok: boolean; msg: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setState(null);
    const res = await fetch("/api/auth/redefinir", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ token, password }),
    });
    const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
    setLoading(false);
    if (!res.ok) {
      setState({ ok: false, msg: data.error ?? "Erro ao redefinir." });
      return;
    }
    setState({ ok: true, msg: "Senha redefinida! Entre com sua nova senha." });
  };

  if (!token) {
    return (
      <Card className="w-full max-w-md">
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Link inválido. Solicite a redefinição novamente em{" "}
          <Link href="/esqueci-senha" className="font-medium text-indigo-600 underline dark:text-indigo-400">
            esqueci minha senha
          </Link>
          .
        </p>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
        Redefinir senha
      </h1>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        Escolha uma nova senha com pelo menos 6 caracteres.
      </p>
      <form onSubmit={submit} className="mt-6 space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Nova senha
          </label>
          <Input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Mínimo de 6 caracteres"
          />
        </div>
        {state?.ok && (
          <p className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
            {state.msg}
          </p>
        )}
        {state && !state.ok && (
          <p className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700 dark:bg-rose-950 dark:text-rose-300">
            {state.msg}
          </p>
        )}
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Redefinindo…" : "Redefinir senha"}
        </Button>
        {state?.ok && (
          <Link href="/login">
            <Button variant="secondary" className="w-full">
              Ir para o login
            </Button>
          </Link>
        )}
      </form>
    </Card>
  );
}

export default function ResetPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <Suspense fallback={null}>
        <ResetFormInner />
      </Suspense>
    </div>
  );
}