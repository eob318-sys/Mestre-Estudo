import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { computeCognitiveProfile } from "@/lib/cognitive";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const logs = await prisma.exerciseLog.findMany({
    where: { studentId: session.user.id },
    orderBy: { createdAt: "asc" },
    take: 500,
  });

  const exerciseIds = Array.from(new Set(logs.map((l) => l.exerciseId)));
  const exercises = await prisma.exercise.findMany({
    where: { id: { in: exerciseIds } },
    select: { id: true, type: true },
  });
  const typeByExercise = new Map(exercises.map((e) => [e.id, e.type]));

  const profile = computeCognitiveProfile(
    logs.map((l) => ({
      exerciseId: l.exerciseId,
      type: typeByExercise.get(l.exerciseId) ?? null,
      isCorrect: l.isCorrect,
      timeTakenMs: l.timeTakenMs,
      errorType: l.errorType,
    }))
  );

  if (profile.sampleSize > 0) {
    await prisma.cognitiveProfile.upsert({
      where: { studentId: session.user.id },
      update: {
        speed: profile.speed,
        accuracy: profile.accuracy,
        focus: profile.focus,
        memory: profile.memory,
        interpretation: profile.interpretation,
        logic: profile.logic,
        persistence: profile.persistence,
      },
      create: {
        studentId: session.user.id,
        speed: profile.speed,
        accuracy: profile.accuracy,
        focus: profile.focus,
        memory: profile.memory,
        interpretation: profile.interpretation,
        logic: profile.logic,
        persistence: profile.persistence,
      },
    });
  }

  return NextResponse.json(profile);
}
