import { useState } from "react";
import LeftShowcasePanel from "@/components/LeftShowcasePanel";
import RightContentPanel from "@/components/RightContentPanel";
import CheckoutPage from "@/pages/checkout";
import SuccessPage from "@/pages/success";
import AdminPage from "@/pages/admin";
import { product } from "@/data/product";

const SITE_PASSWORD = import.meta.env.VITE_SITE_PASSWORD ?? "";

function SiteGate({ onUnlock }: { onUnlock: () => void }) {
  const [pw, setPw] = useState("");
  const [error, setError] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (pw === SITE_PASSWORD) {
      sessionStorage.setItem("site_unlocked", "1");
      onUnlock();
    } else {
      setError(true);
      setPw("");
    }
  }

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2 mb-8">
          <img src="/wizard.png" alt="" className="w-8 h-8 object-contain opacity-90" />
          <span className="text-lg font-bold tracking-[0.05em]">{product.brand}</span>
        </div>
        <h1 className="text-2xl font-bold mb-2">Private Access</h1>
        <p className="text-sm text-gray-500 mb-8">Enter the password to continue.</p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="password"
            placeholder="Password"
            value={pw}
            onChange={(e) => { setPw(e.target.value); setError(false); }}
            autoFocus
            className="rounded border border-white/10 bg-white/[0.03] px-4 py-3 text-sm focus:outline-none focus:border-cyan-400/40"
          />
          {error && <p className="text-sm text-red-400">Incorrect password</p>}
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

function HomePage() {
  return (
    <div className="min-h-screen md:h-screen md:overflow-hidden flex flex-col bg-black">
      {/* Full-width header */}
      <header className="w-full flex items-center justify-between px-4 md:px-8 py-[6px] border-b border-white/[0.06] shrink-0 bg-black relative z-20">
        <div className="w-12 md:w-32" /> {/* spacer */}
        <div className="flex items-center gap-2 md:gap-3">
          <img src="/wizard.png" alt="Nemat" className="w-6 h-6 md:w-10 md:h-10 object-contain opacity-90" />
          <span className="text-base md:text-2xl font-bold tracking-[0.05em] text-white">
            {product.brand}
          </span>
        </div>
        <div className="w-12 md:w-32 flex justify-end">
          <a
            href="/admin"
            className="px-2 py-1 md:px-4 md:py-2 bg-white text-black text-[10px] md:text-[11px] font-bold uppercase tracking-[0.15em] rounded hover:bg-gray-200 transition-colors"
          >
            Admin
          </a>
        </div>
      </header>

      {/* Two-panel layout */}
      <div className="flex flex-col md:flex-row md:flex-1 md:min-h-0">
        <LeftShowcasePanel />
        <RightContentPanel />
      </div>

    </div>
  );
}

export default function App() {
  const path = window.location.pathname;
  const [unlocked, setUnlocked] = useState(
    !SITE_PASSWORD || sessionStorage.getItem("site_unlocked") === "1"
  );

  if (path === "/admin") return <AdminPage />;
  if (!unlocked) return <SiteGate onUnlock={() => setUnlocked(true)} />;

  if (path === "/checkout") return <CheckoutPage />;
  if (path === "/success") return <SuccessPage />;

  return <HomePage />;
}
