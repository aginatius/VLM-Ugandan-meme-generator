import { useEffect, useState } from "react";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Pipeline from "./components/Pipeline";
import Home from "./components/Home";
import HowItWorks from "./components/HowItWorks";
import Samples from "./components/Samples";
import Loading from "./components/Loading";
import IntentionStep from "./components/IntentionStep";
import Candidates from "./components/Candidates";
import FinalMeme from "./components/FinalMeme";
import {
  saveSample,
} from "./utils/meme";
import { composeMeme, generateMeme } from "./utils/api";

const initialState = {
  page: "home",
  navOpen: false,
  topic: "",
  imageFile: null,
  lang: "en",
  intent: "Humour",
  style: "Relatable",
  step: 0,
  loading: false,
  loadingMsg: "",
  imageCandidates: [],
  selectedImageIdx: 0,
  captionCandidates: [],
  selectedCaptionIdx: 0,
  finalDataUrl: null,
  finalScore: null,
  error: "",
};

export default function App() {
  const [state, setState] = useState(initialState);
  const [theme, setTheme] = useState(
    () => localStorage.getItem("meme-studio-theme") || "dark"
  );

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("meme-studio-theme", theme);
  }, [theme]);

  const update = (patch) => setState((current) => ({ ...current, ...patch }));

  const showPage = (page) => {
    if (page === "generate") {
      update({
        page,
        navOpen: false,
        step: 0,
        loading: false,
        imageCandidates: [],
        selectedImageIdx: 0,
        captionCandidates: [],
        selectedCaptionIdx: 0,
        finalDataUrl: null,
        finalScore: null,
        error: "",
      });
    } else {
      update({ page, navOpen: false });
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const proceedToImage = async (skip = false) => {
    update({ loading: true, loadingMsg: "Generating captions with the hosted model…", error: "" });
    try {
      const result = await generateMeme({ imageFile: state.imageFile, topic: state.topic, lang: state.lang, intent: state.intent, style: state.style });
      const imageCandidates = [0, 1, 2].map((index) => ({ label: "Uploaded image", imageUrl: result.image_url, score: 96 - index * 4 }));
      const captionCandidates = result.captions.map((candidate) => ({ label: candidate.caption, lang: candidate.language, structure: "one-liner", score: candidate.score }));
      update({ loading: false, imageCandidates, captionCandidates, selectedImageIdx: 0, selectedCaptionIdx: 0, step: skip ? 2 : 1 });
      if (skip) await composeMemeFor(captionCandidates[0].label);
    } catch (error) {
      update({ loading: false, error: error.message });
    }
  };

  const composeMemeFor = async (caption) => {
    update({ loading: true, loadingMsg: "Composing final meme…", error: "" });
    try {
      const result = await composeMeme({ imageFile: state.imageFile, caption });
      update({ loading: false, finalDataUrl: result.image_url, finalScore: result.score, step: 3 });
    } catch (error) {
      update({ loading: false, error: error.message });
    }
  };

  const regenerateImages = () => proceedToImage(false);

  const continueToCaptions = () => update({ step: 2 });

  const regenerateCaptions = () => proceedToImage(false);

  const composeSelectedMeme = () => {
      const image = state.imageCandidates[state.selectedImageIdx];
      const caption = state.captionCandidates[state.selectedCaptionIdx];
      update({ loading: true, loadingMsg: "Composing final meme…", error: "" });
      composeMeme({ imageFile: state.imageFile, caption: caption.label })
        .then((result) => {
          saveSample({
            id: Date.now(),
            topic: state.topic,
            lang: state.lang,
            intent: state.intent,
            style: state.style,
            dataUrl: result.image_url,
            score: Math.round((image.score + caption.score) / 2),
          });
          update({ loading: false, finalDataUrl: result.image_url, finalScore: result.score, step: 3 });
        })
        .catch((error) => update({ loading: false, error: error.message }));
  };

  const startOver = () => {
    update({
      topic: "",
      imageFile: null,
      step: 0,
      loading: false,
      imageCandidates: [],
      selectedImageIdx: 0,
      captionCandidates: [],
      selectedCaptionIdx: 0,
      finalDataUrl: null,
      finalScore: null,
      error: "",
    });
  };

  const renderGenerateStep = () => {
    if (state.loading) {
      return <Loading message={state.loadingMsg} />;
    }

    if (state.step === 0) {
      return (
        <IntentionStep
          topic={state.topic}
          imageFile={state.imageFile}
          lang={state.lang}
          intent={state.intent}
          style={state.style}
          onTopic={(topic) => update({ topic })}
          onImage={(imageFile) => update({ imageFile })}
          onLang={(lang) => update({ lang })}
          onIntent={(intent) => update({ intent })}
          onStyle={(style) => update({ style })}
          onGenerate={() => proceedToImage(false)}
          onSkip={() => proceedToImage(true)}
        />
      );
    }

    if (state.step === 1) {
      return (
        <Candidates
          type="image"
          candidates={state.imageCandidates}
          selectedIdx={state.selectedImageIdx}
          onSelect={(selectedImageIdx) => update({ selectedImageIdx })}
          onBack={() => update({ step: 0 })}
          onContinue={continueToCaptions}
          onRegenerate={regenerateImages}
        />
      );
    }

    if (state.step === 2) {
      return (
        <Candidates
          type="caption"
          candidates={state.captionCandidates}
          selectedIdx={state.selectedCaptionIdx}
          onSelect={(selectedCaptionIdx) => update({ selectedCaptionIdx })}
          onBack={() => update({ step: 1 })}
          onContinue={composeSelectedMeme}
          onRegenerate={regenerateCaptions}
        />
      );
    }

    const image = state.imageCandidates[state.selectedImageIdx];
    const caption = state.captionCandidates[state.selectedCaptionIdx];

    return (
      <FinalMeme
        image={image}
        caption={caption}
        finalDataUrl={state.finalDataUrl}
        onBack={() => update({ step: 2 })}
        onStartOver={startOver}
      />
    );
  };

  useEffect(() => {
    document.title = "Uganda AI Meme Studio";
  }, []);

  return (
    <>
      <Header
        page={state.page}
        navOpen={state.navOpen}
        theme={theme}
        onNavigate={showPage}
        onThemeToggle={() =>
          setTheme((current) => (current === "dark" ? "light" : "dark"))
        }
        onToggle={() => update({ navOpen: !state.navOpen })}
      />

      <div className={`shell ${state.page === "generate" ? "with-sidebar" : ""}`}>
        {state.page === "generate" && (
          <aside className="sidebar">
            <Pipeline
              step={state.step}
              loading={state.loading}
              onStep={(step) => update({ step })}
            />
          </aside>
        )}

        <main className="main">
          {state.error && <div className="api-error" role="alert">{state.error}</div>}
          <div className={`screen ${state.page === "generate" && state.step === 0 ? "narrow" : ""}`}>
            {state.page === "home" && (
              <Home
                onGenerate={() => showPage("generate")}
                onSamples={() => showPage("samples")}
                onPrompt={(topic) => {
                  update({ topic });
                  showPage("generate");
                }}
              />
            )}

            {state.page === "how" && <HowItWorks />}
            {state.page === "samples" && <Samples />}
            {state.page === "generate" && renderGenerateStep()}
          </div>
        </main>
      </div>

      <Footer />
    </>
  );
}