import { describe, expect, it } from "vitest";
import { avatarStageForLevel, nextAvatarStage } from "../lib/avatar";

describe("avatarStageForLevel", () => {
  it("começa como ovo", () => {
    expect(avatarStageForLevel(1).emoji).toBe("🥚");
    expect(avatarStageForLevel(2).emoji).toBe("🥚");
  });
  it("evolui conforme o nível", () => {
    expect(avatarStageForLevel(3).emoji).toBe("🐣");
    expect(avatarStageForLevel(6).emoji).toBe("🦉");
    expect(avatarStageForLevel(10).emoji).toBe("🦅");
    expect(avatarStageForLevel(15).emoji).toBe("👑");
    expect(avatarStageForLevel(99).emoji).toBe("👑");
  });
});

describe("nextAvatarStage", () => {
  it("aponta a próxima evolução e null no topo", () => {
    expect(nextAvatarStage(1)?.emoji).toBe("🐣");
    expect(nextAvatarStage(9)?.emoji).toBe("🦅");
    expect(nextAvatarStage(14)?.emoji).toBe("👑");
    expect(nextAvatarStage(15)).toBeNull();
  });
});
