import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { assignShipment } from "../src/lib/commerce";

const prisma = new PrismaClient();

const users = [
  { key: "alex", name: "Alex Mercer", email: "alex@leaflit.nz", location: "Auckland, New Zealand", bio: "Avid reader and coffee lover. Passionate about literary fiction and sci-fi.", genres: ["Fiction", "Sci-Fi", "Classics", "Mystery"], avatar: "/images/avatars/alex.jpg", joined: "2024-03-12" },
  { key: "emma", name: "Emma Wilson", email: "emma@leaflit.nz", location: "Auckland Central, New Zealand", bio: "Book club organiser and English literature enthusiast. Running community read-alongs since 2022.", genres: ["Classics", "Fiction"], avatar: "/images/avatars/emma.jpg", joined: "2022-06-01" },
  { key: "james", name: "James Park", email: "james@leaflit.nz", location: "Grey Lynn, New Zealand", bio: "Sci-fi collector and podcast host. Dune is my favourite novel of all time.", genres: ["Sci-Fi", "Fantasy"], avatar: "/images/avatars/james.jpg", joined: "2023-01-18" },
  { key: "sarah", name: "Sarah Nguyen", email: "sarah@leaflit.nz", location: "Ponsonby, New Zealand", bio: "Crime fiction addict and brunch enthusiast.", genres: ["Mystery", "Fiction"], avatar: "/images/avatars/sarah.jpg", joined: "2023-09-04" },
  { key: "lena", name: "Lena Foster", email: "lena@leaflit.nz", location: "Mount Eden, New Zealand", bio: "Community organiser and bookshelf reducer.", genres: ["Fantasy", "Romance"], avatar: "/images/avatars/lena.jpg", joined: "2022-10-20" },
  { key: "david", name: "David Kim", email: "david@leaflit.nz", location: "Newmarket, New Zealand", bio: "History teacher and non-fiction evangelist.", genres: ["History", "Biography"], avatar: "/images/avatars/david.jpg", joined: "2024-02-11" },
  { key: "mia", name: "Mia Torres", email: "mia@leaflit.nz", location: "Mount Eden, New Zealand", bio: "Fantasy and sci-fi reader. Rothfuss superfan.", genres: ["Fantasy", "Sci-Fi"], avatar: "/images/avatars/mia.jpg", joined: "2024-05-02" },
  { key: "sophie", name: "Sophie Chen", email: "sophie@leaflit.nz", location: "Auckland Central, New Zealand", bio: "Sells the books she cannot stop recommending.", genres: ["Fiction", "Biography"], avatar: "/images/avatars/sophie.jpg", joined: "2024-01-09" },
  { key: "mark", name: "Mark Johnson", email: "mark@leaflit.nz", location: "Ponsonby, New Zealand", bio: "Memoir reader and weekend walker.", genres: ["Biography", "Self-Development"], avatar: "/images/avatars/mark.jpg", joined: "2024-06-15" },
  { key: "rachel", name: "Rachel Lee", email: "rachel@leaflit.nz", location: "Grey Lynn, New Zealand", bio: "Quiet reader of contemporary fiction.", genres: ["Fiction", "Classics"], avatar: "/images/avatars/rachel.jpg", joined: "2023-09-22" },
];

