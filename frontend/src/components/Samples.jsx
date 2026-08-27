const SAMPLE_MEMES = [
  "/samples/sample-1.jpg",
  "/samples/sample-2.jpg",
  "/samples/sample-3.jpg",
  "/samples/sample-4.jpg",
  "/samples/sample-5.jpg",
  "/samples/sample-6.jpg",
];

export default function Samples() {
  return (
    <>
      <h2>Samples</h2>

      <div className="samples-grid">
        {SAMPLE_MEMES.map((src, index) => (
          <article
            className="sample-card"
            key={src}
          >
            <div className="sample-visual">
              <img
                src={src}
                alt={`Uganda AI Meme sample ${index + 1}`}
              />
            </div>

            <div className="sample-body">
              <a
                className="sample-dl"
                href={src}
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