import ProductHeroSection from "./ProductHeroSection";
import ProductSpecifications from "./ProductSpecifications";
import PullProbabilityChart from "./PullProbabilityChart";
import PossiblePullsGrid from "./PossiblePullsGrid";
import PurchaseBar from "./PurchaseBar";
import IntelReport from "./IntelReport";

export default function RightContentPanel() {
  return (
    <main className="flex-1 min-w-0 bg-[#0d0d0d] overflow-y-auto md:h-screen">
      <div className="max-w-2xl mx-auto px-6 md:px-10 pt-10 pb-0">
        <ProductHeroSection />
        <IntelReport />
        <ProductSpecifications />
        <PullProbabilityChart />
        <PossiblePullsGrid />

        {/* Footer spacing for sticky bar */}
        <div className="h-24" />
      </div>

      {/* Sticky purchase bar */}
      <div className="sticky bottom-0 max-w-2xl mx-auto px-6 md:px-10">
        <PurchaseBar />
      </div>
    </main>
  );
}
