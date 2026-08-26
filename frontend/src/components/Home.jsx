import { SAMPLE_PROMPTS } from "../utils/meme";

export default function Home({ onGenerate, onSamples, onPrompt }) {
  return (
    <>
      <div className="home-hero">
        <div>
          <h1>
            Memes that understand <span className="accent">Uganda</span>
          </h1>
          <p>Describe a situation, get a meme that fits.</p>
          <div className="btn-row" style={{ marginTop: 0 }}>
            <button className="btn btn-primary" onClick={onGenerate}>
              Start generating →
            </button>
          </div>
        </div>

        <div className="home-prompts">
          <div className="home-prompts-label">Try a prompt</div>
          {SAMPLE_PROMPTS.map((item) => (
            <button
              key={item.prompt}
              className="prompt-chip"
              onClick={() => onPrompt(item.prompt)}
            >
              {item.text}
            </button>
          ))}
        </div>
      </div>

      <div className="home-below">
        <div>
          <div className="home-col-head">
            <h2>How it works</h2>
          </div>
          <div className="home-how">
            <div className="home-how-item">
              <b>1. Describe the idea</b>
              <span>Tell the studio what your meme should be about.</span>
            </div>
            <div className="home-how-item">
              <b>2. Pick a template</b>
              <span>Choose the template that fits your idea best.</span>
            </div>
            <div className="home-how-item">
              <b>3. Pick a caption</b>
              <span>Choose the caption that fits the moment.</span>
            </div>
            <div className="home-how-item">
              <b>4. Get the meme</b>
              <span>Download your finished meme.</span>
            </div>
          </div>
        </div>

        <div>
          <div className="home-col-head">
            <h2>See what's possible</h2>
          </div>
          <div className="samples-teaser">
            <button className="btn btn-samples" onClick={onSamples}>
              View samples →
            </button>
          </div>
        </div>
      </div>
    </>
  );
}