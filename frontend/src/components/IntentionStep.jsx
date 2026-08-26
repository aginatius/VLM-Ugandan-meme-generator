import { INTENTS, STYLES } from "../utils/meme";

export default function IntentionStep({
  topic,
  lang,
  intent,
  style,
  onTopic,
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
        <textarea
          value={topic}
          onChange={(e) => onTopic(e.target.value)}
          placeholder="e.g. A funny meme about a boda rider ignoring traffic lights while the passenger panics"
        />
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
          disabled={!hasTopic}
          onClick={onGenerate}
        >
          Generate →
        </button>
        <button
          className="btn btn-ghost"
          disabled={!hasTopic}
          onClick={onSkip}
        >
          Skip to result
        </button>
      </div>
    </>
  );
}