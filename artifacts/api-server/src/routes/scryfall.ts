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
  // Use lowest active listing price — matches TCGPlayer's "as low as" displayed price
  const PRICE_KEYS = ["lowestListingPrice", "lowestPrice", "directLowPrice", "lowPrice", "marketPrice"];
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

  const mpHeaders = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Referer": "https://www.tcgplayer.com/",
    "Origin": "https://www.tcgplayer.com",
    "Accept": "application/json, text/plain, */*",
  };

  // TCGPlayer is fully client-side rendered — HTML scraping cannot get live prices.
  // Strategy: use mp-search-api POST endpoint which returns real active listings
  // sorted by price ascending, excluding presale listings.
  if (productId) {
    // 1. Search API — fetch listings sorted by price, presale excluded.
    //    Prefer free-shipping listings (shippingPrice === 0, shown as "shipping: included"
    //    on TCGPlayer) since those are all-in prices with no hidden shipping costs.
    try {
      const searchRes = await fetch(
        `https://mp-search-api.tcgplayer.com/v1/product/${productId}/listings`,
        {
          method: "POST",
          headers: { ...mpHeaders, "Content-Type": "application/json" },
          body: JSON.stringify({
            filters: {
              term: { sellerStatus: "Live", channelId: 0 },
              range: { quantity: { gte: 1 } },
              exclude: { channelExclusion: 0, sellerPrograms: ["Presale"] },
            },
            from: 0,
            size: 30,
            sort: { field: "price", order: "asc" },
            context: { shippingCountry: "US", cart: {} },
          }),
        }
      );
      if (searchRes.ok) {
        const searchData = await searchRes.json();
        const results: any[] = searchData?.results?.[0]?.results ?? [];
        // Prefer the lowest free-shipping listing ("shipping: included" on TCGPlayer)
        const freeShipping = results.filter((r: any) => r.shippingPrice === 0 || r.rankedShippingPrice === 0);
        const candidates = freeShipping.length > 0 ? freeShipping : results;
        for (const item of candidates) {
          const n = typeof item.price === "number" ? item.price : parseFloat(item.price);
          if (!isNaN(n) && n > 0) { lowestPrice = n.toFixed(2); break; }
        }
      }
    } catch {}

    // 2. Pricepoints fallback — market average if search API fails
    if (!lowestPrice) {
      try {
        const ppRes = await fetch(
          `https://mpapi.tcgplayer.com/v2/product/${productId}/pricepoints?mpfev=2`,
          { headers: mpHeaders }
        );
        if (ppRes.ok) {
          lowestPrice = findPriceInJson(await ppRes.json());
        }
      } catch {}
    }
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

// GET version for easy browser testing: /api/tcgplayer/price-check?id=657851
router.get("/tcgplayer/price-check", async (req, res) => {
  const id = req.query.id as string;
  if (!id) { res.status(400).json({ error: "id query param required" }); return; }
  const url = `https://www.tcgplayer.com/product/${id}/product`;
  const result = await scrapeTCGPlayer(url);
  res.json(result);
});

// Debug: dump raw responses from TCGPlayer APIs — /api/tcgplayer/debug?id=657851
router.get("/tcgplayer/debug", async (req, res) => {
  const id = req.query.id as string;
  if (!id) { res.status(400).json({ error: "id required" }); return; }
  const headers = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Referer": "https://www.tcgplayer.com/",
    "Origin": "https://www.tcgplayer.com",
    "Accept": "application/json, text/plain, */*",
  };
  const results: Record<string, any> = {};
  try {
    const r = await fetch(`https://mpapi.tcgplayer.com/v2/product/${id}/listings?mpfev=2&limit=10&offset=0`, { headers });
    results.listings = { status: r.status, body: await r.json() };
  } catch (e: any) { results.listings = { error: e.message }; }
  try {
    const r = await fetch(`https://mpapi.tcgplayer.com/v2/product/${id}/pricepoints?mpfev=2`, { headers });
    results.pricepoints = { status: r.status, body: await r.json() };
  } catch (e: any) { results.pricepoints = { error: e.message }; }
  // Check what the HTML page returns (Cloudflare block check)
  try {
    const r = await fetch(`https://www.tcgplayer.com/product/${id}/`, {
      headers: { ...headers, "Accept": "text/html,application/xhtml+xml", "Referer": "https://www.google.com/" },
      redirect: "follow",
    });
    const html = await r.text();
    const asLowAs = html.match(/as\s+low\s+as\s+\$?([\d]+\.[\d]{2})/i);
    const cfBlocked = html.includes("Just a moment") || html.includes("cf-browser-verification") || html.includes("challenge-platform");
    results.htmlScrape = {
      status: r.status,
      cloudflareBlocked: cfBlocked,
      asLowAsMatch: asLowAs?.[1] ?? null,
      htmlSnippet: html.slice(0, 500),
    };
  } catch (e: any) { results.htmlScrape = { error: e.message }; }
  res.json(results);
});

