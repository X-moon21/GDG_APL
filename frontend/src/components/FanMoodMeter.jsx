import { SmilePlus } from "lucide-react";

export default function FanMoodMeter({ counts = {} }) {
  const total = Object.values(counts).reduce((sum, count) => sum + count, 0);
  const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
  const intensity = Math.min(100, total * 12);

  return (
    <section className="surface rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-emerald-200">
          <SmilePlus className="h-4 w-4" />
          <p className="text-xs uppercase">Fan mood</p>
        </div>
        <span className="text-sm font-bold">{top ? `${top[0]} ${top[1]}` : "Calm"}</span>
      </div>
      <div className="mt-3 h-3 overflow-hidden rounded-full bg-white/10">
        <div className="h-full rounded-full bg-emerald-300 transition-all" style={{ width: `${intensity || 8}%` }} />
      </div>
      <div className="mt-3 flex flex-wrap gap-2 text-sm text-slate-300">
        {Object.entries(counts).length === 0 ? (
          <span>No reactions yet</span>
        ) : (
          Object.entries(counts).map(([emoji, count]) => (
            <span key={emoji} className="rounded-full bg-white/10 px-3 py-1">
              {emoji} {count}
            </span>
          ))
        )}
      </div>
    </section>
  );
}
