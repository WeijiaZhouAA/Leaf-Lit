import { NextResponse } from "next/server";
import { clearSession } from "@/lib/auth";
import { handleError } from "@/lib/errors";

export async function POST() {
  try {
    await clearSession();
    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleError(error);
  }
}
