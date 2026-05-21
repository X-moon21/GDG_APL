import { Activity, Radio, Target, Trophy } from "lucide-react";
import LastBalls from "./LastBalls.jsx";

function Stat({ label, value }) {
  return (
    <div className="min-w-0 rounded-md border border-white/10 bg-white/[0.06] px-3 py-2">
      <p className="text-[11px] uppercase text-slate-400">{label}</p>
      <p className="truncate text-base font-bold text-white">{value}</p>
    </div>
  );
}

export default function Scoreboard({ match, compact = false }) {
  if (!match) {
    return (
      <div className="surface rounded-lg p-5">
        <div className="h-24 animate-pulse rounded-md bg-white/10" />
      </div>
    );
  }

  const required = match.required_runs ?? Math.max((match.target || 0) - match.runs, 0);

  return (
    <section className={`surface rounded-lg ${compact ? "p-4" : "p-6"}`}>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2 text-sm text-emerald-200">
            <Radio className="h-4 w-4 text-emerald-300" />
            <span className="font-semibold uppercase">{match.status}</span>
            <span className="text-slate-500">Innings {match.innings}</span>
          </div>
          <h1 className={`${compact ? "text-2xl" : "text-4xl md:text-6xl"} mt-2 font-black text-white`}>
            {match.batting_team} {match.runs}/{match.wickets}
          </h1>
          <p className="mt-1 text-slate-300">
            {match.team_a} vs {match.team_b} · {match.overs_display} overs
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <Stat label="Target" value={match.target || "-"} />
          <Stat label="Need" value={required} />
          <Stat label="Bowling" value={match.bowling_team} />
          <Stat label="RR" value={match.overs > 0 || match.balls > 0 ? (match.runs / (match.overs + match.balls / 6)).toFixed(2) : "0.00"} />
        </div>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-3">
        <Stat label="On strike" value={match.current_batsman} />
        <Stat label="Non-striker" value={match.non_striker} />
        <Stat label="Bowler" value={match.current_bowler} />
      </div>

      {!compact && (
        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-sm text-slate-300">
            <Activity className="h-4 w-4 text-emerald-300" />
            Last six
          </div>
          <LastBalls balls={match.last_balls} large />
        </div>
      )}

      {compact && (
        <div className="mt-4 flex items-center gap-3">
          <Trophy className="h-4 w-4 text-amber-300" />
          <LastBalls balls={match.last_balls} />
        </div>
      )}
    </section>
  );
}
