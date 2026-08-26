export default function FinalMeme({
  image,
  caption,
  finalDataUrl,
  onBack,
  onStartOver,
}) {
  function download() {
    const link = document.createElement("a");
    link.href = finalDataUrl;
    link.download = "uganda-ai-meme.png";
    link.click();
  }

  return (
    <>
      <h2>Final meme</h2>

      <div className="result-layout">
        <div>
          <img
            className="final-meme-image"
            src={finalDataUrl}
            alt="Composed meme"
          />
        </div>

        <div className="result-actions">
          <div className="result-fits">
            <div className="result-fit">
              <div className="num">{image.score}%</div>
              <div className="lbl">Image fit</div>
            </div>
            <div className="result-fit">
              <div className="num">{caption.score}%</div>
              <div className="lbl">Caption fit</div>
            </div>
          </div>

          <div className="result-download">
            <button className="btn btn-primary" onClick={download}>
              Download meme
            </button>
          </div>

          <div className="result-bottom-nav">
            <button className="btn btn-ghost" onClick={onBack}>
              ← Back to captions
            </button>
            <button className="btn btn-quiet" onClick={onStartOver}>
              Start a new meme
            </button>
          </div>
        </div>
      </div>
    </>
  );
}