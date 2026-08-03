import SubjectPage from "@/components/subject-page";
import { TutorChat } from "@/components/tutor-chat";

export default async function Page() {
  return (
    <div>
      <SubjectPage slug="ingles" />
      <div className="mx-auto max-w-5xl px-4 pb-16">
        <h2 className="mb-4 text-2xl font-bold text-orange-600 dark:text-orange-400">
          Pratique conversação com Sam 🦉
        </h2>
        <TutorChat />
      </div>
    </div>
  );
}
