# Ugandan Meme Generator API

This service accepts an uploaded meme image, sends it to a vision-language model hosted by Hugging Face, and returns caption candidates. The Hugging Face token stays on the server. The final caption is rendered into a downloadable JPEG by the API.

## Endpoints

- `GET /health` reports API availability and whether `HF_API_TOKEN` is configured.
- `GET /api/models` lists the model aliases accepted by the UI.
- `POST /api/memes/generate` multipart fields: `image`, `intention`, `language`, `style`, `model`.
- `POST /api/memes/compose` multipart fields: `image`, `caption`, `model`.

The generate response contains `image_url` as a data URL and `captions` with caption, language, and a display score. Compose returns a rendered JPEG data URL.

## Hugging Face setup

1. In Kaggle, save each final adapter or merged model to a Hugging Face model repository. For the router to load it reliably, use a repository containing a complete deployable model; if an adapter is not supported by the selected provider, merge it into the base model before uploading.
2. Create a Hugging Face access token with inference permission.
3. Copy `.env.example` to `.env` and set `HF_API_TOKEN`, the five `HF_*_MODEL` values, and `CORS_ORIGINS`. Never put the token in the frontend or commit `.env`.
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

When `MODAL_CAPTION_URL` is set, image caption requests go to Modal. Otherwise, the backend uses the Hugging Face OpenAI-compatible router at `/v1/chat/completions`.

## Combined Modal workflow

The frontend sends all model requests through this API. `/api/memes/render` calls the Modal image model; the selected image is uploaded to `/api/memes/generate` for caption candidates from the Modal caption model. `/api/memes/compose` renders the selected caption onto that same image and returns the finished meme.

The existing Modal image and caption endpoints are configured as defaults in `app/config.py`. Override them on Render with `MODAL_IMAGE_URL` and `MODAL_CAPTION_URL` when deploying different endpoints. Set either value to an empty string to use its Hugging Face fallback. `MODAL_IMAGE_TIMEOUT_SECONDS` and `MODAL_CAPTION_TIMEOUT_SECONDS` default to 600 to allow GPU startup. Set `CORS_ORIGINS=https://uganda-ai-meme-studio.vercel.app` on Render. `/health` reports whether each model is configured, not whether inference has succeeded.

On Vercel, set `VITE_API_BASE_URL=https://ugandan-meme-generator-api.onrender.com/api` and rebuild. A separate `VITE_MODAL_IMAGE_URL` is no longer used. Deploy both services from the branch containing these changes.

Images appear one at a time as each request completes. A failed candidate does not discard ready images; retry that candidate or continue with any ready image. Continuing stops the browser's remaining image requests. Generated images are decoded before display, and the backend rejects damaged or solid blank images with a retryable error.

The Modal image model uses DPM-Solver++ with 20 sampling steps. Deploy changes to this sampler with `python -m modal deploy backend/src/app/models/modal_api.py`; Git pushes alone do not deploy Modal. GPU startup can still delay the first image after inactivity. Keeping containers warm reduces startup latency but adds idle GPU charges.

Caption candidates use different creative directions and sampled decoding. The backend filters exact repeats and close wording, with at most two attempts per direction. It returns fewer candidates if the model cannot produce three distinct options, rather than padding with duplicates. Regeneration sends the current captions as exclusions. Deploy caption decoding changes with `python -m modal deploy backend/src/app/models/modal_caption_api.py`.

## Modal caption model

The fine-tuned Qwen vision-language adapter can run on Modal when it is not available through Hugging Face Inference Providers. Create a Modal secret named `huggingface-secret` with an `HF_TOKEN` value that can read both the adapter repository and its base model. The adapter's `adapter_config.json` must name a Qwen2.5-VL base model (`qwen2_5_vl`); Modal loads that base model and attaches `adapter_model.safetensors`. A text-only Qwen2 checkpoint cannot accept meme images. From the repository root, deploy it with:

```powershell
python -m modal deploy backend/src/app/models/modal_caption_api.py
```

Copy the Web Function URL printed by Modal into `backend/.env` as `MODAL_CAPTION_URL`. The FastAPI backend calls this endpoint for caption generation, so the browser never receives the Hugging Face token. The local `.env.example` is documentation only; never put a real token in it or commit one.
