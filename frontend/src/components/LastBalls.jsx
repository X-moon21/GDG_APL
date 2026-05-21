const tone = {
  W: "bg-rose-500 text-white",
  4: "bg-amber-300 text-zinc-950",
  6: "bg-emerald-300 text-zinc-950",
  Wd: "bg-sky-300 text-zinc-950",
  Nb: "bg-violet-300 text-zinc-950",
};

export default function LastBalls({ balls = [], large = false }) {
  return (
    <div className="flex flex-wrap gap-2">
      {balls.map((ball, index) => (
        <span
          key={`${ball}-${index}`}
          className={`${tone[ball] || "bg-white/12 text-white"} grid place-items-center rounded-full border border-white/15 font-bold ${
            large ? "h-12 w-12 text-lg" : "h-9 w-9 text-sm"
          }`}
        >
          {ball}
        </span>
      ))}
    </div>
  );
}
