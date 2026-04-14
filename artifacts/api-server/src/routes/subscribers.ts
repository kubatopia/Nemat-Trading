import { Router } from "express";
import { db, subscribersTable } from "@workspace/db";

const router = Router();

// Public: subscribe
router.post("/subscribe", async (req, res) => {
  const { email } = req.body;
  if (!email || typeof email !== "string" || !email.includes("@")) {
    res.status(400).json({ error: "Invalid email" });
    return;
  }
  try {
    await db
      .insert(subscribersTable)
      .values({ email: email.trim().toLowerCase() })
      .onConflictDoNothing();
    res.json({ ok: true });
  } catch {
    res.status(500).json({ error: "Failed to subscribe" });
  }
});

// Admin middleware (reused from products)
function requireAdmin(req: any, res: any, next: any) {
  const key = req.headers["x-admin-key"];
  if (!process.env.ADMIN_SECRET || key !== process.env.ADMIN_SECRET) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  next();
}

// Admin: list all subscribers
router.get("/admin/subscribers", requireAdmin, async (_req, res) => {
  const rows = await db
    .select()
    .from(subscribersTable)
    .orderBy(subscribersTable.subscribedAt);
  res.json(rows);
});

export default router;
