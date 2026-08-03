"use client";

import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Button, Card, Input } from "@/components/ui";

export default function RegisterForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"student" | "responsible">("student");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name, email, password, role }),
    });
    const data = (await res.json().catch(() => ({}))) as { error?: string };
    if (!res.ok) {
      setError(data.error ?? "Erro ao criar conta.");
      setLoading(false);
      return;
    }

    const signin = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    if (signin?.error) {
      setError("Conta criada, mas falha no login automático. Entre manualmente.");
      setLoading(false);
      return;
    }
    router.push(role === "responsible" ? "/painel" : "/diagnostico");
    router.refresh();
  };

  return (
    <Card className="w-full max-w-md">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
        Criar conta
      </h1>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        Alunos começam com um teste rápido de posicionamento; responsáveis
        acompanham o progresso de um ou mais alunos.
      </p>
      <form onSubmit={submit} className="mt-6 space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Você é…
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setRole("student")}
              aria-pressed={role === "student"}
              className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition ${
                role === "student"
                  ? "border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300"
                  : "border-slate-300 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              }`}
            >
              🧑‍🎓 Aluno
            </button>
            <button
              type="button"
              onClick={() => setRole("responsible")}
              aria-pressed={role === "responsible"}
              className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition ${
                role === "responsible"
                  ? "border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300"
                  : "border-slate-300 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              }`}
            >
              👨‍👩‍👧 Responsável
            </button>
          </div>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Seu nome
          </label>
          <Input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Como você quer ser chamado?"
          />
        </div>
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
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Senha
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
        {error && (
          <p className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700 dark:bg-rose-950 dark:text-rose-300">
            {error}
          </p>
        )}
        <Button type="submit" disabled={loading} className="w-full">
          {loading
            ? "Criando conta…"
            : role === "responsible"
              ? "Criar conta de responsável"
              : "Criar conta e fazer diagnóstico"}
        </Button>
      </form>
      <p className="mt-4 text-center text-sm text-slate-500 dark:text-slate-400">
        Já tem conta?{" "}
        <Link href="/login" className="font-medium text-indigo-600 hover:underline dark:text-indigo-400">
          Entrar
        </Link>
      </p>
    </Card>
  );
}
