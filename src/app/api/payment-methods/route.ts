import { NextResponse } from "next/server";
import type { PaymentMethod } from "@prisma/client";
import { requireUser } from "@/lib/auth";
import { cardBrand, isCardType, paymentLabel, type PaymentType } from "@/lib/commerce";
import { handleError } from "@/lib/errors";
import { prisma } from "@/lib/prisma";
import { paymentMethodSchema } from "@/lib/validators";

function serializeMethod(method: PaymentMethod) {
  const detail = isCardType(method.type)
    ? `${method.holderName}${method.expiry ? ` · Expires ${method.expiry}` : ""}`
    : method.email;
  return {
    id: method.id,
    type: method.type,
    label: method.label,
    detail,
    isDefault: method.isDefault,
  };
}

export async function GET() {
  try {
    const session = await requireUser();
    const methods = await prisma.paymentMethod.findMany({
      where: { userId: session.id },
      orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }],
    });
    return NextResponse.json({ methods: methods.map(serializeMethod) });
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireUser();
    const input = paymentMethodSchema.parse(await request.json());
    const digits = input.cardNumber.replace(/\s/g, "");
    const last4 = isCardType(input.type) ? digits.slice(-4) : "";
    const brand = isCardType(input.type) ? cardBrand(digits) : "";
    const label = paymentLabel({
      type: input.type as PaymentType,
      brand,
      last4,
      email: input.email,
    });
    const existing = await prisma.paymentMethod.count({ where: { userId: session.id } });
    const makeDefault = input.isDefault || existing === 0;
    const method = await prisma.$transaction(async (tx) => {
      if (makeDefault) {
        await tx.paymentMethod.updateMany({ where: { userId: session.id }, data: { isDefault: false } });
      }
      return tx.paymentMethod.create({
        data: {
          userId: session.id,
          type: input.type,
          label,
          last4,
          expiry: isCardType(input.type) ? input.expiry : "",
          holderName: isCardType(input.type) ? input.holderName : "",
          email: isCardType(input.type) ? "" : input.email,
          isDefault: makeDefault,
        },
      });
    });
    return NextResponse.json({ method: serializeMethod(method) }, { status: 201 });
  } catch (error) {
    return handleError(error);
  }
}
