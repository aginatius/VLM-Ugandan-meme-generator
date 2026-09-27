const API_BASE = (import.meta.env.VITE_API_BASE_URL || "/api").replace(/\/$/, "");
const MODAL_IMAGE_URL = (import.meta.env.VITE_MODAL_IMAGE_URL || "").replace(/\/$/, "");

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

export function generateMeme({ imageFile, topic, lang, intent, style, model = "qwen25-vl" }) {
  const formData = new FormData();
  formData.append("image", imageFile);
  formData.append("intention", `${intent}: ${topic}`);
  formData.append("language", lang);
  formData.append("style", style);
  formData.append("model", model);
  return request("/memes/generate", formData);
}

export function composeMeme({ imageFile, caption, model = "qwen25-vl" }) {
  const formData = new FormData();
  formData.append("image", imageFile);
  formData.append("caption", caption);
  formData.append("model", model);
  return request("/memes/compose", formData);
}

export async function renderPromptImage({ prompt }) {
  const targetUrl = MODAL_IMAGE_URL || `${API_BASE}/memes/render`;

  let response;
  if (MODAL_IMAGE_URL) {
    response = await fetch(targetUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt }),
    });
  } else {
    const formData = new FormData();
    formData.append("prompt", prompt);
    response = await fetch(targetUrl, {
      method: "POST",
      body: formData,
    });
  }

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

  return URL.createObjectURL(await response.blob());
}
