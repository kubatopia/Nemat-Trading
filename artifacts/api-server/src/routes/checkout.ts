import { Router } from "express";
import Stripe from "stripe";
import { db, productsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

router.post("/checkout", async (req, res) => {
  console.log("[checkout] body:", JSON.stringify(req.body));
  const { productId, quantity } = req.body as { productId: number; quantity: number };

  if (!productId || !quantity || quantity < 1) {
    res.status(400).json({ error: `productId and quantity are required (got productId=${productId}, quantity=${quantity})` });
    return;
  }

  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeKey) {
    res.status(500).json({ error: "Stripe not configured" });
    return;
  }

  const [product] = await db
    .select()
    .from(productsTable)
    .where(eq(productsTable.id, productId));

  if (!product) {
    res.status(404).json({ error: "Product not found" });
    return;
  }

  const stripe = new Stripe(stripeKey);
  const frontendUrl = process.env.FRONTEND_URL ?? "http://localhost:5173";

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [
      {
        quantity,
        price_data: {
          currency: "usd",
          unit_amount: product.price, // already in cents
          product_data: {
            name: product.title,
            description: product.subtitle || undefined,
            images: product.imageUrl ? [product.imageUrl] : undefined,
          },
        },
      },
    ],
    success_url: `${frontendUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${frontendUrl}/checkout?qty=${quantity}`,
  });

  res.json({ url: session.url });
});

export default router;
