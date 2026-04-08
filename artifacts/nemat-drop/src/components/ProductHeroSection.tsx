import { useEffect, useState, useRef, useCallback } from "react";
import { product as staticProduct } from "@/data/product";
import { useActiveProduct } from "@/hooks/useActiveProduct";

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

  if (time.done) return (
    <div className="border border-white/[0.06] rounded bg-white/[0.02] px-6 py-4 inline-flex items-center mb-8">
      <span className="text-[10px] uppercase tracking-[0.25em] text-gray-500">Deal Expired</span>
    </div>
  );

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
  const dbProduct = useActiveProduct();
  const [tcgPrice, setTcgPrice] = useState<number | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const fetchGenRef = useRef(0); // generation counter — only the latest fetch may set state

  const tcgplayerUrl = dbProduct?.tcgplayerUrl ?? null;
  const scryfallId = dbProduct?.scryfallId ?? null;
  const tcgMarketPriceCents = dbProduct?.tcgMarketPriceCents ?? null;

  const fetchPrice = useCallback(async () => {
    if (!API_URL) return;
    const gen = ++fetchGenRef.current;

    // Helper: only update state if this fetch hasn't been superseded
    const commit = (price: number) => {
      if (fetchGenRef.current === gen) setTcgPrice(price);
    };

    // 1. TCGPlayer URL → live lowest listing (preferred source)
    if (tcgplayerUrl) {
      try {
        const r = await fetch(`${API_URL}/api/tcgplayer/price`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: tcgplayerUrl }),
        });
        const d = await r.json();
        if (d.lowestPrice) { commit(parseFloat(d.lowestPrice)); return; }
      } catch {}
      // If TCGPlayer URL is set but fetch failed, fall back to stored price
      if (tcgMarketPriceCents) { commit(tcgMarketPriceCents / 100); return; }
    }

    // 2. Scryfall card price (only when no TCGPlayer URL)
    if (!tcgplayerUrl && scryfallId) {
      try {
        const r = await fetch(`${API_URL}/api/scryfall/${scryfallId}/price`);
        const d = await r.json();
        if (d.usd) { commit(parseFloat(d.usd)); return; }
      } catch {}
    }

    // 3. Stored TCG market price from DB
    if (tcgMarketPriceCents) { commit(tcgMarketPriceCents / 100); }
  }, [tcgplayerUrl, scryfallId, tcgMarketPriceCents]);

  useEffect(() => {
    if (!dbProduct) return; // wait until product is loaded
    fetchPrice();
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = setInterval(fetchPrice, 5 * 60 * 1000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [fetchPrice, dbProduct]);

  const title = dbProduct?.title ?? staticProduct.title;
  const subtitle = dbProduct?.subtitle ?? staticProduct.subtitle;
  const discountPercent = dbProduct?.discountPercent ?? staticProduct.savingsPercent;
  const tcgBest = tcgPrice
    ?? (dbProduct?.tcgMarketPriceCents ? dbProduct.tcgMarketPriceCents / 100 : null)
    ?? staticProduct.tcgBestPrice;
  const nematPrice = dbProduct
    ? (tcgPrice ? parseFloat((tcgPrice * (1 - discountPercent / 100)).toFixed(2)) : dbProduct.price / 100)
    : staticProduct.dropPrice;
  const savings = Math.round((1 - nematPrice / tcgBest) * 100);

  return (
    <section className="pb-10">
      <div className="flex items-center gap-3 mb-6">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-60"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400"></span>
        </span>
        <span className="text-[10px] uppercase tracking-[0.3em] text-gray-500">{staticProduct.status}</span>
      </div>

      <h1 className="text-3xl md:text-4xl font-bold text-white leading-tight tracking-tight mb-1">{title}</h1>
      <p className="text-base text-gray-500 uppercase tracking-[0.2em] mb-8">{subtitle}</p>

      {dbProduct?.expiresAt && <DealCountdown expiresAt={dbProduct.expiresAt} />}

      <div className="grid grid-cols-3 gap-0 border border-white/[0.06] rounded overflow-hidden mb-2">
        <div className="flex flex-col items-center py-4 px-3 border-r border-white/[0.06]">
          {dbProduct?.tcgplayerUrl ? (
            <a href={dbProduct.tcgplayerUrl} target="_blank" rel="noopener noreferrer"
              className="text-[9px] uppercase tracking-[0.2em] text-gray-600 hover:text-cyan-600 transition-colors mb-1 underline underline-offset-2">
              TCG Best ↗
            </a>
          ) : (
            <span className="text-[9px] uppercase tracking-[0.2em] text-gray-600 mb-1">TCG Best</span>
          )}
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
