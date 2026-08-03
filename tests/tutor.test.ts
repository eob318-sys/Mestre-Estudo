import { describe, expect, it } from "vitest";
import { fallbackTutorReply } from "../lib/tutor";

describe("fallbackTutorReply", () => {
  it("matemática com números pede passo a passo dos dados", () => {
    const reply = fallbackTutorReply("matematica", "uma loja vendeu 15 e depois 7");
    expect(reply).toContain("números");
    expect(reply).toContain("passo a passo");
  });

  it("português convida a buscar palavras-chave", () => {
    const reply = fallbackTutorReply("portugues", "o que é sujeito?");
    expect(reply).toContain("palavras-chave");
  });

  it("inglês cai no padrão genérico de ajuda", () => {
    const reply = fallbackTutorReply("ingles", "what is present simple?");
    expect(reply.toLowerCase()).toContain("ajudar");
  });

  it("matemática sem números também usa o padrão genérico", () => {
    const reply = fallbackTutorReply("matematica", "como faço frações?");
    expect(reply).not.toContain("números já tem");
  });

  it("matéria desconhecida usa o padrão genérico", () => {
    const reply = fallbackTutorReply("historia", "qualquer coisa");
    expect(reply).toContain("ajudar");
  });
});