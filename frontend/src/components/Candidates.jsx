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
    <div className="candidates-screen">
      <div className="candidates-header">
        <div>
          <h2>
            {isImage
              ? "Choose a template"
              : "Choose a caption"}
          </h2>

          <p>
            {isImage
              ? "Pick the visual that best fits your idea."
              : "Pick the caption that best fits your meme."}
          </p>
        </div>
      </div>

      <div className="cand-grid">
        {candidates.slice(0, 3).map((candidate, index) => {
          const selected = selectedIdx === index;

          return (
            <div
              className={`cand-card ${
                index === 0 ? "top" : ""
              } ${selected ? "selected" : ""}`}
              key={candidate.id || index}
              onClick={() => onSelect(index)}
            >
              <span
                className={`cand-rank ${
                  index === 0 ? "r1" : ""
                }`}
              >
                #{index + 1}
                {index === 0 && " · top pick"}
              </span>

              <span className="cand-score">
                {candidate.score}%
              </span>

              {isImage ? (
                <>
                  <div className="template-image-wrap">
                    <img
                      src={candidate.image}
                      alt={`Template ${index + 1}`}
                      className="template-image"
                    />
                  </div>

                  <div className="cand-body">
                    <button
                      className="cand-pick-btn"
                      onClick={(event) => {
                        event.stopPropagation();
                        onSelect(index);
                      }}
                    >
                      {selected
                        ? "Selected"
                        : "Use this template"}
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="caption-content">
                    {candidate.structure ===
                    "setup-punchline" ? (
                      <>
                        <div className="caption-setup">
                          {candidate.setup}
                        </div>

                        <div className="caption-punchline">
                          {candidate.punchline}
                        </div>
                      </>
                    ) : (
                      <div className="cand-one-liner">
                        {candidate.label}
                      </div>
                    )}
                  </div>

                  <div className="cand-body">
                    <button
                      className="cand-pick-btn"
                      onClick={(event) => {
                        event.stopPropagation();
                        onSelect(index);
                      }}
                    >
                      {selected
                        ? "Selected"
                        : "Use this caption"}
                    </button>
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>

      <div className="btn-row">
        <button
          className="btn btn-ghost"
          onClick={onBack}
        >
          ← Back
        </button>

        <button
          className="btn btn-primary"
          onClick={onContinue}
        >
          {isImage
            ? "Continue with selected →"
            : "Compose meme →"}
        </button>

        <button
          className="btn btn-quiet"
          onClick={onRegenerate}
        >
          {isImage
            ? "Regenerate candidates"
            : "Regenerate captions"}
        </button>
      </div>
    </div>
  );
}