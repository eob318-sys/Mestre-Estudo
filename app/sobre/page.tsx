import Link from "next/link";
import { Badge, Button, Card } from "@/components/ui";

const GOALS = [
  {
    icon: "📈",
    title: "Progressão por domínio",
    desc: "Inspirado no método Kumon: cada aluno só avança para o próximo módulo ao dominar o conteúdo (100% de acerto), do básico ao avançado.",
  },
  {
    icon: "⚡",
    title: "Correção com IA gratuita",
    desc: "Exercícios abertos corrigidos na hora, com o erro explicado. Gemini, Groq e OpenRouter com failover automático — sem cartão de crédito.",
  },
  {
    icon: "🎓",
    title: "Tutor em português",
    desc: "Um tutor que explica no nível do aluno, com exemplo prático e um desafio na sequência.",
  },
  {
    icon: "⏱️",
    title: "Simulados cronometrados",
    desc: "10 questões sorteadas por matéria, 2 minutos por questão e correção imediata com nota — histórico no dashboard e no painel do responsável.",
  },
  {
    icon: "🦉",
    title: "Motivação gamificada",
    desc: "XP, níveis, missões e avatar que evolui com o estudo. O progresso vira rotina.",
  },
  {
    icon: "👨‍👩‍👧",
    title: "Painel do responsável",
    desc: "Métricas, alertas, revisões em atraso, simulados recentes e relatório semanal por e-mail para acompanhar de perto.",
  },
  {
    icon: "📊",
    title: "Relatórios em PDF",
    desc: "Resumo das últimas 4 semanas exportável em PDF — ótimo para mostrar a evolução.",
  },
  {
    icon: "🔔",
    title: "Notificações inteligentes",
    desc: "Lembretes de revisão espaçada, diagnóstico pendente e metas de estudo direto no dashboard.",
  },
  {
    icon: "🖊️",
    title: "Escrita à mão (modo caneta)",
    desc: "Resolva a questão escrevendo com a caneta do tablet ou com o dedo — a IA lê a escrita e corrige na hora. Como resolver na folha, só que digital.",
  },
  {
    icon: "♿",
    title: "Acessibilidade",
    desc: "Tema escuro, alto contraste, escala de fonte e navegação por teclado — pensado para todos.",
  },
];

const STACK = [
  { name: "Next.js 14 (App Router)", role: "Frontend + API" },
  { name: "TypeScript", role: "Tipagem em todo o projeto" },
  { name: "Prisma ORM", role: "Camada de dados" },
  { name: "PostgreSQL (Neon)", role: "Banco em nuvem, sempre ativo" },
  { name: "NextAuth (JWT)", role: "Login e controle de papéis" },
  { name: "Tailwind CSS", role: "Interface responsiva" },
  { name: "Recharts", role: "Gráficos do dashboard" },
  { name: "Vitest", role: "91 testes em 15 suítes" },
  { name: "Vercel", role: "Deploy contínuo a partir do GitHub" },
];

const PIPELINE = [
  "✔ Motor adaptativo (domínio 100% para avançar)",
  "✔ Revisão espaçada com datas automáticas",
  "✔ Diagnóstico inicial de posicionamento",
  "✔ Perfil cognitivo (velocidade, memória, foco...)",
  "✔ Simulados com nota e histórico",
  "✔ Relatórios semanais, por e-mail e em PDF",
  "✔ Painel do responsável com alertas",
  "✔ IA gratuita com failover Gemini → Groq → OpenRouter → local",
  "✔ Tutor em português e tutor de inglês",
  "✔ XP, níveis, missões e avatar",
  "✔ Modo foco com cronômetro",
  "✔ Escrita à mão (modo caneta) com correção por IA",
  "✔ Recuperação de senha por e-mail",
  "✔ Acessibilidade (tema escuro, alto contraste, escala de fonte)",
];

