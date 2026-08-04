const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const mao = (prompt, text, difficulty = 2) => ({
  type: "escrita_mao",
  prompt,
  correctAnswer: { text },
  difficulty,
});

/**
 * Seed do Modo Caneta — cria exercícios do tipo "escrita_mao" (respondidos
 * com a caneta do tablet) dentro de micro-habilidades já existentes, sem
 * excluir nada (idempotente: não duplica um enunciado já presente).
 */
const ITEMS = [
  { subjectSlug: "matematica", skillName: "Adição e subtração de números naturais",
    exercises: [
      mao("Escreva à mão o resultado da conta: 128 + 75.", "203"),
      mao("Escreva à mão o resultado da conta: 54 − 29.", "25"),
    ] },
  { subjectSlug: "matematica", skillName: "Tabuada e multiplicação",
    exercises: [
      mao("Escreva à mão o resultado de: 7 × 8.", "56"),
    ] },
  { subjectSlug: "matematica", skillName: "Equações do 1º grau",
    exercises: [
      mao("Escreva à mão o valor de x na equação: x + 7 = 12.", "5"),
    ] },
  { subjectSlug: "portugues", skillName: "Ortografia",
    exercises: [
      mao("Escreva à mão a palavra completa: a criança ____ (pasSA/sa) na rua.", "passa"),
    ] },
  { subjectSlug: "portugues", skillName: "Coesão e conectivos",
    exercises: [
      mao("Escreva à mão a frase completa usando o conectivo “porque”: Eu estudei ??? passei na prova.", "porque"),
    ] },
  { subjectSlug: "ingles", skillName: "Greetings and introductions",
    exercises: [
      mao("Write by hand: Good morning!", "good morning"),
    ] },
];

async function main() {
  const subjects = await prisma.subject.findMany({
    include: { modules: { include: { microSkills: { include: { exercises: true } } } } },
  });
  let created = 0;

  for (const item of ITEMS) {
    const subject = subjects.find((s) => s.slug === item.subjectSlug);
    if (!subject) {
      console.log(`Matéria “${item.subjectSlug}” não encontrada — pulando.`);
      continue;
    }
    const skill = subject.modules
      .flatMap((m) => m.microSkills)
      .find((ms) => ms.name === item.skillName);
    if (!skill) {
      console.log(`Habilidade “${item.skillName}” não encontrada — pulando.`);
      continue;
    }
    const existing = new Set(skill.exercises.map((e) => e.prompt));
    for (const ex of item.exercises) {
      if (existing.has(ex.prompt)) {
        console.log(`Exercício “${ex.prompt}” já existe — pulando.`);
        continue;
      }
      await prisma.exercise.create({
        data: { ...ex, microSkillId: skill.id },
      });
      created += 1;
      console.log(`Exercício de caneta criado em “${item.skillName}”: ${ex.prompt}`);
    }
  }

  console.log(`Seed do Modo Caneta concluído: ${created} exercícios criados.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });