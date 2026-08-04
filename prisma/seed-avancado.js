const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const mc = (prompt, options, answer, difficulty = 3) => ({
  type: "multipla_escolha",
  prompt,
  options,
  correctAnswer: { option: answer },
  difficulty,
});
const pre = (prompt, value, difficulty = 3) => ({
  type: "preenchimento",
  prompt,
  correctAnswer: { value: String(value) },
  difficulty,
});

const MODULES = [
  {
    subjectSlug: "matematica",
    title: "Álgebra — Expressões e Equações",
    order: 6,
    difficulty: 6,
    microSkills: [
      {
        name: "Expressões algébricas",
        exercises: [
          mc("Qual é o valor de 2x + 3 quando x = 5?", [
            { id: "a", text: "13" },
            { id: "b", text: "10" },
            { id: "c", text: "8" },
            { id: "d", text: "15" },
          ], "a"),
          mc("Qual expressão representa “o dobro de um número somado a 3”?", [
            { id: "a", text: "2x + 3" },
            { id: "b", text: "x + 6" },
            { id: "c", text: "2 + 3x" },
            { id: "d", text: "x² + 3" },
          ], "a"),
          mc("Simplifique: 3x + 2x", [
            { id: "a", text: "5x" },
            { id: "b", text: "6x" },
            { id: "c", text: "5x²" },
            { id: "d", text: "3x + 2" },
          ], "a"),
          pre("Calcule o valor de 4x − 1 quando x = 3.", 11),
        ],
      },
      {
        name: "Equações do 1º grau",
        exercises: [
          mc("Qual é a solução de x + 7 = 12?", [
            { id: "a", text: "5" },
            { id: "b", text: "19" },
            { id: "c", text: "4" },
            { id: "d", text: "6" },
          ], "a"),
          mc("Qual é a solução de 3x = 21?", [
            { id: "a", text: "7" },
            { id: "b", text: "6" },
            { id: "c", text: "24" },
            { id: "d", text: "3" },
          ], "a"),
          mc("Resolva: 2x − 4 = 6", [
            { id: "a", text: "5" },
            { id: "b", text: "4" },
            { id: "c", text: "8" },
            { id: "d", text: "6" },
          ], "a"),
          pre("Resolva: x − 3 = 9. Qual é o valor de x?", 12),
        ],
      },
    ],
  },
  {
    subjectSlug: "portugues",
    title: "Orações Subordinadas",
    order: 6,
    difficulty: 5,
    microSkills: [
      {
        name: "Orações subordinadas substantivas",
        exercises: [
          mc("Na frase “É importante que você estude”, a oração “que você estude” é:", [
            { id: "a", text: "Substantiva subjetiva" },
            { id: "b", text: "Adjetiva" },
            { id: "c", text: "Adverbial" },
            { id: "d", text: "Coordenada" },
          ], "a"),
          mc("Em “Duvido que ele venha”, a oração “que ele venha” é:", [
            { id: "a", text: "Substantiva objetiva direta" },
            { id: "b", text: "Substantiva subjetiva" },
            { id: "c", text: "Adjetiva restritiva" },
            { id: "d", text: "Adverbial causal" },
          ], "a"),
        ],
      },
      {
        name: "Orações subordinadas adjetivas e adverbiais",
        exercises: [
          mc("Em “O aluno que estuda passa”, a oração “que estuda” é:", [
            { id: "a", text: "Adjetiva restritiva" },
            { id: "b", text: "Substantiva" },
            { id: "c", text: "Adjetiva explicativa" },
            { id: "d", text: "Adverbial" },
          ], "a"),
          mc("Em “Maria, que é minha amiga, chegou”, a oração “que é minha amiga” é:", [
            { id: "a", text: "Adjetiva explicativa" },
            { id: "b", text: "Adjetiva restritiva" },
            { id: "c", text: "Substantiva apositiva" },
            { id: "d", text: "Adverbial" },
          ], "a"),
          mc("A oração em “Saí porque estava cansado” é:", [
            { id: "a", text: "Adverbial causal" },
            { id: "b", text: "Adjetiva" },
            { id: "c", text: "Substantiva" },
            { id: "d", text: "Coordenada sindética" },
          ], "a"),
        ],
      },
      {
        name: "Conectivos subordinativos",
        exercises: [
          mc("Qual conectivo inicia uma oração adverbial condicional?", [
            { id: "a", text: "se" },
            { id: "b", text: "que" },
            { id: "c", text: "porque" },
            { id: "d", text: "mas" },
          ], "a"),
          mc("Qual conectivo inicia uma oração adverbial final?", [
            { id: "a", text: "para que" },
            { id: "b", text: "se" },
            { id: "c", text: "embora" },
            { id: "d", text: "quando" },
          ], "a"),
        ],
      },
    ],
  },
  {
    subjectSlug: "ingles",
    title: "Past Simple e Future",
    order: 6,
    difficulty: 4,
    microSkills: [
      {
        name: "Past Simple (verbos regulares e irregulares)",
        exercises: [
          mc("Choose the correct past: “I ___ to school yesterday.”", [
            { id: "a", text: "went" },
            { id: "b", text: "goed" },
            { id: "c", text: "go" },
            { id: "d", text: "gone" },
          ], "a"),
          mc("Choose the correct past: “She ___ a book last night.”", [
            { id: "a", text: "read" },
            { id: "b", text: "reads" },
            { id: "c", text: "reading" },
            { id: "d", text: "readed" },
          ], "a"),
          mc("Complete: “They ___ TV yesterday evening.”", [
            { id: "a", text: "watched" },
            { id: "b", text: "watch" },
            { id: "c", text: "watching" },
            { id: "d", text: "watchs" },
          ], "a"),
          pre("Type the past form of “play” (like “worked”):", "played"),
        ],
      },
      {
        name: "Future with will",
        exercises: [
          mc("Choose the future: “I ___ visit my grandmother tomorrow.”", [
            { id: "a", text: "will" },
            { id: "b", text: "am" },
            { id: "c", text: "did" },
            { id: "d", text: "was" },
          ], "a"),
          mc("Choose the future question: “___ you help me?”", [
            { id: "a", text: "Will" },
            { id: "b", text: "Do" },
            { id: "c", text: "Did" },
            { id: "d", text: "Are" },
          ], "a"),
          mc("Complete: “It ___ rain later.”", [
            { id: "a", text: "will" },
            { id: "b", text: "does" },
            { id: "c", text: "did" },
            { id: "d", text: "was" },
          ], "a"),
          pre("Use “will” to complete: “She ___ (go) to the park.”", "will go"),
        ],
      },
    ],
  },
];

