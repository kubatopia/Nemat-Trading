
import CountdownTimer from "./CountdownTimer";
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
        {/* Brand wordmark — swap NEMAT text here */}
        <span className="text-xs font-bold uppercase tracking-[0.4em] text-white">
          {product.brand}
        </span>
      </div>

      {/* Product image area */}
      <div className="flex-1 flex items-center justify-center px-8 relative">
        {/* Glow halo — swap color or intensity here */}
        <div
          className="absolute rounded-full blur-3xl opacity-20 pointer-events-none"
          style={{
            width: "320px",
            height: "320px",
            background: "radial-gradient(circle, #22d3ee 0%, transparent 70%)",
          }}
        />
        {/* Pack image — swap src for real product image */}
        <div className="relative z-10 w-52 h-72 animate-bounce">
          <img
            src="/tmnt-booster-nobg.png"
            alt="Teenage Mutant Ninja Turtles Magic: The Gathering Collector Booster Pack"
            className="w-full h-full object-contain drop-shadow-[0_0_30px_rgba(34,211,238,0.4)]"
          />
        </div>
      </div>

      {/* Countdown + gated button */}
      <div className="px-8 pb-8 flex flex-col items-center gap-6">
        <CountdownTimer
          targetIso={product.revealCountdownAt}
          label="Next Drop Reveals In"
          size="lg"
        />

        {/* Blurred/disabled gated action area */}
        <div className="w-full relative">
          <div className="w-full h-12 bg-white/[0.03] border border-white/[0.06] rounded flex items-center justify-center select-none">
            <span className="text-[10px] uppercase tracking-[0.3em] text-gray-700">
              Members Only Access
            </span>
          </div>
          <div className="absolute inset-0 rounded backdrop-blur-[2px] bg-black/40 flex items-center justify-center cursor-not-allowed">
            <span className="text-[9px] uppercase tracking-[0.25em] text-gray-600 flex items-center gap-2">
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <rect x="2" y="4.5" width="6" height="5" rx="0.5" stroke="#6b7280" strokeWidth="1"/>
                <path d="M3.5 4.5V3.5C3.5 2.4 4.4 1.5 5.5 1.5C6.6 1.5 7.5 2.4 7.5 3.5V4.5" stroke="#6b7280" strokeWidth="1"/>
              </svg>
              Private Drop
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}
