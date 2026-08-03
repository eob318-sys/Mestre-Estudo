import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isModuleMastered } from "@/lib/progression";
import { computeXp, evaluateMissions, levelFromXp } from "@/lib/xp";
import { DashboardClient } from "@/components/dashboard-client";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");
  if (session.user.role !== "student") redirect("/painel");

  const student = await prisma.student.findUnique({
    where: { id: session.user.id },
    select: { name: true, diagnosticDone: true },
  });
  if (!student) redirect("/login");

  const subjects = await prisma.subject.findMany({
    include: { modules: { include: { microSkills: true } } },
  });
  const skillIds = subjects.flatMap((s) =>
    s.modules.flatMap((m) => m.microSkills.map((ms) => ms.id))
  );
  const progress = await prisma.progress.findMany({
    where: { studentId: session.user.id, microSkillId: { in: skillIds } },
  });
  const masteryBySkill = new Map(progress.map((p) => [p.microSkillId, p.masteryScore]));

  const perSubject = subjects.map((s) => {
    let totalSkills = 0;
    let masteredSkills = 0;
    let modulesMastered = 0;
    let masterySum = 0;

    for (const m of s.modules) {
      const map: Record<string, number> = {};
      for (const ms of m.microSkills) {
        map[ms.id] = masteryBySkill.get(ms.id) ?? 0;
        totalSkills++;
        if (map[ms.id] === 100) masteredSkills++;
        masterySum += map[ms.id];
      }
      if (isModuleMastered(map)) modulesMastered++;
    }

    return {
      id: s.id,
      name: s.name,
      color: s.color,
      mastery: totalSkills === 0 ? 0 : Math.round(masterySum / totalSkills),
      masteredSkills,
      totalSkills,
      modulesMastered,
    };
  });

  const since = new Date();
  since.setHours(0, 0, 0, 0);
  since.setDate(since.getDate() - 6);

  const logs = await prisma.exerciseLog.findMany({
    where: { studentId: session.user.id, createdAt: { gte: since } },
    orderBy: { createdAt: "asc" },
  });

  const days: { label: string; correct: number; wrong: number }[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(since);
    d.setDate(d.getDate() + i);
    const dayLogs = logs.filter(
      (l) =>
        l.createdAt.toDateString() === d.toDateString()
    );
    days.push({
      label: d.toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit" }),
      correct: dayLogs.filter((l) => l.isCorrect).length,
      wrong: dayLogs.filter((l) => !l.isCorrect).length,
    });
  }

  const allLogs = await prisma.exerciseLog.count({ where: { studentId: session.user.id } });
  const allCorrect = await prisma.exerciseLog.count({
    where: { studentId: session.user.id, isCorrect: true },
  });
  const timeAgg = await prisma.exerciseLog.aggregate({
    where: { studentId: session.user.id },
    _sum: { timeTakenMs: true },
  });
  const totalModulesMastered = perSubject.reduce((a, s) => a + s.modulesMastered, 0);

  const runsAgg = await prisma.progress.aggregate({
    where: { studentId: session.user.id },
    _sum: { attempts: true },
  });

  const focusAgg = await prisma.focusSession.aggregate({
    where: { studentId: session.user.id },
    _sum: { durationMs: true },
  });
  const focusMinutes = Math.round((focusAgg._sum.durationMs ?? 0) / 60000);

  const orderedLogs = await prisma.exerciseLog.findMany({
    where: { studentId: session.user.id },
    orderBy: { createdAt: "asc" },
    select: { exerciseId: true, isCorrect: true, createdAt: true },
    take: 2000,
  });

  const xp = computeXp({
    correctCount: allCorrect,
    runs: runsAgg._sum.attempts ?? 0,
    masteredModules: totalModulesMastered,
    focusMinutes,
  });
  const lvl = levelFromXp(xp);
  const missions = evaluateMissions({
    logs: orderedLogs,
    exercisesDone: allLogs,
    masteredModules: totalModulesMastered,
    diagnosticDone: student.diagnosticDone,
  });

  const knowledgeMap = subjects.map((s) => ({
    id: s.id,
    name: s.name,
    color: s.color,
    skills: s.modules.flatMap((m) =>
      m.microSkills.map((ms) => ({
        id: ms.id,
        name: ms.name,
        mastery: Math.round(masteryBySkill.get(ms.id) ?? 0),
      }))
    ),
  }));

  const dueProgress = await prisma.progress.findMany({
    where: { studentId: session.user.id, nextReviewAt: { lte: new Date() } },
  });
  const dueSkillIds = dueProgress.map((p) => p.microSkillId);
  const dueSkills = await prisma.microSkill.findMany({
    where: { id: { in: dueSkillIds } },
    include: { module: { include: { subject: true } } },
  });
  const dueSkillMap = new Map(dueSkills.map((s) => [s.id, s]));
  const dueReviews = dueProgress
    .map((p) => {
      const skill = dueSkillMap.get(p.microSkillId);
      if (!skill) return null;
      return {
        microSkillId: p.microSkillId,
        skillName: skill.name,
        masteryScore: Math.round(p.masteryScore),
        moduleId: skill.module.id,
        moduleTitle: skill.module.title,
        subjectSlug: skill.module.subject.slug,
        subjectName: skill.module.subject.name,
        subjectColor: skill.module.subject.color,
      };
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);

  return (
    <DashboardClient
      studentName={student.name}
      diagnosticDone={student.diagnosticDone}
      perSubject={perSubject}
      days={days}
      dueReviews={dueReviews}
      xp={xp}
      level={lvl.level}
      nextLevelXp={lvl.nextLevelXp}
      levelProgress={lvl.progress}
      missions={missions}
      knowledgeMap={knowledgeMap}
      totals={{
        exercises: allLogs,
        accuracy: allLogs === 0 ? 0 : Math.round((allCorrect / allLogs) * 100),
        timeMs: timeAgg._sum.timeTakenMs ?? 0,
        modulesMastered: totalModulesMastered,
        focusMinutes,
      }}
    />
  );
}
