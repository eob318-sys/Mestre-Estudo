import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { correctExercise } from "@/lib/ai";
import { applyRunProgress } from "@/lib/progression";
import { scheduleNextReview } from "@/lib/spaced";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const body = await req.json();
  const { microSkillId, answers } = body as {
    microSkillId: string;
    answers: { exerciseId: string; answer: string; timeTakenMs: number }[];
  };

  if (!microSkillId || !Array.isArray(answers) || answers.length === 0) {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  }

  const microSkill = await prisma.microSkill.findUnique({
    where: { id: microSkillId },
    include: {
      module: { include: { subject: true } },
      exercises: true,
    },
  });
  if (!microSkill) {
    return NextResponse.json({ error: "Micro-skill não encontrada" }, { status: 404 });
  }

  const results: {
    exerciseId: string;
    nota: number;
    correta: boolean;
    explicacao: string;
    dica: string;
    tipoErro: string | null;
  }[] = [];

  for (const a of answers) {
    const exercise = microSkill.exercises.find((e) => e.id === a.exerciseId);
    if (!exercise) continue;
    const correction = await correctExercise({
      subject: microSkill.module.subject.slug,
      type: exercise.type,
      prompt: exercise.prompt,
      correctAnswer: exercise.correctAnswer,
      studentAnswer: String(a.answer ?? ""),
    });
    results.push({ exerciseId: exercise.id, ...correction });
  }

  const total = microSkill.exercises.length;
  const correctCount = results.filter((r) => r.correta).length;

  const timeByExercise = new Map(
    answers.map((a) => [a.exerciseId, Number(a.timeTakenMs) || 0])
  );

  await prisma.exerciseLog.createMany({
    data: results.map((r) => ({
      studentId: session.user.id,
      exerciseId: r.exerciseId,
      isCorrect: r.correta,
      timeTakenMs: timeByExercise.get(r.exerciseId) ?? 0,
      errorType: r.tipoErro,
    })),
  });

  const previous = await prisma.progress.findUnique({
    where: {
      studentId_microSkillId: {
        studentId: session.user.id,
        microSkillId,
      },
    },
  });

  const newScore = applyRunProgress(previous?.masteryScore ?? 0, correctCount, total);
  const now = new Date();
  const nextAttempts = (previous?.attempts ?? 0) + 1;

  await prisma.progress.upsert({
    where: {
      studentId_microSkillId: {
        studentId: session.user.id,
        microSkillId,
      },
    },
    update: {
      masteryScore: newScore,
      attempts: nextAttempts,
      lastReviewedAt: now,
      nextReviewAt: scheduleNextReview(newScore, nextAttempts, now),
    },
    create: {
      studentId: session.user.id,
      microSkillId,
      masteryScore: newScore,
      attempts: 1,
      lastReviewedAt: now,
      nextReviewAt: scheduleNextReview(newScore, 1, now),
    },
  });

  return NextResponse.json({
    results,
    correctCount,
    total,
    mastered: newScore === 100,
  });
}
