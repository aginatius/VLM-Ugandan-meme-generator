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
  const languages = [
    ["lg", "Luganda"],
    ["en", "English"],
    ["mix", "Mix"],
    ["any", "Any"],
  ];

  return (
    <div className="create-form">
      <div className="create-intro">
        <div className="eyebrow">Create a Ugandan meme</div>
        <h2>What’s happening?</h2>
        <p className="screen-sub">
          Describe the moment. Add a photo or let the studio create one, then choose the language and tone.
        </p>
      </div>

      <section className="idea-composer" aria-labelledby="idea-label">
        <label id="idea-label" className="composer-label" htmlFor="meme-topic">
          Your idea
        </label>
        <textarea
          id="meme-topic"
          value={topic}
          onChange={(event) => onTopic(event.target.value)}
          placeholder="e.g. A boda rider takes a ‘shortcut’ that becomes a tour of Kampala"
          rows={3}
        />
        <div className="composer-footer">
          <label className="upload-control" htmlFor="meme-image">
            <span aria-hidden="true">＋</span>
            {imageFile ? "Change photo" : "Add a photo"}
          </label>
          <input
            className="visually-hidden"
            id="meme-image"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(event) => onImage(event.target.files?.[0] || null)}
          />
          <span className="file-name" title={imageFile?.name}>
            {imageFile ? imageFile.name : "Optional · JPG, PNG or WebP"}
          </span>
          <span className="model-badge">Qwen2.5-VL</span>
        </div>
      </section>

      <div className="create-options">
        <section className="option-group" aria-labelledby="language-label">
          <div className="option-heading">
            <h3 id="language-label">Caption language</h3>
            <span>Choose one</span>
          </div>
          <div className="lang-pill" role="group" aria-label="Caption language">
            {languages.map(([value, label]) => (
              <button
                type="button"
                key={value}
                className={lang === value ? "active" : ""}
                aria-pressed={lang === value}
                onClick={() => onLang(value)}
              >
                {label}
              </button>
            ))}
          </div>
        </section>

        <section className="option-group" aria-labelledby="intent-label">
          <div className="option-heading">
            <h3 id="intent-label">What should it say?</h3>
            <span>Intention</span>
          </div>
          <div className="chip-row" role="group" aria-label="Communicative intention">
            {INTENTS.map((value) => (
              <button
                type="button"
                key={value}
                className={`chip ${intent === value ? "selected" : ""}`}
                aria-pressed={intent === value}
                onClick={() => onIntent(value)}
              >
                {value}
              </button>
            ))}
          </div>
        </section>

        <section className="option-group" aria-labelledby="style-label">
          <div className="option-heading">
            <h3 id="style-label">Choose a tone</h3>
            <span>Style</span>
          </div>
          <div className="chip-row" role="group" aria-label="Meme tone">
            {STYLES.map((value) => (
              <button
                type="button"
                key={value}
                className={`chip ${style === value ? "selected" : ""}`}
                aria-pressed={style === value}
                onClick={() => onStyle(value)}
              >
                {value}
              </button>
            ))}
          </div>
        </section>
      </div>

      <div className="create-actions">
        <button
          className="btn btn-primary"
          disabled={!hasTopic}
          onClick={onGenerate}
        >
          {imageFile ? "Continue" : "Generate image options"} <span aria-hidden="true">→</span>
        </button>
        {imageFile && (
          <button className="btn btn-ghost" disabled={!hasTopic} onClick={onSkip}>
            Make a meme with this photo
          </button>
        )}
      </div>
      <p className="create-note">Your photo is used to make captions for this meme.</p>
    </div>
  );
}
