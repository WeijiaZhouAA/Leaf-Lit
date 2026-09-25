export type PublicUser = {
  id: string;
  name: string;
  email?: string;
  avatar: string;
  bio: string;
  location: string;
  favouriteGenres: string[];
  memberSince: string;
  gatheringsHosted: number;
  gatheringsJoined: number;
  booksSold: number;
};

export type MeetupCardData = {
  id: string;
  title: string;
  book: { title: string; author: string; cover: string };
  date: string;
  dateValue: string;
  time: string;
  startTime: string;
  endTime: string;
  location: string;
  suburb: string;
  host: { id: string; name: string; avatar: string; bio: string };
  attendees: number;
  maxAttendees: number;
  category: string;
  type: string;
  image: string;
  joined: boolean;
  saved: boolean;
  status: string;
  isHost: boolean;
  description: string;
  topics: string[];
  rules: string[];
  attendeeAvatars: { id: string; name: string; avatar: string }[];
  createdAt: string;
};

export type BookCardData = {
  id: string;
  title: string;
  author: string;
  isbn: string;
  price: number;
  condition: string;
  genre: string;
  cover: string;
  seller: {
    id: string;
    name: string;
    avatar: string;
    soldCount: number;
    memberSince: string;
    location: string;
  };
  location: string;
  saved: boolean;
  listedDate: string;
  description: string;
  sellerNotes: string;
  status: string;
  isOwner: boolean;
  savedBy: number;
  createdAt: string;
  orderId?: string | null;
};

export type ShippingAddress = {
  phone: string;
  line: string;
  suburb: string;
  city: string;
  postcode: string;
};

export type PaymentMethodItem = {
  id: string;
  type: string;
  label: string;
  detail: string;
  isDefault: boolean;
};

export type TrackingEvent = {
  title: string;
  detail: string;
  place: string;
  time: string;
  done: boolean;
  current: boolean;
};

export type OrderSummary = {
  id: string;
  title: string;
  author: string;
  cover: string;
  amount: string;
  status: string;
  statusLabel: string;
  carrier: string;
  place: string;
  createdAt: string;
};

export type OrderDetail = OrderSummary & {
  trackingNumber: string;
  paymentLabel: string;
  address: string;
  phone: string;
  events: TrackingEvent[];
};

export type ConversationSummary = {
  id: string;
  contact: { id: string; name: string; avatar: string };
  lastMessage: string;
  time: string;
  unread: number;
  context: { type: "book" | "gathering"; title: string; id: string } | null;
};

export type ChatMessage = {
  id: string;
  from: "me" | "them";
  text: string;
  time: string;
};

export type NotificationItem = {
  id: string;
  type: string;
  text: string;
  time: string;
  read: boolean;
  link: string | null;
};

export type MeetupFormData = {
  title: string;
  bookTitle: string;
  author: string;
  description: string;
  genre: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  suburb: string;
  maxAttendees: string;
  type: string;
  topics: string;
  rules: string;
  coverImage: string;
  bookCover: string;
  status?: "draft" | "published";
};

export type BookFormData = {
  title: string;
  author: string;
  isbn: string;
  genre: string;
  condition: string;
  price: string;
  description: string;
  sellerNotes: string;
  location: string;
  image: string;
  status?: "draft" | "active";
};
