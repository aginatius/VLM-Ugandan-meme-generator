import { STEPS } from "../utils/meme";

export default function Pipeline({ step, loading, onStep }) {
  return (
    <div className="pipeline">
      {STEPS.map((item, i) => {
        const done = i < step;
        const active = i === step;

        return (
          <button
            key={item.id}
            className={`pl-step ${done ? "done" : ""} ${active ? "active" : ""}`}
            disabled={i > step || loading}
            onClick={() => onStep(i)}
          >
            <span className="pl-dot">{done ? "✓" : i + 1}</span>
            <span className="pl-label">{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}