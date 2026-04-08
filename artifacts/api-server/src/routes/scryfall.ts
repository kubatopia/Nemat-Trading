import { Router } from "express";

const router = Router();

// ─── Helpers ──────────────────────────────────────────────────────────────────

function titleCase(s: string) {
  return s.replace(/\b\w/g, (c) => c.toUpperCase());
}

function dedupeWords(s: string): string {
  const words = s.trim().split(/\s+/);
  if (words.length < 4) return s;
  const half = Math.floor(words.length / 2);
  const first = words.slice(0, half).join(" ");
  const second = words.slice(half).join(" ");
  if (first === second) return first;
  if (second.startsWith(first)) return first;
  return s;
}

/** Recursively search a JSON object for a positive numeric price value at known keys */
function findPriceInJson(obj: unknown, depth = 0): string | null {
  if (depth > 6 || !obj || typeof obj !== "object") return null;
  const PRICE_KEYS = ["marketPrice", "lowestPrice", "lowPrice", "lowestListingPrice", "directLowPrice"];
  for (const key of PRICE_KEYS) {
    const val = (obj as any)[key];
    const n = typeof val === "number" ? val : parseFloat(val);
    if (!isNaN(n) && n > 0) return n.toFixed(2);
  }
  for (const value of Object.values(obj as object)) {
    const found = findPriceInJson(value, depth + 1);
    if (found) return found;
  }
  return null;
}

/**
 * Get product image + lowest price from a TCGPlayer URL.
 *
 * Strategy:
 *  1. Image — construct directly from product ID via TCGPlayer's CDN (no HTTP fetch needed)
 *  2. Price — try mpapi.tcgplayer.com marketplace endpoint (often public)
 *  3. Price fallback — scrape the product page and search __NEXT_DATA__ / JSON-LD
 */
async function scrapeTCGPlayer(url: string): Promise<{ imageUrl: string | null; lowestPrice: string | null }> {
  // Extract numeric product ID from URL  e.g. /product/657851/...
  const productIdMatch = url.match(/\/product\/(\d+)\//);
  const productId = productIdMatch?.[1] ?? null;

  // 1. Construct image URL from TCGPlayer CDN (no scraping, no Cloudflare)
  const imageUrl = productId
    ? `https://product-images.tcgplayer.com/fit-in/437x437/${productId}.jpg`
    : null;

  let lowestPrice: string | null = null;

  // 2. Try TCGPlayer marketplace API (semi-public, used by their own frontend)
  if (productId) {
    try {
      const mpRes = await fetch(
        `https://mpapi.tcgplayer.com/v2/product/${productId}/pricepoints?mpfev=2`,
        {
          headers: {
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
            "Referer": "https://www.tcgplayer.com/",
            "Origin": "https://www.tcgplayer.com",
          },
        }
      );
      if (mpRes.ok) {
        const mpData = await mpRes.json();
        lowestPrice = findPriceInJson(mpData);
      }
    } catch {}
  }

  // 3. HTML scrape fallback — works when Cloudflare doesn't intercept
  if (!lowestPrice) {
    try {
      const res = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.9",
        },
      });
      if (res.ok) {
        const html = await res.text();

        // JSON-LD structured data
        const jsonLdBlocks = [...html.matchAll(/<script[^>]+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)];
        for (const block of jsonLdBlocks) {
          try {
            const data = JSON.parse(block[1]);
            const found = findPriceInJson(data);
            if (found) { lowestPrice = found; break; }
          } catch {}
        }

        // __NEXT_DATA__ — TCGPlayer's Next.js embeds full page state here
        if (!lowestPrice) {
          const nd = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/i);
          if (nd) {
            try {
              lowestPrice = findPriceInJson(JSON.parse(nd[1]));
            } catch {}
          }
        }
      }
    } catch {}
  }

  return { imageUrl, lowestPrice };
}

// ─── Routes ───────────────────────────────────────────────────────────────────

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

