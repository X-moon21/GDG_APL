import { History } from "lucide-react";

export default function Timeline({ events = [] }) {
  return (
    <section className="surface rounded-lg p-4">
      <div className="flex items-center gap-2">
        <History className="h-4 w-4 text-emerald-300" />
        <h2 className="font-bold">Live timeline</h2>
      </div>
      <div className="no-scrollbar mt-4 max-h-72 space-y-3 overflow-y-auto pr-1">
        {events.length === 0 && <p className="text-sm text-slate-400">Ball-by-ball moments will appear here.</p>}
        {events.map((event) => (
          <div key={event.id} className="rounded-md border border-white/10 bg-white/[0.05] p-3">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold text-emerald-300">
                {event.over_number}.{event.ball_number || 0}
              </span>
              <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-slate-200">{event.outcome}</span>
            </div>
            <p className="mt-1 text-sm text-slate-100">{event.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
