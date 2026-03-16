
import { useEffect, useState } from "react";

interface CountdownTimerProps {
  targetIso: string;
  label?: string;
  size?: "sm" | "lg";
}

function getTimeLeft(targetIso: string) {
  const diff = Math.max(0, new Date(targetIso).getTime() - Date.now());
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  return { h, m, s };
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

export default function CountdownTimer({ targetIso, label, size = "lg" }: CountdownTimerProps) {
  const [time, setTime] = useState(() => getTimeLeft(targetIso));

  useEffect(() => {
    const id = setInterval(() => setTime(getTimeLeft(targetIso)), 1000);
    return () => clearInterval(id);
  }, [targetIso]);

  const digitClass =
    size === "lg"
      ? "text-4xl md:text-5xl font-mono font-bold text-cyan-400 tracking-widest tabular-nums"
      : "text-2xl md:text-3xl font-mono font-bold text-cyan-400 tracking-widest tabular-nums";

  const sepClass =
    size === "lg" ? "text-3xl md:text-4xl font-mono text-cyan-400/60 mx-1" : "text-xl font-mono text-cyan-400/60 mx-0.5";

  const labelClass = size === "lg" ? "text-[10px] uppercase tracking-[0.2em] text-gray-500 mt-1" : "text-[9px] uppercase tracking-[0.2em] text-gray-500 mt-0.5";

  return (
    <div className="flex flex-col items-center gap-1">
      {label && (
        <span className="text-[10px] uppercase tracking-[0.25em] text-gray-500 mb-2">{label}</span>
      )}
      <div className="flex items-end gap-0">
        <div className="flex flex-col items-center">
          <span className={digitClass}>{pad(time.h)}</span>
          <span className={labelClass}>HRS</span>
        </div>
        <span className={sepClass + " mb-4"}>:</span>
        <div className="flex flex-col items-center">
          <span className={digitClass}>{pad(time.m)}</span>
          <span className={labelClass}>MIN</span>
        </div>
        <span className={sepClass + " mb-4"}>:</span>
        <div className="flex flex-col items-center">
          <span className={digitClass}>{pad(time.s)}</span>
          <span className={labelClass}>SEC</span>
        </div>
      </div>
    </div>
  );
}
