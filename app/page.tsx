import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Badge, Button, Card } from "@/components/ui";

const FEATURES = [
  {
    title: "Progressão por domínio",
    desc: "Só avança para o próximo módulo com 100% de acerto — do básico ao avançado, português, matemática e inglês.",
    icon: "📈",
  },
  {
    title: "Correção com IA gratuita",
    desc: "Eixos corrigidos na hora, com o erro explicado. Google Gemini, Groq e OpenRouter com failover automático, sem cartão.",
    icon: "⚡",
  },
  {
    title: "Tutor em português",
    desc: "Um tutor que explica da sua forma, com exemplo e um desafio para você tentar na sequência.",
    icon: "🎓",
  },
  {
    title: "Simulado com cronômetro",
    desc: "10 questões sorteadas com 2 minutos por questão e correção imediata no fim.",
    icon: "⏱️",
  },
  {
    title: "Motivação do aluno",
    desc: "XP, níveis, missões e um avatar que evolui conforme você estuda.",
    icon: "🦉",
  },
  {
    title: "Acompanhamento do responsável",
    desc: "Métricas, alertas e relatório semanal por e-mail para você acompanhar de perto.",
    icon: "👨‍👩‍👧",
  },
];

const SUBJECTS = [
  { name: "Português", slug: "/portugues", color: "bg-indigo-600" },
  { name: "Matemática", slug: "/matematica", color: "bg-violet-600" },
  { name: "Inglês", slug: "/ingles", color: "bg-sky-600" },
];

const STEPS = [
  { n: "1", title: "Diagnóstico inicial", desc: "Um teste curto posiciona você no módulo certo de cada matéria." },
  { n: "2", title: "Estude em cadeia", desc: "Exercícios com correção na hora. Errou? Aprimora. Acertou 100%? Avança." },
  { n: "3", title: "Reproduza e acompanhe", desc: "Simulados, modo foco e relatórios semanais para o responsável." },
];

export default async function Home() {
  const session = await getServerSession(authOptions);
  if (session?.user?.id) redirect("/dashboard");

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <header className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-base font-bold text-white">
            ME
          </span>
          <span className="text-lg font-bold">Mestre do Estudo</span>
        </Link>
        <nav className="flex items-center gap-2">
          <Link href="/login">
            <Button variant="ghost">Entrar</Button>
          </Link>
          <Link href="/register">
            <Button>Criar conta</Button>
          </Link>
        </nav>
      </header>

      <section className="mx-auto max-w-5xl px-4 pb-16 pt-14 text-center">
        <Badge color="indigo" className="mb-4">
          Estudos adaptativos para educação básica
        </Badge>
        <h1 className="mx-auto max-w-3xl text-4xl font-black leading-tight sm:text-5xl">
          Aprenda de verdade, do seu jeito, no seu ritmo 📚
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600 dark:text-slate-400">
          Método inspirado no Kumon: cada aluno avança somente ao dominar o conteúdo.
          Correção por IA gratuita, tutor em português, simulados e acompanhamento para os responsáveis.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link href="/register">
            <Button className="h-11 px-6 text-base">Começar grátis</Button>
          </Link>
          <Link href="/login">
            <Button variant="secondary" className="h-11 px-6 text-base">
              Já tenho conta
            </Button>
          </Link>
        </div>
        <p className="mt-4 text-xs text-slate-500 dark:text-slate-500">
          Sem cartão · IA 100% gratuita · Funciona de qualquer navegador
        </p>
      </section>

      <section className="mx-auto max-w-5xl px-4 pb-16">
        <div className="mb-8 flex flex-wrap items-center justify-center gap-3">
          {SUBJECTS.map((s) => (
            <span
              key={s.name}
              className={`${s.color} rounded-full px-5 py-2 text-sm font-semibold text-white shadow-sm`}
            >
              {s.name}
            </span>
          ))}
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <Card key={f.title} className="text-left">
              <div className="text-2xl">{f.icon}</div>
              <h3 className="mt-3 font-bold text-slate-900 dark:text-slate-100">{f.title}</h3>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{f.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="border-y border-slate-200 bg-white py-14 dark:border-slate-800 dark:bg-slate-900/40">
        <div className="mx-auto max-w-5xl px-4">
          <h2 className="text-center text-2xl font-bold sm:text-3xl">Como funciona</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-3">
            {STEPS.map((s) => (
              <div key={s.n} className="text-center">
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-indigo-600 font-bold text-white">
                  {s.n}
                </div>
                <h3 className="mt-3 font-semibold">{s.title}</h3>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{s.desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link href="/register">
              <Button className="h-11 px-6 text-base">Quero experimentar</Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-14">
        <div className="grid gap-4 rounded-2xl border border-indigo-200 bg-indigo-50 p-8 text-center dark:border-indigo-900 dark:bg-indigo-950/30 sm:grid-cols-3">
          <div>
            <p className="text-3xl font-black text-indigo-700 dark:text-indigo-300">3</p>
            <p className="text-sm text-slate-600 dark:text-slate-400">matérias completas</p>
          </div>
          <div>
            <p className="text-3xl font-black text-indigo-700 dark:text-indigo-300">90+</p>
            <p className="text-sm text-slate-600 dark:text-slate-400">exercícios de partida</p>
          </div>
          <div>
            <p className="text-3xl font-black text-indigo-700 dark:text-indigo-300">∞</p>
            <p className="text-sm text-slate-600 dark:text-slate-400">novos exercícios gerados por IA</p>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-200 py-8 dark:border-slate-800">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-3 px-4 text-sm text-slate-500 sm:flex-row dark:text-slate-400">
          <p>Mestre do Estudo — estudo adaptativo com IA</p>
          <span className="flex items-center gap-2">
            <Badge color="green">Aluno</Badge>
            <Badge color="blue">Responsável</Badge>
          </span>
        </div>
      </footer>
    </div>
  );
}