import { useEffect, useState } from "react";
import { product as staticProduct } from "@/data/product";

const API_URL = import.meta.env.VITE_API_URL ?? "";

function getTimeLeft(iso: string) {
  const diff = Math.max(0, new Date(iso).getTime() - Date.now());
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  return { h, m, s, done: diff === 0 };
}

function pad(n: number) { return String(n).padStart(2, "0"); }

function DealCountdown({ expiresAt }: { expiresAt: string }) {
  const [time, setTime] = useState(() => getTimeLeft(expiresAt));
  useEffect(() => {
    const id = setInterval(() => setTime(getTimeLeft(expiresAt)), 1000);
    return () => clearInterval(id);
  }, [expiresAt]);

  if (time.done) {
    return (
      <div className="border border-white/[0.06] rounded bg-white/[0.02] px-6 py-4 inline-flex items-center mb-8">
        <span className="text-[10px] uppercase tracking-[0.25em] text-gray-500">Deal Expired</span>
      </div>
    );
  }

  return (
    <div className="border border-white/[0.06] rounded bg-white/[0.02] px-6 py-4 inline-flex flex-col items-center mb-8">
      <span className="text-[10px] uppercase tracking-[0.25em] text-gray-500 mb-3">Deal Expires In</span>
      <div className="flex items-end gap-1">
        {[{ v: time.h, l: "HRS" }, { v: time.m, l: "MIN" }, { v: time.s, l: "SEC" }].map((unit, i) => (
          <div key={unit.l} className="flex items-end">
            <div className="flex flex-col items-center">
              <span className="text-2xl md:text-3xl font-mono font-bold text-cyan-400 tracking-widest tabular-nums">{pad(unit.v)}</span>
              <span className="text-[9px] uppercase tracking-[0.2em] text-gray-500 mt-0.5">{unit.l}</span>
            </div>
            {i < 2 && <span className="text-xl font-mono text-cyan-400/60 mx-0.5 mb-4">:</span>}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ProductHeroSection() {
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [tcgPrice, setTcgPrice] = useState<number | null>(null);
  const [discountPercent, setDiscountPercent] = useState<number>(staticProduct.savingsPercent);

  useEffect(() => {
    if (!API_URL) return;
    fetch(`${API_URL}/api/products`)
      .then((r) => r.json())
      .then(async (data) => {
        if (!Array.isArray(data) || !data[0]) return;
        const p = data[0];
        if (p.expiresAt) setExpiresAt(p.expiresAt);
        if (p.discountPercent) setDiscountPercent(p.discountPercent);
        if (p.scryfallId) {
          const priceRes = await fetch(`${API_URL}/api/scryfall/${p.scryfallId}/price`);
          const priceData = await priceRes.json();
          if (priceData.usd) setTcgPrice(parseFloat(priceData.usd));
        }
      })
      .catch(() => {});
  }, []);

  const tcgBest = tcgPrice ?? staticProduct.tcgBestPrice;
  const nematPrice = tcgPrice
    ? parseFloat((tcgPrice * (1 - discountPercent / 100)).toFixed(2))
    : staticProduct.dropPrice;
  const savings = Math.round((1 - nematPrice / tcgBest) * 100);

  return (
    <section className="pb-10">
      <div className="flex items-center gap-3 mb-6">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-60"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400"></span>
        </span>
        <span className="text-[10px] uppercase tracking-[0.3em] text-gray-500">
          {staticProduct.status}
        </span>
      </div>

      <h1 className="text-3xl md:text-4xl font-bold text-white leading-tight tracking-tight mb-1">
        {staticProduct.title}
      </h1>
      <p className="text-base text-gray-500 uppercase tracking-[0.2em] mb-8">
        {staticProduct.subtitle}
      </p>

      {expiresAt && <DealCountdown expiresAt={expiresAt} />}

      <div className="grid grid-cols-3 gap-0 border border-white/[0.06] rounded overflow-hidden mb-2">
        <div className="flex flex-col items-center py-4 px-3 border-r border-white/[0.06]">
          <span className="text-[9px] uppercase tracking-[0.2em] text-gray-600 mb-1">TCG Best</span>
          <span className="text-base text-gray-500 line-through">${tcgBest.toFixed(2)}</span>
          {tcgPrice && <span className="text-[8px] text-cyan-600 mt-0.5">Live</span>}
        </div>
        <div className="flex flex-col items-center py-4 px-3 border-r border-white/[0.06] bg-cyan-400/[0.05]">
          <span className="text-[9px] uppercase tracking-[0.2em] text-cyan-400 mb-1">Today's Drop</span>
          <span className="text-xl font-bold text-cyan-400">${nematPrice.toFixed(2)}</span>
        </div>
        <div className="flex flex-col items-center py-4 px-3">
          <span className="text-[9px] uppercase tracking-[0.2em] text-gray-600 mb-1">You Save</span>
          <span className="text-base font-semibold text-cyan-400">{savings}%</span>
        </div>
      </div>
    </section>
  );
}
