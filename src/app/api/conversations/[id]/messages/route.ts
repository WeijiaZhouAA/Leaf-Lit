import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { handleError, HttpError } from "@/lib/errors";
import { avatarFallback, clockTime } from "@/lib/format";
import { notify } from "@/lib/notify";
import { messageSchema } from "@/lib/validators";

async function accessible(id: string, userId: string) {
  const conversation = await prisma.conversation.findFirst({
    where: { id, participants: { some: { userId } } },
    include: {
      participants: { include: { user: true } },
      meetup: true,
      book: true,
    },
  });
  if (!conversation) throw new HttpError(404, "We couldn't find that conversation.");
  return conversation;
}

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const user = await requireUser();
    const conversation = await accessible(id, user.id);
    const messages = await prisma.message.findMany({
      where: { conversationId: id },
      orderBy: { createdAt: "asc" },
    });
    await prisma.conversationParticipant.updateMany({
      where: { conversationId: id, userId: user.id },
      data: { lastReadAt: new Date() },
    });
    const other = conversation.participants.find((item) => item.userId !== user.id)?.user;
    return NextResponse.json({
      conversation: {
        id: conversation.id,
        contact: {
          id: other?.id ?? "",
          name: other?.name ?? "Reader",
          avatar: other?.avatar || avatarFallback(other?.name ?? "Reader"),
        },
        context: conversation.book
          ? { type: "book", title: conversation.book.title, id: conversation.book.id }
          : conversation.meetup
            ? { type: "gathering", title: conversation.meetup.title, id: conversation.meetup.id }
            : null,
      },
      messages: messages.map((message) => ({
        id: message.id,
        from: message.senderId === user.id ? "me" : "them",
        text: message.body,
        time: clockTime(message.createdAt),
      })),
    });
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const user = await requireUser();
    const conversation = await accessible(id, user.id);
    const input = messageSchema.parse(await request.json());
    const message = await prisma.message.create({
      data: { conversationId: id, senderId: user.id, body: input.body },
    });
    await prisma.conversation.update({ where: { id }, data: { updatedAt: new Date() } });
    const other = conversation.participants.find((item) => item.userId !== user.id);
    if (other) {
      await notify(other.userId, "message", `${user.name} sent you a message.`, `/messages?c=${id}`);
    }
    return NextResponse.json({
      message: { id: message.id, from: "me", text: message.body, time: clockTime(message.createdAt) },
    });
  } catch (error) {
    return handleError(error);
  }
}
