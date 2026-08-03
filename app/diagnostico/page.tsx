import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DiagnosticForm, type DiagnosticSubject } from "@/components/diagnostic-form";

export default async function DiagnosticoPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const student = await prisma.student.findUnique({
    where: { id: session.user.id },
    select: { diagnosticDone: true, name: true },
  });
  if (student?.diagnosticDone) redirect("/dashboard");

  const subjects = await prisma.subject.findMany({
    include: {
      modules: { include: { microSkills: { include: { exercises: true } } } },
    },
  });

  const data: DiagnosticSubject[] = subjects.map((s) => {
    const ordered = [...s.modules].sort((x, y) => x.order - y.order);
    const questions = ordered.flatMap((m) => {
      const mc = m.microSkills
        .flatMap((ms) => ms.exercises)
        .filter((e) => e.type === "multipla_escolha")
        .sort((x, y) => x.difficulty - y.difficulty);
      return mc.slice(0, 2).map((e) => ({
        id: e.id,
        moduleId: m.id,
        prompt: e.prompt,
        options: (e.options as { id: string; text: string }[]) ?? [],
      }));
    });
    return {
      id: s.id,
      name: s.name,
      color: s.color,
      modules: ordered.map((m) => ({ id: m.id, title: m.title })),
      questions,
    };
  });

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <DiagnosticForm subjects={data} studentName={student?.name ?? "aluno"} />
    </div>
  );
}
