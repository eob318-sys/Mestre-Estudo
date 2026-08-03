import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { requestAiChat, resetAiState } from "../lib/ai";

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

function stubFetch(handler: (url: string) => { status: number; body: string }) {
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url: string) => {
      const result = handler(url);
      return {
        ok: result.status >= 200 && result.status < 300,
        status: result.status,
        text: async () => result.body,
      };
    })
  );
}

const REQ = {
  system: "sistema de teste",
  messages: [{ role: "user" as const, content: "oi" }],
  maxTokens: 100,
  temperature: 0.5,
};

beforeEach(() => {
  resetAiState();
  clearAiEnv();
});

afterEach(() => {
  vi.unstubAllGlobals();
  clearAiEnv();
});

describe("requestAiChat — failover automático entre provedores", () => {
  it("sem chaves configuradas retorna null (fallback local é usado)", async () => {
    expect(await requestAiChat(REQ)).toBeNull();
  });

  it("troca de provedor automaticamente quando o atual retorna 429 (quota)", async () => {
    process.env.GEMINI_API_KEYS = "gemini-key";
    process.env.GROQ_API_KEY = "groq-key";
    stubFetch((url) => {
      if (url.includes("generativelanguage")) {
        return { status: 429, body: '{"error":{"status":"RESOURCE_EXHAUSTED"}}' };
      }
      return { status: 200, body: '{"choices":[{"message":{"content":"resposta do groq"}}]}' };
    });
    expect(await requestAiChat(REQ)).toBe("resposta do groq");
  });

  it("rotaciona para a próxima chave do mesmo provedor quando a anterior esgotou a cota", async () => {
    process.env.GEMINI_API_KEYS = "chave-esgotada,chave-ok";
    stubFetch((url) => {
      if (url.includes("key=chave-esgotada")) {
        return { status: 429, body: '{"error":{"status":"RESOURCE_EXHAUSTED"}}' };
      }
      return {
        status: 200,
        body: '{"candidates":[{"content":{"parts":[{"text":"resposta do gemini"}]}}]}',
      };
    });
    expect(await requestAiChat(REQ)).toBe("resposta do gemini");
  });

  it("retorna null quando todos os provedores falham", async () => {
    process.env.GEMINI_API_KEYS = "gemini-key";
    process.env.GROQ_API_KEY = "groq-key";
    stubFetch(() => ({ status: 503, body: "indisponível" }));
    expect(await requestAiChat(REQ)).toBeNull();
  });
});
