import { Router } from "express";

const router = Router();

// Proxy Scryfall price by card ID
router.get("/scryfall/:id/price", async (req, res) => {
  const { id } = req.params;
  try {
    const response = await fetch(`https://api.scryfall.com/cards/${id}`);
    if (!response.ok) { res.json({ usd: null }); return; }
    const data = await response.json() as { prices?: { usd?: string | null } };
    res.json({ usd: data.prices?.usd ?? null });
  } catch {
    res.json({ usd: null });
  }
});

function titleCase(s: string) {
  return s.replace(/\b\w/g, (c) => c.toUpperCase());
}

/** Remove repeated halves: "tmnt tmnt" → "tmnt" */
function dedupeWords(s: string): string {
  const words = s.trim().split(/\s+/);
  if (words.length < 4) return s;
  const half = Math.floor(words.length / 2);
  const first = words.slice(0, half).join(" ");
  const second = words.slice(half).join(" ");
  if (first === second) return first;
  // Also check if first appears at the start of second
  if (second.startsWith(first)) return first;
  return s;
}

// Lookup card/set data from a TCGPlayer URL
router.post("/lookup/tcgplayer", async (req, res) => {
  const { url } = req.body as { url: string };
  if (!url) { res.status(400).json({ error: "url is required" }); return; }

  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split("/").filter(Boolean);
    const slug = pathParts[pathParts.length - 1] ?? "";

    // Detect pack/box product type from the slug
    const packMatch = slug.match(/(collector-booster(?:-pack|-box)?|draft-booster(?:-pack|-box)?|set-booster(?:-pack|-box)?|booster-(?:pack|box)|booster-display)/i);
    const packType = packMatch
      ? titleCase(packMatch[0].replace(/-/g, " "))
      : null;

    // Strip game prefixes and pack suffixes to isolate the set/card name
    let setName = slug
      .replace(/^magic-the-gathering-/, "")
      .replace(/^magic-/, "")
      // Remove pack type suffix and everything after
      .replace(/([-_]collector[-_]booster.*)$/i, "")
      .replace(/([-_]draft[-_]booster.*)$/i, "")
      .replace(/([-_]set[-_]booster.*)$/i, "")
      .replace(/([-_]booster[-_](?:pack|box|display).*)$/i, "")
      .replace(/-\d+$/, "")
      .replace(/-/g, " ")
      .trim();

    setName = dedupeWords(setName);

    const suggestedTitle = [titleCase(setName), packType].filter(Boolean).join(" ");

    // --- Try to find a matching Scryfall set ---
    const setsRes = await fetch("https://api.scryfall.com/sets");
    if (setsRes.ok) {
      const setsData = await setsRes.json() as { data: any[] };
      const needle = setName.toLowerCase();
      const set = setsData.data.find((s: any) =>
        s.name.toLowerCase().includes(needle) ||
        needle.includes(s.name.toLowerCase().replace(/universes beyond: /i, ""))
      );

      if (set) {
        // Fetch the top cards in this set by USD price
        const cardsRes = await fetch(
          `https://api.scryfall.com/cards/search?q=set:${set.code}&order=usd&dir=desc&page=1`
        );
        const topCards: any[] = [];
        if (cardsRes.ok) {
          const cardsData = await cardsRes.json() as { data: any[] };
          for (const c of (cardsData.data ?? []).slice(0, 12)) {
            topCards.push({
              id: c.id,
              name: c.name,
              imageUrl: c.image_uris?.normal ?? c.card_faces?.[0]?.image_uris?.normal ?? null,
              usd: c.prices?.usd ?? null,
            });
          }
        }

        res.json({
          type: "set",
          suggestedTitle,
          setCode: set.code,
          setName: set.name,
          setIconUrl: set.icon_svg_uri ?? null,
          topCards,
          scryfallId: null,
          imageUrl: topCards[0]?.imageUrl ?? null,
          usd: null, // Scryfall doesn't track booster pack prices
        });
        return;
      }
    }

    // --- Fall back: search Scryfall for an individual card by name ---
    const searchRes = await fetch(
      `https://api.scryfall.com/cards/named?fuzzy=${encodeURIComponent(setName)}`
    );

    if (!searchRes.ok) {
      const broadRes = await fetch(
        `https://api.scryfall.com/cards/search?q=${encodeURIComponent(setName)}&order=usd&dir=desc`
      );
      if (!broadRes.ok) {
        res.status(404).json({ error: `No card or set found for: "${setName}"` });
        return;
      }
      const broadData = await broadRes.json() as { data: any[] };
      const card = broadData.data?.[0];
      if (!card) { res.status(404).json({ error: "No results" }); return; }
      res.json({
        type: "card",
        suggestedTitle: card.name,
        scryfallId: card.id,
        name: card.name,
        imageUrl: card.image_uris?.normal ?? card.card_faces?.[0]?.image_uris?.normal ?? null,
        usd: card.prices?.usd ?? null,
        topCards: [],
      });
      return;
    }

    const card = await searchRes.json() as any;
    res.json({
      type: "card",
      suggestedTitle: card.name,
      scryfallId: card.id,
      name: card.name,
      imageUrl: card.image_uris?.normal ?? card.card_faces?.[0]?.image_uris?.normal ?? null,
      usd: card.prices?.usd ?? null,
      topCards: [],
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message ?? "Lookup failed" });
  }
});

export default router;
