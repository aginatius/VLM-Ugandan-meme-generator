const API_BASE = (import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api").replace(/\/$/, "");

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

export function generateMeme({ imageFile, topic, lang, intent, style, model = "vlm" }) {
  const formData = new FormData();
  formData.append("image", imageFile);
  formData.append("intention", `${intent}: ${topic}`);
  formData.append("language", lang);
  formData.append("style", style);
  formData.append("model", model);
  return request("/memes/generate", formData);
}

export function composeMeme({ imageFile, caption, model = "vlm" }) {
  const formData = new FormData();
  formData.append("image", imageFile);
  formData.append("caption", caption);
  formData.append("model", model);
  return request("/memes/compose", formData);
}
