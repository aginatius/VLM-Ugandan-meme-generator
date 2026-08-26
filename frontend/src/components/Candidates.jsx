export default function Candidates({
  type,
  candidates,
  selectedIdx,
  onSelect,
  onBack,
  onContinue,
  onRegenerate,
}) {
  const isImage = type === "image";

  return (
    <>
      <h2>{isImage ? "Templates" : "Captions"}</h2>

      <div className={`cand-grid ${isImage ? "template-grid" : "caption-grid"}`}>
        {candidates.slice(0, 3).map((candidate, i) => (
          <div
            key={`${candidate.label}-${i}`}
            className={`cand-card ${i === 0 ? "top" : ""} ${
              selectedIdx === i ? "selected" : ""
            }`}
          >
            <span className={`cand-rank ${i === 0 ? "r1" : ""}`}>
              #{i + 1}
              {isImage && i === 0 ? " · top pick" : ""}
            </span>

            <span className="cand-score">{candidate.score}%</span>

            {isImage ? (
              <div className="placeholder-box" />
            ) : (
              <div className="cand-body caption-body">
                {candidate.structure === "one-liner" ? (
                  <div className="cand-caption-line one-line-placeholder">
                    One-liner placeholder
                  </div>
                ) : (
                  <>
                    <div className="cand-caption-line">Setup placeholder</div>
                    <div className="cand-caption-line">Punchline placeholder</div>
                  </>
                )}

                <button
                  className="cand-pick-btn"
                  onClick={() => onSelect(i)}
                >
                  {selectedIdx === i ? "Selected" : "Use this caption"}
                </button>
              </div>
            )}

            {isImage && (
              <div className="cand-body">
                <button
                  className="cand-pick-btn"
                  onClick={() => onSelect(i)}
                >
                  {selectedIdx === i ? "Selected" : "Use this template"}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="btn-row">
        <button className="btn btn-ghost" onClick={onBack}>
          ← Back
        </button>
        <button className="btn btn-primary" onClick={onContinue}>
          {isImage ? "Continue with selected →" : "Compose meme →"}
        </button>
        <button className="btn btn-quiet" onClick={onRegenerate}>
          Regenerate {isImage ? "candidates" : "captions"}
        </button>
      </div>
    </>
  );
}