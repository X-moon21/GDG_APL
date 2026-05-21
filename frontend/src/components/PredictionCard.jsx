import { Send } from "lucide-react";
import { useState } from "react";

const fallbackOptions = [
  { key: "dot", label: "Dot Ball", points: 20 },
  { key: "1", label: "1 Run", points: 20 },
  { key: "2", label: "2 Runs", points: 20 },
  { key: "3", label: "3 Runs", points: 20 },
  { key: "four", label: "Four", points: 30 },
  { key: "six", label: "Six", points: 40 },
  { key: "wicket", label: "Wicket", points: 50 },
  { key: "wide", label: "Wide/No Ball", points: 20 },
];

export default function PredictionCard({ prediction, onSubmit }) {
  const options = prediction?.options || fallbackOptions;
  const [selected, setSelected] = useState(options[0]?.key || "dot");

  return (
    <section className="surface rounded-lg p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase text-emerald-300">Next ball</p>
          <h2 className="text-xl font-bold text-white">{prediction?.question || "What happens on the next ball?"}</h2>
        </div>
        <span className="rounded-full bg-emerald-400 px-3 py-1 text-xs font-bold text-emerald-950">Open</span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {options.map((option) => (
          <button
            key={option.key}
            type="button"
            onClick={() => setSelected(option.key)}
            className={`rounded-md border px-3 py-3 text-sm font-bold transition ${
              selected === option.key
                ? "border-emerald-300 bg-emerald-300 text-emerald-950"
                : "border-white/10 bg-white/[0.06] text-white hover:bg-white/10"
            }`}
          >
            <span className="block">{option.label}</span>
            <span className="text-xs opacity-75">+{option.points || 20}</span>
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={() => onSubmit(selected)}
        className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-md bg-white px-4 py-3 font-bold text-slate-950 hover:bg-emerald-100"
      >
        <Send className="h-4 w-4" />
        Lock Prediction
      </button>
    </section>
  );
}
