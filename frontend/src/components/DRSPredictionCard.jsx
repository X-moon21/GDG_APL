import { BadgeAlert } from "lucide-react";
import { useState } from "react";

export default function DRSPredictionCard({ data, onSubmit }) {
  const [selected, setSelected] = useState("out");
  if (!data) return null;

  return (
    <section className="rounded-lg border border-rose-300/30 bg-rose-950/65 p-4 shadow-broadcast">
      <div className="flex items-center gap-2 text-rose-100">
        <BadgeAlert className="h-4 w-4" />
        <p className="text-xs font-bold uppercase">DRS live</p>
      </div>
      <h2 className="mt-1 text-lg font-bold text-white">{data.question}</h2>
      <div className="mt-3 grid grid-cols-2 gap-2">
        {(data.options || []).map((option) => (
          <button
            key={option.key}
            type="button"
            onClick={() => setSelected(option.key)}
            className={`rounded-md border px-3 py-3 text-sm font-bold ${
              selected === option.key
                ? "border-white bg-white text-rose-950"
                : "border-white/15 bg-white/10 text-white"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
      <button
        type="button"
        onClick={() => onSubmit(selected)}
        className="mt-3 w-full rounded-md bg-rose-300 px-4 py-2 font-bold text-rose-950 hover:bg-rose-200"
      >
        Lock DRS Call
      </button>
    </section>
  );
}
