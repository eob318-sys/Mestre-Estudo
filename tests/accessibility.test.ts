import { describe, expect, it } from "vitest";
import { FONT_SCALES } from "../lib/accessibility";

describe("accessibility config", () => {
  it("oferece três escalas de fonte", () => {
    expect(FONT_SCALES.map((f) => f.value)).toEqual(["100", "115", "130"]);
  });
});
