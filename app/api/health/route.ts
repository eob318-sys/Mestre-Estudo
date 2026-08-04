import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  let db = "down";
  let error = "";
  try {
    await prisma.$queryRaw`SELECT 1`;
    db = "up";
  } catch (e) {
    error = e instanceof Error ? e.message : String(e);
  }
  return NextResponse.json({
    ok: db === "up",
    db,
    error,
    time: new Date().toISOString(),
  });
}