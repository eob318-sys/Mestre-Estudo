import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const body = await req.json();
  const darkMode = Boolean(body.darkMode);

  await prisma.student.update({
    where: { id: session.user.id },
    data: { darkMode },
  });

  return NextResponse.json({ ok: true });
}
