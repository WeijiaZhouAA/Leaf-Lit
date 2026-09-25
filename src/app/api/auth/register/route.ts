import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSession, hashPassword } from "@/lib/auth";
import { handleError, HttpError } from "@/lib/errors";
import { registerSchema } from "@/lib/validators";

export async function POST(request: Request) {
  try {
    const input = registerSchema.parse(await request.json());
    const existing = await prisma.user.findUnique({ where: { email: input.email.toLowerCase() } });
    if (existing) throw new HttpError(409, "An account with that email already exists.");

    const user = await prisma.user.create({
      data: {
        name: input.name,
        email: input.email.toLowerCase(),
        passwordHash: await hashPassword(input.password),
        location: input.location,
        favouriteGenres: input.favouriteGenres,
        avatar: "/images/avatars/default.jpg",
        bio: "",
      },
    });

    await createSession(user.id);
    return NextResponse.json({ id: user.id, name: user.name, email: user.email }, { status: 201 });
  } catch (error) {
    return handleError(error);
  }
}
