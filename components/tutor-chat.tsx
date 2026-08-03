"use client";

import { useEffect, useRef, useState } from "react";
import { Button, Card } from "@/components/ui";

type Msg = { role: "user" | "assistant"; content: string };

const INITIAL: Msg[] = [
  {
    role: "assistant",
    content:
      "Hi! I'm Sam, your English coach. 😊 Let's practice together. Say something in English — anything!",
  },
];

const TIPS = [
  "How are you today?",
  "My name is...",
  "I like English!",
  "What is your favorite color?",
];

export function TutorChat() {
  const [messages, setMessages] = useState<Msg[]>(INITIAL);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [speak, setSpeak] = useState(true);
  const [micActive, setMicActive] = useState(false);
  const [micSupported, setMicSupported] = useState(true);
  const [voiceAvailable, setVoiceAvailable] = useState(false);

  const listRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<unknown>(null);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    setVoiceAvailable(typeof window !== "undefined" && "speechSynthesis" in window);
    if (typeof window !== "undefined") {
      const w = window as unknown as {
        SpeechRecognition?: unknown;
        webkitSpeechRecognition?: unknown;
      };
      if (!w.SpeechRecognition && !w.webkitSpeechRecognition) {
        setMicSupported(false);
      }
    }
  }, []);

  const say = (text: string) => {
    if (!speak || typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "en-US";
    u.rate = 0.9;
    const voices = window.speechSynthesis.getVoices();
    const en = voices.find((v) => v.lang.startsWith("en"));
    if (en) u.voice = en;
    window.speechSynthesis.speak(u);
  };

  const send = async (text?: string) => {
    const content = (text ?? input).trim();
    if (!content || loading) return;
    setInput("");
    const history: Msg[] = [...messages, { role: "user", content }];
    setMessages(history);
    setLoading(true);
    try {
      const res = await fetch("/api/tutor", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ subject: "ingles", history }),
      });
      const data = (await res.json().catch(() => ({}))) as { text?: string };
      const reply = data.text ?? "Sorry, I couldn't hear you. Could you try again?";
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
      say(reply);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Hmm, something went wrong. Please try again!" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const startMic = () => {
    if (!micSupported) return;
    const w = window as unknown as {
      SpeechRecognition?: new () => SpeechRecognitionLike;
      webkitSpeechRecognition?: new () => SpeechRecognitionLike;
    };
    const SR = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!SR) return;
    stopMic();
    const rec = new SR();
    rec.lang = "en-US";
    rec.interimResults = false;
    rec.onresult = (e) => {
      const transcript = e.results[0]?.[0]?.transcript ?? "";
      setInput(transcript);
      void send(transcript);
    };
    rec.onend = () => setMicActive(false);
    rec.onerror = () => setMicActive(false);
    recognitionRef.current = rec;
    try {
      rec.start();
      setMicActive(true);
    } catch {
      setMicActive(false);
    }
  };

  const stopMic = () => {
    const r = recognitionRef.current as { stop?: () => void } | null;
    r?.stop?.();
    setMicActive(false);
  };

  return (
    <Card className="flex h-[560px] flex-col">
      <div className="flex items-center justify-between border-b border-slate-200 pb-3 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-500 text-lg text-white">
            🦉
          </span>
          <div>
            <p className="font-semibold text-slate-900 dark:text-slate-100">Sam, o Professor de Inglês</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Fale ou escreva em inglês — eu corrijo com carinho
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setSpeak((s) => !s)}
          className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
            speak
              ? "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300"
              : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
          }`}
          title="Ligar/desligar voz"
        >
          {speak ? "🔊 Voz ligada" : "🔇 Voz desligada"}
        </button>
      </div>

      <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto py-4">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
                m.role === "user"
                  ? "rounded-br-md bg-indigo-600 text-white"
                  : "rounded-bl-md bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-100"
              }`}
            >
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="rounded-2xl rounded-bl-md bg-slate-100 px-4 py-2.5 text-sm text-slate-400 dark:bg-slate-800">
              Sam is typing…
            </div>
          </div>
        )}
      </div>

      <div className="border-t border-slate-200 pt-3 dark:border-slate-800">
        <div className="mb-2 flex flex-wrap gap-1.5">
          {TIPS.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => void send(t)}
              className="rounded-full border border-orange-200 bg-orange-50 px-2.5 py-1 text-xs text-orange-700 transition hover:bg-orange-100 dark:border-orange-900 dark:bg-orange-950 dark:text-orange-300"
            >
              {t}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && void send()}
            placeholder="Say something in English..."
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-500/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
          />
          {micSupported ? (
            <button
              type="button"
              onClick={micActive ? stopMic : startMic}
              className={`shrink-0 rounded-xl px-4 py-2 text-sm font-medium transition ${
                micActive
                  ? "animate-pulse bg-orange-600 text-white"
                  : "border border-orange-300 bg-orange-50 text-orange-600 hover:bg-orange-100 dark:border-orange-900 dark:bg-orange-950 dark:text-orange-300"
              }`}
              title="Falar (Chrome/Edge)"
            >
              {micActive ? "Ouvindo…" : "🎤"}
            </button>
          ) : null}
          <Button variant="success" onClick={() => void send()} disabled={!input.trim() || loading}>
            Enviar
          </Button>
        </div>
        <p className="mt-2 text-xs text-slate-400">
          {voiceAvailable
            ? "Sam lê as respostas em voz alta para você praticar a pronúncia."
            : "Seu navegador não suporta voz neste dispositivo."}
        </p>
      </div>
    </Card>
  );
}

type SpeechRecognitionLike = {
  lang: string;
  interimResults: boolean;
  onresult: (e: {
    results: { [i: number]: { [j: number]: { transcript: string } } };
  }) => void;
  onend: () => void;
  onerror: () => void;
  start: () => void;
  stop: () => void;
};
