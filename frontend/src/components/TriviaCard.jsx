import { Brain } from "lucide-react";
import { useState } from "react";

export default function TriviaCard({ trivia, onSubmit }) {
  const [selected, setSelected] = useState("A");
  if (!trivia) return null;

  return (
    <section className="surface rounded-lg border-emerald-300/30 p-4">
      <div className="flex items-center gap-2 text-emerald-200">
        <Brain className="h-4 w-4" />
        <p className="text-xs uppercase">Trivia</p>
      </div>
      <h2 className="mt-1 text-lg font-bold text-white">{trivia.question}</h2>
      <div className="mt-3 grid gap-2">
        {(trivia.options || []).map((option) => (
          <button
            key={option.key}
            type="button"
            onClick={() => setSelected(option.key)}
            className={`rounded-md border px-3 py-2 text-left text-sm font-semibold ${
              selected === option.key
                ? "border-emerald-300 bg-emerald-300 text-emerald-950"
                : "border-white/10 bg-white/[0.06] text-white"
            }`}
          >
            {option.key}. {option.text}
          </button>
        ))}
      </div>
      <button
        type="button"
        onClick={() => onSubmit(trivia.id, selected)}
        className="mt-3 w-full rounded-md bg-white px-4 py-2 font-bold text-slate-950 hover:bg-emerald-100"
      >
        Submit Answer
      </button>
    </section>
  );
}
