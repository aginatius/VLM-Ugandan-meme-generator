from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path

from app.config import get_settings
from app.api.routes import router

settings = get_settings()
app = FastAPI(title=settings.app_name)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(router, prefix="/api")


@app.get("/health")
def health_check() -> dict[str, str]:
    return {
        "status": "ok",
        "environment": settings.environment,
        "caption_model_configured": str(
            bool(settings.modal_caption_url or settings.hf_api_token)
        ).lower(),
        "image_model_configured": str(
            bool(settings.modal_image_url or settings.hf_api_token)
        ).lower(),
    }


frontend_dist = Path(__file__).resolve().parents[2] / "frontend"
if not frontend_dist.is_dir():
    frontend_dist = Path(__file__).resolve().parents[3] / "frontend"
if frontend_dist.is_dir():
    app.mount("/", StaticFiles(directory=frontend_dist, html=True), name="frontend")
