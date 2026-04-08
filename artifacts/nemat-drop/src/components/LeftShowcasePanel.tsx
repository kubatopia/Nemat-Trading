import { product } from "@/data/product";

export default function LeftShowcasePanel() {
  return (
    <aside className="
      w-full md:w-[420px] md:min-w-[380px] md:max-w-[440px]
      md:sticky md:top-0 md:h-screen
      bg-black flex flex-col
      border-r border-white/[0.04]
    ">
      {/* Top bar */}
      <div className="px-8 pt-8 pb-4 flex justify-center">
        <span className="text-xs font-bold uppercase tracking-[0.4em] text-white">
          {product.brand}
        </span>
      </div>

      {/* Product image area */}
      <div className="flex-1 flex items-center justify-center px-8 relative">
        {/* Glow halo */}
        <div
          className="absolute rounded-full blur-3xl opacity-20 pointer-events-none"
          style={{
            width: "320px",
            height: "320px",
            background: "radial-gradient(circle, #22d3ee 0%, transparent 70%)",
          }}
        />
        {/* Pack image */}
        <div className="relative z-10 w-52 h-72 animate-bounce">
          <img
            src="/tmnt-booster-nobg.png"
            alt={product.title}
            className="w-full h-full object-contain drop-shadow-[0_0_30px_rgba(34,211,238,0.4)]"
          />
        </div>
      </div>

      {/* Bottom brand label */}
      <div className="px-8 pb-8 flex flex-col items-center gap-2">
        <span className="text-[10px] uppercase tracking-[0.3em] text-gray-600">
          Secure checkout powered by Stripe
        </span>
      </div>
    </aside>
  );
}
