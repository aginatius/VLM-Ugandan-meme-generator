import base64
import io
import os

import modal
from fastapi import HTTPException

MODEL_ID = "Mwizerwa/meme-qwen2.5-vl-finetuned"

image = (
    modal.Image.debian_slim(python_version="3.11")
    .pip_install(
        "fastapi[standard]",
        "peft",
        "torch==2.6.0",
        "torchvision==0.21.0",
        "transformers==4.51.3",
        "accelerate",
        "qwen-vl-utils==0.0.10",
        "Pillow",
    )
)

app = modal.App("ugmeme-caption-service")


@app.cls(
    image=image,
    gpu="A10G",
    timeout=900,
    secrets=[modal.Secret.from_name("huggingface-secret")],
)
class CaptionModel:
    @modal.enter()
    def load_model(self):
        import torch
        from peft import PeftConfig, PeftModel
        from transformers import AutoConfig, AutoProcessor, Qwen2_5_VLForConditionalGeneration

        token = os.environ.get("HF_TOKEN")
        if not token:
            raise RuntimeError("The huggingface-secret Modal secret must contain HF_TOKEN.")

        adapter_config = PeftConfig.from_pretrained(MODEL_ID, token=token)
        base_model_id = adapter_config.base_model_name_or_path
        if not base_model_id:
            raise RuntimeError(f"{MODEL_ID} does not declare its base model.")

        config = AutoConfig.from_pretrained(base_model_id, token=token)
        if config.model_type != "qwen2_5_vl":
            raise RuntimeError(
                f"Adapter base {base_model_id} has model_type={config.model_type!r}; "
                "image captioning requires Qwen2.5-VL (qwen2_5_vl)."
            )

        self.processor = AutoProcessor.from_pretrained(base_model_id, token=token)
        base_model = Qwen2_5_VLForConditionalGeneration.from_pretrained(
            base_model_id,
            config=config,
            torch_dtype=torch.float16,
            device_map="auto",
            token=token,
        )
        self.model = PeftModel.from_pretrained(
            base_model,
            MODEL_ID,
            token=token,
        )
        self.model.eval()

    @modal.fastapi_endpoint(method="POST")
    def generate(self, data: dict):
        import torch
        from PIL import Image
        from qwen_vl_utils import process_vision_info

        encoded_image = data.get("image")
        prompt = data.get("prompt", "Write a short, original Ugandan meme caption.")
        if not isinstance(encoded_image, str) or not prompt.strip():
            raise HTTPException(status_code=422, detail="Image and prompt are required.")

        try:
            image_bytes = base64.b64decode(encoded_image, validate=True)
            image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        except (ValueError, OSError) as exc:
            raise HTTPException(status_code=422, detail="Invalid image payload.") from exc

        messages = [
            {
                "role": "user",
                "content": [
                    {"type": "image", "image": image},
                    {"type": "text", "text": prompt},
                ],
            }
        ]
        text = self.processor.apply_chat_template(
            messages,
            tokenize=False,
            add_generation_prompt=True,
        )
        image_inputs, video_inputs = process_vision_info(messages)
        inputs = self.processor(
            text=[text],
            images=image_inputs,
            videos=video_inputs,
            padding=True,
            return_tensors="pt",
        ).to(self.model.device)

        with torch.inference_mode():
            generated_ids = self.model.generate(**inputs, max_new_tokens=64)

        trimmed_ids = [
            output_ids[len(input_ids) :]
            for input_ids, output_ids in zip(inputs.input_ids, generated_ids)
        ]
        caption = self.processor.batch_decode(
            trimmed_ids,
            skip_special_tokens=True,
            clean_up_tokenization_spaces=False,
        )[0].strip()
        return {"caption": caption}