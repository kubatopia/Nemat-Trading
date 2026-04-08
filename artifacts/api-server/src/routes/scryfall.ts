import { Router } from "express";

const router = Router();

// Proxy Scryfall price to avoid browser CORS/rate-limit issues
// Returns { usd: "37.49" } or { usd: null }
router.get("/scryfall/:id/price", async (req, res) => {
  const { id } = req.params;
  try {
    const response = await fetch(`https://api.scryfall.com/cards/${id}`);
    if (!response.ok) {
      res.json({ usd: null });
      return;
    }
    const data = await response.json() as { prices?: { usd?: string | null } };
    res.json({ usd: data.prices?.usd ?? null });
  } catch {
    res.json({ usd: null });
  }
});

export default router;
