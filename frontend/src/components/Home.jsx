const HOME_SAMPLES = ["/samples/sample-1.jpg", "/samples/sample-2.jpg"];

const PROMPTS = [
  {
    text: "Leaving early, still late",
    prompt:
      "A hilarious Kampala traffic meme about leaving home two hours early, only to arrive at work when everyone is already asking where you have been",
  },
  {
    text: "The boda shortcut becomes a tour",
    prompt:
      "A funny Ugandan boda meme about the rider confidently taking a shortcut that somehow turns into a full sightseeing tour around the neighbourhood",
  },
  {
    text: "‘I’m almost there’ — still looking for shoes",
    prompt:
      "A playful Ugandan meme about telling your friends you are almost there when you are still at home looking for your shoes",
  },
];

export default function Home({ onNavigate, onPrompt }) {
  return (
    <div className="home-page">
      <section className="home-hero">
        <div className="home-lockup">
          <img src="/logo.webp" alt="" className="home-logo" />
          <span className="eyebrow">Uganda AI Meme Studio</span>
        </div>
        <h1>
          Make a meme that <span className="accent">gets Uganda.</span>
        </h1>
        <p>Turn a photo and a familiar moment into a meme worth sharing.</p>
        <button className="btn btn-primary" onClick={() => onNavigate("generate")}>
          Create a meme <span aria-hidden="true">→</span>
        </button>
      </section>

      <section className="home-start" aria-labelledby="home-start-title">
        <div className="home-section-heading">
          <div>
            <h2 id="home-start-title">Start with an idea</h2>
            <p>Choose a prompt to get started, or write your own.</p>
          </div>
          <button className="btn-quiet" onClick={() => onNavigate("generate")}>
            Write my own →
          </button>
        </div>
        <div className="home-prompts">
          {PROMPTS.map((item) => (
            <button
              key={item.text}
              className="prompt-chip"
              onClick={() => onPrompt(item.prompt)}
            >
              <span>{item.text}</span>
              <span className="prompt-arrow" aria-hidden="true">→</span>
            </button>
          ))}
        </div>
      </section>

      <section className="home-bottom">
        <div className="home-samples">
          <div className="home-section-heading">
            <div>
              <h2>Made with the studio</h2>
              <p>A few examples to set the mood.</p>
            </div>
            <button className="btn-quiet" onClick={() => onNavigate("samples")}>
              Browse samples →
            </button>
          </div>
          <div className="home-samples-grid">
            {HOME_SAMPLES.map((src, index) => (
              <div className="home-sample-card" key={src}>
                <img src={src} alt={`Ugandan meme example ${index + 1}`} loading="lazy" />
              </div>
            ))}
          </div>
        </div>
        <button className="home-how-card" onClick={() => onNavigate("how")}>
          <span className="eyebrow">Four simple steps</span>
          <strong>Idea. Image. Caption. Your meme.</strong>
          <span>See how it works <span aria-hidden="true">→</span></span>
        </button>
      </section>
    </div>
  );
}
