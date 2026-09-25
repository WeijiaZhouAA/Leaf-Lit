import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { handleError, HttpError } from "@/lib/errors";
import { notify } from "@/lib/notify";

export async function POST(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const user = await requireUser();
    const book = await prisma.bookListing.findUnique({ where: { id } });
    if (!book) throw new HttpError(404, "We couldn't find that listing.");
    await prisma.savedBook.upsert({
      where: { userId_bookId: { userId: user.id, bookId: id } },
      update: {},
      create: { userId: user.id, bookId: id },
    });
    if (book.sellerId !== user.id) {
      await notify(book.sellerId, "save", `Your book listing "${book.title}" was saved by another user.`, `/marketplace/${id}`);
    }
    return NextResponse.json({ saved: true });
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const user = await requireUser();
    await prisma.savedBook.deleteMany({ where: { userId: user.id, bookId: id } });
    return NextResponse.json({ saved: false });
  } catch (error) {
    return handleError(error);
  }
}
