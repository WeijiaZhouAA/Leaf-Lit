import { NextResponse } from "next/server";
import { getSessionUser, requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { handleError, HttpError } from "@/lib/errors";
import { notify } from "@/lib/notify";
import { meetupInclude, serializeMeetup } from "@/lib/serialize";
import { meetupSchema } from "@/lib/validators";

async function load(id: string) {
  const meetup = await prisma.meetup.findUnique({ where: { id }, include: meetupInclude });
  if (!meetup) throw new HttpError(404, "We couldn't find that gathering.");
  return meetup;
}

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const viewer = await getSessionUser();
    const meetup = await load(id);
    const similar = await prisma.meetup.findMany({
      where: { id: { not: id }, status: "published", genre: meetup.genre },
      include: meetupInclude,
      take: 3,
    });
    const fallback = similar.length
      ? similar
      : await prisma.meetup.findMany({
          where: { id: { not: id }, status: "published" },
          include: meetupInclude,
          take: 3,
        });
    return NextResponse.json({
      meetup: serializeMeetup(meetup, viewer?.id),
      similar: fallback.map((item) => serializeMeetup(item, viewer?.id)),
    });
  } catch (error) {
    return handleError(error);
  }
}

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const user = await requireUser();
    const existing = await load(id);
    if (existing.hostId !== user.id) throw new HttpError(403, "You can only edit your own gathering.");

    const input = meetupSchema.parse(await request.json());
    const meetup = await prisma.meetup.update({
      where: { id },
      data: {
        title: input.title,
        description: input.description,
        bookTitle: input.bookTitle,
        bookAuthor: input.author,
        bookCover: input.bookCover || existing.bookCover,
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
        coverImage: input.coverImage || existing.coverImage,
        status: input.status === "draft" ? "draft" : existing.status === "cancelled" ? "cancelled" : "published",
      },
      include: meetupInclude,
    });

    await Promise.all(
      existing.attendees
        .filter((attendee) => attendee.userId !== user.id)
        .map((attendee) =>
          notify(attendee.userId, "discover", `The gathering "${meetup.title}" was updated.`, `/gatherings/${meetup.id}`),
        ),
    );

    return NextResponse.json({ meetup: serializeMeetup(meetup, user.id) });
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const user = await requireUser();
    const existing = await load(id);
    if (existing.hostId !== user.id) throw new HttpError(403, "You can only cancel your own gathering.");

    const meetup = await prisma.meetup.update({
      where: { id },
      data: { status: "cancelled" },
      include: meetupInclude,
    });

    await Promise.all(
      existing.attendees.map((attendee) =>
        notify(attendee.userId, "reminder", `"${meetup.title}" has been cancelled by the host.`, `/gatherings/${meetup.id}`),
      ),
    );

    return NextResponse.json({ meetup: serializeMeetup(meetup, user.id) });
  } catch (error) {
    return handleError(error);
  }
}
