import LeftShowcasePanel from "@/components/LeftShowcasePanel";
import RightContentPanel from "@/components/RightContentPanel";
import CheckoutPage from "@/pages/checkout";
import SuccessPage from "@/pages/success";
import AdminPage from "@/pages/admin";

function HomePage() {
  return (
    <div className="min-h-screen flex flex-col md:flex-row md:items-stretch bg-black">
      <LeftShowcasePanel />
      <RightContentPanel />
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