export default function AboutPage() {
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

      <section className="mx-auto max-w-5xl px-4 pb-12 pt-10 text-center">
        <Badge color="indigo" className="mb-4">
          Página do projeto
        </Badge>
        <h1 className="mx-auto max-w-3xl text-4xl font-black leading-tight sm:text-5xl">
          Mestre do Estudo 📚
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600 dark:text-slate-400">
          Plataforma adaptativa de estudos para educação básica — português, matemática e
          inglês — com correção por IA gratuita, tutor em português, simulados e
          acompanhamento para responsáveis.
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
      </section>

      <section className="mx-auto max-w-5xl px-4 pb-14">
        <div className="rounded-2xl border border-indigo-200 bg-indigo-50 p-8 dark:border-indigo-900 dark:bg-indigo-950/30">
          <h2 className="text-xl font-bold">Objetivo</h2>
          <p className="mt-2 text-slate-600 dark:text-slate-400">
            Oferecer uma trilha de estudos verdadeiramente adaptativa: cada aluno parte do
            ponto certo (diagnóstico), avança somente ao dominar o conteúdo e revisa no
            momento ideal — com dados claros para o aluno e para os responsáveis. Tudo com
            IA gratuita, sem cartão de crédito.
          </p>
        </div>
      </section>

      <section className="border-y border-slate-200 bg-white py-14 dark:border-slate-800 dark:bg-slate-900/40">
        <div className="mx-auto max-w-5xl px-4">
          <h2 className="text-center text-2xl font-bold sm:text-3xl">Funcionalidades</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {GOALS.map((f) => (
              <Card key={f.title} className="text-left">
                <div className="text-2xl">{f.icon}</div>
                <h3 className="mt-3 font-bold text-slate-900 dark:text-slate-100">{f.title}</h3>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{f.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-14">
        <h2 className="text-center text-2xl font-bold sm:text-3xl">Por dentro da plataforma</h2>
        <div className="mt-8 grid gap-4 lg:grid-cols-2">
          <Card className="p-6">
            <h3 className="font-bold">Motor adaptativo</h3>
            <ul className="mt-3 space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <li>• Módulos em cadeia: o próximo só libera com 100% de domínio.</li>
              <li>• Revisão espaçada calcula o dia ideal de cada conteúdo.</li>
              <li>• Perfil cognitivo (velocidade, memória, foco, lógica...) se ajusta aos exercícios.</li>
              <li>• Sugestões de reforço baseadas no tipo de erro dominante.</li>
            </ul>
          </Card>
          <Card className="p-6">
            <h3 className="font-bold">IA sem custo</h3>
            <ul className="mt-3 space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <li>• Correção de respostas abertas com explicação do erro.</li>
              <li>• Geração de novos exercícios sob demanda.</li>
              <li>• Tutor em português: explica, dá exemplo e desafia.</li>
              <li>• Failover automático Gemini → Groq → OpenRouter → corretor local.</li>
            </ul>
          </Card>
          <Card className="p-6">
            <h3 className="font-bold">Aluno</h3>
            <ul className="mt-3 space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <li>• Dashboard com gráficos, XP, níveis, missões e avatar.</li>
              <li>• Simulados com nota, relatórios semanais e exportação em PDF.</li>
              <li>• Modo foco, notificações e mapa de conhecimento.</li>
            </ul>
          </Card>
          <Card className="p-6">
            <h3 className="font-bold">Responsável</h3>
            <ul className="mt-3 space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <li>• Vínculo por e-mail e painel com métricas por aluno.</li>
              <li>• Alertas de baixo desempenho, revisões atrasadas e simulados recentes.</li>
              <li>• Relatório semanal por e-mail.</li>
            </ul>
          </Card>
        </div>
      </section>

      <section className="border-y border-slate-200 bg-white py-14 dark:border-slate-800 dark:bg-slate-900/40">
        <div className="mx-auto max-w-5xl px-4">
          <h2 className="text-center text-2xl font-bold sm:text-3xl">Tecnologia</h2>
          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {STACK.map((s) => (
              <div
                key={s.name}
                className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3 dark:border-slate-700"
              >
                <span className="text-sm font-semibold">{s.name}</span>
                <Badge color="gray">{s.role}</Badge>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-14">
        <h2 className="text-center text-2xl font-bold sm:text-3xl">Status do projeto</h2>
        <div className="mx-auto mt-8 grid max-w-4xl gap-4 lg:grid-cols-2">
          <Card className="p-6">
            <h3 className="font-bold text-green-700 dark:text-green-400">Concluído e em produção</h3>
            <ul className="mt-3 space-y-1.5 text-sm text-slate-600 dark:text-slate-400">
              {PIPELINE.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
          </Card>
          <Card className="p-6">
            <h3 className="font-bold text-indigo-700 dark:text-indigo-300">Qualidade</h3>
            <ul className="mt-3 space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <li>• 91 testes automatizados em 15 suítes — todos verdes.</li>
              <li>• TypeScript sem erros e ESLint limpo.</li>
              <li>• Build de produção validado localmente e na Vercel.</li>
              <li>• Banco PostgreSQL gerenciado (Neon) com backup da nuvem.</li>
              <li>• Deploy contínuo: todo push no GitHub publica automaticamente.</li>
            </ul>
            <h3 className="mt-6 font-bold text-indigo-700 dark:text-indigo-300">Próximos passos (opcionais)</h3>
            <ul className="mt-3 space-y-1.5 text-sm text-slate-600 dark:text-slate-400">
              <li>• Domínio próprio e HTTPS.</li>
              <li>• Novos módulos e matérias (ciências, história).</li>
              <li>• Notificações por e-mail/whatsapp.</li>
            </ul>
          </Card>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 pb-14 text-center">
        <Badge color="green" className="mb-3">
          Online em https://mestre-estudo.vercel.app
        </Badge>
        <h2 className="text-2xl font-bold">Pronto para experimentar?</h2>
        <p className="mx-auto mt-2 max-w-xl text-sm text-slate-500 dark:text-slate-400">
          Crie uma conta gratuita em menos de um minuto e faça o diagnóstico inicial.
        </p>
        <div className="mt-6">
          <Link href="/register">
            <Button className="h-11 px-6 text-base">Criar minha conta</Button>
          </Link>
        </div>
      </section>

      <footer className="border-t border-slate-200 py-8 dark:border-slate-800">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-3 px-4 text-sm text-slate-500 sm:flex-row dark:text-slate-400">
          <p>Mestre do Estudo — estudo adaptativo com IA</p>
          <span className="flex items-center gap-2">
            <Link href="/" className="hover:underline">
              Início
            </Link>
            <Badge color="green">Aluno</Badge>
            <Badge color="blue">Responsável</Badge>
          </span>
        </div>
      </footer>
    </div>
  );
}
