"use client";

import { useRef, useState, type FormEvent } from "react";
import { Button, Card, Input } from "@/components/ui";

type Msg = { role: "user" | "assistant"; content: string };

const SUGGESTIONS = [
  "Pode me dar um exemplo do conteúdo do módulo?",
  "Não entendi essa matéria, explica de novo",
  "Me dê um desafio rápido para praticar",
];

export function TutorPtChat({ studentName }: { studentName: string }) {
  const [subject, setSubject] = useState("matematica");
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "assistant",
      content: `Olá, ${studentName}! 👋 Sou seu tutor em português. Pergunte sobre ${subject === "portugues" ? "Português" : subject === "matematica" ? "Matemática" : "Inglês"} e eu explico do seu jeito.`,
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  const send = async (text: string) => {
    if (!text.trim() || loading) return;
    const history: Msg[] = [...messages, { role: "user", content: text }];
    setMessages(history);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/tutor-pt", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ subject, messages: history.slice(0, -1) }),
      });
      const data = (await res.json()) as { reply?: string; error?: string };
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content: data.reply ?? data.error ?? "Sem resposta. Tente de novo.",
        },
      ]);
    } catch {
      setMessages((m) => [...m, { role: "assistant", content: "Erro de conexão. Tente novamente." }]);
    } finally {
      setLoading(false);
      endRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  };

  const changeSubject = (s: string) => {
    setSubject(s);
    setMessages([
      {
        role: "assistant",
        content: `Agora estou focado em ${s === "portugues" ? "Português" : s === "matematica" ? "Matemática" : "Inglês"}. Pode perguntar! 📚`,
      },
    ]);
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    void send(input);
  };

  return (
    <Card className="mx-auto flex h-[70vh] max-w-2xl flex-col">
      <div className="flex items-center gap-2 border-b border-slate-200 p-4 dark:border-slate-700">
        <span className="text-2xl" aria-hidden>🧑‍🏫</span>
        <div className="mr-2">
          <p className="font-semibold text-slate-900 dark:text-slate-100">Tutor em Português</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">Tira dúvidas de qualquer matéria</p>
        </div>
        <div className="ml-auto flex gap-1">
          {["portugues", "matematica", "ingles"].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => changeSubject(s)}
              aria-pressed={subject === s}
              className={`rounded-lg px-2.5 py-1 text-xs font-medium transition ${
                subject === s
                  ? "bg-indigo-600 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
              }`}
            >
              {s === "portugues" ? "Português" : s === "matematica" ? "Matemática" : "Inglês"}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
                m.role === "user"
                  ? "rounded-br-sm bg-indigo-600 text-white"
                  : "rounded-bl-sm bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200"
              }`}
            >
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="rounded-2xl rounded-bl-sm bg-slate-100 px-4 py-2.5 text-sm text-slate-500 dark:bg-slate-800 dark:text-slate-400">
              digitando…
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      <div className="border-t border-slate-200 p-3 dark:border-slate-700">
        <div className="mb-2 flex flex-wrap gap-2">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => void send(s)}
              className="rounded-full border border-indigo-200 px-3 py-1 text-xs text-indigo-700 transition hover:bg-indigo-50 dark:border-indigo-800 dark:text-indigo-300 dark:hover:bg-indigo-950"
            >
              {s}
            </button>
          ))}
        </div>
        <form onSubmit={submit} className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Escreva sua dúvida…"
            aria-label="Sua dúvida"
          />
          <Button type="submit" disabled={loading}>
            Enviar
          </Button>
        </form>
      </div>
    </Card>
  );
}
