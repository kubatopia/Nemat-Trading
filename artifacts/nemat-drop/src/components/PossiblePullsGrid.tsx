
import { product } from "@/data/product";

function CardPlaceholder({ featured }: { featured: boolean }) {
  return (
    <div
      className={`w-full aspect-[2.5/3.5] rounded flex items-center justify-center border ${
        featured
          ? "border-amber-500/30 bg-gradient-to-b from-amber-950/40 to-black/60"
          : "border-white/5 bg-white/[0.02]"
      }`}
    >
      {featured ? (
        <div className="flex flex-col items-center gap-2 p-4 text-center">
          <div className="w-12 h-12 rounded-full border border-amber-500/40 flex items-center justify-center">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-amber-500/60">
              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span className="text-[10px] uppercase tracking-[0.2em] text-amber-500/60">Featured Pull</span>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2 opacity-30">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="text-gray-600">
            <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M9 9H9.01M15 9H15.01M9 15H9.01M15 15H15.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <span className="text-[9px] uppercase tracking-[0.15em] text-gray-600">No Image</span>
        </div>
      )}
    </div>
  );
}

export default function PossiblePullsGrid() {
  const { possiblePulls } = product;

  return (
    <section className="py-16 border-t border-white/5">
      <span className="text-[10px] uppercase tracking-[0.3em] text-gray-500 block mb-2">Card Pulls</span>
      <h2 className="text-xl font-semibold text-white tracking-wide mb-10">Possible Pulls</h2>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
        {possiblePulls.map((pull) => (
          <div key={pull.id} className="flex flex-col gap-2">
            <CardPlaceholder featured={pull.featured} />
            <div>
              <p className={`text-sm font-medium leading-tight ${pull.featured ? "text-amber-400" : "text-amber-300/80"}`}>
                {pull.title}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">{pull.probability}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
