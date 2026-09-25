import type { BookListing, Order, User } from "@prisma/client";
import { describeDelivery, statusLabel } from "@/lib/commerce";
import { formatMoney } from "@/lib/format";

type OrderWithBook = Order & { book: BookListing; seller: User };

export function serializeOrder(order: OrderWithBook, detailed = false) {
  const delivery = describeDelivery({ ...order, sellerName: order.seller.name });
  const summary = {
    id: order.id,
    title: order.book.title,
    author: order.book.author,
    cover: order.book.image || "/images/books/default.jpg",
    amount: formatMoney(Number(order.amount)),
    status: delivery.status,
    statusLabel: statusLabel(delivery.status),
    carrier: delivery.carrier,
    place: delivery.currentPlace,
    createdAt: order.createdAt.toISOString(),
  };
  if (!detailed) return summary;
  return {
    ...summary,
    trackingNumber: delivery.trackingNumber,
    paymentLabel: order.paymentLabel,
    address: delivery.address,
    phone: order.shipToPhone,
    currentTitle: delivery.currentTitle,
    events: delivery.events,
  };
}
