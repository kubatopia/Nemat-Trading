import { Router, type IRouter } from "express";
import Stripe from "stripe";

const router: IRouter = Router();

const stripeSecretKey = process.env["STRIPE_SECRET_KEY"];
const stripePriceId = process.env["STRIPE_PRICE_ID"];

if (!stripeSecretKey) {
  throw new Error("STRIPE_SECRET_KEY must be set.");
}

if (!stripePriceId) {
  throw new Error("STRIPE_PRICE_ID must be set.");
}

const stripe = new Stripe(stripeSecretKey, {
  apiVersion: "2025-07-30.basil",
});

router.post("/checkout/session", async (req, res) => {
  const quantity = Math.max(1, Math.min(Number(req.body?.quantity ?? 1) || 1, 99));
  const origin = `${req.protocol}://${req.get("host")}`;

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [{ price: stripePriceId, quantity }],
    success_url: `${origin}/?checkout=success`,
    cancel_url: `${origin}/?checkout=cancel`,
  });

  res.json({ url: session.url });
});

export default router;
