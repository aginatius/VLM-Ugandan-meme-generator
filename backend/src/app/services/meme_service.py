import base64
import json

import httpx

from app.config import Settings
from app.models.hf_client import HuggingFaceVisionClient
from app.schemas import CaptionCandidate, MemeComposeResponse, MemeGenerationResponse
from app.services.image_renderer import MemeRenderer


class MemeService:
    MODEL_ALIASES = {
        "qwen25-vl": "hf_qwen25_vl_model",
    }

    def __init__(self, settings: Settings) -> None:
        self.settings = settings
        self.client = HuggingFaceVisionClient(settings)
        self.renderer = MemeRenderer()

    async def generate(
        self,
        image: bytes,
        content_type: str,
        intention: str,
        language: str,
        style: str,
        model: str,
    ) -> MemeGenerationResponse:
        model_name = self._model_name(model)
        prompt = self._prompt(intention, language, style)
        captions = []
        for variation in ("fresh and concise", "unexpected and conversational", "dry and highly relatable"):
            caption = await self.client.generate_caption(
                image, content_type, f"{prompt}\nVariation: {variation}.", model_name
            )
            captions.append(
                CaptionCandidate(
                    caption=caption,
                    language=language,
                    score=max(60, 94 - len(captions) * 7),
                )
            )

        return MemeGenerationResponse(
            model=model,
            image_url=self._data_url(image, content_type),
            captions=captions,
        )

    def compose(
        self, image: bytes, caption: str, content_type: str, model: str
    ) -> MemeComposeResponse:
        rendered = self.renderer.render(image, caption)
        return MemeComposeResponse(
            model=model,
            caption=caption,
            image_url=self._data_url(rendered, "image/jpeg"),
            score=min(98, max(65, 92 - len(caption.split()) // 4)),
        )

    async def generate_image(self, prompt: str) -> bytes:
        if not self.settings.hf_api_token:
            raise ValueError("HF_API_TOKEN is not configured on the backend.")

        payload = {
            "inputs": prompt,
            "parameters": {
                "num_inference_steps": 25,
                "guidance_scale": 7.5,
            },
            "options": {"wait_for_model": True},
            "lora": self.settings.hf_lora_model,
        }

        image_url = f"{self.settings.hf_api_inference_base_url.rstrip('/')}/{self.settings.hf_sd_base_model}"
        headers = {"Authorization": f"Bearer {self.settings.hf_api_token}"}

        try:
            async with httpx.AsyncClient(timeout=self.settings.hf_timeout_seconds) as client:
                response = await client.post(image_url, headers=headers, json=payload)
        except httpx.HTTPError as exc:
            raise ValueError("Could not reach the Hugging Face image model.") from exc

        if response.is_error:
            detail = response.text[:500]
            raise ValueError(
                f"Hugging Face image generation failed ({response.status_code}): {detail}"
            )

        content_type = response.headers.get("content-type", "")
        if content_type.startswith("image/"):
            return response.content

        try:
            body = response.json()
        except ValueError as exc:
            raise ValueError("Hugging Face returned an invalid image response.") from exc

        if isinstance(body, dict):
            for key in ("image", "images"):
                value = body.get(key)
                if isinstance(value, list) and value:
                    first = value[0]
                    if isinstance(first, str):
                        return base64.b64decode(first)
                if isinstance(value, str):
                    return base64.b64decode(value)

        raise ValueError("Hugging Face returned an unexpected image payload.")

    def _model_name(self, model: str) -> str:
        settings_name = self.MODEL_ALIASES.get(model)
        if settings_name is None:
            supported = ", ".join(self.MODEL_ALIASES)
            raise ValueError(f"model must be one of: {supported}")
        return getattr(self.settings, settings_name)

    @staticmethod
    def _data_url(content: bytes, content_type: str) -> str:
        return f"data:{content_type};base64,{base64.b64encode(content).decode('ascii')}"

    @staticmethod
    def _prompt(intention: str, language: str, style: str) -> str:
        language_name = {"en": "English", "lg": "Luganda", "mix": "English and Luganda", "any": "the most natural language"}.get(language, language)
        return (
            "You create a short, original Ugandan meme caption. Inspect the image carefully. "
            f"Communicative intention: {intention}. Tone: {style}. Language: {language_name}. "
            "Use culturally respectful Ugandan context when appropriate. Return only the caption, "
            "with no labels, explanation, hashtags, or quotation marks."
        )
