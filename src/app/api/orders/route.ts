import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { handleError } from "@/lib/errors";
import { serializeOrder } from "@/lib/orders";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await requireUser();
    const orders = await prisma.order.findMany({
      where: { buyerId: session.id },
      include: { book: true, seller: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ orders: orders.map((order) => serializeOrder(order, true)) });
  } catch (error) {
    return handleError(error);
  }
}
