export default function Candidates({
  type,
  candidates,
  selectedIdx,
  onSelect,
  onBack,
  onContinue,
  onRegenerate,
  generating = false,
  onRetry,
}) {
  const isImage = type === "image";

  return (
    <div className="candidates-screen">
      <div className="candidates-header">
        <div>
          <h2>
            {isImage
              ? "Choose an image"
              : "Choose a caption"}
          </h2>

          <p>
            {isImage
              ? "Pick the visual that best fits your idea."
              : "Pick the caption that best fits your meme."}
          </p>
        </div>
      </div>

      {isImage && generating && (
        <p className="generation-progress" role="status" aria-live="polite">
          {candidates.filter((candidate) => candidate.file).length} of {candidates.length} images ready.
          You can continue with a ready image while the others load.
        </p>
      )}

      <div className="cand-grid">
        {candidates.slice(0, 3).map((candidate, index) => {
          const selected = selectedIdx === index;
          const unavailable = isImage && (candidate.status === "pending" || candidate.status === "error");

          return (
            <div
              className={`cand-card ${
                index === 0 ? "top" : ""
              } ${selected ? "selected" : ""}`}
              key={candidate.id || index}
              onClick={() => { if (!unavailable) onSelect(index); }}
            >
              <span
                className={`cand-rank ${
                  index === 0 ? "r1" : ""
                }`}
              >
                #{index + 1}
                {index === 0 && " · top pick"}
              </span>

              {!unavailable && <span className="cand-score">
                {candidate.score}%
              </span>}

              {isImage ? (
                <>
                  <div className="template-image-wrap">
                    {unavailable ? (
                      <div className="candidate-placeholder" role="status">
                        {candidate.status === "pending" ? (
                          <><div className="spinner" /><p>Generating image {index + 1}...</p></>
                        ) : <p>{candidate.error || "This image could not be generated."}</p>}
                      </div>
                    ) : <img
                      src={candidate.image || candidate.imageUrl}
                      alt={`Template ${index + 1}`}
                      className="template-image"
                    />}
                  </div>
                  <div className="cand-body">
                    <button
                      className="cand-pick-btn"
                      disabled={candidate.status === "pending" || (candidate.status === "error" && generating)}
                      onClick={(event) => {
                        event.stopPropagation();
                        if (candidate.status === "error") onRetry?.(index);
                        else onSelect(index);
                      }}
                    >
                      {candidate.status === "pending" ? "Generating..." : candidate.status === "error" ? "Retry this image" : selected
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
          disabled={isImage && !candidates[selectedIdx]?.file}
        >
          {isImage
            ? "Continue with selected →"
            : "Compose meme →"}
        </button>

        <button
          className="btn btn-quiet"
          onClick={onRegenerate}
          disabled={generating}
        >
          {isImage
            ? "Regenerate candidates"
            : "Regenerate captions"}
        </button>
      </div>
    </div>
  );
}
