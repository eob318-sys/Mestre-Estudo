import { prisma } from "@/lib/prisma";

const PERSONAS: Record<string, string> = {
  matematica:
    "Você é o professor particular de Matemática do app 'Mestre do Estudo', com tom calmo e didático, explicando sempre passo a passo, como no método Kumon. Para o aluno, seu nome é Prof. Rui.",
  portugues:
    "Você é o professor particular de Português do app 'Mestre do Estudo', articulado e focado em gramática, interpretação e redação. Para o aluno, seu nome é Prof. Clara.",
  ingles:
    "You are Sam, a friendly English tutor at 'Mestre do Estudo'. You encourage students to try, you correct mistakes in a kind way (never sounding punitive), and you always respond in English at a level the student can understand, using simple words.",
};

const DEFAULT_PERSONA =
  "Você é um professor particular paciente e encorajador, explicando de forma clara e simples.";

function personaFor(subject: string): string {
  return PERSONAS[subject] ?? DEFAULT_PERSONA;
}

export interface CorrectionResult {
  nota: number;
  correta: boolean;
  explicacao: string;
  dica: string;
  tipoErro: string | null;
}

export function normalizeText(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s]|_/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Corretor local de fallback: usado quando todas as IAs falham ou não há chave. */
export function localCorrection(
  subject: string,
  type: string,
  correctAnswer: unknown,
  studentAnswer: string
): CorrectionResult {
  const ca = (correctAnswer ?? {}) as Record<string, unknown>;
  const notaZero = (explicacao: string, dica: string): CorrectionResult => ({
    nota: 0,
    correta: false,
    explicacao,
    dica,
    tipoErro: null,
  });

  if (type === "multipla_escolha") {
    if (String(ca.option ?? "") === String(studentAnswer).trim()) {
      return {
        nota: 100,
        correta: true,
        explicacao: "Resposta correta! Muito bem.",
        dica: "Continue assim. Tente explicar com suas palavras por que essa é a resposta certa.",
        tipoErro: null,
      };
    }
    return notaZero(
      "A alternativa escolhida não é a correta.",
      "Leia o enunciado com calma e elimine as alternativas que claramente não fazem sentido."
    );
  }

  if (type === "preenchimento") {
    const expected = String(ca.value ?? "").trim();
    const got = studentAnswer.trim();
    const num = (s: string) => {
      const n = parseFloat(s.replace(",", ".").replace(/\s/g, ""));
      return isNaN(n) ? null : n;
    };
    if (expected === got || num(expected) === num(got)) {
      return {
        nota: 100,
        correta: true,
        explicacao: "Resposta correta! Muito bem.",
        dica: "Continue praticando para fixar o conteúdo.",
        tipoErro: null,
      };
    }
    return notaZero(
      `A resposta esperada era "${expected}", mas você respondeu "${studentAnswer}".`,
      "Refaça o cálculo com atenção, passo a passo."
    );
  }

  if (type === "fala" || type === "dissertativa") {
    const expected = normalizeText(String(ca.text ?? ""));
    const got = normalizeText(studentAnswer);
    if (got !== "" && got === expected) {
      return {
        nota: 100,
        correta: true,
        explicacao: "Muito bem, você acertou!",
        dica: "Repita mais uma vez para ganhar confiança.",
        tipoErro: null,
      };
    }
    if (got === "") {
      return notaZero(
        "Você não enviou uma resposta.",
        "Tente responder mesmo sem certeza — o importante é tentar."
      );
    }
    return notaZero(
      `A resposta esperada era "${expected}".`,
      subject === "ingles"
        ? "Listen to the sounds and try again. You're on the right track!"
        : "Pense no conteúdo do módulo e tente de novo."
    );
  }

  return notaZero("Não foi possível avaliar esta resposta.", "Tente novamente.");
}

// ===== IA gratuita multi-provedor com failover automático =====
// Provedores suportados: Gemini, Groq e OpenRouter (todos gratuitos, sem
// cartão de crédito). O gerenciador tenta os provedores em ordem; quando um
// esgota a cota (429/quota) ou falha, ele é "pausado" por um cooldown e o
// próximo é tentado automaticamente. Chaves podem ser configuradas em lista
// (ex.: GEMINI_API_KEYS="k1,k2") para rotacionar entre contas/projetos.

