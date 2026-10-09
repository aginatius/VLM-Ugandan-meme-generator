import io

from fastapi import HTTPException, Response
from modal import App, Image, enter, fastapi_endpoint

image = (
    Image.debian_slim()
    .pip_install(
        "fastapi[standard]",
        "diffusers",
        "transformers",
        "accelerate",
        "peft",
        "torch",
        "sentencepiece",
    )
)

app = App("ugmeme-vlm-backend", image=image)


@app.cls(gpu="T4")
class MemeModel:
    @enter()
    def load_model(self):
        import torch
        from diffusers import DiffusionPipeline, DPMSolverMultistepScheduler

        self.pipe = DiffusionPipeline.from_pretrained(
            "runwayml/stable-diffusion-v1-5",
            torch_dtype=torch.float16,
        )
        self.pipe.load_lora_weights("Mwizerwa/ugmeme-sd15-lora")
        self.pipe.scheduler = DPMSolverMultistepScheduler.from_config(
            self.pipe.scheduler.config, algorithm_type="dpmsolver++"
        )
        self.pipe.to("cuda")

    @fastapi_endpoint(method="POST")
    def generate(self, data: dict):
        import torch

        prompt = data.get("prompt", "ugandan meme")
        seed = data.get("seed")
        generator = None
        if seed is not None:
            try:
                seed = int(seed)
            except (TypeError, ValueError) as exc:
                raise ValueError("seed must be an integer") from exc
            generator = torch.Generator(device="cuda").manual_seed(seed)

        result = self.pipe(
            prompt,
            num_inference_steps=20,
            generator=generator,
        )
        if result.nsfw_content_detected and any(result.nsfw_content_detected):
            raise HTTPException(status_code=422, detail="The model could not return this image. Try a different prompt.")
        generated = result.images[0]

        buffer = io.BytesIO()
        generated.save(buffer, format="JPEG")
        return Response(content=buffer.getvalue(), media_type="image/jpeg")
