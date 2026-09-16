from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "Ugandan Meme Generator API"
    environment: str = "development"
    hf_api_token: str = ""
    hf_api_base_url: str = "https://router.huggingface.co/v1"
    hf_paligemma2_model: str = "google/paligemma2-3b-pt-224"
    hf_qwen25_vl_model: str = "Qwen/Qwen2.5-VL-3B-Instruct"
    hf_internvl25_model: str = "OpenGVLab/InternVL2_5-4B"
    hf_llava_onevision_model: str = "llava-hf/llava-onevision-qwen2-7b-ov-hf"
    hf_minicpm_v_model: str = "openbmb/MiniCPM-V-2_6"
    hf_timeout_seconds: float = 90.0
    cors_origins: str = "http://localhost:5173"
    max_upload_size_mb: int = 10
    max_new_tokens: int = 64

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    @property
    def allowed_origins(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