async function main() {
  const password = await bcrypt.hash("LeafLit2026!", 12);
  await prisma.order.deleteMany();
  await prisma.paymentMethod.deleteMany();
  await prisma.message.deleteMany();
  await prisma.conversationParticipant.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.savedBook.deleteMany();
  await prisma.savedMeetup.deleteMany();
  await prisma.meetupAttendee.deleteMany();
  await prisma.bookListing.deleteMany();
  await prisma.meetup.deleteMany();
  await prisma.passwordResetToken.deleteMany();
  await prisma.user.deleteMany();

  const created = new Map<string, { id: string; name: string }>();
  for (const user of users) {
    const row = await prisma.user.create({
      data: {
        name: user.name,
        email: user.email,
        passwordHash: password,
        avatar: user.avatar,
        bio: user.bio,
        location: user.location,
        favouriteGenres: user.genres,
        phone: user.key === "alex" ? "021 555 0142" : "",
        addressLine: user.key === "alex" ? "18 Wellesley Street" : "",
        addressSuburb: user.key === "alex" ? "Auckland Central" : "",
        addressCity: user.key === "alex" ? "Auckland" : "",
        addressPostcode: user.key === "alex" ? "1010" : "",
        createdAt: new Date(user.joined),
      },
    });
    created.set(user.key, row);
  }

  const id = (key: string) => created.get(key)!.id;

  const meetups = [
    { host: "emma", title: "Coffee & Classics", bookTitle: "Pride and Prejudice", bookAuthor: "Jane Austen", genre: "Classics", type: "Book Discussion", date: "2026-10-10", start: "14:00", end: "16:00", location: "Albert Park Cafe, Auckland", suburb: "Auckland Central", max: 12, cover: "/images/covers/cafe.jpg", book: "/images/books/classic.jpg", description: "Join us for a relaxed afternoon discussing Pride and Prejudice over coffee. New readers and long-time Austen fans are equally welcome.", topics: ["Character motivations and growth", "Social class in Regency England", "Elizabeth's journey to self-awareness"], rules: ["Be respectful of all opinions", "No major spoilers until everyone confirms they've finished", "Latecomers welcome"], attendees: ["sarah", "lena", "david", "mia", "sophie"] },
    { host: "james", title: "Sci-Fi Sunday Afternoons", bookTitle: "Dune", bookAuthor: "Frank Herbert", genre: "Sci-Fi", type: "Book Discussion", date: "2026-10-18", start: "15:00", end: "17:00", location: "Grey Lynn Library, Auckland", suburb: "Grey Lynn", max: 20, cover: "/images/covers/library.jpg", book: "/images/books/fantasy.jpg", description: "A deep dive into Frank Herbert's epic Dune. We'll discuss ecology, politics, and what makes this world unforgettable.", topics: ["The spice economy", "Paul's messianic arc", "Herbert's ecological vision"], rules: ["Spoilers for the original novel are fine", "Newcomers especially welcome"], attendees: ["alex", "mia", "david"] },
    { host: "sarah", title: "Mystery & Muffins", bookTitle: "The Thursday Murder Club", bookAuthor: "Richard Osman", genre: "Mystery", type: "Casual Reading", date: "2026-10-21", start: "10:00", end: "12:00", location: "Ponsonby Road Cafe, Auckland", suburb: "Ponsonby", max: 8, cover: "/images/covers/cafe.jpg", book: "/images/books/mystery.jpg", description: "A cosy morning gathering over coffee, muffins, and mystery.", topics: ["Who did it?", "Character humour", "Osman's plotting style"], rules: ["No spoilers until we all agree", "Bring something to eat if you like"], attendees: ["emma", "rachel"] },
    { host: "lena", title: "Book Swap Saturday", bookTitle: "Open Shelf", bookAuthor: "Various", genre: "Fiction", type: "Book Swap", date: "2026-10-24", start: "11:00", end: "13:00", location: "Mount Eden Community Space, Auckland", suburb: "Mount Eden", max: 40, cover: "/images/covers/park.jpg", book: "/images/books/fiction.jpg", description: "Bring up to 5 books you no longer need and swap them with other readers.", topics: ["Open swap", "Meet the community"], rules: ["Bring books in good condition", "All genres welcome"], attendees: ["alex", "sophie", "mark", "james"] },
    { host: "david", title: "Non-Fiction Fridays", bookTitle: "Sapiens", bookAuthor: "Yuval Noah Harari", genre: "History", type: "Book Discussion", date: "2026-10-30", start: "18:00", end: "20:00", location: "Newmarket Library, Auckland", suburb: "Newmarket", max: 15, cover: "/images/covers/library.jpg", book: "/images/books/history.jpg", description: "An evening of ideas. We'll explore Harari's history of humanity and what it means today.", topics: ["Cognitive revolution", "Human future"], rules: ["All opinions welcome", "Bring curiosity"], attendees: ["alex", "rachel", "mark"] },
    { host: "mia", title: "Fantasy Evenings", bookTitle: "The Name of the Wind", bookAuthor: "Patrick Rothfuss", genre: "Fantasy", type: "Book Discussion", date: "2026-11-05", start: "19:00", end: "21:00", location: "Mt Eden Brewery, Auckland", suburb: "Mount Eden", max: 16, cover: "/images/covers/evening.jpg", book: "/images/books/fantasy.jpg", description: "A night for fans of epic fantasy and Rothfuss's prose.", topics: ["Unreliable narrator", "The magic system"], rules: ["No Book 3 theories without warning"], attendees: ["james", "lena"] },
    { host: "alex", title: "Poetry & Pastries", bookTitle: "The Collected Poems of Mary Oliver", bookAuthor: "Mary Oliver", genre: "Poetry", type: "Casual Reading", date: "2026-11-07", start: "10:00", end: "12:00", location: "K Road Bakery, Auckland", suburb: "Auckland Central", max: 10, cover: "/images/covers/cafe.jpg", book: "/images/books/classic.jpg", description: "A gentle Saturday morning of poems and pastries.", topics: ["Attention and nature", "A favourite poem to share"], rules: ["Read aloud only if you want to"], attendees: ["emma", "sarah", "sophie"] },
    { host: "rachel", title: "Quiet Contemporary", bookTitle: "Klara and the Sun", bookAuthor: "Kazuo Ishiguro", genre: "Fiction", type: "Author Discussion", date: "2026-11-12", start: "18:30", end: "20:30", location: "Grey Lynn Community Hall", suburb: "Grey Lynn", max: 14, cover: "/images/covers/library.jpg", book: "/images/books/fiction.jpg", description: "A close reading of Ishiguro's gentle science fiction.", topics: ["Klara's point of view", "What we owe one another"], rules: ["Phones away during discussion"], attendees: ["alex"] },
    { host: "mark", title: "Memoir Morning", bookTitle: "Educated", bookAuthor: "Tara Westover", genre: "Biography", type: "Book Discussion", date: "2026-11-14", start: "09:30", end: "11:30", location: "Ponsonby Library", suburb: "Ponsonby", max: 12, cover: "/images/covers/library.jpg", book: "/images/books/bio.jpg", description: "A morning conversation about education, family, and leaving home.", topics: ["Memory and truth", "Education as escape"], rules: ["Be kind about personal stories"], attendees: ["david", "sophie"] },
    { host: "alex", title: "Summer Reading Social", bookTitle: "Beach Read", bookAuthor: "Emily Henry", genre: "Romance", type: "Themed Reading", date: "2026-09-12", start: "14:00", end: "16:00", location: "Mission Bay Beach, Auckland", suburb: "Auckland Central", max: 10, cover: "/images/covers/park.jpg", book: "/images/books/fiction.jpg", description: "A past beach gathering for romance readers.", topics: ["Writer protagonists"], rules: ["Bring a blanket"], attendees: ["lena", "mia", "sarah"] },
  ];

  const meetupIds = new Map<string, string>();
  for (const meetup of meetups) {
    const row = await prisma.meetup.create({
      data: {
        title: meetup.title,
        description: meetup.description,
        bookTitle: meetup.bookTitle,
        bookAuthor: meetup.bookAuthor,
        bookCover: meetup.book,
        genre: meetup.genre,
        meetupType: meetup.type,
        date: new Date(`${meetup.date}T00:00:00`),
        startTime: meetup.start,
        endTime: meetup.end,
        location: meetup.location,
        suburb: meetup.suburb,
        maximumAttendees: meetup.max,
        discussionTopics: meetup.topics,
        rules: meetup.rules,
        coverImage: meetup.cover,
        status: "published",
        hostId: id(meetup.host),
        attendees: { create: meetup.attendees.map((person) => ({ userId: id(person) })) },
      },
    });
    meetupIds.set(meetup.title, row.id);
  }

  await prisma.meetup.create({
    data: {
      title: "Draft: Tech Essays",
      description: "Still planning this one.",
      bookTitle: "The Soul of a New Machine",
      bookAuthor: "Tracy Kidder",
      genre: "Technology",
      meetupType: "Book Discussion",
      date: new Date("2026-12-01"),
      startTime: "18:00",
      endTime: "20:00",
      location: "Auckland Central Library",
      suburb: "Auckland Central",
      maximumAttendees: 12,
      discussionTopics: ["Engineering culture"],
      rules: ["TBC"],
      coverImage: "/images/covers/default.jpg",
      bookCover: "/images/books/history.jpg",
      status: "draft",
      hostId: id("alex"),
    },
  });

  const books = [
    { seller: "sophie", title: "The Midnight Library", author: "Matt Haig", price: 12, condition: "Very Good", genre: "Fiction", location: "Auckland Central", isbn: "9780525559474", image: "/images/books/fiction.jpg", description: "Read once and absolutely loved it. Happy to meet in the city.", notes: "No marks, spine in perfect condition.", status: "active" },
    { seller: "mark", title: "Educated", author: "Tara Westover", price: 15, condition: "Like New", genre: "Biography", location: "Ponsonby", isbn: "9780399590504", image: "/images/books/bio.jpg", description: "Barely touched. Bought two copies by accident.", notes: "Pristine. No writing inside.", status: "active" },
    { seller: "rachel", title: "Klara and the Sun", author: "Kazuo Ishiguro", price: 10, condition: "Good", genre: "Fiction", location: "Grey Lynn", isbn: "9780571364841", image: "/images/books/fiction.jpg", description: "Gentle read. Slight scuff on the back cover.", notes: "All pages clean.", status: "active" },
    { seller: "emma", title: "Lessons in Chemistry", author: "Bonnie Garmus", price: 14, condition: "Very Good", genre: "Fiction", location: "Newmarket", isbn: "9780385547348", image: "/images/books/fiction.jpg", description: "Brilliant and funny. I already own two copies.", notes: "Minor shelf wear on the spine.", status: "active" },
    { seller: "james", title: "Normal People", author: "Sally Rooney", price: 9, condition: "Good", genre: "Fiction", location: "Mount Eden", isbn: "9780571334650", image: "/images/books/fiction.jpg", description: "Well-read copy, still in great shape.", notes: "Pencil notes in the margins.", status: "active" },
    { seller: "lena", title: "The House in the Cerulean Sea", author: "TJ Klune", price: 13, condition: "Like New", genre: "Fantasy", location: "Mount Eden", isbn: "9781250217288", image: "/images/books/fantasy.jpg", description: "A cosy fantasy. It was a gift and I already own it.", notes: "Flawless.", status: "active" },
    { seller: "alex", title: "Piranesi", author: "Susanna Clarke", price: 11, condition: "Very Good", genre: "Fantasy", location: "Auckland Central", isbn: "9781635575637", image: "/images/books/fantasy.jpg", description: "Strange, beautiful, and carefully read.", notes: "No annotations.", status: "active" },
    { seller: "alex", title: "Fourth Wing", author: "Rebecca Yarros", price: 18, condition: "Like New", genre: "Fantasy", location: "Auckland Central", isbn: "9781649374042", image: "/images/books/fantasy.jpg", description: "Finished it in a weekend.", notes: "Looks unread.", status: "active" },
    { seller: "david", title: "Sapiens", author: "Yuval Noah Harari", price: 16, condition: "Good", genre: "History", location: "Newmarket", isbn: "9780062316097", image: "/images/books/history.jpg", description: "Highlighted a few passages in pencil.", notes: "Fully readable.", status: "active" },
    { seller: "mia", title: "The Name of the Wind", author: "Patrick Rothfuss", price: 12, condition: "Very Good", genre: "Fantasy", location: "Mount Eden", isbn: "9780756404741", image: "/images/books/fantasy.jpg", description: "My spare paperback.", notes: "Light spine crease.", status: "active" },
    { seller: "sarah", title: "The Thursday Murder Club", author: "Richard Osman", price: 8, condition: "Good", genre: "Mystery", location: "Ponsonby", isbn: "9780241425442", image: "/images/books/mystery.jpg", description: "Fun and lightly read.", notes: "Coffee ring on the back cover.", status: "active" },
    { seller: "sophie", title: "Atomic Habits", author: "James Clear", price: 14, condition: "Good", genre: "Self-Development", location: "Auckland Central", isbn: "9780735211292", image: "/images/books/history.jpg", description: "Useful and already passed along once.", notes: "A few sticky notes removed.", status: "sold" },
    { seller: "emma", title: "Pride and Prejudice", author: "Jane Austen", price: 7, condition: "Fair", genre: "Classics", location: "Auckland Central", isbn: "9780141439518", image: "/images/books/classic.jpg", description: "A well-loved paperback edition.", notes: "Yellowed pages, complete.", status: "active" },
    { seller: "james", title: "Project Hail Mary", author: "Andy Weir", price: 15, condition: "Like New", genre: "Sci-Fi", location: "Grey Lynn", isbn: "9780593135204", image: "/images/books/fantasy.jpg", description: "Science, friendship, and a great ending.", notes: "Unread gift copy.", status: "active" },
    { seller: "rachel", title: "The Code Book", author: "Simon Singh", price: 11, condition: "Very Good", genre: "Technology", location: "Grey Lynn", isbn: "9780385495325", image: "/images/books/history.jpg", description: "A clear history of codes and ciphers.", notes: "No writing.", status: "active" },
    { seller: "alex", title: "Tomorrow, and Tomorrow, and Tomorrow", author: "Gabrielle Zevin", price: 16, condition: "Very Good", genre: "Fiction", location: "Auckland Central", isbn: "9780593321201", image: "/images/books/fiction.jpg", description: "Draft listing while I photograph the dust jacket.", notes: "", status: "draft" },
    { seller: "emma", title: "Circe", author: "Madeline Miller", price: 13, condition: "Very Good", genre: "Fiction", location: "Auckland Central", isbn: "9780316556347", image: "/images/books/fiction.jpg", description: "Passed along after a reread.", notes: "Clean copy.", status: "sold" },
    { seller: "sarah", title: "The Night Circus", author: "Erin Morgenstern", price: 11, condition: "Good", genre: "Fantasy", location: "Ponsonby", isbn: "9780307744432", image: "/images/books/fantasy.jpg", description: "A magical paperback.", notes: "Light shelf wear.", status: "sold" },
    { seller: "david", title: "Braiding Sweetgrass", author: "Robin Wall Kimmerer", price: 17, condition: "Like New", genre: "Non-Fiction", location: "Newmarket", isbn: "9781571313560", image: "/images/books/history.jpg", description: "Bought a second copy.", notes: "No marks.", status: "sold" },
    { seller: "lena", title: "Mexican Gothic", author: "Silvia Moreno-Garcia", price: 10, condition: "Good", genre: "Mystery", location: "Mount Eden", isbn: "9780525620785", image: "/images/books/mystery.jpg", description: "Spooky and finished.", notes: "Spine slightly creased.", status: "sold" },
    { seller: "sophie", title: "The Song of Achilles", author: "Madeline Miller", price: 12, condition: "Very Good", genre: "Classics", location: "Auckland Central", isbn: "9780062060624", image: "/images/books/classic.jpg", description: "A favourite I already own.", notes: "Unread gift.", status: "sold" },
    { seller: "james", title: "Demon Copperhead", author: "Barbara Kingsolver", price: 14, condition: "Good", genre: "Fiction", location: "Grey Lynn", isbn: "9780063251922", image: "/images/books/fiction.jpg", description: "A long, excellent read.", notes: "A few dog-eared pages.", status: "sold" },
    { seller: "mia", title: "The Seven Husbands of Evelyn Hugo", author: "Taylor Jenkins Reid", price: 9, condition: "Very Good", genre: "Fiction", location: "Mount Eden", isbn: "9781501161933", image: "/images/books/fiction.jpg", description: "Read on holiday.", notes: "No writing inside.", status: "sold" },
    { seller: "rachel", title: "A Gentleman in Moscow", author: "Amor Towles", price: 15, condition: "Like New", genre: "Fiction", location: "Grey Lynn", isbn: "9780670026197", image: "/images/books/classic.jpg", description: "Elegant and carefully kept.", notes: "Looks new.", status: "sold" },
  ];

  const bookIds = new Map<string, string>();
  for (const book of books) {
    const row = await prisma.bookListing.create({
      data: {
        title: book.title,
        author: book.author,
        isbn: book.isbn,
        genre: book.genre,
        condition: book.condition,
        price: book.price,
        description: book.description,
        sellerNotes: book.notes,
        pickupLocation: book.location,
        image: book.image,
        status: book.status,
        sellerId: id(book.seller),
        createdAt: new Date("2026-09-18"),
      },
    });
    bookIds.set(book.title, row.id);
  }

  await prisma.savedMeetup.createMany({
    data: [
      { userId: id("alex"), meetupId: meetupIds.get("Coffee & Classics")! },
      { userId: id("alex"), meetupId: meetupIds.get("Fantasy Evenings")! },
      { userId: id("emma"), meetupId: meetupIds.get("Sci-Fi Sunday Afternoons")! },
    ],
  });
  await prisma.savedBook.createMany({
    data: [
      { userId: id("alex"), bookId: bookIds.get("Educated")! },
      { userId: id("alex"), bookId: bookIds.get("The House in the Cerulean Sea")! },
      { userId: id("mia"), bookId: bookIds.get("Piranesi")! },
    ],
  });

  const convo = await prisma.conversation.create({
    data: {
      bookId: bookIds.get("The Midnight Library"),
      participants: { create: [{ userId: id("james"), lastReadAt: new Date() }, { userId: id("sophie") }] },
      messages: {
        create: [
          { senderId: id("james"), body: "Hi! I'm interested in The Midnight Library. Is it still available?", createdAt: new Date("2026-09-24T10:35:00") },
          { senderId: id("james"), body: "Is the book still available?", createdAt: new Date("2026-09-24T10:42:00") },
        ],
      },
    },
  });
  await prisma.conversation.create({
    data: {
      meetupId: meetupIds.get("Coffee & Classics"),
      participants: { create: [{ userId: id("alex") }, { userId: id("emma") }] },
      messages: {
        create: [
          { senderId: id("emma"), body: "Hi Alex! Excited to have you joining Coffee & Classics.", createdAt: new Date("2026-09-22T14:30:00") },
          { senderId: id("alex"), body: "Thanks Emma! Should I bring my own copy?", createdAt: new Date("2026-09-22T14:45:00") },
          { senderId: id("emma"), body: "Yes please, any edition is welcome. See you Saturday!", createdAt: new Date("2026-09-22T15:00:00") },
        ],
      },
    },
  });

  await prisma.notification.createMany({
    data: [
      { userId: id("alex"), type: "join", text: 'Sarah joined your gathering "Poetry & Pastries".', link: `/gatherings/${meetupIds.get("Poetry & Pastries")}`, read: false, createdAt: new Date(Date.now() - 5 * 60000) },
      { userId: id("alex"), type: "reminder", text: 'Your gathering "Sci-Fi Sunday Afternoons" is coming up.', link: `/gatherings/${meetupIds.get("Sci-Fi Sunday Afternoons")}`, read: false, createdAt: new Date(Date.now() - 2 * 3600000) },
      { userId: id("sophie"), type: "message", text: "James sent you a message about The Midnight Library.", link: `/messages?c=${convo.id}`, read: false },
      { userId: id("alex"), type: "save", text: 'Your book listing "Piranesi" was saved by another user.', link: `/marketplace/${bookIds.get("Piranesi")}`, read: true },
      { userId: id("alex"), type: "discover", text: 'A new gathering matching your interests, "Fantasy Evenings", is now available.', link: `/gatherings/${meetupIds.get("Fantasy Evenings")}`, read: true },
      { userId: id("alex"), type: "message", text: "Emma sent you a message about Coffee & Classics.", read: true },
    ],
  });

  await prisma.paymentMethod.createMany({
    data: [
      { userId: id("alex"), type: "credit_card", label: "Visa credit ···· 4242", last4: "4242", expiry: "12/28", holderName: "Alex Mercer", isDefault: true },
      { userId: id("alex"), type: "paypal", label: "PayPal · alex@leaflit.nz", email: "alex@leaflit.nz" },
    ],
  });

  const purchases = [
    { title: "Atomic Habits", seller: "sophie", price: 14, ago: 100 },
    { title: "Circe", seller: "emma", price: 13, ago: 40 },
    { title: "The Night Circus", seller: "sarah", price: 11, ago: 90 },
    { title: "Braiding Sweetgrass", seller: "david", price: 17, ago: 160 },
    { title: "Mexican Gothic", seller: "lena", price: 10, ago: 220 },
    { title: "The Song of Achilles", seller: "sophie", price: 12, ago: 400 },
    { title: "Demon Copperhead", seller: "james", price: 14, ago: 900 },
    { title: "The Seven Husbands of Evelyn Hugo", seller: "mia", price: 9, ago: 1800 },
    { title: "A Gentleman in Moscow", seller: "rachel", price: 15, ago: 3600 },
  ];
  for (const purchase of purchases) {
    const bookId = bookIds.get(purchase.title)!;
    const shipment = assignShipment(bookId);
    await prisma.order.create({
      data: {
        buyerId: id("alex"),
        sellerId: id(purchase.seller),
        bookId,
        amount: purchase.price,
        paymentLabel: "Visa credit ···· 4242",
        carrier: shipment.carrier,
        trackingNumber: shipment.trackingNumber,
        shipToName: "Alex Mercer",
        shipToPhone: "021 555 0142",
        shipToLine: "18 Wellesley Street",
        shipToSuburb: "Auckland Central",
        shipToCity: "Auckland",
        shipToPostcode: "1010",
        origin: books.find((book) => book.title === purchase.title)!.location,
        createdAt: new Date(Date.now() - purchase.ago * 1000),
      },
    });
  }

  console.log("Seeded Leaf & Lit. Sign in as alex@leaflit.nz / LeafLit2026!");
}

main().finally(() => prisma.$disconnect());
