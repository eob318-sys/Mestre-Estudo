import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const body = await req.json();
  const { subjectId, answers, last } = body as {
    subjectId: string;
    answers: { exerciseId: string; answer: string }[];
    last?: boolean;
  };

  if (!subjectId || !Array.isArray(answers)) {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  }

  const subject = await prisma.subject.findUnique({
    where: { id: subjectId },
    include: {
      modules: {
        include: { microSkills: { include: { exercises: true } } },
      },
    },
  });
  if (!subject) {
    return NextResponse.json({ error: "Matéria não encontrada" }, { status: 404 });
  }

  const orderedModules = [...subject.modules].sort((a, b) => a.order - b.order);

  const exerciseModule = new Map<string, string>();
  for (const m of orderedModules) {
    for (const ms of m.microSkills) {
      for (const ex of ms.exercises) {
        exerciseModule.set(ex.id, m.id);
      }
    }
  }

  const graded: { exerciseId: string; moduleId: string; isCorrect: boolean }[] = [];
  for (const a of answers) {
    const exercise = orderedModules
      .flatMap((m) => m.microSkills)
      .flatMap((ms) => ms.exercises)
      .find((e) => e.id === a.exerciseId);
    if (!exercise) continue;
    const ca = (exercise.correctAnswer ?? {}) as { option?: string };
    const isCorrect = String(ca.option ?? "") === String(a.answer ?? "").trim();
    graded.push({
      exerciseId: exercise.id,
      moduleId: exerciseModule.get(exercise.id)!,
      isCorrect,
    });
  }

  const correctPerModule = new Map<string, number>();
  const totalPerModule = new Map<string, number>();
  for (const g of graded) {
    correctPerModule.set(g.moduleId, (correctPerModule.get(g.moduleId) ?? 0) + (g.isCorrect ? 1 : 0));
    totalPerModule.set(g.moduleId, (totalPerModule.get(g.moduleId) ?? 0) + 1);
  }

  const now = new Date();
  const logs = graded.map((g) => ({
    studentId: session.user.id,
    exerciseId: g.exerciseId,
    isCorrect: g.isCorrect,
    timeTakenMs: 0,
  }));
  if (logs.length > 0) {
    await prisma.exerciseLog.createMany({ data: logs });
  }

  let positionedModuleId = orderedModules[0]?.id ?? null;

  if (orderedModules.length > 0) {
    let firstFailed = -1;
    for (let i = 0; i < orderedModules.length; i++) {
      const total = totalPerModule.get(orderedModules[i].id) ?? 0;
      const correct = correctPerModule.get(orderedModules[i].id) ?? 0;
      const passed = total > 0 && correct / total >= 0.5;
      if (!passed) {
        firstFailed = i;
        break;
      }
    }
    if (firstFailed === -1) {
      firstFailed = orderedModules.length - 1;
    }
    positionedModuleId = orderedModules[firstFailed].id;

    for (let i = 0; i < firstFailed; i++) {
      const m = orderedModules[i];
      for (const ms of m.microSkills) {
        await prisma.progress.upsert({
          where: {
            studentId_microSkillId: {
              studentId: session.user.id,
              microSkillId: ms.id,
            },
          },
          update: { masteryScore: 100, attempts: { increment: 1 }, lastReviewedAt: now },
          create: {
            studentId: session.user.id,
            microSkillId: ms.id,
            masteryScore: 100,
            attempts: 1,
            lastReviewedAt: now,
          },
        });
      }
    }
  }

  if (last) {
    await prisma.student.update({
      where: { id: session.user.id },
      data: { diagnosticDone: true },
    });
  }

  return NextResponse.json({ positionedModuleId });
}
