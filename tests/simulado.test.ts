import { describe, expect, it } from "vitest";
import {
  notaSimulado,
  pickSimulado,
  shuffle,
  simuladoSeconds,
} from "../lib/simulado";
import type { SimExercise } from "../lib/simulado";

function makeExercise(id: string): SimExercise {
  return { id, microSkillId: null, type: "choice", prompt: id, options: null, difficulty: 1 };
}

describe("shuffle", () => {
  it("preserva o conjunto e o tamanho", () => {
    const input = [1, 2, 3, 4, 5];
    const result = shuffle(input);
    expect(result).toHaveLength(input.length);
    expect([...result].sort()).toEqual([...input].sort());
  });

  it("não muta o array original", () => {
    const input = [1, 2, 3];
    shuffle(input);
    expect(input).toEqual([1, 2, 3]);
  });

  it("mantém a ordem para listas vazias ou unitárias", () => {
    expect(shuffle([])).toEqual([]);
    expect(shuffle([42])).toEqual([42]);
  });
});

describe("pickSimulado", () => {
  const bank = [1, 2, 3, 4, 5].map((n) => makeExercise(`ex-${n}`));

  it("pega exatamente 'count' exercícios quando há folga", () => {
    expect(pickSimulado(bank, 3)).toHaveLength(3);
  });

  it("não pede mais do que o banco disponível", () => {
    expect(pickSimulado(bank, 99)).toHaveLength(5);
  });

  it("não devolve menos de 1 questão", () => {
    expect(pickSimulado(bank, 0)).toHaveLength(1);
    expect(pickSimulado([], 10)).toHaveLength(0);
  });

  it("só devolve exercícios do banco, sem repetição", () => {
    const picked = pickSimulado(bank, 4);
    expect(new Set(picked.map((e) => e.id)).size).toBe(picked.length);
    for (const e of picked) {
      expect(bank).toContain(e);
    }
  });
});

describe("simuladoSeconds", () => {
  it("sugere 2 minutos por questão", () => {
    expect(simuladoSeconds(10)).toBe(1200);
    expect(simuladoSeconds(1)).toBe(120);
  });
});

describe("notaSimulado", () => {
  it("converte acertos em nota 0-100 arredondada", () => {
    expect(notaSimulado(10, 10)).toBe(100);
    expect(notaSimulado(7, 10)).toBe(70);
    expect(notaSimulado(0, 10)).toBe(0);
  });

  it("arredonda corretamente", () => {
    expect(notaSimulado(1, 3)).toBe(33);
    expect(notaSimulado(2, 3)).toBe(67);
    expect(notaSimulado(4, 6)).toBe(67);
  });

  it("evita divisão por zero em total 0", () => {
    expect(notaSimulado(0, 0)).toBe(0);
  });
});