export interface TutorMessage {
  role: "user" | "assistant";
  content: string;
}

interface ChatRequest {
  system: string;
  messages: TutorMessage[];
  maxTokens: number;
  temperature: number;
}

type FailureKind = "quota" | "transient" | "client";

const COOLDOWN_MS: Record<FailureKind, number> = {
  quota: 60_000,
  transient: 10_000,
  client: 60_000,
};

const DEFAULT_MODELS: Record<string, string[]> = {
  gemini: ["gemini-3.5-flash-lite", "gemini-3.5-flash", "gemini-3-flash-preview"],
  groq: ["llama-3.3-70b-versatile", "gpt-oss-120b", "qwen/qwen3-32b"],
  openrouter: [
    "nvidia/nemotron-3-ultra-550b-a55b:free",
    "inclusionai/ling-3.0-flash:free",
  ],
};

const pausedUntil = new Map<string, number>();
const lastWorking = new Map<string, { ts: number; modelIdx: number; keyIdx: number }>();

/** Limpa o estado interno do failover (usado pelos testes). */
export function resetAiState(): void {
  pausedUntil.clear();
  lastWorking.clear();
}

function parseList(value: string | undefined): string[] {
  return (value ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

async function fetchJson(url: string, init: RequestInit, timeoutMs: number) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...init, signal: controller.signal });
    const body = await res.text();
    return { ok: res.ok, status: res.status, body };
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

function parseJson(text: string): Record<string, unknown> | null {
  try {
    const value = JSON.parse(text);
    return value && typeof value === "object" ? (value as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

async function callGemini(
  key: string,
  model: string,
  req: ChatRequest,
  timeoutMs: number
): Promise<{ text: string | null; kind: FailureKind | null }> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
    model
  )}:generateContent?key=${encodeURIComponent(key)}`;
  const res = await fetchJson(
    url,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: req.system }] },
        contents: req.messages.map((m) => ({
          role: m.role === "assistant" ? "model" : "user",
          parts: [{ text: m.content }],
        })),
        generationConfig: {
          temperature: req.temperature,
          maxOutputTokens: req.maxTokens,
        },
      }),
    },
    timeoutMs
  );
  if (!res) return { text: null, kind: "transient" };
  if (!res.ok) {
    const err = parseJson(res.body) as { error?: { status?: string } } | null;
    const status = err?.error?.status ?? "";
    if (
      res.status === 429 ||
      status === "RESOURCE_EXHAUSTED" ||
      status === "UNAVAILABLE" ||
      status === "FAILED_PRECONDITION"
    ) {
      return { text: null, kind: "quota" };
    }
    return { text: null, kind: res.status >= 500 ? "transient" : "client" };
  }
  const data = parseJson(res.body) as {
    candidates?: { content?: { parts?: { text?: string }[] } }[];
  } | null;
  const text = (data?.candidates?.[0]?.content?.parts ?? [])
    .map((p) => p.text ?? "")
    .join("")
    .trim();
  return { text: text || null, kind: null };
}

function makeOpenAiCaller(baseUrl: string, extraHeaders: Record<string, string> = {}) {
  return async (
    key: string,
    model: string,
    req: ChatRequest,
    timeoutMs: number
  ): Promise<{ text: string | null; kind: FailureKind | null }> => {
    const res = await fetchJson(
      `${baseUrl}/chat/completions`,
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${key}`,
          ...extraHeaders,
        },
        body: JSON.stringify({
          model,
          temperature: req.temperature,
          max_tokens: req.maxTokens,
          messages: [{ role: "system", content: req.system }, ...req.messages],
        }),
      },
      timeoutMs
    );
    if (!res) return { text: null, kind: "transient" };
    if (!res.ok) {
      const err = parseJson(res.body) as { error?: { code?: string; message?: string } } | null;
      const detail = `${err?.error?.code ?? ""} ${err?.error?.message ?? ""}`;
      if (res.status === 429 || /quota|rate|limit/i.test(detail)) {
        return { text: null, kind: "quota" };
      }
      return { text: null, kind: res.status >= 500 ? "transient" : "client" };
    }
    const data = parseJson(res.body) as {
      choices?: { message?: { content?: string } }[];
    } | null;
    const text = (data?.choices?.[0]?.message?.content ?? "").trim();
    return { text: text || null, kind: null };
  };
}

