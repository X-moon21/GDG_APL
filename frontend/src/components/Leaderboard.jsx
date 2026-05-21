import { Crown } from "lucide-react";

export default function Leaderboard({ entries = [], currentUserId }) {
  return (
    <section className="surface rounded-lg p-4">
      <div className="flex items-center gap-2">
        <Crown className="h-5 w-5 text-amber-300" />
        <h2 className="text-lg font-bold">Leaderboard</h2>
      </div>
      <div className="mt-4 space-y-2">
        {entries.length === 0 && <p className="text-sm text-slate-400">Join to start scoring points.</p>}
        {entries.map((entry, index) => (
          <div
            key={entry.id || entry.user_id}
            className={`flex items-center justify-between gap-3 rounded-md border px-3 py-2 ${
              Number(currentUserId) === Number(entry.user_id)
                ? "border-emerald-300 bg-emerald-300/15"
                : "border-white/10 bg-white/[0.05]"
            }`}
          >
            <div className="min-w-0">
              <p className="truncate font-bold text-white">
                {index + 1}. {entry.nickname}
              </p>
              <p className="text-xs text-slate-400">{entry.favorite_team}</p>
            </div>
            <span className="text-lg font-black text-amber-200">{entry.points}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
