import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { handleError, HttpError } from "@/lib/errors";
import { notify } from "@/lib/notify";

export async function POST(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const user = await requireUser();
    const meetup = await prisma.meetup.findUnique({ where: { id } });
    if (!meetup) throw new HttpError(404, "We couldn't find that gathering.");
    await prisma.savedMeetup.upsert({
      where: { userId_meetupId: { userId: user.id, meetupId: id } },
      update: {},
      create: { userId: user.id, meetupId: id },
    });
    if (meetup.hostId !== user.id) {
      await notify(meetup.hostId, "save", `${user.name} saved your gathering "${meetup.title}".`, `/gatherings/${id}`);
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
    await prisma.savedMeetup.deleteMany({ where: { userId: user.id, meetupId: id } });
    return NextResponse.json({ saved: false });
  } catch (error) {
    return handleError(error);
  }
}
