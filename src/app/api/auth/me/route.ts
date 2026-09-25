import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { handleError } from "@/lib/errors";
import { userStats } from "@/lib/serialize";

export async function GET() {
  try {
    const session = await getSessionUser();
    if (!session) return NextResponse.json({ user: null });

    const user = await prisma.user.findUnique({
      where: { id: session.id },
      include: { _count: { select: { hostedMeetups: true, attendances: true, listings: true } } },
    });
    if (!user) return NextResponse.json({ user: null });

    const booksSold = await prisma.bookListing.count({ where: { sellerId: user.id, status: "sold" } });
    const unread = await prisma.notification.count({ where: { userId: user.id, read: false, type: { not: "purchase" } } });
    return NextResponse.json({ user: userStats(user, booksSold), unread });
  } catch (error) {
    return handleError(error);
  }
}
