import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { handleError, HttpError } from "@/lib/errors";
import { avatarFallback, clockTime, relativeTime } from "@/lib/format";
import { notify } from "@/lib/notify";
import { conversationSchema } from "@/lib/validators";

export async function GET() {
  try {
    const user = await requireUser();
    const conversations = await prisma.conversation.findMany({
      where: { participants: { some: { userId: user.id } } },
      include: {
        participants: { include: { user: true } },
        messages: { orderBy: { createdAt: "desc" }, take: 1 },
        meetup: true,
        book: true,
      },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json({
      conversations: conversations.map((conversation) => {
        const mine = conversation.participants.find((item) => item.userId === user.id);
        const other = conversation.participants.find((item) => item.userId !== user.id)?.user;
        const latest = conversation.messages[0];
        const unread =
          latest && latest.senderId !== user.id && (!mine?.lastReadAt || latest.createdAt > mine.lastReadAt) ? 1 : 0;
        return {
          id: conversation.id,
          contact: {
            id: other?.id ?? "",
            name: other?.name ?? "Reader",
            avatar: other?.avatar || avatarFallback(other?.name ?? "Reader"),
          },
          lastMessage: latest?.body ?? "No messages yet",
          time: latest ? relativeTime(latest.createdAt) : "",
          unread,
          context: conversation.book
            ? { type: "book" as const, title: conversation.book.title, id: conversation.book.id }
            : conversation.meetup
              ? { type: "gathering" as const, title: conversation.meetup.title, id: conversation.meetup.id }
              : null,
        };
      }),
    });
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const input = conversationSchema.parse(await request.json());
    if (input.recipientId === user.id) throw new HttpError(400, "You cannot message yourself.");

    const recipient = await prisma.user.findUnique({ where: { id: input.recipientId } });
    if (!recipient) throw new HttpError(404, "We couldn't find that reader.");

    const existing = await prisma.conversation.findFirst({
      where: {
        meetupId: input.meetupId ?? null,
        bookId: input.bookId ?? null,
        AND: [
          { participants: { some: { userId: user.id } } },
          { participants: { some: { userId: recipient.id } } },
        ],
      },
    });

    const conversation =
      existing ??
      (await prisma.conversation.create({
        data: {
          meetupId: input.meetupId,
          bookId: input.bookId,
          participants: { create: [{ userId: user.id }, { userId: recipient.id }] },
        },
      }));

    await prisma.message.create({
      data: { conversationId: conversation.id, senderId: user.id, body: input.body },
    });
    await prisma.conversation.update({ where: { id: conversation.id }, data: { updatedAt: new Date() } });
    await prisma.conversationParticipant.updateMany({
      where: { conversationId: conversation.id, userId: user.id },
      data: { lastReadAt: new Date() },
    });

    const subject = input.bookId ? "a book listing" : "a gathering";
    await notify(recipient.id, "message", `${user.name} sent you a message about ${subject}.`, `/messages?c=${conversation.id}`);

    return NextResponse.json({ id: conversation.id }, { status: existing ? 200 : 201 });
  } catch (error) {
    return handleError(error);
  }
}
