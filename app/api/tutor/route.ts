import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { tutorReply, type TutorMessage } from "@/lib/ai";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const body = await req.json();
  const { subject, history } = body as {
    subject: string;
    history: TutorMessage[];
  };

  if (!subject || !Array.isArray(history)) {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  }

  const text = await tutorReply(subject, history, session.user.name ?? "aluno");
  return NextResponse.json({ text });
}
