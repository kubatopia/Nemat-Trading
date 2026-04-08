import { useState } from "react";
import QuantitySelector from "./QuantitySelector";
import { product } from "@/data/product";

const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
const stripePriceId = import.meta.env.VITE_STRIPE_PRICE_ID;

export default function PurchaseBar() {
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const total = (product.dropPrice * quantity).toFixed(2);

  const handleAcquire = async () => {
    if (!stripePublishableKey || !stripePriceId) {
      window.location.assign(`/checkout?qty=${quantity}`);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `https://api.stripe.com/v1/checkout/sessions?price=${encodeURIComponent(stripePriceId)}&quantity=${quantity}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${stripePublishableKey}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error("Failed to create checkout session");
      }

      const data = await response.json();
      if (data?.url) {
        window.location.assign(data.url);
        return;
      }

      window.location.assign(`/checkout?qty=${quantity}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="sticky bottom-0 z-10 border-t border-white/10 bg-[#0d0d0d]/95 backdrop-blur-sm py-4 px-0">
      <div className="flex items-center gap-4">
        <QuantitySelector quantity={quantity} onChange={setQuantity} />
        <div className="flex-1 text-right">
          <span className="text-xs text-gray-500 uppercase tracking-wider mr-2">Total</span>
          <span className="text-lg font-bold text-white">${total}</span>
        </div>
        <button
          onClick={handleAcquire}
          disabled={loading}
          className="flex-shrink-0 px-8 py-3 bg-cyan-400 text-black text-xs font-bold uppercase tracking-[0.25em] rounded hover:bg-cyan-300 hover:shadow-[0_0_20px_rgba(34,211,238,0.25)] active:bg-cyan-500 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
          aria-label="Acquire product"
        >
          {loading ? "Redirecting..." : "Acquire"}
        </button>
      </div>
    </div>
  );
}