async function main() {
  for (const mod of MODULES) {
    const subject = await prisma.subject.findUnique({
      where: { slug: mod.subjectSlug },
    });
    if (!subject) {
      console.log(`Matéria ${mod.subjectSlug} não encontrada — pulando.`);
      continue;
    }
    const exists = await prisma.module.findFirst({
      where: { subjectId: subject.id, title: mod.title },
    });
    if (exists) {
      console.log(`Módulo “${mod.title}” já existe — pulando.`);
      continue;
    }
    await prisma.module.create({
      data: {
        subjectId: subject.id,
        title: mod.title,
        order: mod.order,
        difficulty: mod.difficulty,
        prerequisites: "[]",
        microSkills: {
          create: mod.microSkills.map((ms) => ({
            name: ms.name,
            exercises: { create: ms.exercises },
          })),
        },
      },
    });
    console.log(`Módulo “${mod.title}” criado.`);
  }

  const subjects = await prisma.subject.findMany({
    include: { modules: { include: { microSkills: { include: { exercises: true } } } } },
  });
  for (const subject of subjects) {
    const ordered = [...subject.modules].sort((a, b) => a.order - b.order);
    for (let i = 0; i < ordered.length; i++) {
      await prisma.module.update({
        where: { id: ordered[i].id },
        data: {
          prerequisites: i > 0 ? JSON.stringify([ordered[i - 1].id]) : "[]",
        },
      });
    }
  }

  const total = subjects.reduce(
    (acc, s) =>
      acc + s.modules.reduce((a, m) => a + m.microSkills.reduce((x, ms) => x + ms.exercises.length, 0), 0),
    0
  );
  console.log(`Seed avançado concluído: ${subjects.length} matérias, ${total} exercícios.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
