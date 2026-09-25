import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { handleError } from "@/lib/errors";
import { prisma } from "@/lib/prisma";
import { shippingSchema } from "@/lib/validators";

function serializeShipping(user: { phone: string; addressLine: string; addressSuburb: string; addressCity: string; addressPostcode: string; name: string }) {
  return {
    name: user.name,
    phone: user.phone,
    line: user.addressLine,
    suburb: user.addressSuburb,
    city: user.addressCity,
    postcode: user.addressPostcode,
  };
}

export async function GET() {
  try {
    const session = await requireUser();
    const user = await prisma.user.findUniqueOrThrow({ where: { id: session.id } });
    return NextResponse.json({ shipping: serializeShipping(user) });
  } catch (error) {
    return handleError(error);
  }
}

export async function PUT(request: Request) {
  try {
    const session = await requireUser();
    const input = shippingSchema.parse(await request.json());
    const user = await prisma.user.update({
      where: { id: session.id },
      data: {
        phone: input.phone,
        addressLine: input.line,
        addressSuburb: input.suburb,
        addressCity: input.city,
        addressPostcode: input.postcode,
      },
    });
    return NextResponse.json({ shipping: serializeShipping(user) });
  } catch (error) {
    return handleError(error);
  }
}
