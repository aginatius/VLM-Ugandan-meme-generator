from fastapi import APIRouter, File, Form, HTTPException, UploadFile

from app.config import get_settings
from app.models.hf_client import HuggingFaceInferenceError
from app.schemas import MemeComposeResponse, MemeGenerationResponse
from app.services.meme_service import MemeService

router = APIRouter()
meme_service = MemeService(get_settings())


async def read_image(image: UploadFile) -> tuple[bytes, str]:
    settings = get_settings()
    if image.content_type not in {"image/jpeg", "image/png", "image/webp"}:
        raise HTTPException(status_code=415, detail="Upload a JPEG, PNG, or WebP image.")
    image_bytes = await image.read()
    if not image_bytes:
        raise HTTPException(status_code=400, detail="The uploaded image is empty.")
    if len(image_bytes) > settings.max_upload_size_mb * 1024 * 1024:
        raise HTTPException(status_code=413, detail="The image is too large.")
    return image_bytes, image.content_type


@router.post("/memes/generate")
async def generate_meme(
    image: UploadFile = File(...),
    intention: str = Form(...),
    language: str = Form("en"),
    style: str = Form("Relatable"),
    model: str = Form("vlm"),
) -> MemeGenerationResponse:
    if not intention.strip():
        raise HTTPException(status_code=422, detail="Intention cannot be empty.")
    image_bytes, content_type = await read_image(image)
    try:
        return await meme_service.generate(
            image_bytes, content_type, intention.strip(), language, style, model
        )
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    except HuggingFaceInferenceError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc


@router.post("/memes/compose", response_model=MemeComposeResponse)
async def compose_meme(
    image: UploadFile = File(...),
    caption: str = Form(...),
    model: str = Form("vlm"),
) -> MemeComposeResponse:
    if not caption.strip():
        raise HTTPException(status_code=422, detail="Caption cannot be empty.")
    image_bytes, content_type = await read_image(image)
    try:
        return meme_service.compose(image_bytes, caption.strip(), content_type, model)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc


@router.get("/models")
def available_models() -> dict[str, list[str]]:
    return {"models": ["vlm", "lvm"]}
