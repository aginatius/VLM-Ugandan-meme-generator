import base64

from app.config import Settings
from app.models.hf_client import HuggingFaceVisionClient
from app.schemas import CaptionCandidate, MemeComposeResponse, MemeGenerationResponse
from app.services.image_renderer import MemeRenderer


class MemeService:
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

    def _model_name(self, model: str) -> str:
        if model == "vlm":
            return self.settings.hf_vlm_model
        if model == "lvm":
            return self.settings.hf_lvm_model
        raise ValueError("model must be 'vlm' or 'lvm'")

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
