
import { product } from "@/data/product";

export default function ProductSpecifications() {
  const { specs, contents, copyright } = product;

  return (
    <section className="py-16 border-t border-white/5">
      <span className="text-[10px] uppercase tracking-[0.3em] text-gray-500 block mb-2">Details</span>
      <h2 className="text-xl font-semibold text-white tracking-wide mb-10">Product Specifications</h2>

      {/* Specs grid */}
      <div className="grid grid-cols-2 gap-x-8 gap-y-0 mb-10">
        {specs.map((spec) => (
          <div key={spec.label} className="py-3 border-b border-white/5">
            <dt className="text-[10px] uppercase tracking-[0.2em] text-gray-500 mb-0.5">{spec.label}</dt>
            <dd className="text-sm text-white">{spec.value}</dd>
          </div>
        ))}
      </div>

      {/* Contents */}
      <div>
        <h3 className="text-[10px] uppercase tracking-[0.25em] text-gray-500 mb-4">Contents</h3>
        <ul className="space-y-2">
          {contents.map((item, i) => (
            <li key={i} className="flex items-start gap-3 text-sm text-gray-400">
              <span className="text-cyan-500/50 mt-0.5 flex-shrink-0">—</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Copyright */}
      <p className="text-[10px] text-gray-600 mt-8 leading-relaxed">{copyright}</p>
    </section>
  );
}
