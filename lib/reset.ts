import { createHash, randomBytes } from "crypto";

export const RESET_TTL_HOURS = 1;

export function createResetToken(): string {
  return randomBytes(32).toString("hex");
}

export function hashResetToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function isResetExpired(expires: Date | null | string, now: Date = new Date()): boolean {
  if (!expires) return true;
  const t = typeof expires === "string" ? new Date(expires) : expires;
  return t.getTime() < now.getTime();
}

export function buildResetLink(base: string, token: string): string {
  return `${base.replace(/\/$/, "")}/redefinir-senha?token=${token}`;
}