import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { handleError } from "@/lib/errors";
import { profileSchema } from "@/lib/validators";
import { userStats } from "@/lib/serialize";

export async function PUT(request: Request) {
  try {
    const session = await requireUser();
    const input = profileSchema.parse(await request.json());
    const user = await prisma.user.update({
      where: { id: session.id },
      data: {
        name: input.name,
        bio: input.bio,
        location: input.location,
        favouriteGenres: input.favouriteGenres,
        ...(input.avatar ? { avatar: input.avatar } : {}),
      },
      include: { _count: { select: { hostedMeetups: true, attendances: true, listings: true } } },
    });
    const booksSold = await prisma.bookListing.count({ where: { sellerId: user.id, status: "sold" } });
    return NextResponse.json({ user: userStats(user, booksSold) });
  } catch (error) {
    return handleError(error);
  }
}
