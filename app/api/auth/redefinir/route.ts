import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { hashResetToken, isResetExpired } from "@/lib/reset";

export async function POST(req: Request) {
  const body = await req.json();
  const token = String(body.token ?? "");
  const newPassword = String(body.password ?? "");

  if (token.length < 20) {
    return NextResponse.json({ error: "Link inválido." }, { status: 400 });
  }
  if (newPassword.length < 6) {
    return NextResponse.json(
      { error: "A senha precisa ter pelo menos 6 caracteres." },
      { status: 400 }
    );
  }

  const student = await prisma.student.findFirst({
    where: { passwordResetToken: hashResetToken(token) },
  });

  if (!student || isResetExpired(student.passwordResetExpires)) {
    return NextResponse.json(
      { error: "Link expirado ou já utilizado. Solicite um novo." },
      { status: 400 }
    );
  }

  const passwordHash = await bcrypt.hash(newPassword, 10);
  await prisma.student.update({
    where: { id: student.id },
    data: {
      passwordHash,
      passwordResetToken: null,
      passwordResetExpires: null,
    },
  });

  return NextResponse.json({ ok: true });
}