interface ProviderDef {
  id: string;
  keys: () => string[];
  models: () => string[];
  call: typeof callGemini;
}

function getEnabledProviders(): ProviderDef[] {
  const env = process.env;
  const providers: ProviderDef[] = [];

  const geminiKeys = parseList(env.GEMINI_API_KEYS);
  if (geminiKeys.length > 0) {
    providers.push({
      id: "gemini",
      keys: () => geminiKeys,
      models: () => {
        const m = parseList(env.GEMINI_MODELS);
        return m.length > 0 ? m : DEFAULT_MODELS.gemini;
      },
      call: callGemini,
    });
  }

  const groqKey = env.GROQ_API_KEY?.trim();
  if (groqKey) {
    providers.push({
      id: "groq",
      keys: () => [groqKey],
      models: () => {
        const m = parseList(env.GROQ_MODEL);
        return m.length > 0 ? m : DEFAULT_MODELS.groq;
      },
      call: makeOpenAiCaller("https://api.groq.com/openai/v1"),
    });
  }

  const openrouterKey = env.OPENROUTER_API_KEY?.trim();
  if (openrouterKey) {
    providers.push({
      id: "openrouter",
      keys: () => [openrouterKey],
      models: () => {
        const m = parseList(env.OPENROUTER_MODEL);
        return m.length > 0 ? m : DEFAULT_MODELS.openrouter;
      },
      call: makeOpenAiCaller("https://openrouter.ai/api/v1", {
        "HTTP-Referer": "http://localhost:3000",
        "X-Title": "Mestre do Estudo",
      }),
    });
  }

  return providers;
}

/**
 * Envia uma mensagem de chat à IA usando o failover automático:
 * tenta os provedores em ordem (Gemini → Groq → OpenRouter),
 * rotacionando chaves dentro de cada um; retorna null se todos falharem.
 */
export async function requestAiChat(req: ChatRequest): Promise<string | null> {
  const providers = getEnabledProviders();
  if (providers.length === 0) return null;
  const timeoutMs = Number(process.env.AI_TIMEOUT_MS) || 30_000;

  const ordered = providers.slice().sort((a, b) => {
    const ta = lastWorking.get(a.id)?.ts ?? 0;
    const tb = lastWorking.get(b.id)?.ts ?? 0;
    return tb - ta;
  });

  for (const provider of ordered) {
    const models = provider.models();
    const keys = provider.keys();
    const lw = lastWorking.get(provider.id);
    const modelStart = lw ? (lw.modelIdx + 1) % models.length : 0;
    const keyStart = lw ? (lw.keyIdx + 1) % keys.length : 0;

    for (let mi = 0; mi < models.length; mi++) {
      const model = models[(modelStart + mi) % models.length];
      for (let ki = 0; ki < keys.length; ki++) {
        const key = keys[(keyStart + ki) % keys.length];
        const pauseKey = `${provider.id}::${key}`;
        if ((pausedUntil.get(pauseKey) ?? 0) > Date.now()) continue;

        const result = await provider.call(key, model, req, timeoutMs);
        if (result.text !== null) {
          lastWorking.set(provider.id, {
            ts: Date.now(),
            modelIdx: (modelStart + mi) % models.length,
            keyIdx: (keyStart + ki) % keys.length,
          });
          return result.text;
        }
        pausedUntil.set(pauseKey, Date.now() + COOLDOWN_MS[result.kind ?? "transient"]);
      }
    }
  }
  return null;
}

