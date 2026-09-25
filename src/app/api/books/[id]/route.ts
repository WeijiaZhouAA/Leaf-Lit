import { NextResponse } from "next/server";
import { getSessionUser, requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { handleError, HttpError } from "@/lib/errors";
import { bookInclude, serializeBook } from "@/lib/serialize";
import { bookSchema } from "@/lib/validators";

async function soldCount(sellerId: string) {
  return prisma.bookListing.count({ where: { sellerId, status: "sold" } });
}

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const viewer = await getSessionUser();
    const book = await prisma.bookListing.findUnique({ where: { id }, include: bookInclude });
    if (!book) throw new HttpError(404, "We couldn't find that listing.");
    const similar = await prisma.bookListing.findMany({
      where: { id: { not: id }, status: "active", OR: [{ genre: book.genre }, { author: book.author }] },
      include: bookInclude,
      take: 3,
    });
    const count = await soldCount(book.sellerId);
    const purchase = viewer ? await prisma.order.findUnique({ where: { bookId: id } }) : null;
    return NextResponse.json({
      book: { ...serializeBook(book, viewer?.id, count), orderId: purchase && viewer && purchase.buyerId === viewer.id ? purchase.id : null },
      similar: similar.map((item) => serializeBook(item, viewer?.id)),
    });
  } catch (error) {
    return handleError(error);
  }
}

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const user = await requireUser();
    const existing = await prisma.bookListing.findUnique({ where: { id } });
    if (!existing) throw new HttpError(404, "We couldn't find that listing.");
    if (existing.sellerId !== user.id) throw new HttpError(403, "You can only edit your own listing.");

    const input = bookSchema.parse(await request.json());
    const book = await prisma.bookListing.update({
      where: { id },
      data: {
        title: input.title,
        author: input.author,
        isbn: input.isbn || null,
        genre: input.genre,
        condition: input.condition,
        price: input.price,
        description: input.description,
        sellerNotes: input.sellerNotes,
        pickupLocation: input.location,
        image: input.image || existing.image,
        status: input.status,
      },
      include: bookInclude,
    });
    return NextResponse.json({ book: serializeBook(book, user.id, await soldCount(user.id)) });
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const user = await requireUser();
    const existing = await prisma.bookListing.findUnique({ where: { id } });
    if (!existing) throw new HttpError(404, "We couldn't find that listing.");
    if (existing.sellerId !== user.id) throw new HttpError(403, "You can only delete your own listing.");
    await prisma.bookListing.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleError(error);
  }
}
