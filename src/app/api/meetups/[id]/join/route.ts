import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { handleError, HttpError } from "@/lib/errors";
import { notify } from "@/lib/notify";
import { meetupInclude, serializeMeetup } from "@/lib/serialize";

export async function POST(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const user = await requireUser();
    const meetup = await prisma.meetup.findUnique({
      where: { id },
      include: { attendees: true, host: true },
    });
    if (!meetup || meetup.status !== "published") throw new HttpError(404, "This gathering is not open.");
    if (meetup.hostId === user.id) throw new HttpError(400, "You are hosting this gathering.");
    if (meetup.attendees.some((item) => item.userId === user.id)) {
      throw new HttpError(409, "You have already joined this meetup.");
    }
    if (meetup.attendees.length >= meetup.maximumAttendees) {
      throw new HttpError(409, "This meetup is already full.");
    }
    if (meetup.date.getTime() < Date.now() - 24 * 60 * 60 * 1000) {
      throw new HttpError(400, "This gathering has already taken place.");
    }

    await prisma.meetupAttendee.create({ data: { meetupId: id, userId: user.id } });
    await notify(meetup.hostId, "join", `${user.name} joined your gathering "${meetup.title}".`, `/gatherings/${id}`);

    const updated = await prisma.meetup.findUniqueOrThrow({ where: { id }, include: meetupInclude });
    return NextResponse.json({ meetup: serializeMeetup(updated, user.id) });
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const user = await requireUser();
    const attendance = await prisma.meetupAttendee.findUnique({
      where: { meetupId_userId: { meetupId: id, userId: user.id } },
    });
    if (!attendance) throw new HttpError(404, "You are not attending this gathering.");
    await prisma.meetupAttendee.delete({ where: { id: attendance.id } });
    const meetup = await prisma.meetup.findUniqueOrThrow({ where: { id }, include: meetupInclude });
    if (meetup.hostId !== user.id) {
      await notify(meetup.hostId, "join", `${user.name} left your gathering "${meetup.title}".`, `/gatherings/${id}`);
    }
    return NextResponse.json({ meetup: serializeMeetup(meetup, user.id) });
  } catch (error) {
    return handleError(error);
  }
}
