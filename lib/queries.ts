import { prisma } from "@/lib/prisma";
import {
  isModuleMastered,
  moduleMasteryPercent,
  moduleStatus,
  type ModuleStatus,
} from "@/lib/progression";

export type MicroSkillSummary = { id: string; name: string; mastery: number };

export type ModuleSummary = {
  id: string;
  title: string;
  difficulty: number;
  status: ModuleStatus;
  mastery: number;
  microSkills: MicroSkillSummary[];
};

export type SubjectSummary = {
  id: string;
  slug: string;
  name: string;
  color: string;
  modules: ModuleSummary[];
};

export type ExerciseClient = {
  id: string;
  type: string;
  prompt: string;
  difficulty: number;
  options?: { id: string; text: string }[];
};

export type MicroSkillClient = {
  id: string;
  name: string;
  mastery: number;
  exercises: ExerciseClient[];
};

export type ModuleDetail = {
  id: string;
  title: string;
  difficulty: number;
  subjectSlug: string;
  subjectName: string;
  color: string;
  status: ModuleStatus;
  microSkills: MicroSkillClient[];
};

export async function getSubjectSummary(
  slug: string,
  studentId: string
): Promise<SubjectSummary | null> {
  const subject = await prisma.subject.findUnique({
    where: { slug },
    include: { modules: { include: { microSkills: true } } },
  });
  if (!subject) return null;

  const skillIds = subject.modules.flatMap((m) => m.microSkills.map((ms) => ms.id));
  const progress = await prisma.progress.findMany({
    where: { studentId, microSkillId: { in: skillIds } },
  });
  const masteryBySkill = new Map(progress.map((p) => [p.microSkillId, p.masteryScore]));

  const ordered = [...subject.modules].sort((a, b) => a.order - b.order);
  let previousMastered = true;

  const modules: ModuleSummary[] = ordered.map((m) => {
    const skillMap: Record<string, number> = {};
    for (const ms of m.microSkills) skillMap[ms.id] = masteryBySkill.get(ms.id) ?? 0;

    const mastered = isModuleMastered(skillMap);
    const status = moduleStatus({ previousMastered, mastered });
    const mastery = moduleMasteryPercent(skillMap);
    previousMastered = mastered;

    return {
      id: m.id,
      title: m.title,
      difficulty: m.difficulty,
      status,
      mastery,
      microSkills: m.microSkills.map((ms) => ({
        id: ms.id,
        name: ms.name,
        mastery: skillMap[ms.id],
      })),
    };
  });

  return {
    id: subject.id,
    slug: subject.slug,
    name: subject.name,
    color: subject.color,
    modules,
  };
}

export async function getModuleDetail(
  subjectSlug: string,
  moduleId: string,
  studentId: string
): Promise<ModuleDetail | null> {
  const subject = await prisma.subject.findUnique({
    where: { slug: subjectSlug },
    include: {
      modules: { include: { microSkills: { include: { exercises: true } } } },
    },
  });
  if (!subject) return null;

  const ordered = [...subject.modules].sort((a, b) => a.order - b.order);
  const idx = ordered.findIndex((m) => m.id === moduleId);
  if (idx === -1) return null;
  const mod = ordered[idx];

  const allSkillIds = ordered.flatMap((m) => m.microSkills.map((ms) => ms.id));
  const progress = await prisma.progress.findMany({
    where: { studentId, microSkillId: { in: allSkillIds } },
  });
  const masteryBySkill = new Map(progress.map((p) => [p.microSkillId, p.masteryScore]));

  const prevMastered = ordered
    .slice(0, idx)
    .every((m) =>
      isModuleMastered(
        Object.fromEntries(
          m.microSkills.map((ms) => [ms.id, masteryBySkill.get(ms.id) ?? 0])
        )
      )
    );

  const skillMap: Record<string, number> = {};
  for (const ms of mod.microSkills) skillMap[ms.id] = masteryBySkill.get(ms.id) ?? 0;

  const mastered = isModuleMastered(skillMap);
  const status = moduleStatus({ previousMastered: prevMastered, mastered });

  return {
    id: mod.id,
    title: mod.title,
    difficulty: mod.difficulty,
    subjectSlug,
    subjectName: subject.name,
    color: subject.color,
    status,
    microSkills: mod.microSkills.map((ms) => ({
      id: ms.id,
      name: ms.name,
      mastery: skillMap[ms.id],
      exercises: ms.exercises.map((e) => ({
        id: e.id,
        type: e.type,
        prompt: e.prompt,
        difficulty: e.difficulty,
        options:
          (e.options as { id: string; text: string }[] | null) ?? undefined,
      })),
    })),
  };
}
