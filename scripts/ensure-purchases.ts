import { PrismaClient } from "@prisma/client";
import { assignShipment } from "../src/lib/commerce";

const prisma = new PrismaClient();

const purchases = [
  { title: "Circe", author: "Madeline Miller", seller: "emma@leaflit.nz", price: 13, genre: "Fiction", location: "Auckland Central", isbn: "9780316556347", image: "/images/books/fiction.jpg", ago: 40 },
  { title: "The Night Circus", author: "Erin Morgenstern", seller: "sarah@leaflit.nz", price: 11, genre: "Fantasy", location: "Ponsonby", isbn: "9780307744432", image: "/images/books/fantasy.jpg", ago: 90 },
  { title: "Braiding Sweetgrass", author: "Robin Wall Kimmerer", seller: "david@leaflit.nz", price: 17, genre: "Non-Fiction", location: "Newmarket", isbn: "9781571313560", image: "/images/books/history.jpg", ago: 160 },
  { title: "Mexican Gothic", author: "Silvia Moreno-Garcia", seller: "lena@leaflit.nz", price: 10, genre: "Mystery", location: "Mount Eden", isbn: "9780525620785", image: "/images/books/mystery.jpg", ago: 220 },
  { title: "The Song of Achilles", author: "Madeline Miller", seller: "sophie@leaflit.nz", price: 12, genre: "Classics", location: "Auckland Central", isbn: "9780062060624", image: "/images/books/classic.jpg", ago: 400 },
  { title: "Demon Copperhead", author: "Barbara Kingsolver", seller: "james@leaflit.nz", price: 14, genre: "Fiction", location: "Grey Lynn", isbn: "9780063251922", image: "/images/books/fiction.jpg", ago: 900 },
  { title: "The Seven Husbands of Evelyn Hugo", author: "Taylor Jenkins Reid", seller: "mia@leaflit.nz", price: 9, genre: "Fiction", location: "Mount Eden", isbn: "9781501161933", image: "/images/books/fiction.jpg", ago: 1800 },
  { title: "A Gentleman in Moscow", author: "Amor Towles", seller: "rachel@leaflit.nz", price: 15, genre: "Fiction", location: "Grey Lynn", isbn: "9780670026197", image: "/images/books/classic.jpg", ago: 3600 },
];

async function main() {
  const alex = await prisma.user.findUnique({ where: { email: "alex@leaflit.nz" } });
  if (!alex) throw new Error("Alex is not seeded.");
  for (const purchase of purchases) {
    const seller = await prisma.user.findUnique({ where: { email: purchase.seller } });
    if (!seller) continue;
    let book = await prisma.bookListing.findFirst({ where: { title: purchase.title, sellerId: seller.id } });
    if (!book) {
      book = await prisma.bookListing.create({
        data: {
          title: purchase.title,
          author: purchase.author,
          isbn: purchase.isbn,
          genre: purchase.genre,
          condition: "Very Good",
          price: purchase.price,
          description: "Already sold to Alex.",
          sellerNotes: "",
          pickupLocation: purchase.location,
          image: purchase.image,
          status: "sold",
          sellerId: seller.id,
        },
      });
    } else if (book.status !== "sold") {
      book = await prisma.bookListing.update({ where: { id: book.id }, data: { status: "sold" } });
    }
    const existing = await prisma.order.findUnique({ where: { bookId: book.id } });
    if (existing) continue;
    const shipment = assignShipment(book.id);
    await prisma.order.create({
      data: {
        buyerId: alex.id,
        sellerId: seller.id,
        bookId: book.id,
        amount: purchase.price,
        paymentLabel: "Visa credit ···· 4242",
        carrier: shipment.carrier,
        trackingNumber: shipment.trackingNumber,
        shipToName: alex.name,
        shipToPhone: alex.phone || "021 555 0142",
        shipToLine: alex.addressLine || "18 Wellesley Street",
        shipToSuburb: alex.addressSuburb || "Auckland Central",
        shipToCity: alex.addressCity || "Auckland",
        shipToPostcode: alex.addressPostcode || "1010",
        origin: purchase.location,
        createdAt: new Date(Date.now() - purchase.ago * 1000),
      },
    });
  }
  const count = await prisma.order.count({ where: { buyerId: alex.id } });
  console.log(`Alex has ${count} purchases.`);
}

main().finally(() => prisma.$disconnect());
