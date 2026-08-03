import ModuleView from "@/components/module-view";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function Page({
  params,
}: {
  params: { moduleId: string };
}) {
  const session = await getServerSession(authOptions);
  return (
    <ModuleView subjectSlug="matematica" moduleId={params.moduleId} studentId={session!.user!.id} />
  );
}
