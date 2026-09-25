import { mkdirSync, writeFileSync } from "node:fs";

const dirs = ["public/images", "public/images/avatars", "public/images/covers", "public/images/books"];
dirs.forEach((dir) => mkdirSync(dir, { recursive: true }));

function avatar(name, color) {
  const initials = name.split(" ").map((part) => part[0]).join("").slice(0, 2);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160"><rect width="160" height="160" rx="24" fill="${color}"/><text x="80" y="92" text-anchor="middle" font-family="Georgia" font-size="54" fill="#294936">${initials}</text></svg>`;
}

function scene(title, a, b) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="480"><rect width="800" height="480" fill="${a}"/><rect x="70" y="70" width="280" height="340" rx="16" fill="${b}"/><rect x="400" y="120" width="300" height="18" rx="8" fill="#294936" opacity="0.25"/><rect x="400" y="160" width="240" height="12" rx="6" fill="#294936" opacity="0.15"/><text x="90" y="430" font-family="Georgia" font-size="28" fill="#294936">${title}</text></svg>`;
}

function book(title, color) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="240" height="360"><rect width="240" height="360" fill="${color}"/><rect x="18" y="0" width="10" height="360" fill="#294936" opacity="0.2"/><text x="120" y="180" text-anchor="middle" font-family="Georgia" font-size="22" fill="#294936">${title}</text></svg>`;
}

const people = {
  alex: ["Alex Mercer", "#DDEFD8"],
  emma: ["Emma Wilson", "#FFF3BF"],
  james: ["James Park", "#BFDDB8"],
  sarah: ["Sarah Nguyen", "#F5E490"],
  lena: ["Lena Foster", "#DDE5DE"],
  david: ["David Kim", "#DDEFD8"],
  mia: ["Mia Torres", "#FFF3BF"],
  sophie: ["Sophie Chen", "#BFDDB8"],
  mark: ["Mark Johnson", "#F5E490"],
  rachel: ["Rachel Lee", "#DDE5DE"],
  default: ["New Reader", "#DDEFD8"],
};

for (const [file, [name, color]] of Object.entries(people)) {
  writeFileSync(`public/images/avatars/${file}.svg`, avatar(name, color));
}

writeFileSync("public/images/hero.svg", scene("Read together", "#DDEFD8", "#FFF3BF"));
writeFileSync("public/images/covers/cafe.svg", scene("Cafe", "#FFF3BF", "#DDEFD8"));
writeFileSync("public/images/covers/library.svg", scene("Library", "#DDE5DE", "#BFDDB8"));
writeFileSync("public/images/covers/park.svg", scene("Park", "#BFDDB8", "#FFFDF5"));
writeFileSync("public/images/covers/evening.svg", scene("Evening", "#294936", "#F5E490"));
writeFileSync("public/images/covers/default.svg", scene("Gathering", "#DDEFD8", "#FFFFFF"));

const books = {
  classic: ["Classics", "#FFF3BF"],
  fiction: ["Fiction", "#DDEFD8"],
  fantasy: ["Fantasy", "#BFDDB8"],
  mystery: ["Mystery", "#DDE5DE"],
  bio: ["Biography", "#F5E490"],
  history: ["History", "#E7F0E4"],
  default: ["Book", "#DDEFD8"],
};
for (const [file, [title, color]] of Object.entries(books)) {
  writeFileSync(`public/images/books/${file}.svg`, book(title, color));
}

console.log("Wrote local placeholder images.");
