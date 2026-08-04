export interface CognitiveLog {
  exerciseId: string;
  type: string | null;
  isCorrect: boolean;
  timeTakenMs: number;
  errorType: string | null;
}

export type CognitiveLevel = "inicial" | "em_desenvolvimento" | "consistente";

export interface CognitiveResult {
  speed: number;
  accuracy: number;
  focus: number;
  memory: number;
  interpretation: number;
  logic: number;
  persistence: number;
  level: CognitiveLevel;
  feedback: string[];
  sampleSize: number;
}

const clamp = (n: number, min = 0, max = 100) => Math.min(max, Math.max(min, n));

const FEEDBACK_MSGS: Record<string, { low: string; high: string }> = {
  speed: {
    low: "Você leva mais tempo que o comum — o ritmo melhora naturalmente com a prática.",
    high: "Você resolve as questões com agilidade!",
  },
  accuracy: {
    low: "Sua precisão precisa de atenção — revise o conteúdo antes de tentar de novo.",
    high: "Excelente precisão! Continue assim.",
  },
  focus: {
    low: "Seus tempos variam muito — tente estudar sem interrupções para manter o foco.",
    high: "Ótimo foco: seus tempos são bem consistentes.",
  },
  memory: {
    low: "Treine a recuperação do conteúdo: revise exercícios já feitos.",
    high: "Boa memória: você recupera o conteúdo das tentativas anteriores.",
  },
  interpretation: {
    low: "Leia os enunciados com atenção antes de responder.",
    high: "Você interpreta bem os enunciados.",
  },
  logic: {
    low: "Pratique os cálculos passo a passo para fortalecer o raciocínio lógico.",
    high: "Raciocínio lógico afiado!",
  },
  persistence: {
    low: "Não desista: refazer é parte do método — cada tentativa conta.",
    high: "Você é persistente — não desiste até acertar. Isso é o que mais conta!",
  },
};

/** Calcula o perfil cognitivo do aluno a partir do histórico de exercícios. */
export function computeCognitiveProfile(logs: CognitiveLog[]): CognitiveResult {
  if (logs.length === 0) {
    return {
      speed: 50,
      accuracy: 50,
      focus: 50,
      memory: 50,
      interpretation: 50,
      logic: 50,
      persistence: 50,
      level: "inicial",
      feedback: ["Complete seus primeiros exercícios para que o perfil seja calculado."],
      sampleSize: 0,
    };
  }

  const n = logs.length;
  const correct = logs.filter((l) => l.isCorrect).length;
  const accuracy = Math.round((correct / n) * 100);

  const times = logs.map((l) => l.timeTakenMs).filter((t) => t > 0);
  const avgSec = times.length ? times.reduce((a, b) => a + b, 0) / times.length / 1000 : 0;
  const speed = times.length ? clamp(Math.round(120 - avgSec)) : accuracy;
  const std = times.length
    ? Math.sqrt(times.reduce((a, t) => a + (t - avgSec * 1000) ** 2, 0) / times.length)
    : 0;
  const cv = avgSec > 0 ? std / (avgSec * 1000) : 0;
  const focus = times.length ? clamp(Math.round(100 - cv * 200)) : accuracy;

  const byExercise = new Map<string, CognitiveLog[]>();
  for (const l of logs) {
    const arr = byExercise.get(l.exerciseId) ?? [];
    arr.push(l);
    byExercise.set(l.exerciseId, arr);
  }

  const redone = Array.from(byExercise.values()).filter((a) => a.length >= 2);
  const memory = redone.length
    ? Math.round(
        (redone.filter((a) => a[a.length - 1].isCorrect).length / redone.length) * 100
      )
    : accuracy;

  const open = logs.filter((l) => l.type === "dissertativa" || l.type === "fala");
  const interpretation = open.length
    ? Math.round((open.filter((l) => l.isCorrect).length / open.length) * 100)
    : accuracy;

  const calc = logs.filter((l) => l.type === "preenchimento" || l.type === "escrita_mao");
  const logic = calc.length
    ? Math.round((calc.filter((l) => l.isCorrect).length / calc.length) * 100)
    : accuracy;

  const attemptsToCorrect = Array.from(byExercise.values()).map((arr) => {
    const idx = arr.findIndex((l) => l.isCorrect);
    return idx === -1 ? arr.length : idx + 1;
  });
  const avgAttempts =
    attemptsToCorrect.reduce((a, b) => a + b, 0) / attemptsToCorrect.length;
  const persistence = clamp(Math.round(avgAttempts * 25));

  const level: CognitiveLevel =
    accuracy >= 80 && speed >= 60
      ? "consistente"
      : accuracy >= 50
        ? "em_desenvolvimento"
        : "inicial";

  const dims: { key: keyof typeof FEEDBACK_MSGS; value: number }[] = [
    { key: "speed", value: speed },
    { key: "accuracy", value: accuracy },
    { key: "focus", value: focus },
    { key: "memory", value: memory },
    { key: "interpretation", value: interpretation },
    { key: "logic", value: logic },
    { key: "persistence", value: persistence },
  ];

  const sorted = [...dims].sort((a, b) => a.value - b.value);
  const weakest = sorted.slice(0, 2).filter((d) => d.value < 55);
  const strongest = sorted[sorted.length - 1];
  const feedback: string[] = [];
  for (const d of weakest) feedback.push(FEEDBACK_MSGS[d.key].low);
  if (strongest.value >= 70 && feedback.length < 3)
    feedback.push(FEEDBACK_MSGS[strongest.key].high);

  return {
    speed,
    accuracy,
    focus,
    memory,
    interpretation,
    logic,
    persistence,
    level,
    feedback,
    sampleSize: n,
  };
}
