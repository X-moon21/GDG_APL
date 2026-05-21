import { motion } from "framer-motion";

export default function BallAnimation({ triggerKey = 0, outcome = "dot" }) {
  const isSix = outcome === "six";
  const isFour = outcome === "four";
  const isWicket = outcome === "wicket";

  return (
    <motion.div
      key={triggerKey}
      className="absolute left-1/2 top-[15%] z-20 h-5 w-5 rounded-full border-2 border-white/80 bg-rose-600 shadow-[0_0_24px_rgba(248,113,113,0.9)]"
      initial={{ x: -12, y: 0, scale: 0.8, opacity: 0 }}
      animate={{
        x: isSix ? 190 : isFour ? 150 : isWicket ? 4 : 24,
        y: isSix ? -80 : isFour ? 110 : isWicket ? 240 : 250,
        scale: isSix ? 1.7 : isFour ? 1.25 : 1,
        opacity: [0, 1, 1, 0.9],
      }}
      transition={{ duration: 0.9, ease: "easeOut" }}
    />
  );
}
