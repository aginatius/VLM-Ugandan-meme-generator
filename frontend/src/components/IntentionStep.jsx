import { INTENTS, STYLES } from "../utils/meme";

export default function IntentionStep({
  topic,
  imageFile,
  lang,
  intent,
  style,
  onTopic,
  model,
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
      <h2>What should the meme communicate?</h2>

      <div className="field">
        <label htmlFor="meme-image">Image</label>
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
          placeholder="e.g. A funny meme about a boda rider ignoring traffic lights while the passenger panics"
        />
      </div>

      <div className="field">
        <label>Model</label>
        <div className="chip-row">
          {[
            ["paligemma2", "PaliGemma 2"],
            ["qwen25-vl", "Qwen2.5-VL"],
            ["internvl25", "InternVL2.5"],
            ["llava-onevision", "LLaVA-OneVision"],
            ["minicpm-v", "MiniCPM-V"],
          ].map(([value, label]) => (
            <button
              key={value}
              className={`chip ${model === value ? "selected" : ""}`}
              onClick={() => onModel(value)}
            >
              {label}
            </button>
          ))}
        </div>
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
          disabled={!hasTopic || !imageFile}
          onClick={onGenerate}
        >
          Generate →
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