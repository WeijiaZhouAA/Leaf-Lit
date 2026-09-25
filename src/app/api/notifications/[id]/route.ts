import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { handleError, HttpError } from "@/lib/errors";

export async function PATCH(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const user = await requireUser();
    const existing = await prisma.notification.findUnique({ where: { id } });
    if (!existing || existing.userId !== user.id) throw new HttpError(404, "Notification not found.");
    await prisma.notification.update({ where: { id }, data: { read: true } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleError(error);
  }
}
