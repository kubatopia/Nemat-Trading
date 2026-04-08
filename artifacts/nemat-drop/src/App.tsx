import LeftShowcasePanel from "@/components/LeftShowcasePanel";
import RightContentPanel from "@/components/RightContentPanel";
import CheckoutPage from "@/pages/checkout";

function HomePage() {
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-black">
      <LeftShowcasePanel />
      <RightContentPanel />
    </div>
  );
}

export default function App() {
  const path = window.location.pathname;

  if (path === "/checkout") {
    return <CheckoutPage />;
  }

  return <HomePage />;
}
