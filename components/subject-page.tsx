import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getSubjectSummary } from "@/lib/queries";
import { SubjectHome } from "@/components/subject-home";

export default async function SubjectPage({ slug }: { slug: string }) {
  const session = await getServerSession(authOptions);
  const subject = await getSubjectSummary(slug, session!.user!.id);

  if (!subject) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-16 text-center text-slate-500">
        Matéria não encontrada.
      </div>
    );
  }

  return <SubjectHome subject={subject} />;
}
