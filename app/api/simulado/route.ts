import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { correctExercise } from "@/lib/ai";
import { notaSimulado, pickSimulado, simuladoSeconds, type SimExercise } from "@/lib/simulado";

const SLUGS = ["portugues", "matematica", "ingles"];

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const url = new URL(req.url);
  const subjectSlug = url.searchParams.get("subject") ?? "portugues";
  const requested = Math.max(5, Math.min(20, Number(url.searchParams.get("count")) || 10));

  if (!SLUGS.includes(subjectSlug)) {
    return NextResponse.json({ error: "Matéria inválida" }, { status: 400 });
  }

  const subject = await prisma.subject.findUnique({
    where: { slug: subjectSlug },
    select: { id: true, name: true },
  });
  if (!subject) return NextResponse.json({ error: "Matéria não encontrada" }, { status: 404 });

  const rows = await prisma.exercise.findMany({
    where: { microSkill: { module: { subjectId: subject.id } } },
    select: {
      id: true,
      microSkillId: true,
      type: true,
      prompt: true,
      options: true,
      difficulty: true,
    },
  });

  const pool: SimExercise[] = rows.map((r) => ({
    id: r.id,
    microSkillId: r.microSkillId,
    type: r.type,
    prompt: r.prompt,
    options: Array.isArray(r.options)
      ? (r.options as { id: string; text: string }[])
      : null,
    difficulty: r.difficulty,
  }));

  const chosen = pickSimulado(pool, requested);
  return NextResponse.json({
    subjectSlug,
    subjectName: subject.name,
    exercises: chosen,
    durationSeconds: simuladoSeconds(chosen.length),
  });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const body = await req.json();
  const subjectSlug = String(body.subject ?? "");
  const answers = Array.isArray(body.answers) ? (body.answers as { exerciseId: string; answer: string }[]) : [];
  if (!SLUGS.includes(subjectSlug) || answers.length === 0) {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  }

  const subject = await prisma.subject.findUnique({
    where: { slug: subjectSlug },
    select: { id: true },
  });
  if (!subject) return NextResponse.json({ error: "Matéria não encontrada" }, { status: 404 });

  const exercises = await prisma.exercise.findMany({
    where: { id: { in: answers.map((a) => a.exerciseId) } },
    select: { id: true, type: true, prompt: true, correctAnswer: true },
  });
  const byId = new Map(exercises.map((e) => [e.id, e]));

  const results: { exerciseId: string; correta: boolean; explicacao: string }[] = [];
  for (const a of answers) {
    const ex = byId.get(a.exerciseId);
    if (!ex) continue;
    const correction = await correctExercise({
      subject: subjectSlug,
      type: ex.type,
      prompt: ex.prompt,
      correctAnswer: ex.correctAnswer,
      studentAnswer: String(a.answer ?? ""),
    });
    results.push({ exerciseId: ex.id, correta: correction.correta, explicacao: correction.explicacao });
  }

  const correctCount = results.filter((r) => r.correta).length;

  await prisma.exerciseLog.createMany({
    data: results.map((r) => ({
      studentId: session.user.id,
      exerciseId: r.exerciseId,
      isCorrect: r.correta,
      timeTakenMs: 0,
      errorType: null,
    })),
  });

  return NextResponse.json({
    nota: notaSimulado(correctCount, results.length),
    correctCount,
    total: results.length,
    results,
  });
}