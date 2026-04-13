import { useState, useEffect, useRef, useCallback } from "react";

const API_URL = import.meta.env.VITE_API_URL ?? "";
const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD ?? "";

type Product = {
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
  createdAt: string;
};

type View = "list" | "new" | "edit";

function sku(id: number) {
  return `NMT-${String(id).padStart(3, "0")}`;
}

function priceDisplay(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

function toDatetimeLocal(iso: string | null) {
  if (!iso) return "";
  return new Date(iso).toISOString().slice(0, 16);
}

function StatusBadge({ product }: { product: Product }) {
  if (!product.active) return <span className="text-[10px] uppercase tracking-[0.15em] text-gray-600 border border-white/10 px-2 py-0.5 rounded">Hidden</span>;
  if (product.expiresAt && new Date(product.expiresAt) < new Date()) return <span className="text-[10px] uppercase tracking-[0.15em] text-red-400 border border-red-400/20 px-2 py-0.5 rounded">Expired</span>;
  return <span className="text-[10px] uppercase tracking-[0.15em] text-cyan-400 border border-cyan-400/20 px-2 py-0.5 rounded">Live</span>;
}

// ─── Product List ─────────────────────────────────────────────────────────────

function ProductList({ adminKey, onEdit, onNew }: {
  adminKey: string;
  onEdit: (p: Product) => void;
  onNew: () => void;
}) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setLoadError(null);
    try {
      const res = await fetch(`${API_URL}/api/admin/products`, { headers: { "x-admin-key": adminKey } });
      if (!res.ok) throw new Error(`API returned ${res.status}`);
      const data = await res.json();
      const sorted = [...data].sort((a: Product, b: Product) => {
        if (a.expiresAt && b.expiresAt) return new Date(a.expiresAt).getTime() - new Date(b.expiresAt).getTime();
        if (a.expiresAt) return -1;
        if (b.expiresAt) return 1;
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      });
      setProducts(sorted);
    } catch (err: any) {
      setLoadError(err.message ?? "Failed to load products");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="text-[10px] uppercase tracking-[0.3em] text-gray-500 mb-1">Nemat Trading</div>
          <h1 className="text-2xl font-bold text-white">Products</h1>
        </div>
        <div className="flex items-center gap-4">
          <a href="/" className="text-xs text-gray-500 hover:text-white transition-colors">← Storefront</a>
          <button
            onClick={onNew}
            className="rounded bg-cyan-400 px-5 py-2.5 text-xs font-bold uppercase tracking-[0.2em] text-black hover:bg-cyan-300 transition-colors"
          >
            + New Product
          </button>
        </div>
      </div>

      {loading && <p className="text-gray-600 text-sm text-center py-12">Loading...</p>}
      {loadError && (
        <div className="text-center py-12 border border-red-400/20 rounded">
          <p className="text-red-400 text-sm mb-2">Could not connect to API</p>
          <p className="text-gray-600 text-xs font-mono">{API_URL}/api/admin/products</p>
          <p className="text-gray-600 text-xs mt-1">{loadError}</p>
          <button onClick={load} className="mt-4 text-xs text-cyan-400 hover:text-cyan-300 transition-colors">Retry</button>
        </div>
      )}

      {!loading && products.length === 0 && (
        <div className="text-center py-16 border border-white/[0.06] rounded">
          <p className="text-gray-600 text-sm mb-4">No products yet.</p>
          <button onClick={onNew} className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors">+ Add your first product</button>
        </div>
      )}

      {!loading && products.length > 0 && (
        <div className="border border-white/[0.06] rounded overflow-hidden">
          {/* Table header */}
          <div className="grid grid-cols-[2fr_1fr_1fr_1fr_auto] gap-4 px-5 py-3 border-b border-white/[0.06] bg-white/[0.02]">
            <span className="text-[10px] uppercase tracking-[0.2em] text-gray-600">Product</span>
            <span className="text-[10px] uppercase tracking-[0.2em] text-gray-600">SKU</span>
            <span className="text-[10px] uppercase tracking-[0.2em] text-gray-600">Price</span>
            <span className="text-[10px] uppercase tracking-[0.2em] text-gray-600">Expiry</span>
            <span className="text-[10px] uppercase tracking-[0.2em] text-gray-600">Status</span>
          </div>

          {products.map((p, i) => (
            <button
              key={p.id}
              onClick={() => onEdit(p)}
              className={`w-full grid grid-cols-[2fr_1fr_1fr_1fr_auto] gap-4 px-5 py-4 text-left hover:bg-white/[0.03] transition-colors ${i < products.length - 1 ? "border-b border-white/[0.04]" : ""}`}
            >
              <div className="flex items-center gap-3 min-w-0">
                {p.imageUrl && (
                  <img src={p.imageUrl} alt={p.title} className="w-8 h-8 object-contain flex-shrink-0 rounded opacity-80" />
                )}
                <div className="min-w-0">
                  <div className="text-sm font-medium text-white truncate">{p.title}</div>
                  {p.subtitle && <div className="text-xs text-gray-600 truncate">{p.subtitle}</div>}
                </div>
              </div>
              <div className="flex items-center">
                <span className="text-xs text-gray-500 font-mono">{sku(p.id)}</span>
              </div>
              <div className="flex items-center">
                <span className="text-sm text-white">{priceDisplay(p.price)}</span>
              </div>
              <div className="flex items-center">
                <span className="text-xs text-gray-500">
                  {p.expiresAt ? new Date(p.expiresAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—"}
                </span>
              </div>
              <div className="flex items-center">
                <StatusBadge product={p} />
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Product Form (New / Edit) ────────────────────────────────────────────────

type LookupResult = {
  type: "set" | "card";
  suggestedTitle: string;
  setName?: string;
  setCode?: string;
  scryfallId: string | null;
  imageUrl: string | null;
  usd: string | null;
  topCards: { id: string; name: string; imageUrl: string | null; usd: string | null }[];
};

const emptyForm = {
  title: "", subtitle: "", tcgplayerUrl: "", imageUrl: "",
  price: "", stock: "", expiresAt: "",
  scryfallId: "", discountPercent: "15",
};

const CLOUDINARY_CLOUD = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME ?? "";
const CLOUDINARY_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET ?? "";

// ─── Image Field ──────────────────────────────────────────────────────────────

function ImageField({ value, onChange }: {
  value: string;
  onChange: (url: string) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleFile = useCallback(async (file: File) => {
    if (!CLOUDINARY_CLOUD || !CLOUDINARY_PRESET) {
      setUploadError("Cloudinary env vars not set (VITE_CLOUDINARY_CLOUD_NAME, VITE_CLOUDINARY_UPLOAD_PRESET)");
      return;
    }
    setUploading(true);
    setUploadError(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("upload_preset", CLOUDINARY_PRESET);
      const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD}/image/upload`, {
        method: "POST",
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message ?? "Upload failed");
      onChange(data.secure_url);
    } catch (err: any) {
      setUploadError(err.message ?? "Upload failed");
    } finally {
      setUploading(false);
    }
  }, [onChange]);

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file?.type.startsWith("image/")) handleFile(file);
  }

  return (
    <div>
      <label className="text-[10px] uppercase tracking-[0.2em] text-gray-600 block mb-1.5">Image</label>
      <div className="flex gap-3 items-start">
        {/* Preview */}
        {value && (
          <div className="flex-shrink-0 w-16 h-16 rounded border border-white/10 overflow-hidden bg-white/[0.02] flex items-center justify-center">
            <img src={value} alt="Product" className="w-full h-full object-contain" />
          </div>
        )}
        <div className="flex-1 flex flex-col gap-2">
          {/* Drop zone / upload button */}
          <div
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            className="flex items-center gap-2 rounded border border-dashed border-white/20 px-4 py-3 hover:border-cyan-400/40 transition-colors cursor-pointer"
            onClick={() => fileRef.current?.click()}
          >
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ""; }}
            />
            {uploading ? (
              <span className="text-xs text-cyan-400">Uploading...</span>
            ) : (
              <>
                <span className="text-xs text-gray-400">Upload image</span>
                <span className="text-[10px] text-gray-600">or drag & drop</span>
              </>
            )}
          </div>
          {/* URL input — still editable for TCGPlayer auto-fill or manual paste */}
          <input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Or paste URL (auto-filled by Look Up)"
            className="w-full rounded border border-white/10 bg-black px-4 py-2.5 text-xs text-gray-400 focus:outline-none focus:border-cyan-400/40"
          />
        </div>
      </div>
      {uploadError && <p className="text-[10px] text-red-400 mt-1">{uploadError}</p>}
    </div>
  );
}

// ─── Product Form (New / Edit) ────────────────────────────────────────────────

function ProductForm({ adminKey, product, onBack, onSaved }: {
  adminKey: string;
  product: Product | null;
  onBack: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState(product ? {
    title: product.title,
    subtitle: product.subtitle,
    tcgplayerUrl: product.tcgplayerUrl ?? "",
    imageUrl: product.imageUrl,
    price: (product.price / 100).toFixed(2),
    stock: String(product.stock),
    expiresAt: toDatetimeLocal(product.expiresAt),
    scryfallId: product.scryfallId ?? "",
    discountPercent: String(product.discountPercent ?? 15),
  } : emptyForm);

  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupResult, setLookupResult] = useState<LookupResult | null>(null);
  const [lookupError, setLookupError] = useState<string | null>(null);
  // TCG market price used as reference for auto-calculating discount %
  const [tcgMarketPrice, setTcgMarketPrice] = useState(
    product?.tcgMarketPriceCents ? (product.tcgMarketPriceCents / 100).toFixed(2) : ""
  );
  const discountManuallyEdited = useRef(false);

  const isEdit = !!product;

  // Auto-calculate discount % from Nemat price and TCG market price
  useEffect(() => {
    if (discountManuallyEdited.current) return;
    const nemat = parseFloat(form.price);
    const tcg = parseFloat(tcgMarketPrice);
    if (nemat > 0 && tcg > 0 && tcg >= nemat) {
      const computed = ((1 - nemat / tcg) * 100).toFixed(2);
      setForm((f) => ({ ...f, discountPercent: computed }));
    }
  }, [form.price, tcgMarketPrice]);

  async function handleLookup() {
    const url = form.tcgplayerUrl.trim();
    if (!url) return;
    setLookupLoading(true);
    setLookupError(null);
    setLookupResult(null);
    discountManuallyEdited.current = false;
    try {
      const res = await fetch(`${API_URL}/api/lookup/tcgplayer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      if (!res.ok) { setLookupError(data.error ?? "Lookup failed"); return; }
      setLookupResult(data as LookupResult);
      // Auto-fill from result — always update image and price from lookup
      setForm((f) => ({
        ...f,
        title: f.title || data.suggestedTitle || f.title,
        scryfallId: data.scryfallId ?? f.scryfallId,
        imageUrl: data.imageUrl || f.imageUrl,  // lookup wins for image
      }));
      if (data.usd) setTcgMarketPrice(data.usd);
    } catch (err: any) {
      setLookupError(err.message ?? "Lookup failed");
    } finally {
      setLookupLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const body = {
      title: form.title,
      subtitle: form.subtitle,
      price: Math.round(parseFloat(form.price) * 100),
      imageUrl: form.imageUrl,
      stock: parseInt(form.stock, 10) || 0,
      expiresAt: form.expiresAt ? new Date(form.expiresAt).toISOString() : null,
      scryfallId: form.scryfallId,
      discountPercent: parseInt(form.discountPercent, 10) || 15,
      tcgplayerUrl: form.tcgplayerUrl,
      tcgMarketPriceCents: tcgMarketPrice ? Math.round(parseFloat(tcgMarketPrice) * 100) : null,
    };
    try {
      const url = isEdit ? `${API_URL}/api/admin/products/${product.id}` : `${API_URL}/api/admin/products`;
      const res = await fetch(url, {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json", "x-admin-key": adminKey },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Failed to save");
      onSaved();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!product || !confirm(`Delete "${product.title}"?`)) return;
    setDeleting(true);
    await fetch(`${API_URL}/api/admin/products/${product.id}`, {
      method: "DELETE",
      headers: { "x-admin-key": adminKey },
    });
    onSaved();
  }

  async function toggleActive() {
    if (!product) return;
    await fetch(`${API_URL}/api/admin/products/${product.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", "x-admin-key": adminKey },
      body: JSON.stringify({ active: !product.active }),
    });
    onSaved();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <button onClick={onBack} className="text-xs text-gray-500 hover:text-white transition-colors mb-2 block">← Products</button>
          <h1 className="text-2xl font-bold text-white">{isEdit ? product.title : "New Product"}</h1>
          {isEdit && <p className="text-xs text-gray-600 font-mono mt-1">{sku(product.id)}</p>}
        </div>
        {isEdit && (
          <div className="flex items-center gap-3">
            <button
              onClick={toggleActive}
              className={`text-xs px-4 py-2 rounded border transition-colors ${product.active ? "border-red-400/30 text-red-400 hover:bg-red-400/10" : "border-cyan-400/30 text-cyan-400 hover:bg-cyan-400/10"}`}
            >
              {product.active ? "Take Offline" : "Go Live"}
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="text-xs px-4 py-2 rounded border border-white/10 text-gray-500 hover:text-red-400 hover:border-red-400/30 transition-colors"
            >
              {deleting ? "Deleting..." : "Delete"}
            </button>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="grid gap-6">
        {/* Basic Info */}
        <section className="border border-white/[0.06] rounded bg-white/[0.02] p-6">
          <h2 className="text-[10px] uppercase tracking-[0.25em] text-gray-500 mb-5">Basic Info</h2>
          <div className="grid gap-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] uppercase tracking-[0.2em] text-gray-600 block mb-1.5">Title</label>
                <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Product name"
                  className="w-full rounded border border-white/10 bg-black px-4 py-3 text-sm focus:outline-none focus:border-cyan-400/40" />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-[0.2em] text-gray-600 block mb-1.5">Subtitle</label>
                <input value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                  placeholder="e.g. Collector Booster Pack"
                  className="w-full rounded border border-white/10 bg-black px-4 py-3 text-sm focus:outline-none focus:border-cyan-400/40" />
              </div>
            </div>

            {/* TCGPlayer URL — auto-fills title, image, and TCG market price */}
            <div>
              <label className="text-[10px] uppercase tracking-[0.2em] text-gray-600 block mb-1.5">TCGPlayer URL</label>
              <div className="flex gap-2">
                <input value={form.tcgplayerUrl}
                  onChange={(e) => { setForm({ ...form, tcgplayerUrl: e.target.value }); setLookupResult(null); setLookupError(null); }}
                  placeholder="https://www.tcgplayer.com/product/..."
                  className="flex-1 rounded border border-white/10 bg-black px-4 py-3 text-sm focus:outline-none focus:border-cyan-400/40" />
                <button type="button" onClick={handleLookup} disabled={lookupLoading || !form.tcgplayerUrl.trim()}
                  className="rounded border border-cyan-400/30 px-5 py-2 text-xs text-cyan-400 hover:bg-cyan-400/10 transition-colors disabled:opacity-40 whitespace-nowrap">
                  {lookupLoading ? "Looking up..." : "Look Up"}
                </button>
              </div>
              <p className="text-[10px] text-gray-600 mt-1.5">Auto-fills title, image, and TCG market price. "TCG Best" on storefront links here.</p>
            </div>

            {lookupError && <p className="text-xs text-red-400">{lookupError}</p>}

            {lookupResult && (
              <div className="border border-white/[0.06] rounded p-4 bg-black/30">
                {lookupResult.type === "set" ? (
                  <>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-[10px] uppercase tracking-[0.2em] text-cyan-400">Set Found</span>
                      <span className="text-sm text-white font-medium">{lookupResult.setName}</span>
                      <span className="text-[10px] text-gray-600 font-mono uppercase">{lookupResult.setCode}</span>
                    </div>
                    <p className="text-[10px] text-gray-500 mb-3">Top cards by price shown as possible pulls on storefront:</p>
                    <div className="flex flex-wrap gap-2">
                      {lookupResult.topCards.slice(0, 8).map((c) => (
                        <div key={c.id} className="flex flex-col items-center gap-1 w-16">
                          {c.imageUrl && <img src={c.imageUrl} alt={c.name} className="w-16 rounded opacity-90" />}
                          {c.usd && <span className="text-[9px] text-cyan-400">${c.usd}</span>}
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="flex items-center gap-3">
                    {lookupResult.imageUrl && <img src={lookupResult.imageUrl} alt={lookupResult.suggestedTitle} className="w-12 rounded" />}
                    <div>
                      <p className="text-sm text-white font-medium">{lookupResult.suggestedTitle}</p>
                      {lookupResult.usd && <p className="text-xs text-cyan-400 mt-0.5">TCG Market: ${lookupResult.usd}</p>}
                    </div>
                  </div>
                )}
              </div>
            )}

            <ImageField
              value={form.imageUrl}
              onChange={(url) => setForm((f) => ({ ...f, imageUrl: url }))}
            />
          </div>
        </section>

        {/* Pricing */}
        <section className="border border-white/[0.06] rounded bg-white/[0.02] p-6">
          <h2 className="text-[10px] uppercase tracking-[0.25em] text-gray-500 mb-5">Pricing & Stock</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="text-[10px] uppercase tracking-[0.2em] text-gray-600 block mb-1.5">Nemat Price</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm">$</span>
                <input required type="number" step="0.01" min="0" value={form.price}
                  onChange={(e) => { discountManuallyEdited.current = false; setForm({ ...form, price: e.target.value }); }}
                  placeholder="32.00"
                  className="w-full rounded border border-white/10 bg-black pl-8 pr-4 py-3 text-sm focus:outline-none focus:border-cyan-400/40" />
              </div>
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-[0.2em] text-gray-600 block mb-1.5">Stock</label>
              <input type="number" min="0" value={form.stock}
                onChange={(e) => setForm({ ...form, stock: e.target.value })}
                placeholder="0"
                className="w-full rounded border border-white/10 bg-black px-4 py-3 text-sm focus:outline-none focus:border-cyan-400/40" />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-[0.2em] text-gray-600 block mb-1.5">
                Discount %
                {tcgMarketPrice && form.price
                  ? <span className="text-gray-700 ml-1 normal-case">(auto)</span>
                  : <span className="text-gray-700 ml-1 normal-case">(manual)</span>}
              </label>
              <div className="relative">
                <input type="number" min="0" max="100" step="0.01"
                  value={form.discountPercent}
                  onChange={(e) => { discountManuallyEdited.current = true; setForm({ ...form, discountPercent: e.target.value }); }}
                  className={`w-full rounded border bg-black px-4 py-3 text-sm focus:outline-none focus:border-cyan-400/40 ${tcgMarketPrice && form.price ? "border-cyan-400/30 text-cyan-400" : "border-white/10"}`} />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm">%</span>
              </div>
              {tcgMarketPrice && form.price && (
                <p className="text-[10px] text-gray-600 mt-1">
                  {form.discountPercent}% off ${parseFloat(tcgMarketPrice).toFixed(2)} TCG
                </p>
              )}
            </div>
          </div>
        </section>

        {/* Availability */}
        <section className="border border-white/[0.06] rounded bg-white/[0.02] p-6">
          <h2 className="text-[10px] uppercase tracking-[0.25em] text-gray-500 mb-5">Availability</h2>
          <div>
            <label className="text-[10px] uppercase tracking-[0.2em] text-gray-600 block mb-1.5">Deal Expires At</label>
            <input type="datetime-local" value={form.expiresAt}
              onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
              className="w-full rounded border border-white/10 bg-black px-4 py-3 text-sm focus:outline-none focus:border-cyan-400/40 text-white [color-scheme:dark]" />
            <p className="text-[10px] text-gray-600 mt-2">When set, a live countdown timer appears on the storefront.</p>
          </div>
        </section>

        {/* TCG Reference */}
        <section className="border border-white/[0.06] rounded bg-white/[0.02] p-6">
          <h2 className="text-[10px] uppercase tracking-[0.25em] text-gray-500 mb-5">TCG Reference</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] uppercase tracking-[0.2em] text-gray-600 block mb-1.5">
                TCG Market Price <span className="text-gray-700 normal-case">(for discount calc)</span>
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm">$</span>
                <input type="number" step="0.01" min="0" value={tcgMarketPrice}
                  onChange={(e) => { discountManuallyEdited.current = false; setTcgMarketPrice(e.target.value); }}
                  placeholder="Auto-filled from Look Up"
                  className="w-full rounded border border-white/10 bg-black pl-8 pr-4 py-3 text-sm focus:outline-none focus:border-cyan-400/40" />
              </div>
              <p className="text-[10px] text-gray-600 mt-1">
                Auto-filled from Look Up. For packs, enter the TCGPlayer lowest price if not detected.
                Storefront price refreshes every 5 min via TCGPlayer URL.
              </p>
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-[0.2em] text-gray-600 block mb-1.5">Scryfall Card ID <span className="text-gray-700 normal-case">(individual cards)</span></label>
              <input value={form.scryfallId}
                onChange={(e) => setForm({ ...form, scryfallId: e.target.value })}
                placeholder="Auto-filled or paste manually"
                className="w-full rounded border border-white/10 bg-black px-4 py-3 text-sm focus:outline-none focus:border-cyan-400/40 font-mono" />
              <p className="text-[10px] text-gray-600 mt-1">scryfall.com/card/.../&lt;id&gt; — fallback for live price on single-card products.</p>
            </div>
          </div>
        </section>

        {error && <p className="text-sm text-red-400">{error}</p>}

        <div className="flex gap-3">
          <button type="submit" disabled={loading}
            className="rounded bg-cyan-400 px-8 py-3 text-xs font-bold uppercase tracking-[0.2em] text-black hover:bg-cyan-300 transition-colors disabled:opacity-50">
            {loading ? "Saving..." : isEdit ? "Save Changes" : "Create Product"}
          </button>
          <button type="button" onClick={onBack}
            className="rounded border border-white/10 px-6 py-3 text-xs font-bold uppercase tracking-[0.2em] text-gray-400 hover:text-white transition-colors">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

// ─── Root Admin ───────────────────────────────────────────────────────────────

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [view, setView] = useState<View>("list");
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const adminKey = ADMIN_PASSWORD;

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) { setAuthed(true); }
    else { setLoginError("Incorrect password"); }
  }

  if (!authed) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center px-6">
        <div className="w-full max-w-sm">
          <div className="text-[10px] uppercase tracking-[0.3em] text-gray-500 mb-2">Nemat Trading</div>
          <h1 className="text-2xl font-bold mb-8">Admin Access</h1>
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <input type="password" placeholder="Password" value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded border border-white/10 bg-white/[0.03] px-4 py-3 text-sm focus:outline-none focus:border-cyan-400/40" />
            {loginError && <p className="text-sm text-red-400">{loginError}</p>}
            <button type="submit"
              className="rounded bg-cyan-400 px-5 py-3 text-xs font-bold uppercase tracking-[0.25em] text-black hover:bg-cyan-300 transition-colors">
              Enter
            </button>
          </form>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white px-6 py-10">
      <div className="mx-auto max-w-4xl">
        {view === "list" && (
          <ProductList
            adminKey={adminKey}
            onEdit={(p) => { setEditingProduct(p); setView("edit"); }}
            onNew={() => { setEditingProduct(null); setView("new"); }}
          />
        )}
        {(view === "new" || view === "edit") && (
          <ProductForm
            adminKey={adminKey}
            product={editingProduct}
            onBack={() => setView("list")}
            onSaved={() => setView("list")}
          />
        )}
      </div>
    </main>
  );
}
