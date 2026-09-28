---
title: Uganda AI Meme Studio
emoji: 🇺🇬
colorFrom: yellow
colorTo: green
sdk: docker
app_port: 7860
short_description: Generate culturally aware meme captions with a finetuned Qwen2.5-VL model.
---

# Uganda AI Meme Studio

An interactive Hugging Face Space for turning an uploaded photo into a shareable meme. The demo uses [`Mwizerwa/meme-qwen2.5-vl-finetuned`](https://huggingface.co/Mwizerwa/meme-qwen2.5-vl-finetuned) to inspect the image and generate caption candidates in English, Luganda, or a natural mix of both.

## Space configuration

Add `HF_API_TOKEN` as a Space Secret with permission to use the model. The token stays on the server and is never sent to the browser.

The Docker Space serves the Vite frontend and FastAPI backend from one origin. The public app is available at `/`, with `/health` and `/api/models` available for diagnostics.

## Run locally

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
$env:PYTHONPATH = "src"
$env:HF_API_TOKEN = "hf_..."
uvicorn app.main:app --reload --port 8000
```

For the full Space image, build from the repository root with `docker build -t uganda-meme-studio .`.