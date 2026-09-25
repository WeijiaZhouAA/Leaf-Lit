export const GENRES = [
  "Fiction",
  "Non-Fiction",
  "Classics",
  "Fantasy",
  "Mystery",
  "Romance",
  "History",
  "Biography",
  "Self-Development",
  "Technology",
  "Poetry",
  "Sci-Fi",
] as const;

export const MEETUP_TYPES = [
  "Book Discussion",
  "Casual Reading",
  "Book Swap",
  "Author Discussion",
  "Themed Reading",
  "Other",
] as const;

export const CONDITIONS = ["Like New", "Very Good", "Good", "Fair"] as const;

export const CONDITION_DESCRIPTIONS: Record<string, string> = {
  "Like New": "Looks and feels like it just came off a bookshop shelf. No marks, no spine creases.",
  "Very Good": "Read with care. Minimal wear, no annotations, perhaps very light shelf marks.",
  Good: "Clearly loved. Spine may be creased, light annotations possible, all pages intact.",
  Fair: "Well-read. Noticeable wear, possible writing inside, but fully readable.",
};

export const CONDITION_BADGE: Record<string, string> = {
  "Like New": "bg-green-100 text-green-700",
  "Very Good": "bg-blue-50 text-blue-700",
  Good: "bg-yellow/80 text-forest",
  Fair: "bg-orange-50 text-orange-700",
};

export const SUBURBS = [
  "Auckland Central",
  "Grey Lynn",
  "Ponsonby",
  "Mount Eden",
  "Newmarket",
  "Parnell",
  "Kingsland",
  "Takapuna",
];

export const DEMO_PASSWORD = "LeafLit2026!";
