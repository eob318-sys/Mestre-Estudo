import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { buildWeeklyReport, startOfWeek } from "@/lib/report";
import { sendEmail } from "@/lib/email";

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }
  if (session.user.role !== "student") {
    return NextResponse.json({ error: "Apenas alunos recebem relatórios." }, { status: 403 });
  }

  const student = await prisma.student.findUnique({
    where: { id: session.user.id },
    select: { name: true, email: true },
  });
  if (!student?.email) {
    return NextResponse.json({ error: "Email não encontrado." }, { status: 400 });
  }

  const now = new Date();
  const start = startOfWeek(now);
  const end = new Date(start);
  end.setDate(end.getDate() + 7);

  const [logs, mastered] = await Promise.all([
    prisma.exerciseLog.findMany({
      where: { studentId: session.user.id, createdAt: { gte: start, lt: end } },
      select: { isCorrect: true, timeTakenMs: true, createdAt: true },
    }),
    prisma.progress.count({
      where: {
        studentId: session.user.id,
        masteryScore: 100,
        lastReviewedAt: { gte: start, lt: end },
      },
    }),
  ]);

  const report = buildWeeklyReport({ start, logs, masteredInWeek: mastered });
  const minutes = Math.round(report.timeMs / 60000);
  const html = `
  <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto">
    <h2 style="color:#4f46e5">Mestre do Estudo — Resumo da semana</h2>
    <p>Olá, <strong>${student.name}</strong>! Semana <strong>${report.weekLabel}</strong>:</p>
    <ul>
      <li>Exercícios: <strong>${report.total}</strong></li>
      <li>Acertos: <strong>${report.correct}</strong> (${report.accuracy}%)</li>
      <li>Tempo: <strong>${minutes} min</strong></li>
      <li>Dias com estudo: <strong>${report.distinctDays}</strong></li>
      <li>Módulos dominados: <strong>${report.masteredInWeek}</strong></li>
    </ul>
    <p style="color:#666">Continue praticando todos os dias! 📚</p>
  </div>`;

  const result = await sendEmail({
    to: student.email,
    subject: `Seu resumo semanal (${report.weekLabel})`,
    html,
  });

  if (result.sent) {
    return NextResponse.json({ ok: true, mode: result.mode, msg: "Relatório enviado." });
  }
  return NextResponse.json({
    ok: false,
    mode: "dev",
    msg: "Envio de e-mail não configurado (RESEND_API_KEY ausente). Configure o e-mail ou veja o relatório na tela.",
  });
}