// Scrape TCGPlayer product page for description + contents via __NEXT_DATA__
async function scrapeProductPage(url: string): Promise<{ intelReport: string | null; contents: string[] | null }> {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        "Referer": "https://www.google.com/",
      },
      redirect: "follow",
    });
    if (!res.ok) return { intelReport: null, contents: null };
    const html = await res.text();
    if (html.includes("Just a moment") || html.includes("challenge-platform")) return { intelReport: null, contents: null };

    const match = html.match(/<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/);
    if (!match) return { intelReport: null, contents: null };

    const nextData = JSON.parse(match[1]);
    const pageProps = nextData?.props?.pageProps ?? {};
    const product = pageProps.product ?? pageProps.productDetails ?? pageProps.details ?? null;
    const extendedData: any[] = product?.extendedData ?? product?.extended_data ?? [];

    function stripHtml(s: string) {
      return s
        .replace(/<br\s*\/?>/gi, "\n")
        .replace(/<\/p>/gi, "\n\n")
        .replace(/<\/li>/gi, "\n")
        .replace(/<[^>]+>/g, "")
        .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&nbsp;/g, " ")
        .replace(/\n{3,}/g, "\n\n")
        .trim();
    }

    let intelReport: string | null = null;
    let contents: string[] | null = null;

    for (const item of extendedData) {
      const name = (item.name ?? item.displayName ?? "").toLowerCase();
      const value = String(item.value ?? "");
      if (!value) continue;

      if (name.includes("description") || name.includes("product detail") || name === "description") {
        const text = stripHtml(value);
        if (text) intelReport = text;
      }
      if (name.includes("content")) {
        const lines = stripHtml(value).split("\n").map((s: string) => s.trim()).filter(Boolean);
        if (lines.length) contents = lines;
      }
    }

    return { intelReport, contents };
  } catch {
    return { intelReport: null, contents: null };
  }
}

