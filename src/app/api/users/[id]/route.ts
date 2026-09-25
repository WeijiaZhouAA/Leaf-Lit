import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { handleError, HttpError } from "@/lib/errors";
import { bookInclude, meetupInclude, serializeBook, serializeMeetup, userStats } from "@/lib/serialize";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const viewer = await getSessionUser();
    const user = await prisma.user.findUnique({
      where: { id },
      include: { _count: { select: { hostedMeetups: true, attendances: true, listings: true } } },
    });
    if (!user) throw new HttpError(404, "We couldn't find that reader.");

    const booksSold = await prisma.bookListing.count({ where: { sellerId: id, status: "sold" } });
    const [meetups, books] = await Promise.all([
      prisma.meetup.findMany({
        where: { hostId: id, status: { in: ["published", "cancelled"] } },
        include: meetupInclude,
        orderBy: { date: "desc" },
        take: 6,
      }),
      prisma.bookListing.findMany({
        where: { sellerId: id, status: "active" },
        include: bookInclude,
        orderBy: { createdAt: "desc" },
        take: 6,
      }),
    ]);

    const profile = userStats(user, booksSold);
    delete (profile as { email?: string }).email;

    return NextResponse.json({
      user: profile,
      meetups: meetups.map((meetup) => serializeMeetup(meetup, viewer?.id)),
      books: books.map((book) => serializeBook(book, viewer?.id, booksSold)),
    });
  } catch (error) {
    return handleError(error);
  }
}
