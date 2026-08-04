import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { correctExercise, localCorrection, resetAiState } from "../lib/ai";
import { parseGeneratedExercise } from "../lib/generator";
import { computeCognitiveProfile } from "../lib/cognitive";

const AI_ENV_KEYS = [
  "GEMINI_API_KEYS",
  "GROQ_API_KEY",
  "OPENROUTER_API_KEY",
  "GEMINI_MODELS",
  "GROQ_MODEL",
  "OPENROUTER_MODEL",
];

function clearAiEnv() {
  for (const key of AI_ENV_KEYS) delete process.env[key];
}

function stubFetch(handler: (url: string, init: RequestInit) => { status: number; body: string }) {
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url: string, init?: RequestInit) => {
      const result = handler(url, init ?? {});
      return {
        ok: result.status >= 200 && result.status < 300,
        status: result.status,
        text: async () => result.body,
      };
    })
  );
}

beforeEach(() => {
  resetAiState();
  clearAiEnv();
});

afterEach(() => {
  vi.unstubAllGlobals();
  clearAiEnv();
});

describe("escrita_mao — correção local (fallback sem IA)", () => {
  it("retorna resultado neutro com dica do valor esperado quando não há IA", () => {
    const r = localCorrection("matematica", "escrita_mao", { text: "62" }, "data:image/png;base64,AAAA");
    expect(r.correta).toBe(false);
    expect(r.nota).toBe(0);
    expect(r.tipoErro).toBe("ilegivel");
    expect(r.explicacao).toContain("62");
  });

  it("sem chaves Gemini, correctExercise cai no fallback local", async () => {
    const r = await correctExercise({
      subject: "matematica",
      type: "escrita_mao",
      prompt: "Escreva à mão o resultado de 37 + 25.",
      correctAnswer: { text: "62" },
      studentAnswer: "data:image/png;base64,AAAA",
    });
    expect(r.correta).toBe(false);
    expect(r.tipoErro).toBe("ilegivel");
  });
});

describe("escrita_mao — correção por visão (Gemini)", () => {
  it("envia a imagem inline e usa a nota retornada pela IA", async () => {
    process.env.GEMINI_API_KEYS = "gemini-key";
    let sentImage = "";
    stubFetch((url, init) => {
      if (url.includes("generativelanguage") && url.includes("generateContent")) {
        const body = JSON.parse(String(init.body)) as {
          contents: { parts: { inlineData?: { data: string } }[] }[];
        };
        sentImage = body.contents[0].parts.find((p) => p.inlineData)?.inlineData?.data ?? "";
        return {
          status: 200,
          body: '{"candidates":[{"content":{"parts":[{"text":"{\\"nota\\":100,\\"correta\\":true,\\"explicacao\\":\\"Você escreveu 62, correto!\\",\\"dica\\":\\"Ótima letra!\\",\\"tipoErro\\":null}"}]}}]}',
        };
      }
      return { status: 404, body: "not found" };
    });

    const r = await correctExercise({
      subject: "matematica",
      type: "escrita_mao",
      prompt: "Escreva à mão o resultado de 37 + 25.",
      correctAnswer: { text: "62" },
      studentAnswer: "data:image/png;base64,ZmluZ2VycHJpbnQ=",
    });
    expect(sentImage).toBe("ZmluZ2VycHJpbnQ=");
    expect(r.correta).toBe(true);
    expect(r.nota).toBe(100);
    expect(r.tipoErro).toBeNull();
  });

  it("cai no fallback local quando a resposta não é uma imagem válida", async () => {
    process.env.GEMINI_API_KEYS = "gemini-key";
    const r = await correctExercise({
      subject: "matematica",
      type: "escrita_mao",
      prompt: "Escreva à mão o resultado de 37 + 25.",
      correctAnswer: { text: "62" },
      studentAnswer: "apenas um texto sem imagem",
    });
    expect(r.correta).toBe(false);
    expect(r.tipoErro).toBe("ilegivel");
  });
});

describe("escrita_mao — geração de exercícios", () => {
  it("aceita JSON do tipo escrita_mao com correctAnswer.text", () => {
    const ex = parseGeneratedExercise(
      '{"type":"escrita_mao","prompt":"Escreva à mão o resultado de 3 × 4.","difficulty":2,"correctAnswer":{"text":"12"}}'
    );
    expect(ex).not.toBeNull();
    expect(ex!.type).toBe("escrita_mao");
    expect(ex!.correctAnswer).toEqual({ text: "12" });
  });

  it("rejeita escrita_mao sem resposta esperada", () => {
    expect(
      parseGeneratedExercise(
        '{"type":"escrita_mao","prompt":"Escreva à mão algo.","difficulty":2,"correctAnswer":{}}'
      )
    ).toBeNull();
  });
});

describe("escrita_mao — perfil cognitivo", () => {
  it("contribui para a dimensão de lógica/raciocínio", () => {
    const profile = computeCognitiveProfile([
      { exerciseId: "e1", type: "escrita_mao", isCorrect: true, timeTakenMs: 30000, errorType: null },
      { exerciseId: "e2", type: "escrita_mao", isCorrect: false, timeTakenMs: 40000, errorType: "erro_calculo" },
    ]);
    expect(profile.logic).toBe(50);
    expect(profile.sampleSize).toBe(2);
  });
});
