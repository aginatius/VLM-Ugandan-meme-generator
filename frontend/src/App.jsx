import { useEffect, useRef, useState } from "react";
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
import { composeMeme, generateMeme, renderPromptImage } from "./utils/api";

const initialState = {
  page: "home",
  navOpen: false,
  topic: "",
  imageFile: null,
  model: "qwen25-vl",
  lang: "en",
  intent: "Humour",
  style: "Relatable",
  step: 0,
  loading: false,
  loadingMsg: "",
  imageGenerating: false,
  imageCandidates: [],
  selectedImageIdx: 0,
  captionCandidates: [],
  selectedCaptionIdx: 0,
  finalDataUrl: null,
  finalScore: null,
  finalSampleId: null,
  error: "",
};

export default function App() {
  const [state, setState] = useState(initialState);
  const imageRun = useRef(null);
  const imageUrls = useRef(new Set());

  useEffect(() => () => {
    imageRun.current?.abort();
    imageUrls.current.forEach((url) => URL.revokeObjectURL(url));
  }, []);
  const [theme, setTheme] = useState(
    () => localStorage.getItem("meme-studio-theme") || "dark"
  );

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("meme-studio-theme", theme);
  }, [theme]);

  const update = (patch) => setState((current) => ({ ...current, ...patch }));

  const stopImageGeneration = () => {
    imageRun.current?.abort();
    imageRun.current = null;
    setState((current) => ({
      ...current,
      imageGenerating: false,
      imageCandidates: current.imageCandidates.map((candidate) =>
        candidate.status === "pending"
          ? { ...candidate, status: "error", error: "Generation stopped. Retry this image." }
          : candidate
      ),
    }));
  };

  const showPage = (page) => {
    stopImageGeneration();
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
        finalSampleId: null,
        error: "",
      });
    } else {
      update({ page, navOpen: false });
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const composeMemeFor = async (imageFile, caption) => {
    update({ loading: true, loadingMsg: "Composing final meme…", error: "" });
    try {
      const result = await composeMeme({ imageFile, caption, model: state.model });
      update({ loading: false, finalDataUrl: result.image_url, finalScore: result.score, finalSampleId: null, step: 3 });
    } catch (error) {
      update({ loading: false, error: error.message });
    }
  };

  const generateCaptionsForImage = async (imageFile, composeFirst = false) => {
    update({ loading: true, loadingMsg: "Generating captions with the hosted model…", error: "" });
    try {
      const result = await generateMeme({ imageFile, topic: state.topic, lang: state.lang, intent: state.intent, style: state.style, model: state.model });
      const captionCandidates = result.captions.map((candidate) => ({ label: candidate.caption, lang: candidate.language, structure: "one-liner", score: candidate.score }));
      update({ loading: false, imageFile, captionCandidates, selectedCaptionIdx: 0, step: 2 });
      if (composeFirst && captionCandidates[0]) {
        await composeMemeFor(imageFile, captionCandidates[0].label);
      }
    } catch (error) {
      update({ loading: false, error: error.message });
    }
  };

  const proceedToImage = async (skip = false, nextImageFile = state.imageFile) => {
    if (!nextImageFile) {
      update({ loading: false, error: "Please choose an image or generate one first." });
      return;
    }

    const imageUrl = URL.createObjectURL(nextImageFile);
    const imageCandidates = [{
      label: "Uploaded photo",
      imageUrl,
      file: nextImageFile,
      score: 100,
    }];
    update({ imageFile: nextImageFile, imageCandidates, captionCandidates: [], selectedImageIdx: 0, selectedCaptionIdx: 0, step: 1, error: "" });
    if (skip) await generateCaptionsForImage(nextImageFile, true);
  };

  const generateImageFromPrompt = async (retryIndex = null) => {
    if (!state.topic.trim() || state.imageGenerating) return;
    imageRun.current?.abort();
    const controller = new AbortController();
    imageRun.current = controller;
    const visualDirections = [
      "Use a wide environmental view with the people and setting visible.",
      "Use a candid medium shot from a different angle, centered on the main subject.",
      "Use a close, expressive composition with a noticeably different arrangement of subjects.",
    ];
    const basePrompt = `${state.topic}. Ugandan setting. ${state.style} mood. No text or letters.`;
    const indexes = retryIndex === null ? [0, 1, 2] : [retryIndex];
    setState((current) => ({
      ...current,
      loading: false,
      imageGenerating: true,
      step: 1,
      error: "",
      captionCandidates: [],
      ...(retryIndex === null ? { imageFile: null, selectedImageIdx: 0 } : {}),
      imageCandidates: retryIndex === null
        ? indexes.map((index) => ({ id: index, label: `Generated image ${index + 1}`, status: "pending" }))
        : current.imageCandidates.map((candidate, index) => index === retryIndex
          ? { ...candidate, status: "pending", error: "" } : candidate),
    }));

    for (const index of indexes) {
      if (controller.signal.aborted) break;
      try {
        const { imageUrl, blob } = await renderPromptImage({
          prompt: `${basePrompt} ${visualDirections[index]}`,
          signal: controller.signal,
        });
        if (controller.signal.aborted) {
          URL.revokeObjectURL(imageUrl);
          break;
        }
        imageUrls.current.add(imageUrl);
        const extension = blob.type === "image/jpeg" ? "jpg" : "png";
        const file = new File([blob], `generated-meme-image-${index + 1}.${extension}`, { type: blob.type });
        setState((current) => ({
          ...current,
          imageFile: current.imageFile || file,
          selectedImageIdx: current.imageCandidates[current.selectedImageIdx]?.file ? current.selectedImageIdx : index,
          imageCandidates: current.imageCandidates.map((candidate, slot) => slot === index
            ? { id: index, label: `Generated image ${index + 1}`, imageUrl, file, status: "ready", score: 96 - index * 4 }
            : candidate),
        }));
      } catch (error) {
        if (controller.signal.aborted) break;
        setState((current) => ({
          ...current,
          imageCandidates: current.imageCandidates.map((candidate, slot) => slot === index
            ? { ...candidate, status: "error", error: error.message } : candidate),
        }));
      }
    }
    if (imageRun.current === controller) {
      imageRun.current = null;
      update({ imageGenerating: false });
    }
  };

  const regenerateImages = () => generateImageFromPrompt();

  const continueToCaptions = () => {
    const selectedImage = state.imageCandidates[state.selectedImageIdx];
    if (selectedImage?.file) {
      stopImageGeneration();
      return generateCaptionsForImage(selectedImage.file);
    }
    update({ error: "Choose an image before generating captions." });
  };

  const regenerateCaptions = () => {
    const selectedImage = state.imageCandidates[state.selectedImageIdx];
    if (selectedImage?.file) {
      stopImageGeneration();
      return generateCaptionsForImage(selectedImage.file);
    }
    update({ error: "Choose an image before generating captions." });
  };

  const composeSelectedMeme = () => {
      const image = state.imageCandidates[state.selectedImageIdx];
      const caption = state.captionCandidates[state.selectedCaptionIdx];
      update({ loading: true, loadingMsg: "Composing final meme…", error: "" });
      composeMeme({ imageFile: image.file || state.imageFile, caption: caption.label, model: state.model })
        .then((result) => {
          const sampleId = Date.now();
          saveSample({
            id: sampleId,
            topic: state.topic,
            lang: state.lang,
            intent: state.intent,
            style: state.style,
            dataUrl: result.image_url,
            score: Math.round((image.score + caption.score) / 2),
          });
          update({ loading: false, finalDataUrl: result.image_url, finalScore: result.score, finalSampleId: sampleId, step: 3 });
        })
        .catch((error) => update({ loading: false, error: error.message }));
  };

  const startOver = () => {
    stopImageGeneration();
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
      finalSampleId: null,
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
          onGenerate={() => {
            if (state.imageFile) {
              proceedToImage(false);
            } else {
              generateImageFromPrompt();
            }
          }}
          onSkip={() => proceedToImage(true, state.imageFile)}
          onModel={(model) => update({ model })}
        />
      );
    }

    if (state.step === 1) {
      return (
        <Candidates
          type="image"
          generating={state.imageGenerating}
          onRetry={(index) => generateImageFromPrompt(index)}
          candidates={state.imageCandidates}
          selectedIdx={state.selectedImageIdx}
          onSelect={(selectedImageIdx) => update({ selectedImageIdx })}
          onBack={() => { stopImageGeneration(); update({ step: 0 }); }}
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
        onSave={(dataUrl) => {
          const sampleId = state.finalSampleId || Date.now();
          saveSample({ id: sampleId, topic: state.topic, lang: state.lang, intent: state.intent, style: state.style, dataUrl, score: state.finalScore });
          update({ finalDataUrl: dataUrl, finalSampleId: sampleId });
        }}
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
              loading={state.loading || state.imageGenerating}
              onStep={(step) => update({ step })}
            />
          </aside>
        )}

        <main className="main">
          {state.error && <div className="api-error" role="alert">{state.error}</div>}
          <div className={`screen ${state.page === "generate" && state.step === 0 ? "narrow" : ""}`}>
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
            {state.page === "generate" && renderGenerateStep()}
          </div>
        </main>
      </div>

      <Footer />
    </>
  );
}
