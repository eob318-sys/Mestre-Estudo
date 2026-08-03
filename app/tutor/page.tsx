import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { TutorPtChat } from "@/components/tutor-pt-chat";

export default async function TutorPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
          Tutor em Português 🧑‍🏫
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Pergunte sobre qualquer matéria — explicamos no seu ritmo.
        </p>
      </div>
      <TutorPtChat studentName={session.user.name ?? "aluno"} />
    </div>
  );
}
