
import LeftShowcasePanel from "@/components/LeftShowcasePanel";
import RightContentPanel from "@/components/RightContentPanel";

export default function App() {
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-black">
      {/* Left: sticky showcase panel */}
      <LeftShowcasePanel />

      {/* Right: scrollable content */}
      <RightContentPanel />
    </div>
  );
}
