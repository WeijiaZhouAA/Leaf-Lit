import { z } from "zod";
import { isCardType, luhn, PAYMENT_TYPES } from "@/lib/commerce";

const password = z.string().min(8, "Password must be at least 8 characters.");
const email = z.string().trim().email("Please enter a valid email address.");

export const registerSchema = z
  .object({
    name: z.string().trim().min(2, "Please enter your name."),
    email,
    password,
    confirmPassword: z.string(),
    location: z.string().trim().min(2, "Please enter your location."),
    favouriteGenres: z.array(z.string()).default([]),
  })
  .refine((value) => value.password === value.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export const loginSchema = z.object({
  email,
  password: z.string().min(1, "Please enter your password."),
});

export const forgotSchema = z.object({ email });

export const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Please enter your current password."),
    newPassword: password,
    confirmPassword: z.string(),
  })
  .refine((value) => value.newPassword === value.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export const profileSchema = z.object({
  name: z.string().trim().min(2, "Please enter your name."),
  bio: z.string().trim().max(500, "Bio must be 500 characters or fewer."),
  location: z.string().trim().min(2, "Please enter your location."),
  favouriteGenres: z.array(z.string()).default([]),
  avatar: z.string().optional(),
});

const lines = z.string().transform((value) =>
  value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean),
);

export const meetupSchema = z.object({
  title: z.string().trim().min(1, "Please enter a meetup title."),
  bookTitle: z.string().trim().min(1, "Please enter a book title."),
  author: z.string().trim().default(""),
  description: z.string().trim().default(""),
  genre: z.string().trim().min(1, "Please choose a genre."),
  date: z.string().min(1, "Please choose a date."),
  startTime: z.string().min(1, "Please enter a start time."),
  endTime: z.string().default(""),
  location: z.string().trim().min(1, "Please enter a location."),
  suburb: z.string().trim().default(""),
  maxAttendees: z.coerce
    .number()
    .int("Please enter a whole number of attendees.")
    .min(2, "A gathering needs at least 2 attendees.")
    .max(100, "Maximum attendees cannot be more than 100."),
  type: z.string().trim().min(1, "Please choose a gathering type."),
  topics: lines,
  rules: lines,
  coverImage: z.string().default(""),
  bookCover: z.string().default(""),
  status: z.enum(["draft", "published"]).default("published"),
});

const isbnPattern = /^(?:\d{9}[\dXx]|\d{13}|(?:\d{3}-)?\d{1,5}-\d{1,7}-\d{1,7}-[\dXx])$/;

export const bookSchema = z.object({
  title: z.string().trim().min(1, "Please enter a book title."),
  author: z.string().trim().min(1, "Please enter the author."),
  isbn: z
    .string()
    .trim()
    .default("")
    .refine((value) => !value || isbnPattern.test(value.replace(/\s/g, "")), {
      message: "Please enter a valid ISBN.",
    }),
  genre: z.string().trim().min(1, "Please choose a genre."),
  condition: z.string().trim().min(1, "Please choose a condition."),
  price: z.coerce
    .number()
    .positive("Please enter a valid price.")
    .max(999, "Price looks too high for a second-hand book."),
  description: z.string().trim().default(""),
  sellerNotes: z.string().trim().default(""),
  location: z.string().trim().min(1, "Please enter a pickup location."),
  image: z.string().default(""),
  status: z.enum(["draft", "active"]).default("active"),
});

export const messageSchema = z.object({
  body: z.string().trim().min(1, "Please enter a message.").max(2000),
});

export const conversationSchema = z.object({
  recipientId: z.string().min(1),
  meetupId: z.string().optional(),
  bookId: z.string().optional(),
  body: z.string().trim().min(1, "Please enter a message.").max(2000),
});

export const statusSchema = z.object({
  status: z.enum(["active", "sold", "draft"]),
});

export const shippingSchema = z.object({
  phone: z.string().trim().regex(/^(?:\+64|0)[0-9\s()-]{7,16}$/, "Enter a New Zealand phone number."),
  line: z.string().trim().min(5, "Please enter a street address."),
  suburb: z.string().trim().min(2, "Please enter a suburb."),
  city: z.string().trim().min(2, "Please enter a city."),
  postcode: z.string().trim().regex(/^\d{4}$/, "Enter a 4-digit postcode."),
});

const paymentTypes = PAYMENT_TYPES.map((item) => item.id) as [string, ...string[]];

export const paymentMethodSchema = z
  .object({
    type: z.enum(paymentTypes),
    holderName: z.string().trim().default(""),
    cardNumber: z.string().trim().default(""),
    expiry: z.string().trim().default(""),
    email: z.string().trim().default(""),
    isDefault: z.boolean().default(false),
  })
  .superRefine((value, ctx) => {
    if (isCardType(value.type)) {
      const digits = value.cardNumber.replace(/\s/g, "");
      if (!/^\d{13,19}$/.test(digits) || !luhn(digits)) {
        ctx.addIssue({ code: "custom", message: "Please enter a valid card number.", path: ["cardNumber"] });
      }
      if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(value.expiry)) {
        ctx.addIssue({ code: "custom", message: "Enter an expiry date as MM/YY.", path: ["expiry"] });
      } else {
        const [month, year] = value.expiry.split("/");
        const expires = new Date(2000 + Number(year), Number(month), 1);
        if (expires <= new Date()) {
          ctx.addIssue({ code: "custom", message: "This card has expired.", path: ["expiry"] });
        }
      }
      if (value.holderName.length < 2) {
        ctx.addIssue({ code: "custom", message: "Please enter the name on the card.", path: ["holderName"] });
      }
      return;
    }
    if (!z.string().email().safeParse(value.email).success) {
      ctx.addIssue({ code: "custom", message: "Please enter the account email.", path: ["email"] });
    }
  });

export const purchaseSchema = z.object({
  paymentMethodId: z.string().min(1, "Please choose a payment method."),
});
