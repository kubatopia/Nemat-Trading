
// ─── MOCK DATA ───────────────────────────────────────────────────────────────
// Edit this file to update product details, prices, pull probabilities, etc.

export const product = {
  // ── Brand ──────────────────────────────────────────────────────────────────
  brand: "NEMAT",

  // ── Product ────────────────────────────────────────────────────────────────
  title: "Teenage Mutant Ninja Turtles",
  subtitle: "Collector Booster Pack",
  status: "FLASH DROP // ACTIVE",

  // ── Pricing ────────────────────────────────────────────────────────────────
  tcgBestPrice: 37.49,
  dropPrice: 32,
  savingsPercent: 15,

  // ── Countdown target (ISO string or ms from now for demo) ──────────────────
  // Set to a future date/time for a real drop.
  dropExpiresAt: new Date(Date.now() + 4 * 60 * 60 * 1000 + 37 * 60 * 1000 + 22 * 1000).toISOString(),
  revealCountdownAt: new Date(Date.now() + 23 * 60 * 60 * 1000 + 14 * 60 * 1000 + 9 * 1000).toISOString(),

  // ── Intel Report ───────────────────────────────────────────────────────────
  intelReport: [
    {
      text: "These things vanished faster than a pizza at the lair the last time we saw them. But fear not!!! Another batch of mutagen-enhanced TMNT Magic Collector Boosters just crawled out of the sewer and they are LOADED.",
      highlights: [],
    },
    {
      text: "We're talking Turtle-powered rares and mythic rares, traditional foils shining brighter than a freshly sharpened katana, and full-art lands that look like they were pulled straight from the underground tunnels of NYC. And yes...there's a chance at the borderless source-material cards dripping with nostalgia thicker than mozzarella on a late-night pepperoni slice.",
      highlights: ["rares", "mythic rares", "traditional foils", "full-art lands", "borderless source-material cards"],
    },
    {
      text: "But the REAL headline? Ohhhh yes...",
      highlights: [],
    },
    {
      text: "All four Turtles. Leonardo, Donatello, Raphael, and Michelangelo. Illustrated by the original co-creator himself, Kevin Eastman.",
      highlights: ["Leonardo", "Donatello", "Raphael", "Michelangelo", "Kevin Eastman"],
    },
    {
      text: "I mean... come on. That's basically the cardboard equivalent of finding the secret entrance to the sewer lair.",
      highlights: [],
    },
  ],

  // ── Specifications ─────────────────────────────────────────────────────────
  specs: [
    { label: "SET", value: "Teenage Mutant Ninja Turtles" },
    { label: "RELEASE", value: "2025" },
    { label: "PACKS / BOX", value: "1" },
    { label: "CARDS / PACK", value: "15" },
  ],

  contents: [
    "15 Magic: The Gathering cards",
    "May contain these cards: TMT 1–190, 196–314; TMC 1–97; PZA 1–20",
    "0–3 surge foil cards",
    "9–12 traditional foil cards",
    "5 cards of rarity rare or higher",
    "3–4 uncommon cards",
    "5–6 common cards",
    "1 land card",
    "Borderless signature Kevin Eastman headliner card in <1% of boosters",
  ],

  copyright: "© 2025 Wizards of the Coast LLC. © 2025 Viacom International. TEENAGE MUTANT NINJA TURTLES is a trademark of Viacom International Inc. All rights reserved.",

  // ── Pull Probabilities ─────────────────────────────────────────────────────
  pullProbabilities: [
    { label: "Common", abbr: "C", percent: 27, color: "#6b7280" },
    { label: "Uncommon", abbr: "U", percent: 23, color: "#60a5fa" },
    { label: "Rare", abbr: "R", percent: 22, color: "#fbbf24" },
    { label: "Mythic Rare", abbr: "M", percent: 14, color: "#f97316" },
    { label: "Borderless", abbr: "B", percent: 9, color: "#a78bfa" },
    { label: "Eastman Art", abbr: "E", percent: 5, color: "#34d399" },
  ],

  donutCenter: {
    label: "Common",
    percent: "27.0%",
    sub: "Standard cards",
  },

  // ── Possible Pulls ─────────────────────────────────────────────────────────
  // Card images sourced from Scryfall API (https://scryfall.com) — swap scryfallId to change the card shown
  possiblePulls: [
    {
      id: 1,
      title: "Leonardo, Leader in Blue",
      subtitle: "Mythic Rare · Eastman Art",
      probability: "~2%",
      scryfallImage: "https://cards.scryfall.io/normal/front/d/6/d6eaae35-d513-43d8-be2d-b97c15e25937.jpg?1771502519",
      featured: false,
    },
    {
      id: 2,
      title: "Donatello, Turtle Techie",
      subtitle: "Mythic Rare · Eastman Art",
      probability: "~2%",
      scryfallImage: "https://cards.scryfall.io/normal/front/6/8/683cfef0-f164-4db8-b83f-79eb804e50ae.jpg?1771502569",
      featured: false,
    },
    {
      id: 3,
      title: "Raphael, Most Attitude",
      subtitle: "Mythic Rare · Eastman Art",
      probability: "~2%",
      scryfallImage: "https://cards.scryfall.io/normal/front/8/8/88385a87-f931-409f-8a21-250f0866d63d.jpg?1771502673",
      featured: false,
    },
    {
      id: 4,
      title: "Michelangelo, Game Master",
      subtitle: "Mythic Rare · Eastman Art",
      probability: "~2%",
      scryfallImage: "https://cards.scryfall.io/normal/front/2/e/2e914c3d-2eed-48bf-af9a-a8998fd5111d.jpg?1771502708",
      featured: true,
    },
    {
      id: 5,
      title: "Shredder, Shadow Master",
      subtitle: "Borderless Source Material",
      probability: "~9%",
      scryfallImage: "https://cards.scryfall.io/normal/front/d/d/ddf4d3c9-bef9-4796-91ef-3d5beebae571.jpg?1773509742",
      featured: false,
    },
  ],
};
