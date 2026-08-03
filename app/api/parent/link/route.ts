import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }
  if (session.user.role !== "responsible") {
    return NextResponse.json({ error: "Apenas responsáveis podem vincular alunos." }, { status: 403 });
  }

  const body = await req.json();
  const email = String(body.email ?? "").trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Email inválido." }, { status: 400 });
  }

  const student = await prisma.student.findUnique({ where: { email } });
  if (!student) {
    return NextResponse.json(
      { error: "Nenhum aluno encontrado com este email." },
      { status: 404 }
    );
  }
  if (student.id === session.user.id) {
    return NextResponse.json(
      { error: "Você não pode vincular a si mesmo." },
      { status: 400 }
    );
  }
  if (student.role === "responsible") {
    return NextResponse.json(
      { error: "Esta conta também é de responsável." },
      { status: 400 }
    );
  }

  await prisma.parentStudent.upsert({
    where: {
      parentId_studentId: { parentId: session.user.id, studentId: student.id },
    },
    update: {},
    create: { parentId: session.user.id, studentId: student.id },
  });

  return NextResponse.json({ ok: true, studentName: student.name });
}
