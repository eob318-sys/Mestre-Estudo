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
  const durationMs = Math.floor(Number(body.durationMs) || 0);
  const completed = Boolean(body.completed);

  if (durationMs <= 0 || durationMs > 3 * 60 * 60 * 1000) {
    return NextResponse.json({ error: "Duração inválida" }, { status: 400 });
  }

  const created = await prisma.focusSession.create({
    data: { studentId: session.user.id, durationMs, completed },
  });

  return NextResponse.json({
    ok: true,
    sessionId: created.id,
    focusMinutes: Math.round(durationMs / 60000),
  });
}
