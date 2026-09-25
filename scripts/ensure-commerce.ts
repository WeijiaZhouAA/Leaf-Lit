import { PrismaClient } from "@prisma/client";
import { assignShipment } from "../src/lib/commerce";

const prisma = new PrismaClient();

async function main() {
  const alex = await prisma.user.findUnique({ where: { email: "alex@leaflit.nz" } });
  if (!alex) return;
  if (!alex.addressLine) {
    await prisma.user.update({
      where: { id: alex.id },
      data: {
        phone: "021 555 0142",
        addressLine: "18 Wellesley Street",
        addressSuburb: "Auckland Central",
        addressCity: "Auckland",
        addressPostcode: "1010",
      },
    });
  }
  const methods = await prisma.paymentMethod.count({ where: { userId: alex.id } });
  if (methods === 0) {
    await prisma.paymentMethod.createMany({
      data: [
        { userId: alex.id, type: "credit_card", label: "Visa credit ···· 4242", last4: "4242", expiry: "12/28", holderName: "Alex Mercer", isDefault: true },
        { userId: alex.id, type: "paypal", label: "PayPal · alex@leaflit.nz", email: "alex@leaflit.nz" },
      ],
    });
  }
  const book = await prisma.bookListing.findFirst({ where: { title: "Atomic Habits", status: "sold" } });
  if (book) {
    const existing = await prisma.order.findUnique({ where: { bookId: book.id } });
    if (!existing) {
      const shipment = assignShipment(book.id);
      await prisma.order.create({
        data: {
          buyerId: alex.id,
          sellerId: book.sellerId,
          bookId: book.id,
          amount: book.price,
          paymentLabel: "Visa credit ···· 4242",
          carrier: shipment.carrier,
          trackingNumber: shipment.trackingNumber,
          shipToName: alex.name,
          shipToPhone: "021 555 0142",
          shipToLine: "18 Wellesley Street",
          shipToSuburb: "Auckland Central",
          shipToCity: "Auckland",
          shipToPostcode: "1010",
          origin: book.pickupLocation,
          createdAt: new Date(Date.now() - 100 * 1000),
        },
      });
    }
  }
  console.log("Commerce demo data ready for alex@leaflit.nz");
}

main().finally(() => prisma.$disconnect());
