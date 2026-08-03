import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import { buildResetLink, createResetToken, hashResetToken, RESET_TTL_HOURS } from "@/lib/reset";

const BASE = process.env.NEXTAUTH_URL ?? "http://localhost:3000";

export async function POST(req: Request) {
  const body = await req.json();
  const email = String(body.email ?? "").trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Email inválido." }, { status: 400 });
  }

  const student = await prisma.student.findUnique({ where: { email } });
  // Nunca revela se o email existe: mesmo sem conta, responde igual.
  if (!student) {
    return NextResponse.json({ ok: true, mode: "dev", link: null });
  }

  const token = createResetToken();
  const expires = new Date(Date.now() + RESET_TTL_HOURS * 60 * 60 * 1000);
  await prisma.student.update({
    where: { id: student.id },
    data: { passwordResetToken: hashResetToken(token), passwordResetExpires: expires },
  });

  const link = buildResetLink(BASE, token);
  const emailResult = await sendEmail({
    to: email,
    subject: "Redefina sua senha — Mestre do Estudo",
    html: `
      <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto">
        <h2 style="color:#4f46e5">Redefinição de senha</h2>
        <p>Olá, <strong>${student.name}</strong>! Use o link abaixo para criar uma nova senha. Ele expira em 1 hora.</p>
        <p><a href="${link}" style="display:inline-block;background:#4f46e5;color:#fff;padding:10px 18px;border-radius:8px;text-decoration:none">Redefinir senha</a></p>
        <p style="color:#666;font-size:12px">Se você não pediu isso, ignore este e-mail.</p>
      </div>`,
  });

  if (emailResult.sent) {
    return NextResponse.json({ ok: true, mode: "resend", link: null });
  }
  // Sem SMTP configurado: devolve o link para a interface (desenvolvimento) e avisa.
  return NextResponse.json({
    ok: true,
    mode: "dev",
    link,
    warn: "Envio de e-mail não configurado (RESEND_API_KEY). Em produção, configure o provedor de e-mail.",
  });
}