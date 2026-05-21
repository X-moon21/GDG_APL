import { Gauge, HelpCircle, Radio, ShieldQuestion, StopCircle, Trophy } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Scoreboard from "../components/Scoreboard.jsx";
import { socket } from "../socket.js";

const ballButtons = [
  ["Dot Ball", "dot"],
  ["1 Run", "1"],
  ["2 Runs", "2"],
  ["3 Runs", "3"],
  ["Four", "four"],
  ["Six", "six"],
  ["Wicket", "wicket"],
  ["Wide", "wide"],
  ["No Ball", "no_ball"],
];

function AdminButton({ children, onClick, tone = "default", Icon = Radio }) {
  const tones = {
    default: "border-white/10 bg-white/[0.06] text-white hover:bg-white/12",
    green: "border-emerald-300/30 bg-emerald-300 text-emerald-950 hover:bg-emerald-200",
    amber: "border-amber-300/30 bg-amber-300 text-amber-950 hover:bg-amber-200",
    rose: "border-rose-300/30 bg-rose-300 text-rose-950 hover:bg-rose-200",
  };
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-md border px-4 py-3 font-bold ${tones[tone]}`}
    >
      <Icon className="h-4 w-4" />
      {children}
    </button>
  );
}

export default function AdminPanel() {
  const { matchId = "1" } = useParams();
  const [match, setMatch] = useState(null);
  const [message, setMessage] = useState("Ready");
  const [connected, setConnected] = useState(socket.connected);

  useEffect(() => {
    if (!socket.connected) socket.connect();

    const onConnect = () => setConnected(true);
    const onDisconnect = () => setConnected(false);
    socket.emit("join_match", { match_id: Number(matchId) });
    const onMatch = (payload) => setMatch(payload);
    const onScore = (payload) => setMatch(payload);
    const onBall = (payload) => setMessage(payload.description);
    const onMoment = (payload) => setMessage(payload.message || payload.title);
    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("match_state", onMatch);
    socket.on("score_update", onScore);
    socket.on("new_ball_event", onBall);
    socket.on("big_moment", onMoment);
    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("match_state", onMatch);
      socket.off("score_update", onScore);
      socket.off("new_ball_event", onBall);
      socket.off("big_moment", onMoment);
    };
  }, [matchId]);

  function emit(event, payload = {}) {
    if (!socket.connected) {
      setMessage("Socket is reconnecting. Try again in a second.");
      socket.connect();
      return;
    }
    setMessage("Sent. Waiting for live update...");
    socket.emit(event, { match_id: Number(matchId), ...payload });
  }

  function triggerBall(outcome) {
    emit("admin_trigger_ball", { outcome });
  }

  return (
    <main className="min-h-screen px-4 py-5">
      <div className="mx-auto max-w-6xl">
        <header className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase text-emerald-300">Admin control</p>
            <h1 className="text-3xl font-black">Match Event Panel</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className={`rounded-md border px-3 py-2 text-sm font-bold ${connected ? "border-emerald-300/35 bg-emerald-300/15 text-emerald-100" : "border-rose-300/35 bg-rose-300/15 text-rose-100"}`}>
              {connected ? "Socket connected" : "Reconnecting"}
            </span>
            <Link className="rounded-md border border-white/10 px-3 py-2 text-sm font-semibold text-slate-200 hover:bg-white/10" to="/">
              Home
            </Link>
          </div>
        </header>

        <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="space-y-4">
            <Scoreboard match={match} compact />
            <section className="surface rounded-lg p-4">
              <div className="flex items-center gap-2 text-emerald-200">
                <Gauge className="h-4 w-4" />
                <p className="text-xs uppercase">Latest event</p>
              </div>
              <p className="mt-2 text-lg font-bold">{message}</p>
            </section>
          </div>

          <section className="surface rounded-lg p-5">
            <h2 className="text-xl font-bold">Trigger delivery</h2>
            <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3">
              {ballButtons.map(([label, outcome]) => (
                <AdminButton
                  key={outcome}
                  onClick={() => triggerBall(outcome)}
                  tone={outcome === "four" || outcome === "six" ? "amber" : outcome === "wicket" ? "rose" : "default"}
                  Icon={Radio}
                >
                  {label}
                </AdminButton>
              ))}
            </div>

            <h2 className="mt-8 text-xl font-bold">Interactive moments</h2>
            <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
              <AdminButton onClick={() => emit("admin_trigger_drs")} tone="rose" Icon={ShieldQuestion}>
                Start DRS
              </AdminButton>
              <AdminButton onClick={() => emit("admin_resolve_drs", { result: "out" })} tone="rose" Icon={ShieldQuestion}>
                Resolve DRS: Out
              </AdminButton>
              <AdminButton onClick={() => emit("admin_resolve_drs", { result: "not_out" })} Icon={ShieldQuestion}>
                Resolve DRS: Not Out
              </AdminButton>
              <AdminButton onClick={() => emit("admin_trigger_poll")} tone="green" Icon={Trophy}>
                Trigger Poll
              </AdminButton>
              <AdminButton onClick={() => emit("admin_trigger_trivia")} tone="amber" Icon={HelpCircle}>
                Trigger Trivia
              </AdminButton>
              <AdminButton onClick={() => emit("admin_end_innings")} Icon={StopCircle}>
                End Innings
              </AdminButton>
              <AdminButton onClick={() => emit("admin_end_match")} tone="rose" Icon={StopCircle}>
                End Match
              </AdminButton>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
