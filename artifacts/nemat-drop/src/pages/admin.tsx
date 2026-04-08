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
};

function priceDisplay(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

function toDatetimeLocal(iso: string | null) {
  if (!iso) return "";
  return new Date(iso).toISOString().slice(0, 16);
}

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: "",
    subtitle: "",
    price: "",
    imageUrl: "",
    stock: "",
    expiresAt: "",
  });
  const [editingId, setEditingId] = useState<number | null>(null);

  const adminKey = ADMIN_PASSWORD;

  async function fetchProducts() {
    const res = await fetch(`${API_URL}/api/admin/products`, {
      headers: { "x-admin-key": adminKey },
    });
    const data = await res.json();
    setProducts(data);
  }

  useEffect(() => {
    if (authed) fetchProducts();
  }, [authed]);

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setAuthed(true);
    } else {
      setError("Incorrect password");
    }
  }

  function startEdit(product: Product) {
    setEditingId(product.id);
    setForm({
      title: product.title,
      subtitle: product.subtitle,
      price: (product.price / 100).toFixed(2),
      imageUrl: product.imageUrl,
      stock: String(product.stock),
      expiresAt: toDatetimeLocal(product.expiresAt),
    });
  }

  function resetForm() {
    setEditingId(null);
    setForm({ title: "", subtitle: "", price: "", imageUrl: "", stock: "", expiresAt: "" });
    setError(null);
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
      stock: parseInt(form.stock, 10),
      expiresAt: form.expiresAt ? new Date(form.expiresAt).toISOString() : null,
    };

    try {
      const url = editingId
        ? `${API_URL}/api/admin/products/${editingId}`
        : `${API_URL}/api/admin/products`;

      const res = await fetch(url, {
        method: editingId ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-key": adminKey,
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error("Failed to save product");
      resetForm();
      await fetchProducts();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this product?")) return;
    await fetch(`${API_URL}/api/admin/products/${id}`, {
      method: "DELETE",
      headers: { "x-admin-key": adminKey },
    });
    await fetchProducts();
  }

  async function toggleActive(product: Product) {
    await fetch(`${API_URL}/api/admin/products/${product.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "x-admin-key": adminKey,
      },
      body: JSON.stringify({ active: !product.active }),
    });
    await fetchProducts();
  }

  if (!authed) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center px-6">
        <div className="w-full max-w-sm">
          <div className="text-[10px] uppercase tracking-[0.3em] text-gray-500 mb-2">Nemat Trading</div>
          <h1 className="text-2xl font-bold mb-8">Admin Access</h1>
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded border border-white/10 bg-white/[0.03] px-4 py-3 text-sm focus:outline-none focus:border-cyan-400/40"
            />
            {error && <p className="text-sm text-red-400">{error}</p>}
            <button
              type="submit"
              className="rounded bg-cyan-400 px-5 py-3 text-xs font-bold uppercase tracking-[0.25em] text-black hover:bg-cyan-300 transition-colors"
            >
              Enter
            </button>
          </form>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white px-6 py-10">
      <div className="mx-auto max-w-3xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="text-[10px] uppercase tracking-[0.3em] text-gray-500 mb-1">Nemat Trading</div>
            <h1 className="text-2xl font-bold">Products</h1>
          </div>
          <a href="/" className="text-xs text-gray-500 hover:text-white transition-colors">← Storefront</a>
        </div>

        {/* Product form */}
        <div className="border border-white/10 rounded bg-white/[0.02] p-6 mb-8">
          <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-400 mb-6">
            {editingId ? "Edit Product" : "Add Product"}
          </h2>
          <form onSubmit={handleSubmit} className="grid gap-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <input
                required
                placeholder="Title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="rounded border border-white/10 bg-black px-4 py-3 text-sm focus:outline-none focus:border-cyan-400/40"
              />
              <input
                placeholder="Subtitle"
                value={form.subtitle}
                onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                className="rounded border border-white/10 bg-black px-4 py-3 text-sm focus:outline-none focus:border-cyan-400/40"
              />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm">$</span>
                <input
                  required
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="Price (e.g. 32.00)"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  className="w-full rounded border border-white/10 bg-black pl-8 pr-4 py-3 text-sm focus:outline-none focus:border-cyan-400/40"
                />
              </div>
              <input
                required
                type="number"
                min="0"
                placeholder="Stock quantity"
                value={form.stock}
                onChange={(e) => setForm({ ...form, stock: e.target.value })}
                className="rounded border border-white/10 bg-black px-4 py-3 text-sm focus:outline-none focus:border-cyan-400/40"
              />
            </div>
            <input
              placeholder="Image URL (optional)"
              value={form.imageUrl}
              onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
              className="rounded border border-white/10 bg-black px-4 py-3 text-sm focus:outline-none focus:border-cyan-400/40"
            />
            <div>
              <label className="text-[10px] uppercase tracking-[0.2em] text-gray-500 block mb-1.5">
                Deal Expires At (optional)
              </label>
              <input
                type="datetime-local"
                value={form.expiresAt}
                onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
                className="w-full rounded border border-white/10 bg-black px-4 py-3 text-sm focus:outline-none focus:border-cyan-400/40 text-white [color-scheme:dark]"
              />
            </div>

            {error && <p className="text-sm text-red-400">{error}</p>}

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={loading}
                className="rounded bg-cyan-400 px-6 py-2.5 text-xs font-bold uppercase tracking-[0.2em] text-black hover:bg-cyan-300 transition-colors disabled:opacity-50"
              >
                {loading ? "Saving..." : editingId ? "Update" : "Add Product"}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded border border-white/10 px-6 py-2.5 text-xs font-bold uppercase tracking-[0.2em] text-gray-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Products list */}
        <div className="flex flex-col gap-3">
          {products.length === 0 && (
            <p className="text-gray-600 text-sm text-center py-8">No products yet. Add one above.</p>
          )}
          {products.map((p) => (
            <div
              key={p.id}
              className="flex items-center justify-between border border-white/[0.06] rounded bg-white/[0.02] px-5 py-4"
            >
              <div className="flex items-center gap-4">
                {p.imageUrl && (
                  <img src={p.imageUrl} alt={p.title} className="w-10 h-10 object-contain rounded" />
                )}
                <div>
                  <div className="text-sm font-medium text-white">{p.title}</div>
                  <div className="text-xs text-gray-500">
                    {priceDisplay(p.price)} · {p.stock} in stock
                    {p.expiresAt && (
                      <span className="ml-2 text-cyan-600">
                        · expires {new Date(p.expiresAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => toggleActive(p)}
                  className={`text-[10px] uppercase tracking-[0.2em] px-3 py-1 rounded border transition-colors ${
                    p.active
                      ? "border-cyan-400/30 text-cyan-400 hover:border-red-400/30 hover:text-red-400"
                      : "border-white/10 text-gray-600 hover:border-cyan-400/30 hover:text-cyan-400"
                  }`}
                >
                  {p.active ? "Live" : "Hidden"}
                </button>
                <button
                  onClick={() => startEdit(p)}
                  className="text-xs text-gray-400 hover:text-white transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(p.id)}
                  className="text-xs text-gray-600 hover:text-red-400 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
