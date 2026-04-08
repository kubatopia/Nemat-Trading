import { useState } from "react";
import QuantitySelector from "./QuantitySelector";
import { product } from "@/data/product";

export default function PurchaseBar() {
  const [quantity, setQuantity] = useState(1);
  const total = (product.dropPrice * quantity).toFixed(2);

  const handleAcquire = () => {
    window.location.assign(`/checkout?qty=${quantity}`);
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
          className="flex-shrink-0 px-8 py-3 bg-cyan-400 text-black text-xs font-bold uppercase tracking-[0.25em] rounded hover:bg-cyan-300 hover:shadow-[0_0_20px_rgba(34,211,238,0.25)] active:bg-cyan-500 transition-all duration-200"
          aria-label="Acquire product"
        >
          Acquire
        </button>
      </div>
    </div>
  );
}
