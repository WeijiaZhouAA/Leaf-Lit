import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { handleError, HttpError } from "@/lib/errors";
import { prisma } from "@/lib/prisma";

export async function PATCH(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const session = await requireUser();
    const method = await prisma.paymentMethod.findUnique({ where: { id } });
    if (!method || method.userId !== session.id) throw new HttpError(404, "We couldn't find that payment method.");
    await prisma.$transaction([
      prisma.paymentMethod.updateMany({ where: { userId: session.id }, data: { isDefault: false } }),
      prisma.paymentMethod.update({ where: { id }, data: { isDefault: true } }),
    ]);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const session = await requireUser();
    const method = await prisma.paymentMethod.findUnique({ where: { id } });
    if (!method || method.userId !== session.id) throw new HttpError(404, "We couldn't find that payment method.");
    await prisma.paymentMethod.delete({ where: { id } });
    if (method.isDefault) {
      const next = await prisma.paymentMethod.findFirst({ where: { userId: session.id }, orderBy: { createdAt: "asc" } });
      if (next) await prisma.paymentMethod.update({ where: { id: next.id }, data: { isDefault: true } });
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleError(error);
  }
}
