import { describe, expect, it } from "vitest";
import { parseGeneratedExercise } from "../lib/generator";

describe("parseGeneratedExercise", () => {
  it("aceita multipla_escolha válida e normaliza a alternativa correta", () => {
    const ex = parseGeneratedExercise(
      `{"type":"multipla_escolha","prompt":"Quanto é 2+2?","difficulty":1,"options":[{"id":"A","text":"3"},{"id":"B","text":"4"},{"id":"C","text":"5"},{"id":"D","text":"6"}],"correctAnswer":{"option":"B"}}`
    );
    expect(ex).not.toBeNull();
    expect(ex?.type).toBe("multipla_escolha");
    expect(ex?.options?.length).toBe(4);
    expect(ex?.correctAnswer).toEqual({ option: "b" });
  });

  it("corrige alternativa correta que não está entre as opções", () => {
    const ex = parseGeneratedExercise(
      `{"type":"multipla_escolha","prompt":"P","options":[{"id":"a","text":"X"},{"id":"b","text":"Y"}],"correctAnswer":{"option":"z"}}`
    );
    expect(ex?.correctAnswer).toEqual({ option: "a" });
  });

  it("aceita preenchimento e dissertativa", () => {
    const fill = parseGeneratedExercise(
      `{"type":"preenchimento","prompt":"7x8?","correctAnswer":{"value":"56"}}`
    );
    expect(fill?.correctAnswer).toEqual({ value: "56" });

    const essay = parseGeneratedExercise(
      `{"type":"dissertativa","prompt":"Explique","correctAnswer":{"text":"resp"}}`
    );
    expect(essay?.type).toBe("dissertativa");
    expect(essay?.correctAnswer).toEqual({ text: "resp" });
  });

  it("rejeita JSON inválido, tipo desconhecido ou opções insuficientes", () => {
    expect(parseGeneratedExercise("texto sem json")).toBeNull();
    expect(parseGeneratedExercise('{"type":"audio","prompt":"x","correctAnswer":{}}')).toBeNull();
    expect(
      parseGeneratedExercise(
        '{"type":"multipla_escolha","prompt":"x","options":[{"id":"a","text":"só"}],"correctAnswer":{"option":"a"}}'
      )
    ).toBeNull();
    expect(parseGeneratedExercise('{"type":"fala","prompt":"","correctAnswer":{"text":"x"}}')).toBeNull();
  });

  it("usa difficulty padrão 1 para valores inválidos", () => {
    const ex = parseGeneratedExercise(
      `{"type":"preenchimento","prompt":"P","difficulty":"9","correctAnswer":{"value":"1"}}`
    );
    expect(ex?.difficulty).toBe(1);
  });
});