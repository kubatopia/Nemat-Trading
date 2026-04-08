import { useMemo } from "react";
import { product } from "@/data/product";

function money(value: number) {
  return `$${value.toFixed(2)}`;
}

export default function CheckoutPage() {
  const qty = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    const parsed = Number(params.get("qty") ?? "1");
    return Number.isFinite(parsed) && parsed > 0 ? Math.min(parsed, 99) : 1;
  }, []);

  const total = product.dropPrice * qty;

  return (
    <main className="min-h-screen bg-black text-white px-6 py-10">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6 text-[10px] uppercase tracking-[0.3em] text-gray-500">Secure Checkout</div>
        <h1 className="text-3xl font-semibold mb-2">Complete your order</h1>
        <p className="text-sm text-gray-400 mb-8">Protected checkout powered by Stripe. Your payment details are processed securely.</p>

        <div className="grid gap-4 rounded border border-white/10 bg-white/[0.03] p-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <div className="text-xs uppercase tracking-[0.25em] text-gray-500">Item</div>
              <div className="text-white">{product.title}</div>
              <div className="text-xs text-gray-500">Qty {qty}</div>
            </div>
            <div className="text-right">
              <div className="text-xs uppercase tracking-[0.25em] text-gray-500">Total</div>
              <div className="text-2xl font-bold text-cyan-400">{money(total)}</div>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <input className="rounded border border-white/10 bg-black px-4 py-3 text-sm" placeholder="Email address" />
            <input className="rounded border border-white/10 bg-black px-4 py-3 text-sm" placeholder="Shipping country" />
          </div>

          <button className="rounded bg-cyan-400 px-5 py-3 text-xs font-bold uppercase tracking-[0.25em] text-black hover:bg-cyan-300 transition-colors">
            Pay securely with Stripe
          </button>

          <p className="text-xs text-gray-500">
            This is an internal secure checkout screen. To accept live payments, connect a Stripe Checkout session on the server.
          </p>
        </div>
      </div>
    </main>
  );
}
