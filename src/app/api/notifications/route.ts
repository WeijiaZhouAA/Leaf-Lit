import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { handleError } from "@/lib/errors";
import { relativeTime } from "@/lib/format";

export async function GET() {
  try {
    const user = await requireUser();
    const notifications = await prisma.notification.findMany({
      where: { userId: user.id, type: { not: "purchase" } },
      orderBy: { createdAt: "desc" },
      take: 40,
    });
    return NextResponse.json({
      notifications: notifications.map((item) => ({
        id: item.id,
        type: item.type,
        text: item.text,
        time: relativeTime(item.createdAt),
        read: item.read,
        link: item.link,
      })),
    });
  } catch (error) {
    return handleError(error);
  }
}