function parsePullProbabilities(
  contents: string[],
  slug: string
): { label: string; abbr: string; percent: number; color: string }[] {
  const text = contents.join(" ").toLowerCase();

  let total = 15;
  let common = 0, uncommon = 0, land = 0, rareOrHigher = 0;

  const totalMatch = text.match(/(\d+) magic(?:: the gathering)? cards?/);
  if (totalMatch) total = parseInt(totalMatch[1]);

  const rareMatch = text.match(/(\d+) cards? of rarity rare or higher|includes? (\d+) (?:cards? of )?rare/);
  if (rareMatch) rareOrHigher = parseInt(rareMatch[1] ?? rareMatch[2] ?? "0");

  const uncommonMatch = text.match(/(\d+) uncommon/);
  if (uncommonMatch) uncommon = parseInt(uncommonMatch[1]);

  const commonMatch = text.match(/(\d+) common/);
  if (commonMatch) common = parseInt(commonMatch[1]);

  const landMatch = text.match(/(\d+) land/);
  if (landMatch) land = parseInt(landMatch[1]);

  // Fallback heuristics by product type when page scrape didn't yield data
  if (!rareOrHigher && !uncommon && !common) {
    const isCollector = /collector/i.test(slug);
    const isDraft = /draft/i.test(slug);
    const isSet = /set.booster/i.test(slug);
    if (isCollector)    { total = 15; common = 4; uncommon = 5; land = 1; rareOrHigher = 5; }
    else if (isDraft)   { total = 15; common = 10; uncommon = 3; land = 0; rareOrHigher = 2; }
    else if (isSet)     { total = 12; common = 2; uncommon = 3; land = 1; rareOrHigher = 3; }
    else                { total = 15; common = 5; uncommon = 4; land = 1; rareOrHigher = 5; }
  }

  // Split rare/mythic using standard 1-in-8 mythic ratio
  const mythicCount = rareOrHigher > 0 ? Math.max(1, Math.round(rareOrHigher / 8)) : 0;
  const rareCount = rareOrHigher - mythicCount;
  const denominator = common + uncommon + land + rareCount + mythicCount || total;

  const slots: { label: string; abbr: string; count: number; color: string }[] = [
    { label: "Common",      abbr: "C", count: common,      color: "#6b7280" },
    { label: "Uncommon",    abbr: "U", count: uncommon,    color: "#60a5fa" },
    { label: "Land",        abbr: "L", count: land,        color: "#4ade80" },
    { label: "Rare",        abbr: "R", count: rareCount,   color: "#fbbf24" },
    { label: "Mythic Rare", abbr: "M", count: mythicCount, color: "#f97316" },
  ].filter(s => s.count > 0);

  const probs = slots.map(s => ({ ...s, percent: Math.round((s.count / denominator) * 100) }));

  // Normalize to exactly 100%
  const sum = probs.reduce((acc, p) => acc + p.percent, 0);
  if (sum !== 100 && probs.length > 0) probs[probs.length - 1].percent += 100 - sum;

  return probs.map(({ label, abbr, percent, color }) => ({ label, abbr, percent, color }));
}

function buildSpecs(set: any, slug: string): { label: string; value: string }[] {
  const specs: { label: string; value: string }[] = [];
  specs.push({ label: "SET", value: set.name });
  if (set.released_at) specs.push({ label: "RELEASE", value: set.released_at.substring(0, 4) });
  const isBox = /booster[-_]box|booster[-_]display/i.test(slug);
  specs.push({ label: isBox ? "PACKS / BOX" : "PACKS / BOX", value: isBox ? "36" : "1" });
  const isCollector = /collector/i.test(slug);
  const isSet = /set[-_]booster/i.test(slug);
  specs.push({ label: "CARDS / PACK", value: isCollector ? "15" : isSet ? "12" : "15" });
  return specs;
}

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

    // Scrape TCGPlayer for image + price + product details, and fetch Scryfall sets — all in parallel
    const [tcgData, setsRes, pageDetails] = await Promise.all([
      scrapeTCGPlayer(url),
      fetch("https://api.scryfall.com/sets"),
      scrapeProductPage(url),
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
              rarity: c.rarity ?? null, // "mythic" | "rare" | "uncommon" | "common"
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
          usd: tcgLowestPrice,
          specs: buildSpecs(set, slug),
          intelReport: pageDetails.intelReport,
          contents: pageDetails.contents,
          pullProbabilities: parsePullProbabilities(pageDetails.contents ?? [], slug),
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

// Remove background from an image URL using remove.bg
router.post("/remove-background", async (req, res) => {
  const { imageUrl } = req.body as { imageUrl?: string };
  if (!imageUrl) { res.status(400).json({ error: "imageUrl required" }); return; }

  const apiKey = process.env.REMOVE_BG_API_KEY;
  if (!apiKey) { res.status(503).json({ error: "REMOVE_BG_API_KEY not configured" }); return; }

  try {
    const response = await fetch("https://api.remove.bg/v1.0/removebg", {
      method: "POST",
      headers: { "X-Api-Key": apiKey, "Content-Type": "application/json" },
      body: JSON.stringify({ image_url: imageUrl, size: "auto" }),
    });

    if (!response.ok) {
      const err: any = await response.json().catch(() => ({}));
      res.status(500).json({ error: err.errors?.[0]?.title ?? "remove.bg failed" });
      return;
    }

    const buffer = await response.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");
    res.json({ png: `data:image/png;base64,${base64}` });
  } catch (err: any) {
    res.status(500).json({ error: err.message ?? "Failed to remove background" });
  }
});

export default router;
