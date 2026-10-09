export const INTENTS = [
  "Humour",
  "Warning",
  "Criticism",
  "Education",
  "Satire",
  "Social commentary",
  "Celebration",
  "Rant",
];

export const STYLES = [
  "Relatable",
  "Dry humour",
  "Exaggerated",
  "Sarcastic",
];

export const STEPS = [
  { id: "intention", label: "Intention" },
  { id: "image", label: "Image" },
  { id: "caption", label: "Caption" },
  { id: "composition", label: "Composition" },
];

export const SAMPLE_PROMPTS = [
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

export function seededRand(seedStr) {
  let h = 0;
  for (let i = 0; i < seedStr.length; i++) {
    h = (h * 31 + seedStr.charCodeAt(i)) >>> 0;
  }
  return () => {
    h = (h * 1664525 + 1013904223) >>> 0;
    return h / 4294967296;
  };
}

function rankedScores(rng, base) {
  return base.map((b) => Math.round(b + (rng() * 4 - 2)));
}

export function makeImageCandidates(topic) {
  const rng = seededRand(`${topic}${Math.random()}`);
  return rankedScores(rng, [94, 86, 79]).map((score, i) => ({
    label: `Template ${i + 1}`,
    score,
  }));
}

export function makeCaptionCandidates() {
  return [
    {
      label: "Boda boda guys at the end of the day",
      lang: "English",
      structure: "one-liner",
      score: 92,
    },

    {
      setup: "SUIT.",
      punchline: "ESUUTI",
      lang: "Mix",
      structure: "setup-punchline",
      score: 85,
    },

    {
      label: "Nkulaba Ssebo.",
      lang: "Luganda",
      structure: "one-liner",
      score: 78,
    },
  ];
}

export function renderPlaceholderMeme(imageIdx = 0, captionIdx = 0) {
  const canvas = document.createElement("canvas");
  canvas.width = 640;
  canvas.height = 640;

  const ctx = canvas.getContext("2d");
  const W = canvas.width;
  const H = canvas.height;

  ctx.fillStyle = "#1E1B17";
  ctx.fillRect(0, 0, W, H);

  ctx.strokeStyle = "#332E27";
  ctx.lineWidth = 2;

  const offset = (imageIdx * 9 + captionIdx * 5) % 28;

  for (let x = -H + offset; x < W; x += 28) {
    ctx.beginPath();
    ctx.moveTo(x, H);
    ctx.lineTo(x + H, 0);
    ctx.stroke();
  }

  ctx.strokeStyle = "#7A5A26";
  ctx.lineWidth = 3;

  const inset = 34 + imageIdx * 12;
  ctx.beginPath();

  if (captionIdx % 2 === 0) {
    ctx.roundRect(inset, inset, W - inset * 2, H - inset * 2, 22);
  } else {
    ctx.arc(
      W / 2,
      H / 2,
      Math.min(W, H) / 2 - inset,
      0,
      Math.PI * 2
    );
  }

  ctx.stroke();

  return canvas.toDataURL("image/png");
}

export function loadSamples() {
  try {
    return JSON.parse(localStorage.getItem("gallery-feed") || "[]");
  } catch {
    return [];
  }
}

export function saveSample(entry) {
  const current = loadSamples();
  const updated = [entry, ...current.filter((sample) => sample.id !== entry.id)].slice(0, 16);
  localStorage.setItem("gallery-feed", JSON.stringify(updated));
  return updated;
}
