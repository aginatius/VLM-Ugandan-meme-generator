import base64
import re
from typing import Any

import httpx

from app.config import Settings


class HuggingFaceInferenceError(RuntimeError):
    pass


class HuggingFaceVisionClient:
    def __init__(self, settings: Settings) -> None:
        self.settings = settings

    async def generate_caption(
        self,
        image: bytes,
        content_type: str,
        prompt: str,
        model_name: str,
    ) -> str:
        if not self.settings.modal_caption_url and not self.settings.hf_api_token:
            raise HuggingFaceInferenceError(
                "Configure MODAL_CAPTION_URL or HF_API_TOKEN on the backend."
            )

        image_data = base64.b64encode(image).decode("ascii")
        if self.settings.modal_caption_url:
            try:
                async with httpx.AsyncClient(
                    timeout=self.settings.modal_caption_timeout_seconds
                ) as client:
                    response = await client.post(
                        self.settings.modal_caption_url,
                        json={
                            "image": image_data,
                            "content_type": content_type,
                            "prompt": prompt,
                        },
                    )
            except httpx.HTTPError as exc:
                raise HuggingFaceInferenceError(
                    "Could not reach the Modal caption model."
                ) from exc

            if response.is_error:
                raise HuggingFaceInferenceError(
                    f"Modal caption inference failed ({response.status_code}): "
                    f"{response.text[:500]}"
                )

            try:
                caption = response.json().get("caption", "")
            except (ValueError, AttributeError) as exc:
                raise HuggingFaceInferenceError(
                    "Modal returned an invalid caption response."
                ) from exc
            if not caption:
                raise HuggingFaceInferenceError("Modal returned an empty caption.")
            return self._clean_caption(caption)

        image_url = f"data:{content_type};base64,{image_data}"
        payload = {
            "model": model_name,
            "messages": [
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": prompt,
                        },
                        {
                            "type": "image_url",
                            "image_url": {"url": image_url},
                        },
                    ],
                }
            ],
            "max_tokens": self.settings.max_new_tokens,
            "temperature": 0.8,
        }
        headers = {
            "Authorization": f"Bearer {self.settings.hf_api_token}",
            "Content-Type": "application/json",
        }
        url = f"{self.settings.hf_api_base_url.rstrip('/')}/chat/completions"

        try:
            async with httpx.AsyncClient(timeout=self.settings.hf_timeout_seconds) as client:
                response = await client.post(url, json=payload, headers=headers)
        except httpx.HTTPError as exc:
            raise HuggingFaceInferenceError("Could not reach Hugging Face.") from exc

        if response.is_error:
            detail = response.text[:500]
            raise HuggingFaceInferenceError(
                f"Hugging Face inference failed ({response.status_code}): {detail}"
            )

        try:
            result: Any = response.json()
        except ValueError as exc:
            raise HuggingFaceInferenceError("Hugging Face returned invalid JSON.") from exc

        caption = self._extract_text(result)
        if not caption:
            raise HuggingFaceInferenceError("Hugging Face returned an empty caption.")
        return self._clean_caption(caption)

    @staticmethod
    def _extract_text(result: Any) -> str:
        if isinstance(result, dict):
            choices = result.get("choices")
            if isinstance(choices, list) and choices:
                message = choices[0].get("message", {})
                content = message.get("content", "") if isinstance(message, dict) else ""
                if isinstance(content, list):
                    return " ".join(
                        item.get("text", "")
                        for item in content
                        if isinstance(item, dict)
                    )
                return str(content)
            return str(result.get("generated_text", ""))

        if isinstance(result, list) and result:
            first = result[0]
            if isinstance(first, dict):
                return str(first.get("generated_text", first.get("text", "")))
            return str(first)
        return ""

    @staticmethod
    def _clean_caption(caption: str) -> str:
        caption = re.sub(r"^\s*(assistant|caption)\s*:\s*", "", caption, flags=re.I)
        caption = re.sub(r"\s+", " ", caption).strip().strip('"')
        return caption