// Live refresh: fetch current lowest price from a TCGPlayer product URL
router.post("/tcgplayer/price", async (req, res) => {
  const { url } = req.body as { url?: string };
  if (!url) { res.status(400).json({ error: "url required" }); return; }
  const { lowestPrice } = await scrapeTCGPlayer(url);
  res.json({ lowestPrice });
});

// Lookup product data from a TCGPlayer URL
router.post("/lookup/tcgplayer", async (req, res) => {
  const { url } = req.body as { url: string };
  if (!url) { res.status(400).json({ error: "url is required" }); return; }

  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split("/").filter(Boolean);
    const slug = pathParts[pathParts.length - 1] ?? "";

    // Detect pack/box type
    const packMatch = slug.match(/(collector-booster(?:-pack|-box)?|draft-booster(?:-pack|-box)?|set-booster(?:-pack|-box)?|booster-(?:pack|box)|booster-display)/i);
    const packType = packMatch ? titleCase(packMatch[0].replace(/-/g, " ")) : null;

    // Strip game prefix and pack suffix to isolate the set/card name
    let setName = slug
      .replace(/^magic-the-gathering-/, "")
      .replace(/^magic-/, "")
      .replace(/([-_]collector[-_]booster.*)$/i, "")
      .replace(/([-_]draft[-_]booster.*)$/i, "")
      .replace(/([-_]set[-_]booster.*)$/i, "")
      .replace(/([-_]booster[-_](?:pack|box|display).*)$/i, "")
      .replace(/-\d+$/, "")
      .replace(/-/g, " ")
      .trim();

    setName = dedupeWords(setName);
    const suggestedTitle = [titleCase(setName), packType].filter(Boolean).join(" ");

    // Scrape TCGPlayer for image + price (runs in parallel with Scryfall search)
    const [tcgData, setsRes] = await Promise.all([
      scrapeTCGPlayer(url),
      fetch("https://api.scryfall.com/sets"),
    ]);

    const tcgImageUrl = tcgData.imageUrl;
    const tcgLowestPrice = tcgData.lowestPrice;

    // Try to find a matching Scryfall set
    if (setsRes.ok) {
      const setsData = await setsRes.json() as { data: any[] };
      const needle = setName.toLowerCase();

      // Exclude supplemental sets that aren't the main product
      const EXCLUDED_TYPES = new Set(["token", "memorabilia", "promo"]);
      const candidates = setsData.data.filter((s: any) => {
        if (EXCLUDED_TYPES.has(s.set_type)) return false;
        const n = s.name.toLowerCase().replace(/^universes beyond: /i, "");
        return n.includes(needle) || needle.includes(n);
      });

      // Prefer sets whose name most closely matches (shortest = most specific match)
      candidates.sort((a: any, b: any) => {
        const aName = a.name.toLowerCase().replace(/^universes beyond: /i, "");
        const bName = b.name.toLowerCase().replace(/^universes beyond: /i, "");
        // Exact match wins
        if (aName === needle && bName !== needle) return -1;
        if (bName === needle && aName !== needle) return 1;
        // Shorter name = less likely to be a supplemental/sub-set
        return aName.length - bName.length;
      });

      const set = candidates[0];

      if (set) {
        // Fetch top cards in this set by USD price
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
          topCards,
          scryfallId: null,
          imageUrl: tcgImageUrl ?? topCards[0]?.imageUrl ?? null,
          usd: tcgLowestPrice,  // from TCGPlayer scrape
        });
        return;
      }
    }

    // Fall back: search Scryfall for an individual card by name
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
        imageUrl: tcgImageUrl ?? card.image_uris?.normal ?? card.card_faces?.[0]?.image_uris?.normal ?? null,
        usd: tcgLowestPrice ?? card.prices?.usd ?? null,
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
      imageUrl: tcgImageUrl ?? card.image_uris?.normal ?? card.card_faces?.[0]?.image_uris?.normal ?? null,
      usd: tcgLowestPrice ?? card.prices?.usd ?? null,
      topCards: [],
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message ?? "Lookup failed" });
  }
});

export default router;
