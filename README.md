# Leaf & Lit

Leaf & Lit is a local full-stack app for in-person book gatherings and second-hand books. A reader can browse gatherings, join or host one, list a book, buy a listing, and follow that parcel after checkout.

It runs on your machine. Payments are recorded locally and are not sent to a bank or a payment provider. Card numbers are not stored; only the last four digits are kept. Images are files in the repository, not a cloud upload.

## Try it

After the steps in [Getting Started](#getting-started), open [http://localhost:3000](http://localhost:3000) and sign in:

| Field | Value |
| --- | --- |
| Email | `alex@leaflit.nz` |
| Password | `LeafLit2026!` |

Useful paths once signed in:

- `/marketplace` — buy an active listing with the saved Visa or PayPal method
- `/orders` — My Purchases, with carrier, current location, and a collapsible tracking timeline
- `/settings` — delivery address, phone, and payment methods
- `/gatherings` — search and join a gathering
- `/messages` — existing conversation with a host

Alex already has gatherings, listings, messages, notifications, a delivery address, two payment methods, and ten purchases at different stages of delivery. Other seeded accounts use the same password, for example `emma@leaflit.nz`.

## Features

- Email and password accounts, with bcrypt hashes and an httpOnly session cookie
- Gatherings: search and filters, create, edit, publish, join, leave, and cancel, with capacity checks
- Marketplace: search by title, author, ISBN, genre, condition, price, and location; create, edit, and delete listings
- Checkout: a listing can be bought once, with the buyer's saved address and payment method
- Settings: delivery address, phone, and payment methods (credit card, debit card, PayPal, Apple Pay, Google Pay, Stripe)
- My Purchases: each order folds open to show the carrier, tracking number, current place, and timeline
- Messages between readers, hosts, and sellers
- Notifications for joins, messages, saves, gathering changes, and sales. Delivery updates stay on My Purchases
- Profile pages and password change

## Tech stack

- TypeScript, React, and Next.js App Router
- REST route handlers for auth, gatherings, books, orders, and settings
- Zod for request validation
- PostgreSQL and Prisma, including migrations and seed data
- Tailwind CSS

## Database

Foreign keys enforce the relationships.

- **User** hosts gatherings, sells books, and stores a phone number plus a delivery address.
- **Meetup** has one host and many **MeetupAttendee** rows. A user can join a gathering only once.
- **BookListing** belongs to a seller and is `draft`, `active`, or `sold`.
- **PaymentMethod** belongs to a user. One method can be the default.
- **Order** is one purchase of one listing. It snapshots the price, payment label, address, carrier, and tracking number.
- **SavedMeetup** and **SavedBook** bookmark an item once per user.
- **Conversation**, **ConversationParticipant**, and **Message** store threads about a gathering or a listing.
- **Notification** records joins, messages, saves, gathering changes, and sales.
- **PasswordResetToken** is a short-lived local token. The demo does not send email.

## Getting started

You need Node.js 22.16 or newer and npm. Prisma on Windows crashes under Node.js 22.11. PostgreSQL does not have to be installed separately.

1. Clone the repository and install dependencies

```bash
git clone <your-repository-url>
cd leaf-lit
npm install
```

2. Create `.env` from the example

```bash
cp .env.example .env
```

On Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

3. Start the local database and leave that terminal open

```bash
npm run db:start
```

This creates `%LOCALAPPDATA%\leaflit-pgdata` and a database named `leaflit` on `localhost:5432`. The data directory is outside the project so a non-ASCII project path does not break PostgreSQL. If you already run PostgreSQL, create a database named `leaflit` and set `DATABASE_URL` in `.env`.

4. Apply migrations, generate the client, and seed

```bash
npx prisma migrate deploy
npx prisma generate
npm run db:seed
```

5. Start the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and sign in as `alex@leaflit.nz` / `LeafLit2026!`.

## Project structure

- `src/app` — pages and REST route handlers
- `src/components` — navigation, cards, and shared UI
- `src/features` — gathering, listing, and settings forms
- `src/lib` — Prisma client, auth, validation, orders, and serializers
- `prisma` — schema, migrations, and seed data
- `public/images` — local photographs used by the interface
- `scripts` — local PostgreSQL launcher

## Not in this demo

- A live payment provider, or charging a real card
- Email delivery
- WebSocket chat
- Maps
- Cloud image upload
- Production hosting
