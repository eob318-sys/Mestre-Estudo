import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SimuladoPage } from "@/components/simulado-page";

export default async function SimuladoRoute() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");
  if (session.user.role === "responsible") redirect("/painel");

  const subjects = await prisma.subject.findMany({
    select: { slug: true, name: true, color: true },
    orderBy: { id: "asc" },
  });

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
          Simulado 📝
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          10 questões sorteadas de toda a matéria, com cronômetro e correção na hora.
        </p>
      </div>
      <SimuladoPage subjects={subjects} />
    </div>
  );
}
