
import CountdownTimer from "./CountdownTimer";
import { product } from "@/data/product";

export default function ProductHeroSection() {
  return (
    <section className="pb-10">
      {/* Status line */}
      <div className="flex items-center gap-3 mb-6">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-60"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400"></span>
        </span>
        <span className="text-[10px] uppercase tracking-[0.3em] text-gray-500">
          {product.status}
        </span>
      </div>

      {/* Product title — swap product name here */}
      <h1 className="text-3xl md:text-4xl font-bold text-white leading-tight tracking-tight mb-1">
        {product.title}
      </h1>
      <p className="text-base text-gray-500 uppercase tracking-[0.2em] mb-8">
        {product.subtitle}
      </p>

      {/* Deal expires countdown */}
      <div className="border border-white/[0.06] rounded bg-white/[0.02] px-6 py-4 inline-flex flex-col items-center mb-8">
        <CountdownTimer
          targetIso={product.dropExpiresAt}
          label="Deal Expires"
          size="sm"
        />
      </div>

      {/* Price row */}
      <div className="grid grid-cols-3 gap-0 border border-white/[0.06] rounded overflow-hidden mb-2">
        {/* TCG Best */}
        <div className="flex flex-col items-center py-4 px-3 border-r border-white/[0.06]">
          <span className="text-[9px] uppercase tracking-[0.2em] text-gray-600 mb-1">TCG Best</span>
          <span className="text-base text-gray-500 line-through">${product.tcgBestPrice.toFixed(2)}</span>
        </div>
        {/* Today's Drop */}
        <div className="flex flex-col items-center py-4 px-3 border-r border-white/[0.06] bg-cyan-400/[0.05]">
          <span className="text-[9px] uppercase tracking-[0.2em] text-cyan-400 mb-1">Today's Drop</span>
          <span className="text-xl font-bold text-cyan-400">${product.dropPrice}</span>
        </div>
        {/* You Save */}
        <div className="flex flex-col items-center py-4 px-3">
          <span className="text-[9px] uppercase tracking-[0.2em] text-gray-600 mb-1">You Save</span>
          <span className="text-base font-semibold text-cyan-400">{product.savingsPercent}%</span>
        </div>
      </div>
    </section>
  );
}
