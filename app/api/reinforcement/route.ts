import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  buildReinforcement,
  type ReinforcementSkill,
} from "@/lib/reinforcement";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const logs = await prisma.exerciseLog.findMany({
    where: { studentId: session.user.id, errorType: { not: null } },
    orderBy: { createdAt: "desc" },
    take: 500,
  });

  if (logs.length === 0) return NextResponse.json([]);

  const exerciseIds = Array.from(new Set(logs.map((l) => l.exerciseId)));
  const exercises = await prisma.exercise.findMany({
    where: { id: { in: exerciseIds } },
    select: { id: true, microSkillId: true },
  });
  const skillIds = Array.from(new Set(exercises.map((e) => e.microSkillId)));
  const skills = await prisma.microSkill.findMany({
    where: { id: { in: skillIds } },
    include: { module: { include: { subject: true } } },
  });
  const skillMap = new Map<string, ReinforcementSkill>();
  for (const s of skills) {
    skillMap.set(s.id, {
      microSkillId: s.id,
      name: s.name,
      moduleId: s.module.id,
      moduleTitle: s.module.title,
      subjectSlug: s.module.subject.slug,
    });
  }
  const skillByExercise = new Map<string, ReinforcementSkill>();
  for (const e of exercises) {
    const skill = skillMap.get(e.microSkillId);
    if (skill) skillByExercise.set(e.id, skill);
  }

  return NextResponse.json(
    buildReinforcement(
      logs.map((l) => ({
        exerciseId: l.exerciseId,
        isCorrect: l.isCorrect,
        errorType: l.errorType,
      })),
      skillByExercise
    )
  );
}
