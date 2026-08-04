import { requestAiChat } from "@/lib/ai";

export type GeneratedExercise = {
  type: "multipla_escolha" | "preenchimento" | "dissertativa" | "fala" | "escrita_mao";
  prompt: string;
  difficulty: number;
  options?: { id: string; text: string }[];
  correctAnswer: Record<string, unknown>;
};

const LETTERS = ["a", "b", "c", "d", "e", "f"];

function toAnswer(value: string) {
  return value.replace(/-/g, "_").replace(/\s+/g, "_").toLowerCase().trim();
}

/** Valida e converte o JSON retornado pela IA em um exercício utilizável. */
export function parseGeneratedExercise(text: string): GeneratedExercise | null {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) return null;
  let raw: Record<string, unknown>;
  try {
    raw = JSON.parse(match[0]) as Record<string, unknown>;
  } catch {
    return null;
  }
  if (!raw || typeof raw !== "object") return null;

  const prompt = String(raw.prompt ?? "").trim();
  if (!prompt) return null;
  const difficulty =
    (typeof raw.difficulty === "number" &&
      Number.isFinite(raw.difficulty) &&
      Math.round(raw.difficulty) >= 1 &&
      Math.round(raw.difficulty) <= 3)
      ? Math.round(raw.difficulty)
      : 1;

  const ca = (raw.correctAnswer ?? {}) as Record<string, unknown>;
  const type = String(raw.type ?? "");

  if (type === "multipla_escolha") {
    const rawOptions = Array.isArray(raw.options) ? (raw.options as Record<string, unknown>[]) : [];
    const options = rawOptions
      .map((o, i) => ({
        id: String(o?.id ?? LETTERS[i] ?? `x${i}`).slice(0, 1).toLowerCase(),
        text: String(o?.text ?? "").trim(),
      }))
      .filter((o) => o.id && o.text);
    if (options.length < 2) return null;
    let correct = toAnswer(String(ca.option ?? raw.correct ?? ""));
    if (!options.some((o) => o.id === correct)) {
      correct = options[0].id;
    }
    return {
      type,
      prompt,
      difficulty,
      options,
      correctAnswer: { option: correct },
    };
  }

  if (type === "preenchimento") {
    const value = String(ca.value ?? raw.correct ?? "").trim();
    if (!value) return null;
    return { type, prompt, difficulty, correctAnswer: { value } };
  }

  if (type === "dissertativa" || type === "fala" || type === "escrita_mao") {
    const text = String(ca.text ?? raw.correct ?? "").trim();
    if (!text) return null;
    return { type, prompt, difficulty, correctAnswer: { text } };
  }

  return null;
}

/** Gera um exercício novo para a skill usando a IA (failover automático). */
export async function generateExercise(input: {
  subjectSlug: string;
  subjectName: string;
  skillName: string;
  difficulty: number;
  examplePrompt?: string;
}): Promise<GeneratedExercise | null> {
  const system =
    "Você gera exercícios pedagógicos para o app de estudos 'Mestre do Estudo'. " +
    "Sempre responda APENAS com um JSON válido, sem texto fora dele.";

  const user = `Gere EXATAMENTE UM exercício novo para a habilidade "${input.skillName}" da matéria "${input.subjectName}".
Formato JSON (sem texto fora):
{"type":"multipla_escolha"|"preenchimento"|"dissertativa"|"fala"|"escrita_mao","prompt":"enunciado da questão","difficulty":1|2|3,"options":[{"id":"a","text":"alternativa"}],"correctAnswer":{...}}
Regras:
- multipla_escolha: envie 4 options (ids a, b, c, d) e correctAnswer {"option":"c"}; o enunciado descreve a pergunta e as alternativas são respostas plausíveis.
- preenchimento: correctAnswer {"value":"<resposta exata>"}; indicada para cálculos.
- dissertativa: correctAnswer {"text":"<resposta de referência curta>"}.
- fala (somente para Inglês): a questão pede para o aluno falar uma frase; correctAnswer {"text":"<frase em inglês>"}.
- escrita_mao (somente para Matemática): a questão pede para o aluno escrever à mão o resultado de um cálculo ou a resposta numérica; correctAnswer {"text":"<valor exato>"} (ex.: "62").
- Tipo válido conforme a matéria: Matemática usa preferencialmente preenchimento, multipla_escolha ou escrita_mao; Português final usa dissertativa ou multipla_escolha; Inglês usa fala ou multipla_escolha.
- difficulty entre 1 e 3, coerente com o nível ${input.difficulty}.
${input.subjectSlug === "ingles" ? "Tudo em inglês." : "Tudo em português."}`;

  const text = await requestAiChat({
    system,
    messages: [{ role: "user", content: user }],
    maxTokens: 512,
    temperature: 0.8,
  });
  if (!text) return null;
  return parseGeneratedExercise(text);
}