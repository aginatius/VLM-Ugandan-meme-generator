from fastapi import APIRouter, File, Form, UploadFile

from app.services.meme_service import MemeService

router = APIRouter()
meme_service = MemeService()


@router.post("/memes/generate")
async def generate_meme(
    image: UploadFile = File(...),
    intention: str = Form(...),
    model: str = Form("vlm"),
) -> dict[str, str]:
    image_bytes = await image.read()
    return meme_service.generate(image_bytes, intention, model)
