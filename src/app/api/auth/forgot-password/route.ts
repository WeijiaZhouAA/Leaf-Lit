import { randomBytes } from "crypto";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { handleError } from "@/lib/errors";
import { forgotSchema } from "@/lib/validators";

export async function POST(request: Request) {
  try {
    const input = forgotSchema.parse(await request.json());
    const user = await prisma.user.findUnique({ where: { email: input.email.toLowerCase() } });
    if (user) {
      const token = randomBytes(24).toString("hex");
      await prisma.passwordResetToken.create({
        data: {
          email: user.email,
          token,
          expiresAt: new Date(Date.now() + 1000 * 60 * 60),
        },
      });
    }
    return NextResponse.json({
      message: "If an account exists for that email, a reset link is ready. This local demo does not send email.",
    });
  } catch (error) {
    return handleError(error);
  }
}
