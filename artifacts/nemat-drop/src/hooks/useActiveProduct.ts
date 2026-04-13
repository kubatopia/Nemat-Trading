import { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL ?? "";

export type DbProduct = {
  id: number;
  title: string;
  subtitle: string;
  price: number;
  imageUrl: string;
  stock: number;
  active: boolean;
  expiresAt: string | null;
  scryfallId: string | null;
  discountPercent: number;
  tcgplayerUrl: string | null;
  tcgMarketPriceCents: number | null;
  pullProbabilities: string; // JSON array
  possiblePulls: string;     // JSON array
  intelReport: string;       // plain text, paragraphs separated by \n\n
};

let cached: DbProduct | null = null;
const listeners: Array<(p: DbProduct | null) => void> = [];

function notify(p: DbProduct | null) {
  cached = p;
  listeners.forEach((fn) => fn(p));
}

async function fetchActive() {
  if (!API_URL) return;
  try {
    const res = await fetch(`${API_URL}/api/products`);
    const data = await res.json();
    notify(Array.isArray(data) && data[0] ? data[0] : null);
  } catch {
    // silently fall back to static data
  }
}

// Kick off the fetch once at module load
fetchActive();

export function useActiveProduct() {
  const [product, setProduct] = useState<DbProduct | null>(cached);

  useEffect(() => {
    listeners.push(setProduct);
    if (cached) setProduct(cached);
    return () => {
      const i = listeners.indexOf(setProduct);
      if (i !== -1) listeners.splice(i, 1);
    };
  }, []);

  return product;
}
