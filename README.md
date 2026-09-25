# Leaf & Lit

## Overview

Leaf & Lit is a full-stack community platform for organizing local book gatherings and buying and selling second-hand books. Readers can discover in-person meetups, join or host them, list pre-loved books, message hosts and sellers, and save what they want to come back to.

The app is a local portfolio project. It is meant to run on your machine. Production deployment, payments, and cloud image storage are intentionally out of scope.

## Test account

After seeding the database, sign in at [http://localhost:3000/signin](http://localhost:3000/signin) with:

| Field | Value |
| --- | --- |
| Email | `alex@leaflit.nz` |
| Password | `LeafLit2026!` |

Alex Mercer is the main seeded reader and already has gatherings, listings, saved items, messages, and notifications. Every other seeded account uses the same password, for example `emma@leaflit.nz`.

## Features

- Register, sign in, sign out, and change your password with hashed credentials and an httpOnly session cookie
- Discover gatherings with search, genre, type, date, location, and available-spots filters
- Create, edit, publish, join, leave, and cancel gatherings, with capacity and duplicate-join checks
- Browse the marketplace by title, author, ISBN, genre, condition, price, and location
- Create, edit, delete, and mark book listings as sold
- Save and unsave gatherings and books
- Message hosts and sellers, with conversation history stored in PostgreSQL
- Notifications for joins, messages, saves, and gathering updates
- Profile, public reader profiles, and settings

## Tech Stack

- Next.js
- React
- TypeScript
- Tailwind CSS
- PostgreSQL
- Prisma

## Screenshots

Capture these after the app is running and place the files in `docs/screenshots/`:

- `docs/screenshots/home.png` — home page
- `docs/screenshots/gatherings.png` — discover gatherings
- `docs/screenshots/marketplace.png` — marketplace
- `docs/screenshots/messages.png` — messages

## Database Design

The schema is relational and enforced with foreign keys.

- **User** owns gatherings, listings, messages, saves, and notifications.
- **Meetup** is hosted by one user and has many **MeetupAttendee** rows. A user can join a gathering only once.
- **BookListing** belongs to a seller and moves through draft, active, and sold.
- **SavedMeetup** and **SavedBook** store bookmarks with a unique pair of user and item.
- **Conversation** optionally points at a gathering or a listing. **ConversationParticipant** and **Message** store who is in the thread and what was said.
- **Notification** is created when someone joins, messages, saves, or updates a gathering.
- **PasswordResetToken** stores a short-lived local reset token. The demo does not send email.

## Getting Started

You need Node.js 22.16 or newer and npm. Prisma's Windows engine crashes on Node.js 22.11, so use a current 22.x release. PostgreSQL does not have to be installed separately. `npm run db:start` downloads and runs a local PostgreSQL server for this project.

1. Clone the repository

```bash
git clone <your-repository-url>
cd leaf-lit
```

2. Install dependencies

```bash
npm install
```

3. Create the environment file

```bash
cp .env.example .env
```

On Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

4. Start the local PostgreSQL database (leave this terminal open)

```bash
npm run db:start
```

This creates a data directory at `%LOCALAPPDATA%\leaflit-pgdata` and a database named `leaflit` on `localhost:5432`. The data directory sits outside the project so PostgreSQL is not affected by non-ASCII folder names. The default connection string in `.env.example` matches that server. If you already run PostgreSQL, create a database named `leaflit` and put your own `DATABASE_URL` in `.env` instead.

5. Run Prisma migrations

```bash
npx prisma migrate dev --name init
```

6. Seed the database

```bash
npm run db:seed
```

7. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Sign in with the [test account](#test-account): `alex@leaflit.nz` / `LeafLit2026!`.

## Project Structure

- `src/app` — pages and REST route handlers
- `src/components` — navigation, cards, and shared UI
- `src/features` — gathering and listing forms
- `src/lib` — Prisma client, auth, validation, and serializers
- `src/types` — shared TypeScript types
- `prisma` — schema, migrations, and seed data
- `public/images` — local placeholder images
- `scripts` — local PostgreSQL launcher

## Future Improvements

These are intentionally outside the current local portfolio scope:

- Real-time messaging
- Map integration
- Email notifications
- Online payments
- Cloud image storage
- Production deployment
