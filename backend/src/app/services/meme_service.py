import base64
import io
import json
import re
import unicodedata
from difflib import SequenceMatcher

import httpx
from PIL import Image, UnidentifiedImageError

from app.config import Settings
from app.models.hf_client import HuggingFaceInferenceError, HuggingFaceVisionClient
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
        excluded_captions: list[str] | None = None,
    ) -> MemeGenerationResponse:
        model_name = self._model_name(model)
        prompt = self._prompt(intention, language, style)
        captions = []
        avoid = list(excluded_captions or [])
        directions = (
            "Write a first-person inner thought about an unexpected consequence in the image.",
            "Write a short spoken reaction from a different character, using a different joke and sentence structure.",
            "Write an ironic comparison between expectation and reality, with a new punchline and vocabulary.",
        )
        for direction in directions:
            for attempt in range(2):
                variation_prompt = f"{prompt}\nCreative direction: {direction}"
                if avoid:
                    variation_prompt += (
                        "\nPreviously used captions (reference only): " + json.dumps(avoid, ensure_ascii=False)
                        + "\nDo not repeat or paraphrase these captions. Use a different joke, subject angle, opening, and punchline."
                    )
                if attempt:
                    variation_prompt += "\nYour last attempt was too similar. Invent a completely new idea."
                caption = self._candidate_text(await self.client.generate_caption(
                    image, content_type, variation_prompt, model_name
                ), language)
                if not caption or any(self._similar_caption(caption, previous) for previous in avoid):
                    continue
                captions.append(CaptionCandidate(
                    caption=caption, language=language, score=max(60, 94 - len(captions) * 7)
                ))
                avoid.append(caption)
                break
        if not captions:
            raise HuggingFaceInferenceError(
                "The caption model kept repeating earlier captions. Please regenerate or adjust your topic."
            )

        return MemeGenerationResponse(
            model=model,
            image_url=self._data_url(image, content_type),
            captions=captions,
        )

    @staticmethod
    def _candidate_text(caption: str, language: str) -> str:
        # These supported languages use Latin script. Some sampled model outputs
        # append an unsolicited translation; never show that tail as the caption.
        if language in {"en", "lg", "mix", "any"}:
            for index, character in enumerate(caption):
                if character.isalpha() and "LATIN" not in unicodedata.name(character, ""):
                    caption = caption[:index]
                    break
        caption = re.sub(r"#\w+", "", caption)
        return caption.strip().strip('"')

    @staticmethod
    def _similar_caption(first: str, second: str) -> bool:
        def normalize(text):
            return " ".join(re.findall(r"\w+", text.casefold()))
        a, b = normalize(first), normalize(second)
        if not a or not b:
            return a == b
        if a == b or SequenceMatcher(None, a, b).ratio() >= 0.78:
            return True
        tokens_a, tokens_b = set(a.split()), set(b.split())
        common = len(tokens_a & tokens_b)
        return (
            common / len(tokens_a | tokens_b) >= 0.65
            or common / min(len(tokens_a), len(tokens_b)) >= 0.85
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

    async def generate_image(self, prompt: str, seed: int | None = None) -> bytes:
        if self.settings.modal_image_url:
            payload = {"prompt": prompt}
            if seed is not None:
                payload["seed"] = seed
            try:
                async with httpx.AsyncClient(
                    timeout=self.settings.modal_image_timeout_seconds
                ) as client:
                    response = await client.post(self.settings.modal_image_url, json=payload)
            except httpx.HTTPError as exc:
                raise ValueError("Could not reach the Modal image model. Please try again.") from exc
            if response.is_error:
                raise ValueError(
                    f"Modal image generation failed ({response.status_code}): {response.text[:500]}"
                )
            if not response.headers.get("content-type", "").startswith("image/") or not response.content:
                raise ValueError("Modal returned an invalid image response.")
            self._validate_generated_image(response.content)
            return response.content

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
            self._validate_generated_image(response.content)
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
                        image = base64.b64decode(first)
                        self._validate_generated_image(image)
                        return image
                if isinstance(value, str):
                    image = base64.b64decode(value)
                    self._validate_generated_image(image)
                    return image

        raise ValueError("Hugging Face returned an unexpected image payload.")

    @staticmethod
    def _validate_generated_image(content: bytes) -> None:
        try:
            with Image.open(io.BytesIO(content)) as image:
                image.load()
                extrema = image.convert("RGB").getextrema()
                if all(high - low <= 2 for low, high in extrema):
                    raise ValueError("The model returned a blank image. Please retry this candidate.")
        except (UnidentifiedImageError, OSError) as exc:
            raise ValueError("The model returned a damaged image. Please retry this candidate.") from exc

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
            "Use culturally respectful Ugandan context when appropriate. Use at most 20 words. "
            "Write only in the requested language; do not append translations into other languages. Return only the caption, "
            "with no labels, explanation, hashtags, or quotation marks."
        )