/** Corrige uma resposta aberta usando a IA; null se todos os provedores falharem. */
async function aiCorrection(
  subject: string,
  type: string,
  prompt: string,
  correctAnswer: unknown,
  studentAnswer: string
): Promise<CorrectionResult | null> {
  const ca = (correctAnswer ?? {}) as Record<string, unknown>;
  const reference =
    type === "multipla_escolha"
      ? `opção ${ca.option}`
      : type === "preenchimento"
        ? String(ca.value ?? "")
        : String(ca.text ?? "");

  const system = `${personaFor(subject)}
Sua tarefa é corrigir uma resposta de exercício do tipo "${type}".
Regras:
- Aponte o ERRO ESPECÍFICO da resposta do aluno (nunca apenas "errado"), de forma clara e encorajadora.
- Se a resposta do aluno estiver substancialmente correta (mesmo com pequenas variações de redação, desde que não mude o sentido), considere correta com nota alta.
- Para respostas de fala em inglês, avalie o texto aproximando a pronúncia/intenção — seja tolerante.
- Responda APENAS em JSON válido, sem texto fora dele:
{"nota": 0-100, "correta": true|false, "explicacao": "erro específico ou elogio", "dica": "uma dica prática", "tipoErro": "erro_conceitual"|"erro_calculo"|"gramatical"|"distracao"|null}`;

  const userMessage = `ENUNCIADO: ${prompt}
RESPOSTA ESPERADA (referência): ${reference}
RESPOSTA DO ALUNO: ${studentAnswer || "(vazia)"}`;

  const text = await requestAiChat({
    system,
    messages: [{ role: "user", content: userMessage }],
    maxTokens: 512,
    temperature: 0.3,
  });
  if (!text) return null;

  const match = text.match(/\{[\s\S]*\}/);
  if (!match) return null;
  try {
    const parsed = JSON.parse(match[0]) as {
      nota?: number;
      correta?: boolean;
      explicacao?: string;
      dica?: string;
      tipoErro?: string;
    };
    return {
      nota: Math.max(0, Math.min(100, Math.round(Number(parsed.nota ?? 0)))),
      correta: Boolean(parsed.correta),
      explicacao: String(parsed.explicacao ?? "Correção concluída."),
      dica: String(parsed.dica ?? "Continue tentando!"),
      tipoErro: typeof parsed.tipoErro === "string" ? parsed.tipoErro : null,
    };
  } catch {
    return null;
  }
}

/** Corrige um exercício: usa IA quando possível, sempre com fallback local. */
export async function correctExercise(input: {
  subject: string;
  type: string;
  prompt: string;
  correctAnswer: unknown;
  studentAnswer: string;
}): Promise<CorrectionResult> {
  if (input.type === "multipla_escolha" || input.type === "preenchimento") {
    return localCorrection(input.subject, input.type, input.correctAnswer, input.studentAnswer);
  }
  const ai = await aiCorrection(
    input.subject,
    input.type,
    input.prompt,
    input.correctAnswer,
    input.studentAnswer
  );
  if (ai) return ai;
  return localCorrection(input.subject, input.type, input.correctAnswer, input.studentAnswer);
}

/** Chat do personagem de IA (usado no Inglês, Sam). Fallback caso a IA falhe. */
export async function tutorReply(
  subject: string,
  history: TutorMessage[],
  studentName: string
): Promise<string> {
  const last = history[history.length - 1]?.content ?? "";
  const system = `${personaFor(subject)}
Você está conversando com ${studentName}, um aluno de educação básica.
No Inglês, responda SEMPRE em inglês simples e amigável, corrija erros de forma gentil e incentive a tentar.
Responda em no máximo 3 frases por mensagem.`;

  const text = await requestAiChat({
    system,
    messages: history.slice(-20),
    maxTokens: 200,
    temperature: 0.7,
  });
  if (!text) return fallbackTutorReply(subject, studentName, last);
  return text;
}

function fallbackTutorReply(subject: string, studentName: string, last: string): string {
  if (subject === "ingles") {
    if (/how are you/i.test(last)) return "I'm great, thank you! How about you?";
    if (/hello|hi|hey/i.test(last)) return "Hello! Nice to meet you. What is your name?";
    if (/name/i.test(last)) return "Nice to meet you! Let's practice: say 'I am " + studentName + "' out loud.";
    if (/good|great|fine|well/i.test(last))
      return "Awesome! Try saying: 'I'm happy today.' Can you say it?";
    return "That's a good try! Remember: short sentences are great for practice. Say: 'I like English.' Now you try!";
  }
  return `Tudo bem, ${studentName}? Estou aqui para ajudar nos estudos. Tente responder de novo com calma — o importante é praticar.`;
}

export async function getSubjectBySlug(slug: string) {
  return prisma.subject.findUnique({
    where: { slug },
    include: {
      modules: {
        include: { microSkills: { include: { exercises: true } } },
      },
    },
  });
}
