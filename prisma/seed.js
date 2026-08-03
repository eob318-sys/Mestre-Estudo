const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  console.log("Limpando banco...");
  await prisma.exerciseLog.deleteMany();
  await prisma.progress.deleteMany();
  await prisma.cognitiveProfile.deleteMany();
  await prisma.exercise.deleteMany();
  await prisma.microSkill.deleteMany();
  await prisma.module.deleteMany();
  await prisma.subject.deleteMany();
  await prisma.student.deleteMany();

  console.log("Criando matérias...");
  const matematica = await prisma.subject.create({
    data: { slug: "matematica", name: "Matemática", color: "blue" },
  });
  const portugues = await prisma.subject.create({
    data: { slug: "portugues", name: "Português", color: "green" },
  });
  const ingles = await prisma.subject.create({
    data: { slug: "ingles", name: "Inglês", color: "orange" },
  });

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
  const fala = (prompt, text, difficulty = 2) => ({
    type: "fala",
    prompt,
    correctAnswer: { text },
    difficulty,
  });

  console.log("Criando Matemática...");
  await prisma.module.create({
    data: {
      subjectId: matematica.id,
      title: "Números Naturais e Adição",
      order: 1,
      difficulty: 2,
      prerequisites: "[]",
      microSkills: {
        create: [
          {
            name: "Adição e subtração de números naturais",
            exercises: {
              create: [
                mc("Quanto é 37 + 25?", [
                  { id: "a", text: "52" },
                  { id: "b", text: "62" },
                  { id: "c", text: "72" },
                  { id: "d", text: "53" },
                ], "b"),
                mc("Quanto é 84 − 37?", [
                  { id: "a", text: "47" },
                  { id: "b", text: "57" },
                  { id: "c", text: "43" },
                  { id: "d", text: "53" },
                ], "a"),
                pre("Calcule: 128 + 75 = ?", 203),
              ],
            },
          },
          {
            name: "Sequência e comparação de números",
            exercises: {
              create: [
                mc("Qual número vem depois de 1 199 na sequência?", [
                  { id: "a", text: "1 200" },
                  { id: "b", text: "1 190" },
                  { id: "c", text: "2 000" },
                  { id: "d", text: "1 099" },
                ], "a"),
                mc("Qual desses números é o maior?", [
                  { id: "a", text: "245" },
                  { id: "b", text: "254" },
                  { id: "c", text: "244" },
                  { id: "d", text: "249" },
                ], "b"),
                mc("Qual número está entre 430 e 450?", [
                  { id: "a", text: "425" },
                  { id: "b", text: "460" },
                  { id: "c", text: "445" },
                  { id: "d", text: "430" },
                ], "c"),
              ],
            },
          },
        ],
      },
    },
  });

  await prisma.module.create({
    data: {
      subjectId: matematica.id,
      title: "Multiplicação e Divisão",
      order: 2,
      difficulty: 4,
      prerequisites: "[]",
      microSkills: {
        create: [
          {
            name: "Tabuada e multiplicação",
            exercises: {
              create: [
                mc("Quanto é 7 × 8?", [
                  { id: "a", text: "54" },
                  { id: "b", text: "56" },
                  { id: "c", text: "48" },
                  { id: "d", text: "63" },
                ], "b"),
                mc("Quanto é 12 × 5?", [
                  { id: "a", text: "50" },
                  { id: "b", text: "55" },
                  { id: "c", text: "60" },
                  { id: "d", text: "65" },
                ], "c"),
                pre("Quanto é 9 × 6?", 54),
              ],
            },
          },
          {
            name: "Divisão e restos",
            exercises: {
              create: [
                mc("Quanto é 42 ÷ 6?", [
                  { id: "a", text: "6" },
                  { id: "b", text: "7" },
                  { id: "c", text: "8" },
                  { id: "d", text: "9" },
                ], "b"),
                mc("Qual é o resto de 47 ÷ 5?", [
                  { id: "a", text: "0" },
                  { id: "b", text: "1" },
                  { id: "c", text: "2" },
                  { id: "d", text: "3" },
                ], "c"),
                pre("Quanto é 72 ÷ 8?", 9),
              ],
            },
          },
        ],
      },
    },
  });

  await prisma.module.create({
    data: {
      subjectId: matematica.id,
      title: "Frações",
      order: 3,
      difficulty: 6,
      prerequisites: "[]",
      microSkills: {
        create: [
          {
            name: "Frações equivalentes",
            exercises: {
              create: [
                mc("Qual fração é equivalente a 1/2?", [
                  { id: "a", text: "2/3" },
                  { id: "b", text: "3/6" },
                  { id: "c", text: "3/4" },
                  { id: "d", text: "1/4" },
                ], "b"),
                mc("Qual fração é equivalente a 2/3?", [
                  { id: "a", text: "4/6" },
                  { id: "b", text: "3/6" },
                  { id: "c", text: "6/4" },
                  { id: "d", text: "2/6" },
                ], "a"),
                mc("Qual fração é equivalente a 1/2?", [
                  { id: "a", text: "4/8" },
                  { id: "b", text: "3/8" },
                  { id: "c", text: "5/8" },
                  { id: "d", text: "2/8" },
                ], "a"),
              ],
            },
          },
          {
            name: "Simplificação de frações",
            exercises: {
              create: [
                mc("Simplifique 6/9:", [
                  { id: "a", text: "2/3" },
                  { id: "b", text: "3/6" },
                  { id: "c", text: "1/3" },
                  { id: "d", text: "6/3" },
                ], "a"),
                mc("Simplifique 5/15:", [
                  { id: "a", text: "1/3" },
                  { id: "b", text: "1/5" },
                  { id: "c", text: "3/5" },
                  { id: "d", text: "5/3" },
                ], "a"),
                mc("Simplifique 12/16:", [
                  { id: "a", text: "3/4" },
                  { id: "b", text: "4/3" },
                  { id: "c", text: "6/8" },
                  { id: "d", text: "1/4" },
                ], "a"),
              ],
            },
          },
        ],
      },
    },
  });

  await prisma.module.create({
    data: {
      subjectId: matematica.id,
      title: "Geometria Básica",
      order: 4,
      difficulty: 7,
      prerequisites: "[]",
      microSkills: {
        create: [
          {
            name: "Formas e perímetro",
            exercises: {
              create: [
                mc("Um quadrado tem 5 cm de lado. Qual é o perímetro?", [
                  { id: "a", text: "10 cm" },
                  { id: "b", text: "20 cm" },
                  { id: "c", text: "25 cm" },
                  { id: "d", text: "15 cm" },
                ], "b"),
                mc("Um retângulo tem 6 cm de comprimento e 4 cm de largura. Qual é o perímetro?", [
                  { id: "a", text: "10 cm" },
                  { id: "b", text: "12 cm" },
                  { id: "c", text: "20 cm" },
                  { id: "d", text: "24 cm" },
                ], "c"),
                mc("Quantos lados tem um pentágono?", [
                  { id: "a", text: "4" },
                  { id: "b", text: "5" },
                  { id: "c", text: "6" },
                  { id: "d", text: "3" },
                ], "b"),
              ],
            },
          },
          {
            name: "Área de retângulos",
            exercises: {
              create: [
                mc("Qual é a área de um retângulo de 5 cm por 3 cm?", [
                  { id: "a", text: "8 cm²" },
                  { id: "b", text: "15 cm²" },
                  { id: "c", text: "16 cm²" },
                  { id: "d", text: "10 cm²" },
                ], "b"),
                mc("Qual é a área de um quadrado de lado 4 cm?", [
                  { id: "a", text: "8 cm²" },
                  { id: "b", text: "12 cm²" },
                  { id: "c", text: "16 cm²" },
                  { id: "d", text: "4 cm²" },
                ], "c"),
                mc("Um retângulo tem área 24 cm² e largura 6 cm. Qual é o comprimento?", [
                  { id: "a", text: "3 cm" },
                  { id: "b", text: "4 cm" },
                  { id: "c", text: "6 cm" },
                  { id: "d", text: "8 cm" },
                ], "b"),
              ],
            },
          },
        ],
      },
    },
  });

  await prisma.module.create({
    data: {
      subjectId: matematica.id,
      title: "Porcentagem",
      order: 5,
      difficulty: 6,
      prerequisites: "[]",
      microSkills: {
        create: [
          {
            name: "Porcentagem de um número",
            exercises: {
              create: [
                mc("Quanto é 10% de 200?", [
                  { id: "a", text: "10" },
                  { id: "b", text: "20" },
                  { id: "c", text: "30" },
                  { id: "d", text: "40" },
                ], "b"),
                mc("Quanto é 50% de 80?", [
                  { id: "a", text: "20" },
                  { id: "b", text: "30" },
                  { id: "c", text: "40" },
                  { id: "d", text: "50" },
                ], "c"),
                pre("Quanto é 25% de 40?", 10),
              ],
            },
          },
          {
            name: "Aumentos e descontos",
            exercises: {
              create: [
                mc("Um celular custa R$ 400 com 20% de desconto. Qual é o preço final?", [
                  { id: "a", text: "R$ 360" },
                  { id: "b", text: "R$ 320" },
                  { id: "c", text: "R$ 300" },
                  { id: "d", text: "R$ 380" },
                ], "b"),
                mc("Um salário de R$ 1 000 subiu 10%. Quanto passou a valer?", [
                  { id: "a", text: "R$ 1 100" },
                  { id: "b", text: "R$ 1 010" },
                  { id: "c", text: "R$ 1 200" },
                  { id: "d", text: "R$ 900" },
                ], "a"),
                mc("Qual é o total de 15% de 60?", [
                  { id: "a", text: "6" },
                  { id: "b", text: "9" },
                  { id: "c", text: "12" },
                  { id: "d", text: "15" },
                ], "b"),
              ],
            },
          },
        ],
      },
    },
  });

  console.log("Criando Português...");
  await prisma.module.create({
    data: {
      subjectId: portugues.id,
      title: "Ortografia",
      order: 1,
      difficulty: 2,
      prerequisites: "[]",
      microSkills: {
        create: [
          {
            name: "S ou SS",
            exercises: {
              create: [
                mc("Qual palavra está escrita corretamente?", [
                  { id: "a", text: "passado" },
                  { id: "b", text: "pazado" },
                  { id: "c", text: "pasado" },
                  { id: "d", text: "pacado" },
                ], "a"),
                mc("Qual palavra está escrita corretamente?", [
                  { id: "a", text: "asado" },
                  { id: "b", text: "assado" },
                  { id: "c", text: "azado" },
                  { id: "d", text: "acasado" },
                ], "b"),
                mc("Qual palavra está escrita corretamente?", [
                  { id: "a", text: "crescer" },
                  { id: "b", text: "creser" },
                  { id: "c", text: "crecer" },
                  { id: "d", text: "crezzer" },
                ], "a"),
              ],
            },
          },
          {
            name: "Uso de M antes de P e B",
            exercises: {
              create: [
                mc("Qual palavra está escrita corretamente?", [
                  { id: "a", text: "campo" },
                  { id: "b", text: "canpo" },
                  { id: "c", text: "camppo" },
                  { id: "d", text: "campoo" },
                ], "a"),
                mc("Qual palavra está escrita corretamente?", [
                  { id: "a", text: "comprar" },
                  { id: "b", text: "conprar" },
                  { id: "c", text: "comprarr" },
                  { id: "d", text: "compra" },
                ], "a"),
                mc("Qual palavra está escrita corretamente?", [
                  { id: "a", text: "sombra" },
                  { id: "b", text: "sonbra" },
                  { id: "c", text: "sombbra" },
                  { id: "d", text: "somboa" },
                ], "a"),
              ],
            },
          },
        ],
      },
    },
  });

  await prisma.module.create({
    data: {
      subjectId: portugues.id,
      title: "Leitura e Interpretação",
      order: 2,
      difficulty: 4,
      prerequisites: "[]",
      microSkills: {
        create: [
          {
            name: "Interpretar texto curto",
            exercises: {
              create: [
                mc("Leia: 'O sol nasceu cedo e a menina foi brincar no jardim.' Quando a menina foi brincar?", [
                  { id: "a", text: "De manhã" },
                  { id: "b", text: "À noite" },
                  { id: "c", text: "À tarde" },
                  { id: "d", text: "De madrugada" },
                ], "a"),
                mc("Leia: 'O cachorro latiu quando o carteiro passou.' Por que o cachorro latiu?", [
                  { id: "a", text: "Estava com fome" },
                  { id: "b", text: "Por causa do carteiro" },
                  { id: "c", text: "Queria dormir" },
                  { id: "d", text: "Estava chovendo" },
                ], "b"),
                mc("Leia: 'Maria plantou uma semente e regou todos os dias.' O que Maria fez?", [
                  { id: "a", text: "Cortou as flores" },
                  { id: "b", text: "Plantou uma semente" },
                  { id: "c", text: "Vendeu frutas" },
                  { id: "d", text: "Colheu trigo" },
                ], "b"),
              ],
            },
          },
          {
            name: "Localizar informações",
            exercises: {
              create: [
                mc("Leia: 'O passeio começa às 9 horas no parque.' Onde começa o passeio?", [
                  { id: "a", text: "No cinema" },
                  { id: "b", text: "No parque" },
                  { id: "c", text: "Na escola" },
                  { id: "d", text: "No museu" },
                ], "b"),
                mc("Leia: 'João comprou três livros e um caderno.' O que João comprou?", [
                  { id: "a", text: "Três cadernos e um livro" },
                  { id: "b", text: "Três lápis" },
                  { id: "c", text: "Três livros e um caderno" },
                  { id: "d", text: "Um livro e três cadernos" },
                ], "c"),
                mc("Leia: 'A festa será no sábado à noite, na casa da avó.' Quando será a festa?", [
                  { id: "a", text: "No domingo" },
                  { id: "b", text: "Na sexta-feira" },
                  { id: "c", text: "No sábado" },
                  { id: "d", text: "Na segunda-feira" },
                ], "c"),
              ],
            },
          },
        ],
      },
    },
  });

  await prisma.module.create({
    data: {
      subjectId: portugues.id,
      title: "Gramática Essencial",
      order: 3,
      difficulty: 5,
      prerequisites: "[]",
      microSkills: {
        create: [
          {
            name: "Artigos e substantivos",
            exercises: {
              create: [
                mc("Qual é o artigo em 'O menino correu'?", [
                  { id: "a", text: "O" },
                  { id: "b", text: "menino" },
                  { id: "c", text: "correu" },
                  { id: "d", text: "O menino" },
                ], "a"),
                mc("Qual palavra é um substantivo?", [
                  { id: "a", text: "bonito" },
                  { id: "b", text: "menina" },
                  { id: "c", text: "corre" },
                  { id: "d", text: "rapidamente" },
                ], "b"),
                mc("Complete: '___ casa é bonita.'", [
                  { id: "a", text: "O" },
                  { id: "b", text: "Os" },
                  { id: "c", text: "A" },
                  { id: "d", text: "As" },
                ], "c"),
              ],
            },
          },
          {
            name: "Verbos e concordância",
            exercises: {
              create: [
                mc("Complete: 'Nós ___ ao mercado.'", [
                  { id: "a", text: "foi" },
                  { id: "b", text: "fomos" },
                  { id: "c", text: "fui" },
                  { id: "d", text: "foram" },
                ], "b"),
                mc("Complete: 'Ela ___ de manhã.'", [
                  { id: "a", text: "acordam" },
                  { id: "b", text: "acordamos" },
                  { id: "c", text: "acorda" },
                  { id: "d", text: "acordei" },
                ], "c"),
                mc("Complete: 'As meninas ___ felizes.'", [
                  { id: "a", text: "está" },
                  { id: "b", text: "estão" },
                  { id: "c", text: "estamos" },
                  { id: "d", text: "estou" },
                ], "b"),
              ],
            },
          },
        ],
      },
    },
  });

  await prisma.module.create({
    data: {
      subjectId: portugues.id,
      title: "Produção de Texto",
      order: 4,
      difficulty: 6,
      prerequisites: "[]",
      microSkills: {
        create: [
          {
            name: "Estrutura do parágrafo",
            exercises: {
              create: [
                mc("Qual frase é uma boa introdução para um texto sobre o inverno?", [
                  { id: "a", text: "Concluindo, o inverno é frio." },
                  { id: "b", text: "O inverno é a estação mais fria do ano." },
                  { id: "c", text: "Depois disso, fui para casa." },
                  { id: "d", text: "Ou seja, no verão." },
                ], "b"),
                mc("Onde deve estar a conclusão de um texto?", [
                  { id: "a", text: "No começo" },
                  { id: "b", text: "No meio" },
                  { id: "c", text: "No final" },
                  { id: "d", text: "Em qualquer lugar" },
                ], "c"),
                mc("Um parágrafo bem estruturado geralmente começa com:", [
                  { id: "a", text: "A frase principal (tópico frasal)" },
                  { id: "b", text: "Um exemplo sem contexto" },
                  { id: "c", text: "Um ponto final" },
                  { id: "d", text: "Uma pergunta sem sentido" },
                ], "a"),
              ],
            },
          },
          {
            name: "Coesão e conectivos",
            exercises: {
              create: [
                mc("Qual conectivo liga ideias de causa?", [
                  { id: "a", text: "portanto" },
                  { id: "b", text: "porque" },
                  { id: "c", text: "mas" },
                  { id: "d", text: "ou" },
                ], "b"),
                mc("Qual conectivo indica oposição?", [
                  { id: "a", text: "porque" },
                  { id: "b", text: "também" },
                  { id: "c", text: "mas" },
                  { id: "d", text: "então" },
                ], "c"),
                mc("Complete: 'Estava chovendo, ___ não fomos ao parque.'", [
                  { id: "a", text: "mas" },
                  { id: "b", text: "porque" },
                  { id: "c", text: "portanto" },
                  { id: "d", text: "ou" },
                ], "c"),
              ],
            },
          },
        ],
      },
    },
  });

  await prisma.module.create({
    data: {
      subjectId: portugues.id,
      title: "Acentuação",
      order: 5,
      difficulty: 6,
      prerequisites: "[]",
      microSkills: {
        create: [
          {
            name: "Sílaba tônica",
            exercises: {
              create: [
                mc("Qual palavra é oxítona (acento na última sílaba)?", [
                  { id: "a", text: "cadeira" },
                  { id: "b", text: "café" },
                  { id: "c", text: "janela" },
                  { id: "d", text: "água" },
                ], "b"),
                mc("Qual palavra é proparoxítona (acento na antepenúltima sílaba)?", [
                  { id: "a", text: "bolo" },
                  { id: "b", text: "bumbum" },
                  { id: "c", text: "lâmpada" },
                  { id: "d", text: "amor" },
                ], "c"),
                mc("Em 'cidade', a sílaba tônica é:", [
                  { id: "a", text: "ci" },
                  { id: "b", text: "da" },
                  { id: "c", text: "de" },
                  { id: "d", text: "ci-da" },
                ], "b"),
              ],
            },
          },
          {
            name: "Regras de acentuação",
            exercises: {
              create: [
                mc("Qual palavra está acentuada corretamente?", [
                  { id: "a", text: "matematica" },
                  { id: "b", text: "Matemática" },
                  { id: "c", text: "Matematicá" },
                  { id: "d", text: "matemáticA" },
                ], "b"),
                mc("Todas as proparoxítonas são acentuadas. Qual aquela está errada?", [
                  { id: "a", text: "rápido" },
                  { id: "b", text: "médico" },
                  { id: "c", text: "história" },
                  { id: "d", text: "gráfico" },
                ], "c"),
                mc("Qual NÃO leva acento?", [
                  { id: "a", text: "café" },
                  { id: "b", text: "Armário" },
                  { id: "c", text: "casa" },
                  { id: "d", text: "mês" },
                ], "c"),
              ],
            },
          },
        ],
      },
    },
  });

  console.log("Criando Inglês...");
  await prisma.module.create({
    data: {
      subjectId: ingles.id,
      title: "Apresentação",
      order: 1,
      difficulty: 1,
      prerequisites: "[]",
      microSkills: {
        create: [
          {
            name: "Greetings and introductions",
            exercises: {
              create: [
                mc("How do you say 'Olá' in English?", [
                  { id: "a", text: "Bye" },
                  { id: "b", text: "Hello" },
                  { id: "c", text: "Thanks" },
                  { id: "d", text: "Sorry" },
                ], "b"),
                mc("What is the best answer to: 'How are you?'", [
                  { id: "a", text: "I'm fine, thanks" },
                  { id: "b", text: "My name is John" },
                  { id: "c", text: "I'm twelve" },
                  { id: "d", text: "Yes, I do" },
                ], "a"),
                fala("Say 'Good morning' out loud (or type it below).", "good morning"),
              ],
            },
          },
          {
            name: "Alphabet and spelling",
            exercises: {
              create: [
                mc("How many letters are there in the English alphabet?", [
                  { id: "a", text: "24" },
                  { id: "b", text: "25" },
                  { id: "c", text: "26" },
                  { id: "d", text: "27" },
                ], "c"),
                mc("What letter comes right after 'H'?", [
                  { id: "a", text: "G" },
                  { id: "b", text: "I" },
                  { id: "c", text: "J" },
                  { id: "d", text: "K" },
                ], "b"),
                fala("Say 'Hello' out loud (or type it below).", "hello"),
              ],
            },
          },
        ],
      },
    },
  });

  await prisma.module.create({
    data: {
      subjectId: ingles.id,
      title: "Números e Cores",
      order: 2,
      difficulty: 2,
      prerequisites: "[]",
      microSkills: {
        create: [
          {
            name: "Numbers 1-100",
            exercises: {
              create: [
                mc("What number is 'twenty-five'?", [
                  { id: "a", text: "15" },
                  { id: "b", text: "25" },
                  { id: "c", text: "35" },
                  { id: "d", text: "50" },
                ], "b"),
                mc("What number is 'ninety-nine'?", [
                  { id: "a", text: "19" },
                  { id: "b", text: "90" },
                  { id: "c", text: "99" },
                  { id: "d", text: "109" },
                ], "c"),
                pre("Type '31' in English (for example: thirty-one).", "thirty-one"),
              ],
            },
          },
          {
            name: "Colors",
            exercises: {
              create: [
                mc("What color is the sky on a sunny day?", [
                  { id: "a", text: "Red" },
                  { id: "b", text: "Blue" },
                  { id: "c", text: "Green" },
                  { id: "d", text: "Yellow" },
                ], "b"),
                mc("What color is a banana?", [
                  { id: "a", text: "Yellow" },
                  { id: "b", text: "Purple" },
                  { id: "c", text: "Black" },
                  { id: "d", text: "Pink" },
                ], "a"),
                mc("What color is grass?", [
                  { id: "a", text: "Blue" },
                  { id: "b", text: "Orange" },
                  { id: "c", text: "Green" },
                  { id: "d", text: "Gray" },
                ], "c"),
              ],
            },
          },
        ],
      },
    },
  });

  await prisma.module.create({
    data: {
      subjectId: ingles.id,
      title: "Frases Simples",
      order: 3,
      difficulty: 4,
      prerequisites: "[]",
      microSkills: {
        create: [
          {
            name: "Verb to be",
            exercises: {
              create: [
                mc("Complete: 'I ___ a student.'", [
                  { id: "a", text: "am" },
                  { id: "b", text: "is" },
                  { id: "c", text: "are" },
                  { id: "d", text: "be" },
                ], "a"),
                mc("Complete: 'She ___ my friend.'", [
                  { id: "a", text: "am" },
                  { id: "b", text: "is" },
                  { id: "c", text: "are" },
                  { id: "d", text: "be" },
                ], "b"),
                mc("Complete: 'They ___ happy.'", [
                  { id: "a", text: "am" },
                  { id: "b", text: "is" },
                  { id: "c", text: "are" },
                  { id: "d", text: "be" },
                ], "c"),
              ],
            },
          },
          {
            name: "Simple questions",
            exercises: {
              create: [
                mc("Complete: '___ you like pizza?'", [
                  { id: "a", text: "Is" },
                  { id: "b", text: "Do" },
                  { id: "c", text: "Does" },
                  { id: "d", text: "Are" },
                ], "b"),
                mc("Complete: 'Where ___ you from?'", [
                  { id: "a", text: "are" },
                  { id: "b", text: "is" },
                  { id: "c", text: "am" },
                  { id: "d", text: "be" },
                ], "a"),
                mc("Complete: '___ your name?'", [
                  { id: "a", text: "What's" },
                  { id: "b", text: "Why" },
                  { id: "c", text: "How" },
                  { id: "d", text: "When" },
                ], "a"),
              ],
            },
          },
        ],
      },
    },
  });

  await prisma.module.create({
    data: {
      subjectId: ingles.id,
      title: "Vocabulário do Dia a Dia",
      order: 4,
      difficulty: 5,
      prerequisites: "[]",
      microSkills: {
        create: [
          {
            name: "Food and drinks",
            exercises: {
              create: [
                mc("What is 'pão' in English?", [
                  { id: "a", text: "Water" },
                  { id: "b", text: "Bread" },
                  { id: "c", text: "Butter" },
                  { id: "d", text: "Cake" },
                ], "b"),
                mc("What is 'leite' in English?", [
                  { id: "a", text: "Milk" },
                  { id: "b", text: "Juice" },
                  { id: "c", text: "Tea" },
                  { id: "d", text: "Coffee" },
                ], "a"),
                mc("What is 'maçã' in English?", [
                  { id: "a", text: "Orange" },
                  { id: "b", text: "Banana" },
                  { id: "c", text: "Apple" },
                  { id: "d", text: "Grape" },
                ], "c"),
              ],
            },
          },
          {
            name: "Daily routines",
            exercises: {
              create: [
                mc("What do you do when you 'wake up'?", [
                  { id: "a", text: "Sleep" },
                  { id: "b", text: "Stop sleeping" },
                  { id: "c", text: "Eat dinner" },
                  { id: "d", text: "Go out" },
                ], "b"),
                mc("What is 'dormir' in English?", [
                  { id: "a", text: "To sleep" },
                  { id: "b", text: "To swim" },
                  { id: "c", text: "To run" },
                  { id: "d", text: "To walk" },
                ], "a"),
                mc("Complete: 'I ___ my teeth every morning.'", [
                  { id: "a", text: "brush" },
                  { id: "b", text: "eat" },
                  { id: "c", text: "clean" },
                  { id: "d", text: "wash" },
                ], "a"),
              ],
            },
          },
        ],
      },
    },
  });

  await prisma.module.create({
    data: {
      subjectId: ingles.id,
      title: "Present Simple",
      order: 5,
      difficulty: 6,
      prerequisites: "[]",
      microSkills: {
        create: [
          {
            name: "Affirmative sentences",
            exercises: {
              create: [
                mc("Complete: 'I ___ to school every day.'", [
                  { id: "a", text: "goes" },
                  { id: "b", text: "go" },
                  { id: "c", text: "going" },
                  { id: "d", text: "gone" },
                ], "b"),
                mc("Complete: 'She ___ TV at night.'", [
                  { id: "a", text: "watch" },
                  { id: "b", text: "watches" },
                  { id: "c", text: "watching" },
                  { id: "d", text: "are watch" },
                ], "b"),
                mc("Complete: 'They ___ soccer on Saturdays.'", [
                  { id: "a", text: "play" },
                  { id: "b", text: "plays" },
                  { id: "c", text: "playing" },
                  { id: "d", text: "are plays" },
                ], "a"),
              ],
            },
          },
          {
            name: "Negatives and questions",
            exercises: {
              create: [
                mc("Complete the negative: 'She ___ like coffee.'", [
                  { id: "a", text: "don't" },
                  { id: "b", text: "doesn't" },
                  { id: "c", text: "isn't" },
                  { id: "d", text: "aren't" },
                ], "b"),
                mc("Complete the question: '___ you like music?'", [
                  { id: "a", text: "Does" },
                  { id: "b", text: "Do" },
                  { id: "c", text: "Is" },
                  { id: "d", text: "Are" },
                ], "b"),
                fala("Say 'I like English' out loud (or type it below).", "i like english"),
              ],
            },
          },
        ],
      },
    },
  });

  const subjects = await prisma.subject.findMany({
    include: {
      modules: { include: { microSkills: { include: { exercises: true } } } },
    },
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
  console.log(`Seed concluído: ${subjects.length} matérias, ${total} exercícios.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
