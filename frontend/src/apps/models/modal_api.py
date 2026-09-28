import io
from fastapi import Response
from modal import App, Image, web_endpoint

# 1. Create a remote Linux environment with all ML dependencies
image = (
    Image.debian_slim()
    .pip_install(
        "diffusers",
        "transformers",
        "accelerate",
        "peft",  # Required to load your Hugging Face LoRA weights
        "torch",
    )
)

app = App("ugmeme-gpu-service", image=image)

# 2. Configure the structural pipeline to run on a dedicated T4 GPU
@app.cls(gpu="T4")
class MemeModel:
    def __enter__(self):
        import torch
        from diffusers import DiffusionPipeline

        # Download the base stable diffusion engine
        self.pipe = DiffusionPipeline.from_pretrained(
            "runwayml/stable-diffusion-v1-5", 
            torch_dtype=torch.float16
        )
        
        # Inject your custom fine-tuned weights dynamically from Hugging Face
        self.pipe.load_lora_weights("Mwizerwa/ugmeme-sd15-lora")
        self.pipe.to("cuda")

    @web_endpoint(method="POST")
    def generate(self, data: dict):
        # Extract prompt input payload sent over the network
        prompt = data.get("prompt", "a classic ugandan meme")
        
        # Execute the underlying neural network layers
        generated_image = self.pipe(prompt, num_inference_steps=30).images[0]
        
        # Stream the raw image data format back to the requester
        byte_stream = io.BytesIO()
        generated_image.save(byte_stream, format="JPEG")
        
        return Response(content=byte_stream.getvalue(), media_type="image/jpeg")
