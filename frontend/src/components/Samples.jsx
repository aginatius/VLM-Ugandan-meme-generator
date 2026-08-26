import { useEffect, useState } from "react";
import { loadSamples, renderPlaceholderMeme } from "../utils/meme";

const DEFAULT_SAMPLES = [
  { image: 0, caption: 0 },
  { image: 1, caption: 0 },
  { image: 2, caption: 1 },
  { image: 0, caption: 1 },
  { image: 1, caption: 1 },
  { image: 2, caption: 0 },
];

export default function Samples() {
  const [samples, setSamples] = useState([]);

  useEffect(() => {
    const saved = loadSamples();

    if (saved.length) {
      setSamples(saved);
    } else {
      setSamples(
        DEFAULT_SAMPLES.map((sample, index) => ({
          ...sample,
          id: `default-${index}`,
          dataUrl: renderPlaceholderMeme(sample.image, sample.caption),
        }))
      );
    }
  }, []);

  return (
    <div className="samples-grid">
      {samples.map((sample) => (
        <article className="sample-card" key={sample.id}>
          <div className="sample-visual">
            <img
              src={sample.dataUrl}
              alt="Uganda AI Meme Studio sample"
            />
          </div>

          <div className="sample-body">
            {sample.dataUrl && (
              <a
                className="sample-dl"
                href={sample.dataUrl}
                download="uganda-ai-meme.png"
              >
                Download
              </a>
            )}
          </div>
        </article>
      ))}
    </div>
  );
}