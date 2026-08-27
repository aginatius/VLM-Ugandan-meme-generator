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
  makeImageCandidates,
  makeCaptionCandidates,
  renderPlaceholderMeme,
} from "./utils/meme";

const TEMPLATES = [
  {
    id: 1,
    label: "Template 1",
    image: "/templates/template-1.jpg",
    score: 94,
  },
  {
    id: 2,
    label: "Template 2",
    image: "/templates/template-2.jpg",
    score: 86,
  },
  {
    id: 3,
    label: "Template 3",
    image: "/templates/template-3.jpg",
    score: 79,
  },
];

const initialState = {
  page: "home",
  navOpen: false,

  topic: "",
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
};

export default function App() {
  const [state, setState] = useState(initialState);

  const update = (patch) => {
    setState((current) => ({
      ...current,
      ...patch,
    }));
  };

  const showPage = (page) => {
    if (page === "generate") {
      update({
        page: "generate",
        navOpen: false,
        step: 0,
        loading: false,
        imageCandidates: [],
        selectedImageIdx: 0,
        captionCandidates: [],
        selectedCaptionIdx: 0,
        finalDataUrl: null,
        finalScore: null,
      });
    } else {
      update({
        page,
        navOpen: false,
      });
    }

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const runLoading = (message, delay, after) => {
    update({
      loading: true,
      loadingMsg: message,
    });

    window.setTimeout(() => {
      update({
        loading: false,
      });

      after();
    }, delay);
  };

  const getImageCandidates = () => {
    const generated = makeImageCandidates(state.topic);

    return generated.map((candidate, index) => ({
      ...candidate,
      ...TEMPLATES[index],
    }));
  };

  const proceedToImage = (skip = false) => {
    runLoading(
      "Interpreting communicative intention…",
      700,
      () => {
        const imageCandidates = getImageCandidates();

        update({
          imageCandidates,
          selectedImageIdx: 0,
        });

        if (!skip) {
          update({
            step: 1,
          });

          return;
        }

        runLoading(
          "Retrieving and refining visual candidates…",
          700,
          () => {
            runLoading(
              "Generating captions for the selected image…",
              700,
              () => {
                const captionCandidates = makeCaptionCandidates(
                  state.topic,
                  state.lang
                );

                update({
                  captionCandidates,
                  selectedCaptionIdx: 0,
                });

                runLoading(
                  "Composing final meme…",
                  700,
                  () => {
                    const finalDataUrl = renderPlaceholderMeme(0, 0);

                    const finalScore = Math.round(
                      (
                        imageCandidates[0].score +
                        captionCandidates[0].score
                      ) / 2
                    );

                    update({
                      finalDataUrl,
                      finalScore,
                      step: 3,
                    });
                  }
                );
              }
            );
          }
        );
      }
    );
  };

  const regenerateImages = () => {
    runLoading(
      "Re-running visual retrieval…",
      600,
      () => {
        update({
          imageCandidates: getImageCandidates(),
          selectedImageIdx: 0,
        });
      }
    );
  };

  const continueToCaptions = () => {
    runLoading(
      "Generating captions for the selected image…",
      700,
      () => {
        update({
          captionCandidates: makeCaptionCandidates(
            state.topic,
            state.lang
          ),
          selectedCaptionIdx: 0,
          step: 2,
        });
      }
    );
  };

  const regenerateCaptions = () => {
    runLoading(
      "Re-running caption generation…",
      600,
      () => {
        update({
          captionCandidates: makeCaptionCandidates(
            state.topic,
            state.lang
          ),
          selectedCaptionIdx: 0,
        });
      }
    );
  };

  const composeMeme = () => {
    runLoading(
      "Composing meme…",
      700,
      () => {
        const image =
          state.imageCandidates[state.selectedImageIdx];

        const caption =
          state.captionCandidates[state.selectedCaptionIdx];

        const finalDataUrl = renderPlaceholderMeme(
          state.selectedImageIdx,
          state.selectedCaptionIdx
        );

        const finalScore = Math.round(
          (image.score + caption.score) / 2
        );

        update({
          finalDataUrl,
          finalScore,
          step: 3,
        });
      }
    );
  };

  const startOver = () => {
    update({
      topic: "",
      step: 0,
      loading: false,
      imageCandidates: [],
      selectedImageIdx: 0,
      captionCandidates: [],
      selectedCaptionIdx: 0,
      finalDataUrl: null,
      finalScore: null,
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
          lang={state.lang}
          intent={state.intent}
          style={state.style}
          onTopic={(topic) => update({ topic })}
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
          onSelect={(selectedImageIdx) =>
            update({ selectedImageIdx })
          }
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
          onSelect={(selectedCaptionIdx) =>
            update({ selectedCaptionIdx })
          }
          onBack={() => update({ step: 1 })}
          onContinue={composeMeme}
          onRegenerate={regenerateCaptions}
        />
      );
    }

    const image =
      state.imageCandidates[state.selectedImageIdx];

    const caption =
      state.captionCandidates[state.selectedCaptionIdx];

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
        onNavigate={showPage}
        onToggle={() =>
          update({
            navOpen: !state.navOpen,
          })
        }
      />

      <div
        className={`shell ${
          state.page === "generate"
            ? "with-sidebar"
            : ""
        }`}
      >
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
          <div
            className={`screen ${
              state.page === "generate" &&
              state.step === 0
                ? "narrow"
                : ""
            }`}
          >
            {state.page === "home" && (
              <Home
                onNavigate={showPage}
                onPrompt={(topic) => {
                  update({ topic });
                  showPage("generate");
                }}
              />
            )}

            {state.page === "how" && <HowItWorks />}

            {state.page === "samples" && <Samples />}

            {state.page === "generate" &&
              renderGenerateStep()}
          </div>
        </main>
      </div>

      <Footer />
    </>
  );
}