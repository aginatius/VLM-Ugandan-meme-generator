const HOME_SAMPLES = [
  "/samples/sample-1.jpg",
  "/samples/sample-2.jpg",
];

export default function Home({ onNavigate, onPrompt }) {
  const prompts = [
    {
      text: "You leave early for Kampala traffic… somehow you're still late",
      prompt:
        "A hilarious Kampala traffic meme about leaving home two hours early, only to arrive at work when everyone is already asking where you have been",
    },
    {
      text: "The boda shortcut becomes a whole tour of the neighbourhood",
      prompt:
        "A funny Ugandan boda meme about the rider confidently taking a shortcut that somehow turns into a full sightseeing tour around the neighbourhood",
    },
    {
      text: "“I'm almost there” but you're still at home looking for your shoes",
      prompt:
        "A playful Ugandan meme about telling your friends you are almost there when you are still at home looking for your shoes",
    },
  ];

  return (
    <>
      <div className="home-hero">
        <div>
          <h1>
            Memes that understand{" "}
            <span className="accent">Uganda</span>
          </h1>
          <p>
            Describe a situation, get a meme that fits.
          </p>

          <div className="btn-row" style={{ marginTop: 0 }}>
            <button className="btn btn-primary" onClick={() => onNavigate("generate")}>
              Start generating →
            </button>
          </div>
        </div>

        <div className="home-prompts">
          <div className="home-prompts-label">
            Try a prompt
          </div>

          {prompts.map((item, index) => (
            <button
              key={index}
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
            <h2>Samples</h2>
          </div>
          <div className="home-samples-grid">
            {HOME_SAMPLES.map((src, index) => (
              <div
                className="home-sample-card"
                key={src}
              >
                <img
                  src={src}
                  alt={`Meme sample ${index + 1}`}
                />
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="home-col-head">
            <h2>See what's possible</h2>
          </div>

          <div className="samples-teaser">
            <p>
              Explore more memes created by Uganda AI
              Meme Studio.
            </p>

            <button
              className="btn btn-samples"
              onClick={() => onNavigate("samples")}
            >
              See more →
            </button>
          </div>
        </div>
      </div>
    </>
  );
}