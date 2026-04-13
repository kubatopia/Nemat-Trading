import { product } from "@/data/product";
import { useActiveProduct } from "@/hooks/useActiveProduct";

const SIZE = 220;
const STROKE = 28;
const R = (SIZE - STROKE) / 2;
const CIRC = 2 * Math.PI * R;
const GAP = 4;

export default function PullProbabilityChart() {
  const dbProduct = useActiveProduct();

  const pullProbabilities: typeof product.pullProbabilities =
    dbProduct?.pullProbabilities && dbProduct.pullProbabilities !== "[]"
      ? JSON.parse(dbProduct.pullProbabilities)
      : product.pullProbabilities;

  // Auto-derive donut center from highest-percent entry
  const top = [...pullProbabilities].sort((a, b) => b.percent - a.percent)[0];
  const donutCenter = top
    ? { label: top.label, percent: `${top.percent.toFixed(1)}%`, sub: "Standard cards" }
    : product.donutCenter;

  let offset = -CIRC / 4;
  const segments = pullProbabilities.map((item) => {
    const len = (item.percent / 100) * CIRC - GAP;
    const seg = { ...item, dashLen: len, dashOffset: offset };
    offset += (item.percent / 100) * CIRC;
    return seg;
  });

  return (
    <section className="py-16 border-t border-white/5">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] uppercase tracking-[0.3em] text-gray-500">Oracle's Insight</span>
        <div className="flex gap-1.5">
          {["◈", "◇", "◆"].map((icon, i) => (
            <span key={i} className="text-gray-600 text-sm">{icon}</span>
          ))}
        </div>
      </div>
      <h2 className="text-xl font-semibold text-white tracking-wide mb-10">Pull Probability</h2>

      <div className="flex flex-col items-center gap-10 md:flex-row md:items-start md:justify-center md:gap-16">
        <div className="relative flex-shrink-0" style={{ width: SIZE, height: SIZE }}>
          <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
            <circle cx={SIZE/2} cy={SIZE/2} r={R} fill="none" stroke="#1f2937" strokeWidth={STROKE} />
            {segments.map((seg) => (
              <circle
                key={seg.label}
                cx={SIZE/2} cy={SIZE/2} r={R}
                fill="none"
                stroke={seg.color}
                strokeWidth={STROKE - 4}
                strokeDasharray={`${seg.dashLen} ${CIRC - seg.dashLen}`}
                strokeDashoffset={-seg.dashOffset}
                strokeLinecap="round"
                style={{ transition: "stroke-dashoffset 0.3s" }}
              />
            ))}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-xs text-gray-400 uppercase tracking-wider">{donutCenter.label}</span>
            <span className="text-2xl font-bold text-white tabular-nums">{donutCenter.percent}</span>
            <span className="text-[10px] text-gray-500 uppercase tracking-wider">{donutCenter.sub}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-x-10 gap-y-4 self-center">
          {pullProbabilities.map((item) => (
            <div key={item.label} className="flex items-center gap-3">
              <div
                className="w-7 h-7 flex-shrink-0 flex items-center justify-center border text-[10px] font-bold uppercase tracking-wider rounded-sm"
                style={{ borderColor: item.color, color: item.color }}
              >
                {item.abbr}
              </div>
              <div className="flex flex-col">
                <span className="text-sm text-white leading-tight">{item.label}</span>
                <span className="text-xs text-gray-500">{item.percent}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
