import { prisma } from "@/lib/prisma";

export async function notify(userId: string, type: string, text: string, link?: string) {
  return prisma.notification.create({
    data: { userId, type, text, link },
  });
}
