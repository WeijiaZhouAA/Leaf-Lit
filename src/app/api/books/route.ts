import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { getSessionUser, requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { handleError } from "@/lib/errors";
import { bookInclude, serializeBook } from "@/lib/serialize";
import { bookSchema } from "@/lib/validators";

export async function GET(request: Request) {
  try {
    const viewer = await getSessionUser();
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q")?.trim();
    const genre = searchParams.get("genre");
    const condition = searchParams.get("condition");
    const location = searchParams.get("location");
    const maxPrice = searchParams.get("maxPrice");
    const sort = searchParams.get("sort") ?? "recommended";
    const mine = searchParams.get("mine");
    const saved = searchParams.get("saved");
    const status = searchParams.get("status");

    const where: Prisma.BookListingWhereInput = {};
    if (mine === "1" && viewer) where.sellerId = viewer.id;
    else if (saved === "1" && viewer) where.savedBy = { some: { userId: viewer.id } };
    else where.status = "active";

    if (status && status !== "all") where.status = status;
    if (genre && genre !== "All") where.genre = genre;
    if (condition && condition !== "All") where.condition = condition;
    if (location && location !== "All") where.pickupLocation = { contains: location, mode: "insensitive" };
    if (maxPrice) where.price = { lte: new Prisma.Decimal(maxPrice) };
    if (q) {
      where.OR = [
        { title: { contains: q, mode: "insensitive" } },
        { author: { contains: q, mode: "insensitive" } },
        { isbn: { contains: q, mode: "insensitive" } },
      ];
    }

    const orderBy =
      sort === "price-asc"
        ? { price: "asc" as const }
        : sort === "price-desc"
          ? { price: "desc" as const }
          : { createdAt: "desc" as const };

    const books = await prisma.bookListing.findMany({ where, include: bookInclude, orderBy });
    const sellerIds = [...new Set(books.map((book) => book.sellerId))];
    const sold = await prisma.bookListing.groupBy({
      by: ["sellerId"],
      where: { sellerId: { in: sellerIds }, status: "sold" },
      _count: true,
    });
    const soldMap = new Map(sold.map((row) => [row.sellerId, row._count]));

    return NextResponse.json({
      books: books.map((book) => serializeBook(book, viewer?.id, soldMap.get(book.sellerId) ?? 0)),
    });
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const input = bookSchema.parse(await request.json());
    const book = await prisma.bookListing.create({
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
        image: input.image || "/images/books/default.jpg",
        status: input.status,
        sellerId: user.id,
      },
      include: bookInclude,
    });
    return NextResponse.json({ book: serializeBook(book, user.id) }, { status: 201 });
  } catch (error) {
    return handleError(error);
  }
}
