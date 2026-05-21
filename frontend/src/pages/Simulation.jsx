import confetti from "canvas-confetti";
import { AnimatePresence, motion } from "framer-motion";
import { Maximize2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import CricketPitch from "../components/CricketPitch.jsx";
import LastBalls from "../components/LastBalls.jsx";
import Scoreboard from "../components/Scoreboard.jsx";
import { socket } from "../socket.js";

function overlayTitle(moment) {
  if (!moment) return "";
  if (moment.type === "DRS") return "DRS";
  if (moment.type === "TRIVIA") return "TRIVIA";
  if (moment.type === "POLL") return "POLL";
  if (moment.type === "WICKET") return "WICKET";
  if (moment.type === "SIX") return "SIX";
  if (moment.type === "FOUR") return "FOUR";
  return moment.title || moment.type;
}

export default function Simulation() {
  const { matchId = "1" } = useParams();
  const [match, setMatch] = useState(null);
  const [animation, setAnimation] = useState({ key: 0, outcome: "dot" });
  const [moment, setMoment] = useState(null);
  const [lastEvent, setLastEvent] = useState(null);

  useEffect(() => {
    socket.emit("join_match", { match_id: Number(matchId) });

    const onMatch = (payload) => setMatch(payload);
    const onScore = (payload) => setMatch(payload);
    const onAnimation = (payload) => {
      setAnimation((current) => ({ key: current.key + 1, outcome: payload.outcome || "dot" }));
      if (payload.outcome === "six") {
        confetti({ particleCount: 120, spread: 80, origin: { y: 0.62 } });
      }
      if (payload.outcome === "four") {
        confetti({ particleCount: 70, spread: 55, origin: { y: 0.7 } });
      }
    };
    const onBall = (payload) => {
      setLastEvent(payload);
      if (payload.is_boundary || payload.is_wicket) {
        setMoment({
          type: payload.outcome.toUpperCase(),
          title: payload.outcome.toUpperCase(),
          message: payload.description,
        });
        window.setTimeout(() => setMoment(null), 2100);
      }
    };
    const onMoment = (payload) => {
      setMoment(payload);
      window.setTimeout(() => setMoment(null), 2600);
    };

    socket.on("match_state", onMatch);
    socket.on("score_update", onScore);
    socket.on("simulation_animation", onAnimation);
    socket.on("new_ball_event", onBall);
    socket.on("big_moment", onMoment);

    return () => {
      socket.off("match_state", onMatch);
      socket.off("score_update", onScore);
      socket.off("simulation_animation", onAnimation);
      socket.off("new_ball_event", onBall);
      socket.off("big_moment", onMoment);
    };
  }, [matchId]);

  return (
    <main className="min-h-screen overflow-hidden bg-[#06130c] p-4">
      <div className="mx-auto max-w-7xl">
        <header className="mb-4 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase text-emerald-300">FanPulse Broadcast</p>
            <h1 className="text-3xl font-black">India vs Australia</h1>
          </div>
          <Link className="inline-flex items-center gap-2 rounded-md border border-white/10 px-3 py-2 text-sm font-semibold text-slate-200 hover:bg-white/10" to="/">
            <Maximize2 className="h-4 w-4" />
            Lobby
          </Link>
        </header>

        <div className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="space-y-4">
            <Scoreboard match={match} />
            <section className="surface rounded-lg p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs uppercase text-emerald-300">Last delivery</p>
                  <h2 className="mt-1 text-xl font-bold">{lastEvent?.description || "Waiting for admin to trigger a ball"}</h2>
                </div>
                <LastBalls balls={match?.last_balls || []} large />
              </div>
            </section>
          </div>

          <CricketPitch
            animationKey={animation.key}
            outcome={animation.outcome}
            shake={animation.outcome === "wicket"}
          />
        </div>
      </div>

      <AnimatePresence>
        {moment && (
          <motion.div
            initial={{ opacity: 0, scale: 0.82 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.92 }}
            className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-6"
          >
            <div className="max-w-3xl text-center">
              <motion.h2
                initial={{ y: 20 }}
                animate={{ y: 0 }}
                className="text-6xl font-black text-white md:text-8xl"
              >
                {overlayTitle(moment)}
              </motion.h2>
              <p className="mt-4 text-xl font-semibold text-emerald-100 md:text-2xl">{moment.message}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
