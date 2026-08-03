"use client";

import Link from "next/link";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Badge, Button, Card } from "@/components/ui";
import { CognitiveProfile } from "@/components/cognitive-profile";
import { ReinforcementSuggestions } from "@/components/reinforcement-suggestions";
import { ProgressOverview } from "@/components/progress-overview";
import { KnowledgeMap, type KnowledgeSubject } from "@/components/knowledge-map";
import { Avatar } from "@/components/avatar";
import type { Mission } from "@/lib/xp";

type Props = {
  studentName: string;
  diagnosticDone: boolean;
  perSubject: {
    id: string;
    name: string;
    color: string;
    mastery: number;
    masteredSkills: number;
    totalSkills: number;
    modulesMastered: number;
  }[];
  days: { label: string; correct: number; wrong: number }[];
  dueReviews: {
    microSkillId: string;
    skillName: string;
    masteryScore: number;
    moduleId: string;
    moduleTitle: string;
    subjectSlug: string;
    subjectName: string;
    subjectColor: string;
  }[];
  xp: number;
  level: number;
  nextLevelXp: number;
  levelProgress: number;
  missions: Mission[];
  knowledgeMap: KnowledgeSubject[];
  totals: {
    exercises: number;
    accuracy: number;
    timeMs: number;
    modulesMastered: number;
    focusMinutes: number;
  };
};

const COLOR_HEX: Record<string, string> = {
  blue: "#3b82f6",
  green: "#10b981",
  orange: "#f97316",
};

const tooltipStyle = {
  backgroundColor: "rgb(30 41 59)",
  border: "none",
  borderRadius: 8,
  color: "#f1f5f9",
  fontSize: 12,
};

function formatTime(ms: number): string {
  const totalMin = Math.round(ms / 60000);
  if (totalMin < 60) return `${totalMin} min`;
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  return m === 0 ? `${h}h` : `${h}h ${m}min`;
}

export function DashboardClient(props: Props) {
  const {
    studentName,
    diagnosticDone,
    perSubject,
    days,
    dueReviews,
    xp,
    level,
    nextLevelXp,
    levelProgress,
    missions,
    knowledgeMap,
    totals,
  } = props;

  const stats = [
    { label: "Exercícios feitos", value: String(totals.exercises) },
    { label: "Taxa de acerto", value: `${totals.accuracy}%` },
    { label: "Tempo estudado", value: formatTime(totals.timeMs) },
    { label: "Módulos dominados", value: String(totals.modulesMastered) },
    { label: "Minutos de foco", value: String(totals.focusMinutes) },
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-4">
          <Avatar level={level} size="lg" />
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
              Olá, {studentName}! 👋
            </h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Seu progresso de estudos em tempo real.
            </p>
          </div>
        </div>
        {!diagnosticDone && (
          <Link href="/diagnostico">
            <Button variant="success">Fazer diagnóstico de posicionamento</Button>
          </Link>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
        {stats.map((s) => (
          <Card key={s.label} className="p-4">
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {s.value}
            </p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              {s.label}
            </p>
          </Card>
        ))}
      </div>

      {!diagnosticDone && (
        <Card className="mt-6 border-amber-300 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/40">
          <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
            📌 Você ainda não fez o diagnóstico inicial. Faça um teste rápido
            para começar no módulo certo em vez de partir do zero.
          </p>
        </Card>
      )}

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="mb-4 font-semibold text-slate-900 dark:text-slate-100">
            Domínio por matéria (%)
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={perSubject} barSize={48}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.2)" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="mastery" radius={[8, 8, 0, 0]}>
                  {perSubject.map((s) => (
                    <Cell key={s.id} fill={COLOR_HEX[s.color] ?? "#6366f1"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3 space-y-1.5">
            {perSubject.map((s) => (
              <div key={s.id} className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: COLOR_HEX[s.color] ?? "#6366f1" }}
                  />
                  {s.name}
                </span>
                <span className="text-slate-500 dark:text-slate-400">
                  {s.masteredSkills}/{s.totalSkills} habilidades · {s.mastery}%
                </span>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h2 className="mb-4 font-semibold text-slate-900 dark:text-slate-100">
            Acertos e erros — últimos 7 dias
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={days}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.2)" />
                <XAxis dataKey="label" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <Tooltip contentStyle={tooltipStyle} />
                <Line
                  type="monotone"
                  dataKey="correct"
                  name="Acertos"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
                <Line
                  type="monotone"
                  dataKey="wrong"
                  name="Erros"
                  stroke="#f43f5e"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3 flex gap-4 text-sm">
            <Badge color="green">● Acertos</Badge>
            <Badge color="rose">● Erros</Badge>
          </div>
        </Card>
      </div>

      {dueReviews.length > 0 && (
        <Card className="mt-6 border-indigo-300 bg-indigo-50 dark:border-indigo-900 dark:bg-indigo-950/40">
          <h2 className="mb-3 font-semibold text-slate-900 dark:text-slate-100">
            🔁 Revisão espaçada — hora de revisar
          </h2>
          <ul className="space-y-2">
            {dueReviews.map((r) => (
              <li key={r.microSkillId}>
                <Link
                  href={`/${r.subjectSlug}/${r.moduleId}`}
                  className="flex items-center justify-between gap-3 rounded-lg border border-indigo-200 bg-white px-3 py-2 text-sm transition hover:bg-indigo-100 dark:border-indigo-800 dark:bg-slate-900 dark:hover:bg-slate-800"
                >
                  <span className="font-medium text-slate-800 dark:text-slate-200">
                    {r.skillName}
                  </span>
                  <span className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: COLOR_HEX[r.subjectColor] ?? "#6366f1" }}
                    />
                    {r.subjectName} · {r.moduleTitle} · {r.masteryScore}%
                    <Button variant="secondary" className="!py-1 text-xs">
                      Revisar
                    </Button>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <CognitiveProfile />

      <ReinforcementSuggestions />

      <ProgressOverview
        xp={xp}
        level={level}
        nextLevelXp={nextLevelXp}
        levelProgress={levelProgress}
        missions={missions}
      />

      <KnowledgeMap subjects={knowledgeMap} />

      <div className="mt-6 flex justify-center gap-3">
        <Link href="/portugues"><Button variant="secondary">Estudar Português</Button></Link>
        <Link href="/matematica"><Button variant="secondary">Estudar Matemática</Button></Link>
        <Link href="/ingles"><Button variant="secondary">Estudar Inglês</Button></Link>
      </div>
    </div>
  );
}
