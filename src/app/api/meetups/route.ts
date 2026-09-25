import { NextResponse } from "next/server";
import { getSessionUser, requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { handleError } from "@/lib/errors";
import { meetupInclude, serializeMeetup } from "@/lib/serialize";
import { meetupSchema } from "@/lib/validators";

export async function GET(request: Request) {
  try {
    const viewer = await getSessionUser();
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q")?.trim();
    const genre = searchParams.get("genre");
    const type = searchParams.get("type");
    const suburb = searchParams.get("location");
    const spots = searchParams.get("spots");
    const when = searchParams.get("when");
    const sort = searchParams.get("sort") ?? "recommended";
    const mine = searchParams.get("mine");
    const saved = searchParams.get("saved");
    const status = searchParams.get("status");

    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    else if (!mine) where.status = "published";

    if (mine === "hosting" && viewer) where.hostId = viewer.id;
    if (mine === "joined" && viewer) where.attendees = { some: { userId: viewer.id } };
    if (saved === "1" && viewer) where.savedBy = { some: { userId: viewer.id } };
    if (genre && genre !== "All") where.genre = genre;
    if (type && type !== "All") where.meetupType = type;
    if (suburb && suburb !== "All") where.suburb = suburb;
    if (q) {
      where.OR = [
        { title: { contains: q, mode: "insensitive" } },
        { bookTitle: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
        { location: { contains: q, mode: "insensitive" } },
      ];
    }

    const now = new Date();
    now.setHours(0, 0, 0, 0);
    if (when === "week") {
      const end = new Date(now);
      end.setDate(end.getDate() + 7);
      where.date = { gte: now, lte: end };
    } else if (when === "month") {
      const end = new Date(now);
      end.setMonth(end.getMonth() + 1);
      where.date = { gte: now, lte: end };
    } else if (when === "past") {
      where.date = { lt: now };
    } else if (when === "upcoming") {
      where.date = { gte: now };
    }

    const meetups = await prisma.meetup.findMany({
      where,
      include: meetupInclude,
      orderBy: sort === "new" ? { createdAt: "desc" } : { date: "asc" },
    });

    let data = meetups.map((meetup) => serializeMeetup(meetup, viewer?.id));
    if (spots === "open") data = data.filter((meetup) => meetup.attendees < meetup.maxAttendees);
    if (sort === "popular") data = [...data].sort((a, b) => b.attendees - a.attendees);

    return NextResponse.json({ meetups: data });
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const input = meetupSchema.parse(await request.json());
    const meetup = await prisma.meetup.create({
      data: {
        title: input.title,
        description: input.description,
        bookTitle: input.bookTitle,
        bookAuthor: input.author,
        bookCover: input.bookCover || "/images/books/default.jpg",
        genre: input.genre,
        meetupType: input.type,
        date: new Date(`${input.date}T00:00:00`),
        startTime: input.startTime,
        endTime: input.endTime,
        location: input.location,
        suburb: input.suburb || input.location,
        maximumAttendees: input.maxAttendees,
        discussionTopics: input.topics,
        rules: input.rules,
        coverImage: input.coverImage || "/images/covers/default.jpg",
        status: input.status,
        hostId: user.id,
      },
      include: meetupInclude,
    });
    return NextResponse.json({ meetup: serializeMeetup(meetup, user.id) }, { status: 201 });
  } catch (error) {
    return handleError(error);
  }
}
