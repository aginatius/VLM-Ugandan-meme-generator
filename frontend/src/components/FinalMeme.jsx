import { useEffect, useRef, useState } from "react";
import { clamp, drawCaptionMeme } from "../utils/captionCanvas";

export default function FinalMeme({ image, caption, onBack, onStartOver, onSave }) {
  const canvasRef = useRef(null);
  const layoutRef = useRef(null);
  const dragRef = useRef(null);
  const [loaded, setLoaded] = useState(null);
  const [error, setError] = useState("");
  const [notification, setNotification] = useState(null);
  const [downloading, setDownloading] = useState(false);
  const [position, setPosition] = useState(1);
  const [fontScale, setFontScale] = useState(0.09);
  const [background, setBackground] = useState(true);
  const source = image?.imageUrl || image?.image;
  const ready = loaded?.src === source && !!loaded;

  useEffect(() => {
    if (!notification) return;
    const timer = setTimeout(() => setNotification(null), 6000);
    return () => clearTimeout(timer);
  }, [notification]);

  useEffect(() => {
    let cancelled = false;
    const original = new Image();
    original.onload = () => { if (!cancelled) setLoaded({ src: source, image: original }); };
    original.onerror = () => { if (!cancelled) setError("Could not open the original image. Go back and choose it again."); };
    original.src = source || "";
    return () => { cancelled = true; };
  }, [source]);

  useEffect(() => {
    if (!ready || !canvasRef.current) return;
    layoutRef.current = drawCaptionMeme(canvasRef.current, loaded.image, caption?.label || "", {
      position, fontScale, background,
    });
  }, [ready, loaded, caption, position, fontScale, background]);

  function startDrag(event) {
    if (!ready || !layoutRef.current || (event.pointerType === "mouse" && event.button !== 0)) return;
    const canvas = event.currentTarget;
    const rect = canvas.getBoundingClientRect();
    const y = (event.clientY - rect.top) * canvas.height / rect.height;
    const layout = layoutRef.current;
    if (y < layout.top || y > layout.top + layout.height) return;
    canvas.setPointerCapture(event.pointerId);
    dragRef.current = { pointerId: event.pointerId, y: event.clientY, position, travel: layout.travel * rect.height / canvas.height };
  }

  function moveDrag(event) {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId || !drag.travel) return;
    setPosition(clamp(drag.position + (event.clientY - drag.y) / drag.travel, 0, 1));
  }

  function endDrag(event) {
    if (dragRef.current?.pointerId !== event.pointerId) return;
    dragRef.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
  }

  async function download() {
    if (!ready || downloading) return;
    setDownloading(true);
    setNotification(null);
    setError("");
    try {
      const dataUrl = canvasRef.current.toDataURL("image/png");
      if (typeof window.showSaveFilePicker === "function") {
        const handle = await window.showSaveFilePicker({
          suggestedName: "uganda-ai-meme.png",
          types: [{ description: "PNG image", accept: { "image/png": [".png"] } }],
        });
        const blob = await new Promise((resolve) => canvasRef.current.toBlob(resolve, "image/png"));
        if (!blob) throw new Error("Could not encode image");
        const writable = await handle.createWritable();
        try {
          await writable.write(blob);
          await writable.close();
        } catch (failure) {
          await writable.abort().catch(() => {});
          throw failure;
        }
        setNotification({ text: "Download completed! Your meme has been saved." });
      } else {
        const link = document.createElement("a");
        link.href = dataUrl;
        link.download = "uganda-ai-meme.png";
        link.click();
        setNotification({ text: "Download started! Check your browser's downloads for your meme." });
      }
      try {
        onSave?.(dataUrl);
      } catch {
        setError("Your download is ready, but your browser's sample gallery is full.");
      }
    } catch (failure) {
      if (failure.name === "AbortError") return;
      setError("Could not save this meme. Please try again.");
    } finally {
      setDownloading(false);
    }
  }

  return (
    <>
      <h2>Make it yours</h2>
      <p className="screen-sub">Drag the caption up or down. Your download will look exactly like this preview.</p>
      {error && <p role="alert">{error}</p>}
      {notification && (
        <div className="download-notification" role="status" aria-live="polite">
          <span>{notification.text}</span>
          <button aria-label="Dismiss download notification" onClick={() => setNotification(null)}>{"\u00d7"}</button>
        </div>
      )}
      <div className="result-layout">
        <div className="meme-editor-preview">
          {!ready && !error && <p role="status">Opening your image...</p>}
          <canvas
            ref={canvasRef}
            className="final-meme-image meme-editor-canvas"
            hidden={!ready}
            aria-label={`Meme preview: ${caption?.label || ""}. Use the caption position control to move the text.`}
            onPointerDown={startDrag}
            onPointerMove={moveDrag}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
            onLostPointerCapture={() => { dragRef.current = null; }}
          />
          <p className="editor-hint">Touch or click the caption and drag to reposition it.</p>
        </div>
        <div className="result-actions">
          <div className="caption-editor-controls">
            <label htmlFor="caption-size">Caption size <span>{Math.round(fontScale * 100)}%</span></label>
            <input id="caption-size" type="range" min="5" max="14" step="0.5" value={fontScale * 100} onChange={(event) => setFontScale(Number(event.target.value) / 100)} />
            <label htmlFor="caption-position">Caption position <span>{position < 0.34 ? "Top" : position > 0.66 ? "Bottom" : "Middle"}</span></label>
            <input id="caption-position" type="range" min="0" max="100" value={Math.round(position * 100)} onChange={(event) => setPosition(Number(event.target.value) / 100)} />
            <div className="caption-background-control">
              <span>Black background</span>
              <button className="caption-background-toggle" aria-pressed={background} aria-label={background ? "Remove black caption background" : "Add black caption background"} onClick={() => setBackground((current) => !current)}>
                <span aria-hidden="true">{background ? "\u2212" : "+"}</span>
                {background ? "Remove" : "Add"}
              </button>
            </div>
            <button className="btn btn-ghost" onClick={() => { setPosition(1); setFontScale(0.09); setBackground(true); }}>Reset caption layout</button>
          </div>
          <div className="result-download">
            <button className="btn btn-primary" disabled={!ready || downloading} onClick={download}>{downloading ? "Saving meme..." : "Download meme"}</button>
          </div>
          <div className="result-bottom-nav">
            <button className="btn btn-ghost" onClick={onBack}>{"\u2190"} Back to captions</button>
            <button className="btn btn-quiet" onClick={onStartOver}>Start a new meme</button>
          </div>
        </div>
      </div>
    </>
  );
}
