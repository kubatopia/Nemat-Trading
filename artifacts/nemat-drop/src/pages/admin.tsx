import { useState, useEffect } from "react";

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

const emptyForm = {
  title: "", subtitle: "", price: "", imageUrl: "",
  stock: "", expiresAt: "", scryfallId: "", discountPercent: "15",
};

function ProductForm({ adminKey, product, onBack, onSaved }: {
  adminKey: string;
  product: Product | null;
  onBack: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState(product ? {
    title: product.title,
    subtitle: product.subtitle,
    price: (product.price / 100).toFixed(2),
    imageUrl: product.imageUrl,
    stock: String(product.stock),
    expiresAt: toDatetimeLocal(product.expiresAt),
    scryfallId: product.scryfallId ?? "",
    discountPercent: String(product.discountPercent ?? 15),
  } : emptyForm);

  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tcgPreview, setTcgPreview] = useState<string | null>(null);

  const isEdit = !!product;

  async function fetchTcgPreview() {
    if (!form.scryfallId.trim()) return;
    setTcgPreview("Loading...");
    try {
      const res = await fetch(`${API_URL}/api/scryfall/${form.scryfallId.trim()}/price`);
      const data = await res.json();
      setTcgPreview(data.usd ? `TCG Best: $${data.usd}` : "Price not found");
    } catch {
      setTcgPreview("Could not fetch");
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
            <div>
              <label className="text-[10px] uppercase tracking-[0.2em] text-gray-600 block mb-1.5">Image URL</label>
              <input value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                placeholder="https://... or /filename.png"
                className="w-full rounded border border-white/10 bg-black px-4 py-3 text-sm focus:outline-none focus:border-cyan-400/40" />
            </div>
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
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
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
              <label className="text-[10px] uppercase tracking-[0.2em] text-gray-600 block mb-1.5">Discount %</label>
              <div className="relative">
                <input type="number" min="0" max="100" value={form.discountPercent}
                  onChange={(e) => setForm({ ...form, discountPercent: e.target.value })}
                  className="w-full rounded border border-white/10 bg-black px-4 py-3 text-sm focus:outline-none focus:border-cyan-400/40" />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm">%</span>
              </div>
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

        {/* TCG Data */}
        <section className="border border-white/[0.06] rounded bg-white/[0.02] p-6">
          <h2 className="text-[10px] uppercase tracking-[0.25em] text-gray-500 mb-1">TCG Pricing</h2>
          <p className="text-[10px] text-gray-600 mb-5">Link a Scryfall card to auto-fetch the live TCG market price and calculate savings.</p>
          <div>
            <label className="text-[10px] uppercase tracking-[0.2em] text-gray-600 block mb-1.5">Scryfall Card ID</label>
            <div className="flex gap-2">
              <input value={form.scryfallId}
                onChange={(e) => { setForm({ ...form, scryfallId: e.target.value }); setTcgPreview(null); }}
                placeholder="e.g. 2e914c3d-2eed-48bf-af9a-a8998fd5111d"
                className="flex-1 rounded border border-white/10 bg-black px-4 py-3 text-sm focus:outline-none focus:border-cyan-400/40 font-mono" />
              <button type="button" onClick={fetchTcgPreview}
                className="rounded border border-white/10 px-5 py-2 text-xs text-gray-400 hover:text-white transition-colors">
                Test
              </button>
            </div>
            {tcgPreview && (
              <p className={`text-xs mt-2 ${tcgPreview.startsWith("TCG") ? "text-cyan-400" : "text-gray-500"}`}>{tcgPreview}</p>
            )}
            <p className="text-[10px] text-gray-600 mt-2">Find the ID in the Scryfall URL: scryfall.com/card/.../<strong>card-id</strong></p>
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
