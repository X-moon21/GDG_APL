import { TimerReset } from "lucide-react";
import { useState } from "react";

const fallbackOptions = [
  { key: "0-6", label: "0-6 runs" },
  { key: "7-10", label: "7-10 runs" },
  { key: "11-15", label: "11-15 runs" },
  { key: "16+", label: "16+ runs" },
];

export default function OverPredictionCard({ data, onSubmit }) {
  const [selected, setSelected] = useState("7-10");
  if (!data) return null;

  const options = data.options || fallbackOptions;

  return (
    <section className="surface rounded-lg p-4">
      <div className="flex items-center gap-2 text-amber-200">
        <TimerReset className="h-4 w-4" />
        <p className="text-xs uppercase">Over prediction</p>
      </div>
      <h2 className="mt-1 text-lg font-bold text-white">{data.question}</h2>
      <div className="mt-3 grid grid-cols-2 gap-2">
        {options.map((option) => (
          <button
            key={option.key}
            type="button"
            onClick={() => setSelected(option.key)}
            className={`rounded-md border px-3 py-2 text-sm font-semibold ${
              selected === option.key
                ? "border-amber-200 bg-amber-200 text-slate-950"
                : "border-white/10 bg-white/[0.06] text-white"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
      <button
        type="button"
        onClick={() => onSubmit(selected)}
        className="mt-3 w-full rounded-md bg-amber-300 px-4 py-2 font-bold text-slate-950 hover:bg-amber-200"
      >
        Save Over Call
      </button>
    </section>
  );
}
