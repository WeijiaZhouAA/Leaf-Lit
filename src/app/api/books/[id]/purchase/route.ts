import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { assignShipment } from "@/lib/commerce";
import { handleError, HttpError } from "@/lib/errors";
import { notify } from "@/lib/notify";
import { serializeOrder } from "@/lib/orders";
import { prisma } from "@/lib/prisma";
import { purchaseSchema } from "@/lib/validators";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const session = await requireUser();
    const input = purchaseSchema.parse(await request.json());
    const buyer = await prisma.user.findUniqueOrThrow({ where: { id: session.id } });
    if (!buyer.phone || !buyer.addressLine || !buyer.addressSuburb || !buyer.addressCity || !buyer.addressPostcode) {
      throw new HttpError(400, "Add a delivery address and phone number in Settings before you buy.");
    }
    const method = await prisma.paymentMethod.findUnique({ where: { id: input.paymentMethodId } });
    if (!method || method.userId !== session.id) throw new HttpError(400, "Choose a saved payment method.");

    const shipment = assignShipment(id + session.id);
    const order = await prisma.$transaction(async (tx) => {
      const updated = await tx.bookListing.updateMany({
        where: { id, status: "active", sellerId: { not: session.id } },
        data: { status: "sold" },
      });
      if (updated.count !== 1) {
        const existing = await tx.bookListing.findUnique({ where: { id } });
        if (!existing) throw new HttpError(404, "We couldn't find that listing.");
        if (existing.sellerId === session.id) throw new HttpError(400, "You cannot buy your own listing.");
        throw new HttpError(409, "This book has already been sold.");
      }
      const book = await tx.bookListing.findUniqueOrThrow({ where: { id } });
      return tx.order.create({
        data: {
          buyerId: session.id,
          sellerId: book.sellerId,
          bookId: id,
          amount: book.price,
          paymentLabel: method.label,
          carrier: shipment.carrier,
          trackingNumber: shipment.trackingNumber,
          shipToName: buyer.name,
          shipToPhone: buyer.phone,
          shipToLine: buyer.addressLine,
          shipToSuburb: buyer.addressSuburb,
          shipToCity: buyer.addressCity,
          shipToPostcode: buyer.addressPostcode,
          origin: book.pickupLocation,
        },
        include: { book: true, seller: true },
      });
    });

    await notify(order.sellerId, "sale", `${buyer.name} bought "${order.book.title}".`, `/my-listings`);
    return NextResponse.json({ order: serializeOrder(order, true) }, { status: 201 });
  } catch (error) {
    return handleError(error);
  }
}
