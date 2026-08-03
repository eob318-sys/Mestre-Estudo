import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  let db = "down";
  try {
    await prisma.$queryRaw`SELECT 1`;
    db = "up";
  } catch {
    db = "down";
  }
  return NextResponse.json({
    ok: db === "up",
    db,
    time: new Date().toISOString(),
  });
}