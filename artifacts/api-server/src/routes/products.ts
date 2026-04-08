import { Router } from "express";
import { db, productsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

// Public: list active products
router.get("/products", async (_req, res) => {
  const products = await db
    .select()
    .from(productsTable)
    .where(eq(productsTable.active, true));
  res.json(products);
});

// Admin middleware
function requireAdmin(req: any, res: any, next: any) {
  const key = req.headers["x-admin-key"];
  if (!process.env.ADMIN_SECRET || key !== process.env.ADMIN_SECRET) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  next();
}

// Admin: create product
router.post("/admin/products", requireAdmin, async (req, res) => {
  const { title, subtitle, price, imageUrl, stock, specs, contents, expiresAt, scryfallId, discountPercent, tcgplayerUrl, tcgMarketPriceCents } = req.body;
  const [product] = await db
    .insert(productsTable)
    .values({
      title,
      subtitle: subtitle ?? "",
      price,
      imageUrl: imageUrl ?? "",
      stock: stock ?? 0,
      specs: JSON.stringify(specs ?? []),
      contents: JSON.stringify(contents ?? []),
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      scryfallId: scryfallId ?? "",
      discountPercent: discountPercent ?? 15,
      tcgplayerUrl: tcgplayerUrl ?? "",
      tcgMarketPriceCents: tcgMarketPriceCents ?? null,
      active: true,
    })
    .returning();
  res.json(product);
});

// Admin: update product
router.patch("/admin/products/:id", requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  const { title, subtitle, price, imageUrl, stock, active, specs, contents, expiresAt, scryfallId, discountPercent, tcgplayerUrl, tcgMarketPriceCents } = req.body;
  const updates: Record<string, any> = {};
  if (title !== undefined) updates.title = title;
  if (subtitle !== undefined) updates.subtitle = subtitle;
  if (price !== undefined) updates.price = price;
  if (imageUrl !== undefined) updates.imageUrl = imageUrl;
  if (stock !== undefined) updates.stock = stock;
  if (active !== undefined) updates.active = active;
  if (specs !== undefined) updates.specs = JSON.stringify(specs);
  if (contents !== undefined) updates.contents = JSON.stringify(contents);
  if (expiresAt !== undefined) updates.expiresAt = expiresAt ? new Date(expiresAt) : null;
  if (scryfallId !== undefined) updates.scryfallId = scryfallId;
  if (discountPercent !== undefined) updates.discountPercent = discountPercent;
  if (tcgplayerUrl !== undefined) updates.tcgplayerUrl = tcgplayerUrl;
  if (tcgMarketPriceCents !== undefined) updates.tcgMarketPriceCents = tcgMarketPriceCents;

  const [product] = await db
    .update(productsTable)
    .set(updates)
    .where(eq(productsTable.id, id))
    .returning();
  res.json(product);
});

// Admin: list all products (including inactive)
router.get("/admin/products", requireAdmin, async (_req, res) => {
  const products = await db.select().from(productsTable);
  res.json(products);
});

// Admin: delete product
router.delete("/admin/products/:id", requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  await db.delete(productsTable).where(eq(productsTable.id, id));
  res.json({ ok: true });
});

export default router;
