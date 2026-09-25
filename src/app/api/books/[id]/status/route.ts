import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { handleError, HttpError } from "@/lib/errors";
import { bookInclude, serializeBook } from "@/lib/serialize";
import { statusSchema } from "@/lib/validators";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const user = await requireUser();
    const existing = await prisma.bookListing.findUnique({ where: { id } });
    if (!existing) throw new HttpError(404, "We couldn't find that listing.");
    if (existing.sellerId !== user.id) throw new HttpError(403, "You can only edit your own listing.");

    const input = statusSchema.parse(await request.json());
    const book = await prisma.bookListing.update({
      where: { id },
      data: { status: input.status },
      include: bookInclude,
    });
    const sold = await prisma.bookListing.count({ where: { sellerId: user.id, status: "sold" } });
    return NextResponse.json({ book: serializeBook(book, user.id, sold) });
  } catch (error) {
    return handleError(error);
  }
}
