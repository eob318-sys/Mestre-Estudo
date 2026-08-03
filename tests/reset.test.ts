import { describe, expect, it } from "vitest";
import {
  buildResetLink,
  createResetToken,
  hashResetToken,
  isResetExpired,
  RESET_TTL_HOURS,
} from "../lib/reset";

describe("createResetToken", () => {
  it("gera um token hex de 64 caracteres (32 bytes)", () => {
    const token = createResetToken();
    expect(token).toMatch(/^[0-9a-f]{64}$/);
  });

  it("gera tokens diferentes a cada chamada", () => {
    expect(createResetToken()).not.toBe(createResetToken());
  });
});

describe("hashResetToken", () => {
  it("produz hash hex de 64 caracteres", () => {
    expect(hashResetToken("token-de-teste")).toMatch(/^[0-9a-f]{64}$/);
  });

  it("é determinístico", () => {
    expect(hashResetToken("abc")).toBe(hashResetToken("abc"));
  });

  it("tokens diferentes geram hashes diferentes", () => {
    expect(hashResetToken("abc")).not.toBe(hashResetToken("abd"));
  });

  it("não armazena o token em texto puro", () => {
    expect(hashResetToken("segredo")).not.toContain("segredo");
  });
});

describe("isResetExpired", () => {
  const now = new Date("2026-08-03T12:00:00Z");

  it("considera ausência de expiração como expirado", () => {
    expect(isResetExpired(null, now)).toBe(true);
  });

  it("expiração no passado está expirada", () => {
    expect(isResetExpired(new Date("2026-08-03T11:00:00Z"), now)).toBe(true);
  });

  it("expiração futura ainda é válida", () => {
    expect(isResetExpired(new Date("2026-08-03T13:00:00Z"), now)).toBe(false);
  });

  it("aceita datas em string ISO", () => {
    expect(isResetExpired("2026-08-03T11:00:00Z", now)).toBe(true);
    expect(isResetExpired("2026-08-03T13:00:00Z", now)).toBe(false);
  });

  it("expiração exatamente agora ainda é válida", () => {
    expect(isResetExpired(now, now)).toBe(false);
  });
});

describe("buildResetLink", () => {
  it("monta o link de redefinição com o token", () => {
    expect(buildResetLink("https://exemplo.com", "tok-123")).toBe(
      "https://exemplo.com/redefinir-senha?token=tok-123"
    );
  });

  it("remove barra final da base antes de montar", () => {
    expect(buildResetLink("https://exemplo.com/", "tok")).toBe(
      "https://exemplo.com/redefinir-senha?token=tok"
    );
  });
});

describe("RESET_TTL_HOURS", () => {
  it("link expira em 1 hora", () => {
    expect(RESET_TTL_HOURS).toBe(1);
  });
});