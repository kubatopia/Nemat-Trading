import { product } from "@/data/product";
import { useActiveProduct } from "@/hooks/useActiveProduct";

export default function IntelReport() {
  const dbProduct = useActiveProduct();

  // Use DB intel report if set, otherwise fall back to static data
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
          <p key={i} className="text-sm text-gray-400 leading-relaxed">{text}</p>
        ))}
      </div>
    </section>
  );
}
