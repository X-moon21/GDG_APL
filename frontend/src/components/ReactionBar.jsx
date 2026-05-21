import { Flame, Heart, PartyPopper, ThumbsUp, Zap } from "lucide-react";

const reactions = [
  { emoji: "🔥", label: "Fire", Icon: Flame },
  { emoji: "⚡", label: "Buzz", Icon: Zap },
  { emoji: "👏", label: "Clap", Icon: ThumbsUp },
  { emoji: "❤️", label: "Love", Icon: Heart },
  { emoji: "🎉", label: "Party", Icon: PartyPopper },
];

export default function ReactionBar({ onReact }) {
  return (
    <section className="surface rounded-lg p-4">
      <p className="text-xs uppercase text-emerald-300">React now</p>
      <div className="mt-3 grid grid-cols-5 gap-2">
        {reactions.map(({ emoji, label, Icon }) => (
          <button
            key={emoji}
            type="button"
            title={label}
            onClick={() => onReact(emoji)}
            className="grid h-12 place-items-center rounded-md border border-white/10 bg-white/[0.06] text-xl transition hover:bg-white/15"
          >
            <span className="sr-only">{label}</span>
            <Icon className="h-5 w-5 text-amber-200" />
          </button>
        ))}
      </div>
    </section>
  );
}
