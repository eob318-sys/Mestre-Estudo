import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { tutorPtReply, type TutorMessage } from "@/lib/tutor";

const SLUGS = ["portugues", "matematica", "ingles"];

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const body = await req.json();
  const subject = String(body.subject ?? "");
  const messages = Array.isArray(body.messages) ? (body.messages as TutorMessage[]) : [];

  if (!SLUGS.includes(subject)) {
    return NextResponse.json({ error: "Matéria inválida" }, { status: 400 });
  }
  const sane = messages
    .filter((m) => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
    .slice(-20);

  const reply = await tutorPtReply(subject, sane, session.user.name ?? "aluno");
  return NextResponse.json({ reply });
}