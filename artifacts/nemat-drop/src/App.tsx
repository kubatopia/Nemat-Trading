import LeftShowcasePanel from "@/components/LeftShowcasePanel";
import RightContentPanel from "@/components/RightContentPanel";
import CheckoutPage from "@/pages/checkout";
import SuccessPage from "@/pages/success";
import AdminPage from "@/pages/admin";
import { product } from "@/data/product";

function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-black">
      {/* Full-width header */}
      <header className="w-full flex items-center justify-between px-8 py-[18px] border-b border-white/[0.06] flex-shrink-0 bg-black relative z-20">
        <div className="w-32" /> {/* spacer */}
        <div className="flex items-center gap-3">
          <img src="/wizard.png" alt="Nemat" className="w-16 h-16 object-contain opacity-90" />
          <span className="text-2xl font-bold uppercase tracking-[0.4em] text-white">
            {product.brand}
          </span>
        </div>
        <div className="w-32 flex justify-end">
          <a
            href="/admin"
            className="px-4 py-2 bg-white text-black text-[11px] font-bold uppercase tracking-[0.15em] rounded hover:bg-gray-200 transition-colors"
          >
            Admin
          </a>
        </div>
      </header>

      {/* Two-panel layout */}
      <div className="flex flex-col md:flex-row flex-1">
        <LeftShowcasePanel />
        <RightContentPanel />
      </div>
    </div>
  );
}

export default function App() {
  const path = window.location.pathname;

  if (path === "/checkout") return <CheckoutPage />;
  if (path === "/success") return <SuccessPage />;
  if (path === "/admin") return <AdminPage />;

  return <HomePage />;
}
