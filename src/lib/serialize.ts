import type { BookListing, Meetup, MeetupAttendee, User } from "@prisma/client";
import { avatarFallback, formatLongDate, formatMoney, formatShortDate, formatTimeRange, memberSince, relativeTime } from "@/lib/format";

type MeetupWithRelations = Meetup & {
  host: User;
  attendees: (MeetupAttendee & { user: User })[];
  savedBy?: { userId: string }[];
  _count?: { savedBy: number };
};

type BookWithSeller = BookListing & {
  seller: User;
  savedBy?: { userId: string }[];
  _count?: { savedBy: number };
};

export function userStats(user: User & { _count?: { hostedMeetups: number; attendances: number; listings: number } }, booksSold = 0) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    avatar: user.avatar || avatarFallback(user.name),
    bio: user.bio ?? "",
    location: user.location ?? "",
    favouriteGenres: user.favouriteGenres,
    memberSince: memberSince(user.createdAt),
    gatheringsHosted: user._count?.hostedMeetups ?? 0,
    gatheringsJoined: user._count?.attendances ?? 0,
    booksSold,
  };
}

export function serializeMeetup(meetup: MeetupWithRelations, viewerId?: string | null) {
  const spots = meetup.attendees.length;
  return {
    id: meetup.id,
    title: meetup.title,
    book: {
      title: meetup.bookTitle,
      author: meetup.bookAuthor,
      cover: meetup.bookCover || "/images/books/default.jpg",
    },
    date: formatLongDate(meetup.date),
    dateValue: meetup.date.toISOString().slice(0, 10),
    time: formatTimeRange(meetup.startTime, meetup.endTime),
    startTime: meetup.startTime,
    endTime: meetup.endTime,
    location: meetup.location,
    suburb: meetup.suburb,
    host: {
      id: meetup.host.id,
      name: meetup.host.name,
      avatar: meetup.host.avatar || avatarFallback(meetup.host.name),
      bio: meetup.host.bio ?? "",
    },
    attendees: spots,
    maxAttendees: meetup.maximumAttendees,
    category: meetup.genre,
    type: meetup.meetupType,
    image: meetup.coverImage || "/images/covers/default.jpg",
    joined: viewerId ? meetup.attendees.some((item) => item.userId === viewerId) : false,
    saved: viewerId ? (meetup.savedBy ?? []).some((item) => item.userId === viewerId) : false,
    status: meetup.status,
    isHost: viewerId === meetup.hostId,
    description: meetup.description,
    topics: meetup.discussionTopics,
    rules: meetup.rules,
    attendeeAvatars: meetup.attendees.map((item) => ({
      id: item.user.id,
      name: item.user.name,
      avatar: item.user.avatar || avatarFallback(item.user.name),
    })),
    createdAt: meetup.createdAt.toISOString(),
  };
}

export function serializeBook(book: BookWithSeller, viewerId?: string | null, soldCount = 0) {
  const price = Number(book.price);
  return {
    id: book.id,
    title: book.title,
    author: book.author,
    isbn: book.isbn ?? "",
    price,
    priceLabel: formatMoney(price),
    condition: book.condition,
    genre: book.genre,
    cover: book.image || "/images/books/default.jpg",
    seller: {
      id: book.seller.id,
      name: book.seller.name,
      avatar: book.seller.avatar || avatarFallback(book.seller.name),
      soldCount,
      memberSince: memberSince(book.seller.createdAt),
      location: book.seller.location ?? "",
    },
    location: book.pickupLocation,
    saved: viewerId ? (book.savedBy ?? []).some((item) => item.userId === viewerId) : false,
    listedDate: relativeTime(book.createdAt),
    listedOn: formatShortDate(book.createdAt),
    description: book.description,
    sellerNotes: book.sellerNotes,
    status: book.status,
    isOwner: viewerId === book.sellerId,
    savedBy: book._count?.savedBy ?? book.savedBy?.length ?? 0,
    createdAt: book.createdAt.toISOString(),
  };
}

export const meetupInclude = {
  host: true,
  attendees: { include: { user: true }, orderBy: { createdAt: "asc" as const } },
  savedBy: { select: { userId: true } },
};

export const bookInclude = {
  seller: true,
  savedBy: { select: { userId: true } },
  _count: { select: { savedBy: true } },
};
