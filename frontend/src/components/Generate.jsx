import { useState } from "react";

const TEMPLATES = [
  {
    id: 1,
    image: "/templates/template-1.jpg",
    score: 94,
  },
  {
    id: 2,
    image: "/templates/template-2.jpg",
    score: 89,
  },
  {
    id: 3,
    image: "/templates/template-3.jpg",
    score: 84,
  },
];

export default function Generate() {
  const [selectedTemplate, setSelectedTemplate] = useState(0);

  return (
    <div className="generate-screen">
      <h2>Templates</h2>

      <div className="cand-grid template-grid">
        {TEMPLATES.map((template, index) => (
          <div
            className={`cand-card ${
              index === 0 ? "top" : ""
            } ${
              selectedTemplate === index ? "selected" : ""
            }`}
            key={template.id}
            onClick={() => setSelectedTemplate(index)}
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
              {template.score}%
            </span>

            <div className="template-image-wrap">
              <img
                src={template.image}
                alt={`Template ${index + 1}`}
                className="template-image"
              />
            </div>

            <div className="cand-body">
              <button
                className="cand-pick-btn"
                onClick={(event) => {
                  event.stopPropagation();
                  setSelectedTemplate(index);
                }}
              >
                {selectedTemplate === index
                  ? "Selected"
                  : "Use this template"}
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="btn-row">
        <button className="btn btn-ghost">
          ← Back
        </button>

        <button className="btn btn-primary">
          Continue with selected →
        </button>

        <button className="btn btn-quiet">
          Regenerate candidates
        </button>
      </div>
    </div>
  );
}