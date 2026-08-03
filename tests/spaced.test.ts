import { describe, expect, it } from "vitest";
import {
  daysUntilNextReview,
  isReviewDue,
  scheduleNextReview,
} from "../lib/spaced";

describe("daysUntilNextReview", () => {
  it("domínio abaixo de 50% revisa em 1 dia", () => {
    expect(daysUntilNextReview(0, 1)).toBe(1);
    expect(daysUntilNextReview(49, 3)).toBe(1);
  });

  it("domínio parcial (50-99%) revisa em 3 dias", () => {
    expect(daysUntilNextReview(50, 1)).toBe(3);
    expect(daysUntilNextReview(67, 5)).toBe(3);
    expect(daysUntilNextReview(99, 2)).toBe(3);
  });

  it("domínio completo espaça: 7, 14 e depois 30 dias", () => {
    expect(daysUntilNextReview(100, 1)).toBe(7);
    expect(daysUntilNextReview(100, 2)).toBe(14);
    expect(daysUntilNextReview(100, 3)).toBe(30);
    expect(daysUntilNextReview(100, 10)).toBe(30);
  });

  it("tentativas extras não ultrapassam o intervalo máximo", () => {
    expect(daysUntilNextReview(100, 99)).toBe(30);
  });
});

describe("scheduleNextReview", () => {
  it("agenda a partir da data base", () => {
    const from = new Date("2026-08-02T12:00:00Z");
    expect(scheduleNextReview(100, 1, from)).toEqual(new Date("2026-08-09T12:00:00Z"));
  });
});

describe("isReviewDue", () => {
  const now = new Date("2026-08-02T12:00:00Z");
  it("revisão no passado ou agora está vencida", () => {
    expect(isReviewDue(new Date("2026-08-01T00:00:00Z"), now)).toBe(true);
    expect(isReviewDue(now, now)).toBe(true);
  });
  it("revisão futura ou ausente não está vencida", () => {
    expect(isReviewDue(new Date("2026-08-03T00:00:00Z"), now)).toBe(false);
    expect(isReviewDue(null, now)).toBe(false);
  });
});
