import { useEffect, useState } from "react";

const TARGET = new Date("2026-05-11T13:00:00+07:00").getTime();

function diff() {
  const d = TARGET - Date.now();
  if (d <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  return {
    days: Math.floor(d / 86_400_000),
    hours: Math.floor((d / 3_600_000) % 24),
    minutes: Math.floor((d / 60_000) % 60),
    seconds: Math.floor((d / 1000) % 60),
  };
}

export function Countdown() {
  const [t, setT] = useState(diff);
  useEffect(() => {
    const id = setInterval(() => setT(diff()), 1000);
    return () => clearInterval(id);
  }, []);

  const items: Array<[string, number]> = [
    ["HARI", t.days],
    ["JAM", t.hours],
    ["MENIT", t.minutes],
    ["DETIK", t.seconds],
  ];

  return (
    <div className="grid grid-cols-4 gap-2 sm:gap-3">
      {items.map(([label, val]) => (
        <div
          key={label}
          className="rounded-2xl border border-white/15 bg-white/5 px-2 py-3 text-center backdrop-blur-md sm:px-4 sm:py-4"
        >
          <div className="font-display text-3xl font-extrabold tabular-nums text-white sm:text-5xl">
            {String(val).padStart(2, "0")}
          </div>
          <div className="mt-1 text-[10px] font-bold uppercase tracking-[0.2em] text-gold sm:text-xs">
            {label}
          </div>
        </div>
      ))}
    </div>
  );
}
