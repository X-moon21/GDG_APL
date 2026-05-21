import { BarChart3 } from "lucide-react";

export default function PollCard({ poll, onVote }) {
  if (!poll) return null;

  const total = (poll.options || []).reduce((sum, option) => sum + option.vote_count, 0);

  return (
    <section className="surface rounded-lg p-4">
      <div className="flex items-center gap-2 text-sky-200">
        <BarChart3 className="h-4 w-4" />
        <p className="text-xs uppercase">Fan poll</p>
      </div>
      <h2 className="mt-1 text-lg font-bold text-white">{poll.question}</h2>
      <div className="mt-3 space-y-2">
        {(poll.options || []).map((option) => {
          const pct = total ? Math.round((option.vote_count / total) * 100) : 0;
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => onVote(poll.id, option.id)}
              className="w-full rounded-md border border-white/10 bg-white/[0.06] p-3 text-left hover:bg-white/10"
            >
              <div className="flex items-center justify-between gap-2 text-sm font-semibold">
                <span>{option.option_text}</span>
                <span>{pct}%</span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
                <div className="h-full rounded-full bg-sky-300" style={{ width: `${pct}%` }} />
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
