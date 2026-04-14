import { useEffect, useState } from "react";
import { product } from "@/data/product";
import { useActiveProduct } from "@/hooks/useActiveProduct";

function getTimeLeft(iso: string) {
  const diff = Math.max(0, new Date(iso).getTime() - Date.now());
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  return { h, m, s, done: diff === 0 };
}
function pad(n: number) { return String(n).padStart(2, "0"); }

function SideCountdown({ expiresAt }: { expiresAt: string }) {
  const [time, setTime] = useState(() => getTimeLeft(expiresAt));
  useEffect(() => {
    const id = setInterval(() => setTime(getTimeLeft(expiresAt)), 1000);
    return () => clearInterval(id);
  }, [expiresAt]);

  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-[10px] uppercase tracking-[0.25em] text-gray-500 mb-1">
        {time.done ? "Deal Expired" : "Deal Expires In"}
      </span>
      {!time.done && (
        <div className="flex items-end gap-0.5">
          {[{ v: time.h, l: "HRS" }, { v: time.m, l: "MIN" }, { v: time.s, l: "SEC" }].map((unit, i) => (
            <div key={unit.l} className="flex items-end">
              <div className="flex flex-col items-center">
                <span className="text-4xl md:text-5xl font-mono font-bold text-cyan-400 tracking-widest tabular-nums">
                  {pad(unit.v)}
                </span>
                <span className="text-[10px] uppercase tracking-[0.2em] text-gray-500 mt-1">{unit.l}</span>
              </div>
              {i < 2 && <span className="text-3xl md:text-4xl font-mono text-cyan-400/60 mx-1 mb-4">:</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function LeftShowcasePanel() {
  const dbProduct = useActiveProduct();

  return (
    <aside className="
      w-full md:w-[560px] md:min-w-[500px] md:max-w-[580px]
      md:sticky md:top-0 md:h-screen
      bg-black flex flex-col
      border-r border-white/[0.04]
    ">
      {/* Top bar */}
      <div className="px-8 pt-8 pb-4 flex justify-center items-center gap-2 flex-shrink-0">
        <img src="/wizard.png" alt="Nemat" className="w-6 h-6 object-contain opacity-90" />
        <span className="text-xs font-bold uppercase tracking-[0.4em] text-white">
          {product.brand}
        </span>
      </div>

      {/* Product image — fills all space between header and countdown */}
      <div className="flex-1 relative min-h-0 px-10 py-4">
        {/* Glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(circle at 50% 50%, rgba(34,211,238,0.12) 0%, transparent 70%)" }}
        />
        <div className="relative z-10 w-full h-full animate-bounce">
          <img
            src={dbProduct?.imageUrl || "/tmnt-booster-nobg.png"}
            alt={dbProduct?.title ?? product.title}
            className="w-full h-full object-contain drop-shadow-[0_0_30px_rgba(34,211,238,0.4)]"
          />
        </div>
      </div>

      {/* Bottom: countdown */}
      <div className="px-8 pb-8 pt-4 flex flex-col items-center gap-4 flex-shrink-0">
        {dbProduct?.expiresAt ? (
          <SideCountdown expiresAt={dbProduct.expiresAt} />
        ) : (
          <span className="text-[10px] uppercase tracking-[0.3em] text-gray-600">
            Secure checkout powered by Stripe
          </span>
        )}
      </div>
    </aside>
  );
}
