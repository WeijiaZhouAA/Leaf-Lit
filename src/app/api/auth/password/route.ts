import { NextResponse } from "next/server";
import { hashPassword, requireUser, verifyPassword } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { handleError, HttpError } from "@/lib/errors";
import { passwordSchema } from "@/lib/validators";

export async function PUT(request: Request) {
  try {
    const user = await requireUser();
    const input = passwordSchema.parse(await request.json());
    if (!(await verifyPassword(input.currentPassword, user.passwordHash))) {
      throw new HttpError(400, "Your current password is incorrect.");
    }
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: await hashPassword(input.newPassword) },
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleError(error);
  }
}
