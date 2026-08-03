import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { Prisma } from "@prisma/client";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateExercise } from "@/lib/generator";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const { microSkillId } = (await req.json()) as { microSkillId?: string };
  if (!microSkillId) {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  }

  const skill = await prisma.microSkill.findUnique({
    where: { id: microSkillId },
    include: {
      module: { include: { subject: true } },
      exercises: { orderBy: { difficulty: "asc" }, take: 1 },
    },
  });
  if (!skill) {
    return NextResponse.json({ error: "Habilidade não encontrada" }, { status: 404 });
  }

  const generated = await generateExercise({
    subjectSlug: skill.module.subject.slug,
    subjectName: skill.module.subject.name,
    skillName: skill.name,
    difficulty: skill.exercises[0]?.difficulty ?? 1,
  });
  if (!generated) {
    return NextResponse.json(
      { error: "A IA não respondeu agora. Tente novamente em instantes." },
      { status: 502 }
    );
  }

  const exercise = await prisma.exercise.create({
    data: {
      microSkillId,
      type: generated.type,
      prompt: generated.prompt,
      options: generated.options ? JSON.parse(JSON.stringify(generated.options)) : undefined,
      correctAnswer: JSON.parse(
        JSON.stringify(generated.correctAnswer)
      ) as Prisma.InputJsonValue,
      difficulty: generated.difficulty,
    },
  });

  return NextResponse.json({
    exercise: {
      id: exercise.id,
      type: exercise.type,
      prompt: exercise.prompt,
      difficulty: exercise.difficulty,
      options:
        (exercise.options as { id: string; text: string }[] | null) ?? undefined,
    },
  });
}
