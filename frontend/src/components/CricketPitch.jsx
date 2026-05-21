import { motion } from "framer-motion";
import BallAnimation from "./BallAnimation.jsx";

export default function CricketPitch({ animationKey = 0, outcome = "dot", shake = false }) {
  return (
    <div className={`relative h-[520px] overflow-hidden rounded-lg border border-white/10 bg-emerald-950/70 shadow-broadcast ${shake ? "animate-shake" : ""}`}>
      <div className="pitch-stripe absolute inset-0 opacity-80" />
      <div className="absolute left-1/2 top-0 h-full w-28 -translate-x-1/2 bg-[#b9925a]" />
      <div className="absolute left-1/2 top-0 h-full w-20 -translate-x-1/2 border-x border-white/20 bg-[#caa36b]" />

      <div className="absolute left-1/2 top-12 h-20 w-[2px] -translate-x-1/2 bg-white/70" />
      <div className="absolute left-1/2 bottom-14 h-24 w-[2px] -translate-x-1/2 bg-white/70" />

      <div className="absolute left-1/2 top-24 flex -translate-x-1/2 gap-1">
        {[0, 1, 2].map((item) => (
          <span key={item} className="h-12 w-1 rounded-full bg-amber-100" />
        ))}
      </div>
      <div className="absolute left-1/2 bottom-20 flex -translate-x-1/2 gap-1">
        {[0, 1, 2].map((item) => (
          <motion.span
            key={item}
            animate={outcome === "wicket" ? { rotate: [-4, 8, -6, 0], y: [0, -10, 0] } : {}}
            className="h-14 w-1 rounded-full bg-amber-100"
          />
        ))}
      </div>

      <motion.div
        className="absolute left-1/2 top-10 -translate-x-1/2 rounded-full border border-white/15 bg-slate-950/75 px-4 py-2 text-sm font-semibold text-white"
        animate={{ y: [0, -4, 0] }}
        transition={{ duration: 1.4, repeat: Infinity }}
      >
        Bowler
      </motion.div>
      <motion.div
        className="absolute bottom-24 left-1/2 -translate-x-1/2 rounded-full border border-amber-200/30 bg-amber-400/20 px-4 py-2 text-sm font-semibold text-amber-50"
        animate={{ rotate: outcome === "six" || outcome === "four" ? [0, -10, 8, 0] : 0 }}
      >
        Batter
      </motion.div>

      <div className="absolute bottom-4 left-5 rounded-md border border-white/10 bg-black/35 px-3 py-2 text-xs text-slate-200">
        Live pitch view
      </div>
      <BallAnimation triggerKey={animationKey} outcome={outcome} />
    </div>
  );
}
