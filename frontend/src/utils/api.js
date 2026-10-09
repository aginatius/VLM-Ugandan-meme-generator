const API_BASE = (import.meta.env.VITE_API_BASE_URL || "/api").replace(/\/$/, "");

async function request(path, formData) {
  const response = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    let detail = "The meme service could not complete the request.";
    try {
      const body = await response.json();
      detail = body.detail || detail;
    } catch {
      // Keep the generic message when the server did not return JSON.
    }
    throw new Error(detail);
  }
  return response.json();
}

export function generateMeme({ imageFile, topic, lang, intent, style, model = "qwen25-vl", excludedCaptions = [] }) {
  const formData = new FormData();
  formData.append("image", imageFile);
  formData.append("intention", `${intent}: ${topic}`);
  formData.append("language", lang);
  formData.append("style", style);
  formData.append("model", model);
  formData.append("excluded_captions", JSON.stringify(excludedCaptions));
  return request("/memes/generate", formData);
}

export function composeMeme({ imageFile, caption, model = "qwen25-vl" }) {
  const formData = new FormData();
  formData.append("image", imageFile);
  formData.append("caption", caption);
  formData.append("model", model);
  return request("/memes/compose", formData);
}

export async function renderPromptImage({ prompt, seed, signal }) {
  const formData = new FormData();
  formData.append("prompt", prompt);
  formData.append("seed", seed ?? crypto.getRandomValues(new Uint32Array(1))[0]);
  const response = await fetch(`${API_BASE}/memes/render`, {
    method: "POST",
    body: formData,
    signal,
  });

  if (!response.ok) {
    let detail = "The image model could not complete the request.";
    try {
      const body = await response.json();
      detail = body.detail || detail;
    } catch {
      // Leave the generic message when the server did not return JSON.
    }
    throw new Error(detail);
  }

  const blob = await response.blob();
  if (!blob.size || !blob.type.startsWith("image/")) {
    throw new Error("The model did not return an image. Please retry this candidate.");
  }
  const imageUrl = URL.createObjectURL(blob);
  try {
    const preview = new Image();
    preview.src = imageUrl;
    await preview.decode();
    return { imageUrl, blob };
  } catch {
    URL.revokeObjectURL(imageUrl);
    throw new Error("The generated image could not be opened. Please retry this candidate.");
  }
}
