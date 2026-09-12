# Ugandan Meme Generator API

This service accepts an uploaded meme image, sends it to a vision-language model hosted by Hugging Face, and returns caption candidates. The Hugging Face token stays on the server. The final caption is rendered into a downloadable JPEG by the API.

## Endpoints

- `GET /health` reports API availability and whether `HF_API_TOKEN` is configured.
- `GET /api/models` lists the model aliases accepted by the UI.
- `POST /api/memes/generate` multipart fields: `image`, `intention`, `language`, `style`, `model`.
- `POST /api/memes/compose` multipart fields: `image`, `caption`, `model`.

The generate response contains `image_url` as a data URL and `captions` with caption, language, and a display score. Compose returns a rendered JPEG data URL.

## Hugging Face setup

1. In Kaggle, save the final adapter or merged model to a Hugging Face model repository. For the router to load it reliably, use a repository containing a complete deployable model; if the adapter is not supported by the selected provider, merge the adapter into the base model before uploading.
2. Create a Hugging Face access token with inference permission.
3. Copy `.env.example` to `.env` and set `HF_API_TOKEN`, `HF_VLM_MODEL`, and `CORS_ORIGINS`. Never put the token in the frontend or commit `.env`.
4. Deploy this `backend` directory to Hugging Face Spaces, Render, Railway, or another Docker host. The included Dockerfile listens on port 8000.

## Local development

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
$env:PYTHONPATH = "src"
uvicorn app.main:app --reload --port 8000
```

Then configure the frontend with `VITE_API_BASE_URL=http://localhost:8000/api` before running Vite. The default already points there.

The Hugging Face OpenAI-compatible router is used at `/v1/chat/completions`, and the client also understands legacy inference responses containing `generated_text`.
