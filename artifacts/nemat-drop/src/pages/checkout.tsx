import { useMemo, useState } from "react";
import { product } from "@/data/product";
import { useActiveProduct } from "@/hooks/useActiveProduct";

const API_URL = import.meta.env.VITE_API_URL ?? "";

function money(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

export default function CheckoutPage() {
  const dbProduct = useActiveProduct();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { qty, productId } = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    const parsedQty = Number(params.get("qty") ?? "1");
    const parsedPid = Number(params.get("pid") ?? "1");
    return {
      qty: Number.isFinite(parsedQty) && parsedQty > 0 ? Math.min(parsedQty, 99) : 1,
      productId: Number.isFinite(parsedPid) && parsedPid > 0 ? parsedPid : 1,
    };
  }, []);

  const unitCents = dbProduct?.price ?? product.dropPrice * 100;
  const totalCents = unitCents * qty;

  const handlePay = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/api/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, quantity: qty }),
      });
      const text = await res.text();
      let data: any;
      try { data = JSON.parse(text); } catch { throw new Error(`Server error (${res.status}): ${text.slice(0, 200)}`); }
      if (!res.ok) throw new Error(data.error ?? "Checkout failed");
      window.location.href = data.url;
    } catch (err: any) {
      setError(err.message ?? "Something went wrong");
      setLoading(false);
    }
  };

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
              <div className="text-white">{dbProduct?.title ?? product.title}</div>
              <div className="text-xs text-gray-500">Qty {qty}</div>
            </div>
            <div className="text-right">
              <div className="text-xs uppercase tracking-[0.25em] text-gray-500">Total</div>
              <div className="text-2xl font-bold text-cyan-400">{money(totalCents)}</div>
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded px-4 py-3">
              {error}
            </p>
          )}

          <button
            onClick={handlePay}
            disabled={loading}
            className="rounded bg-cyan-400 px-5 py-3 text-xs font-bold uppercase tracking-[0.25em] text-black hover:bg-cyan-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Redirecting..." : "Pay securely with Stripe"}
          </button>

          <p className="text-xs text-gray-500">
            You'll be redirected to Stripe's secure payment page.
          </p>
        </div>
      </div>
    </main>
  );
}
