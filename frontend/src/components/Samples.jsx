import { useState } from "react";
import { loadSamples } from "../utils/meme";

const SAMPLE_MEMES = [
  "/samples/sample-1.jpg",
  "/samples/sample-2.jpg",
  "/samples/sample-3.jpg",
  "/samples/sample-4.jpg",
  "/samples/sample-5.jpg",
  "/samples/sample-6.jpg",
];

export default function Samples() {
  const [samples] = useState(() => {
    const saved = loadSamples();

    if (saved.length) {
      return saved;
    }

    return SAMPLE_MEMES.map((src, index) => ({
      id: `default-${index}`,
      src,
    }));
  });

  return (
    <>
      <h2>Samples</h2>

      <div className="samples-grid">
        {samples.map((sample, index) => (
          <article
            className="sample-card"
            key={sample.id || sample.src}
          >
            <div className="sample-visual">
              <img
                src={sample.dataUrl || sample.src}
                alt={`Uganda AI Meme sample ${index + 1}`}
              />
            </div>

            <div className="sample-body">
              <a
                className="sample-dl"
                href={sample.dataUrl || sample.src}
                download={`uganda-meme-sample-${index + 1}.jpg`}
              >
                Download
              </a>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}