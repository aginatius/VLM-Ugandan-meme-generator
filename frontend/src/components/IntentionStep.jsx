import { INTENTS, STYLES } from "../utils/meme";

export default function IntentionStep({
  topic,
  imageFile,
  lang,
  intent,
  style,
  onTopic,
  onImage,
  onLang,
  onIntent,
  onStyle,
  onGenerate,
  onSkip,
}) {
  const hasTopic = topic.trim().length > 0;

  return (
    <>
      <div className="eyebrow">Mwizerwa / Qwen2.5-VL</div>
      <h2>Turn a photo into a Ugandan meme</h2>
      <p className="screen-sub">Upload a photo, describe the moment, and let the finetuned vision model write caption options in English, Luganda, or a natural mix.</p>

      <div className="field">
        <label htmlFor="meme-image">1. Choose a photo</label>
        <input
          id="meme-image"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={(event) => onImage(event.target.files?.[0] || null)}
        />
        {imageFile && <small>{imageFile.name}</small>}
      </div>

      <div className="field">
        <textarea
          value={topic}
          onChange={(e) => onTopic(e.target.value)}
          placeholder="e.g. A boda rider ignores the traffic lights while the passenger panics"
        />
      </div>

      <div className="field">
        <label>Powered by</label>
        <div className="model-badge">Mwizerwa/meme-qwen2.5-vl-finetuned</div>
      </div>

      <div className="field">
        <label>Language</label>
        <div className="lang-pill">
          {[
            ["lg", "Luganda"],
            ["en", "English"],
            ["mix", "Mix"],
            ["any", "Any"],
          ].map(([value, label]) => (
            <button
              key={value}
              className={lang === value ? "active" : ""}
              onClick={() => onLang(value)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="field">
        <label>Communicative intention</label>
        <div className="chip-row">
          {INTENTS.map((value) => (
            <button
              key={value}
              className={`chip ${intent === value ? "selected" : ""}`}
              onClick={() => onIntent(value)}
            >
              {value}
            </button>
          ))}
        </div>
      </div>

      <div className="field">
        <label>Tone / style</label>
        <div className="chip-row">
          {STYLES.map((value) => (
            <button
              key={value}
              className={`chip ${style === value ? "selected" : ""}`}
              onClick={() => onStyle(value)}
            >
              {value}
            </button>
          ))}
        </div>
      </div>

      <div className="btn-row">
        <button
          className="btn btn-primary"
          disabled={!hasTopic || (!imageFile && !hasTopic)}
          onClick={onGenerate}
        >
          {imageFile ? "Generate →" : "Generate meme image →"}
        </button>
        <button
          className="btn btn-ghost"
          disabled={!hasTopic || !imageFile}
          onClick={onSkip}
        >
          Skip to result
        </button>
      </div>
    </>
  );
}