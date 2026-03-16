
import { product } from "@/data/product";

function HighlightedText({ text, highlights }: { text: string; highlights: string[] }) {
  if (highlights.length === 0) return <>{text}</>;

  const escapedHighlights = highlights.map((h) => h.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const pattern = new RegExp(`(${escapedHighlights.join("|")})`, "gi");
  const parts = text.split(pattern);

  return (
    <>
      {parts.map((part, i) => {
        const isHighlight = highlights.some((h) => h.toLowerCase() === part.toLowerCase());
        return isHighlight ? (
          <span key={i} className="text-amber-400 font-medium">
            {part}
          </span>
        ) : (
          <span key={i}>{part}</span>
        );
      })}
    </>
  );
}

export default function IntelReport() {
  const { intelReport } = product;

  return (
    <section className="py-10 border-t border-white/5">
      <span className="text-[10px] uppercase tracking-[0.3em] text-gray-500 block mb-6">Product Intelligence</span>
      <h2 className="text-[10px] uppercase tracking-[0.25em] text-gray-500 mb-6 flex items-center gap-3">
        <span>Intel Report</span>
        <span className="flex-1 h-px bg-white/5"></span>
      </h2>
      <div className="space-y-4">
        {intelReport.map((para, i) => (
          <p key={i} className="text-sm text-gray-400 leading-relaxed">
            <HighlightedText text={para.text} highlights={para.highlights} />
          </p>
        ))}
      </div>
    </section>
  );
}
