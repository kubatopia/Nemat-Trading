import { product } from "@/data/product";
import { useActiveProduct } from "@/hooks/useActiveProduct";

const HIGHLIGHT_COLORS: Record<string, string> = {
  "rares":                        "text-amber-400",
  "mythic rares":                 "text-amber-400",
  "traditional foils":            "text-amber-400",
  "full-art lands":               "text-amber-400",
  "borderless source-material cards": "text-amber-400",
  "Leonardo":                     "text-blue-400",
  "Donatello":                    "text-purple-400",
  "Raphael":                      "text-red-400",
  "Michelangelo":                 "text-orange-400",
  "Kevin Eastman":                "text-green-400",
};

const HIGHLIGHTS = Object.keys(HIGHLIGHT_COLORS);

function highlightText(text: string) {
  const sorted = [...HIGHLIGHTS].sort((a, b) => b.length - a.length);
  const regex = new RegExp(`(${sorted.map((h) => h.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`, "gi");
  const parts = text.split(regex);
  return (
    <>
      {parts.map((part, i) => {
        const key = HIGHLIGHTS.find((h) => h.toLowerCase() === part.toLowerCase());
        return key
          ? <strong key={i} className={`${HIGHLIGHT_COLORS[key]} font-semibold`}>{part}</strong>
          : <span key={i}>{part}</span>;
      })}
    </>
  );
}

export default function IntelReport() {
  const dbProduct = useActiveProduct();

  const paragraphs: string[] = dbProduct?.intelReport
    ? dbProduct.intelReport.split(/\n\n+/).filter(Boolean)
    : product.intelReport.map((p) => p.text);

  return (
    <section className="py-10 border-t border-white/5">
      <span className="text-[10px] uppercase tracking-[0.3em] text-gray-500 block mb-6">Product Intelligence</span>
      <h2 className="text-[10px] uppercase tracking-[0.25em] text-gray-500 mb-6 flex items-center gap-3">
        <span>Intel Report</span>
        <span className="flex-1 h-px bg-white/5"></span>
      </h2>
      <div className="space-y-4">
        {paragraphs.map((text, i) => (
          <p key={i} className="text-sm text-gray-400 leading-relaxed">
            {highlightText(text)}
          </p>
        ))}
      </div>
    </section>
  );
}
