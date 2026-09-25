import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { handleError, HttpError } from "@/lib/errors";
import { serializeOrder } from "@/lib/orders";
import { prisma } from "@/lib/prisma";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const session = await requireUser();
    const order = await prisma.order.findUnique({ where: { id }, include: { book: true, seller: true } });
    if (!order || (order.buyerId !== session.id && order.sellerId !== session.id)) {
      throw new HttpError(404, "We couldn't find that order.");
    }
    return NextResponse.json({ order: serializeOrder(order, true) });
  } catch (error) {
    return handleError(error);
  }
}
