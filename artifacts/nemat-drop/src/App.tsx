import { useState } from "react";
import LeftShowcasePanel from "@/components/LeftShowcasePanel";
import RightContentPanel from "@/components/RightContentPanel";
import CheckoutPage from "@/pages/checkout";
import SuccessPage from "@/pages/success";
import AdminPage from "@/pages/admin";
import { product } from "@/data/product";

const SITE_PASSWORD = import.meta.env.VITE_SITE_PASSWORD ?? "";
const API_URL = import.meta.env.VITE_API_URL ?? "";

function SiteGate({ onUnlock }: { onUnlock: () => void }) {
  const [email, setEmail] = useState("");
  const [emailSubmitted, setEmailSubmitted] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);

  const [pw, setPw] = useState("");
  const [pwError, setPwError] = useState(false);

  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setEmailLoading(true);
    setEmailError(null);
    try {
      const res = await fetch(`${API_URL}/api/subscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      if (!res.ok) throw new Error();
      setEmailSubmitted(true);
    } catch {
      setEmailError("Something went wrong. Please try again.");
    } finally {
      setEmailLoading(false);
    }
  }

  function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (SITE_PASSWORD && pw === SITE_PASSWORD) {
      sessionStorage.setItem("site_unlocked", "1");
      onUnlock();
    } else {
      setPwError(true);
      setPw("");
    }
  }

  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-6 py-16">
      {/* Branding */}
      <div className="flex items-center gap-3 mb-12">
        <img src="/wizard.png" alt="" className="w-10 h-10 object-contain opacity-90" />
        <span className="text-xl font-bold tracking-[0.05em]">{product.brand}</span>
      </div>

      <div className="w-full max-w-sm flex flex-col gap-10">
        {/* Email section */}
        <div>
          <p className="text-[10px] uppercase tracking-[0.3em] text-gray-500 mb-2">Coming Soon</p>
          <h1 className="text-2xl font-bold mb-2">Get Early Access</h1>
          <p className="text-sm text-gray-500 mb-6">
            Drop your email and we'll reach out before the next deal goes live.
          </p>
          {emailSubmitted ? (
            <div className="flex items-center gap-3 text-sm text-cyan-400">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 8L6.5 11.5L13 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              You're on the list — we'll be in touch.
            </div>
          ) : (
            <form onSubmit={handleEmailSubmit} className="flex flex-col gap-2">
              <div className="flex gap-0">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  disabled={emailLoading}
                  className="flex-1 bg-white/[0.03] border border-white/10 border-r-0 rounded-l px-4 py-3 text-sm placeholder-gray-600 focus:outline-none focus:border-cyan-500/50 transition-colors disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={emailLoading}
                  className="px-5 py-3 bg-cyan-400 text-black text-xs font-bold uppercase tracking-[0.2em] rounded-r hover:bg-cyan-300 transition-colors disabled:opacity-50"
                >
                  {emailLoading ? "..." : "Notify Me"}
                </button>
              </div>
              {emailError && <p className="text-xs text-red-400">{emailError}</p>}
            </form>
          )}
        </div>

        {/* Divider */}
        <div className="flex items-center gap-4">
          <div className="flex-1 border-t border-white/10" />
          <span className="text-xs text-gray-600 uppercase tracking-widest">or</span>
          <div className="flex-1 border-t border-white/10" />
        </div>

        {/* Password section */}
        <div>
          <p className="text-sm text-gray-500 mb-4">Enter site password to access the store.</p>
          <form onSubmit={handlePasswordSubmit} className="flex flex-col gap-3">
            <input
              type="password"
              placeholder="Password"
              value={pw}
              onChange={(e) => { setPw(e.target.value); setPwError(false); }}
              className="rounded border border-white/10 bg-white/[0.03] px-4 py-3 text-sm focus:outline-none focus:border-cyan-400/40"
            />
            {pwError && <p className="text-sm text-red-400">Incorrect password</p>}
            <button
              type="submit"
              className="rounded bg-white/[0.06] border border-white/10 px-5 py-3 text-xs font-bold uppercase tracking-[0.25em] text-white hover:bg-white/10 transition-colors"
            >
              Enter
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}

function HomePage() {
  return (
    <div className="min-h-screen md:h-screen md:overflow-hidden flex flex-col bg-black">
      <header className="w-full flex items-center justify-between px-4 md:px-8 py-[6px] border-b border-white/[0.06] shrink-0 bg-black relative z-20">
        <div className="w-12 md:w-32" />
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
    sessionStorage.getItem("site_unlocked") === "1"
  );

  if (path === "/admin") return <AdminPage />;
  if (!unlocked) return <SiteGate onUnlock={() => setUnlocked(true)} />;

  if (path === "/checkout") return <CheckoutPage />;
  if (path === "/success") return <SuccessPage />;

  return <HomePage />;
}
