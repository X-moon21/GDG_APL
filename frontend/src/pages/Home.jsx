import { motion } from "framer-motion";
import { Radio, Settings, Smartphone, Tv } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Scoreboard from "../components/Scoreboard.jsx";
import { API_URL } from "../socket.js";

export default function Home() {
  const [match, setMatch] = useState(null);

  useEffect(() => {
    fetch(`${API_URL}/api/matches`)
      .then((res) => res.json())
      .then((data) => setMatch(data[0]))
      .catch(() => setMatch(null));
  }, []);

  return (
    <main className="min-h-screen broadcast-grid px-4 py-8">
      <div className="mx-auto max-w-6xl">
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-300/25 bg-emerald-300/10 px-4 py-2 text-sm font-semibold text-emerald-200">
            <Radio className="h-4 w-4" />
            Live demo match
          </div>
          <h1 className="mt-5 text-5xl font-black text-white md:text-7xl">FanPulse Cricket</h1>
          <p className="mt-4 max-w-2xl text-lg text-slate-300">
            A second-screen fan layer for live cricket with predictions, polls, trivia, reactions, and leaderboards.
          </p>
        </motion.div>

        <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
          <Scoreboard match={match} />
          <section className="surface rounded-lg p-5">
            <h2 className="text-2xl font-bold">Demo tabs</h2>
            <p className="mt-2 text-sm text-slate-400">Open these in three browser tabs for the hackathon flow.</p>
            <div className="mt-5 grid gap-3">
              <Link className="inline-flex items-center justify-center gap-2 rounded-md bg-emerald-300 px-4 py-3 font-bold text-emerald-950 hover:bg-emerald-200" to="/join/1">
                <Smartphone className="h-5 w-5" />
                Join as Fan
              </Link>
              <Link className="inline-flex items-center justify-center gap-2 rounded-md border border-white/12 bg-white/[0.06] px-4 py-3 font-bold text-white hover:bg-white/12" to="/simulation/1">
                <Tv className="h-5 w-5" />
                Open Simulation
              </Link>
              <Link className="inline-flex items-center justify-center gap-2 rounded-md border border-white/12 bg-white/[0.06] px-4 py-3 font-bold text-white hover:bg-white/12" to="/admin/1">
                <Settings className="h-5 w-5" />
                Open Admin
              </Link>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
