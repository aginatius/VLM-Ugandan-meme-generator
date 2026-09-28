from pydantic import BaseModel, Field


class CaptionCandidate(BaseModel):
    caption: str
    language: str
    score: int = Field(ge=0, le=100)


class MemeGenerationResponse(BaseModel):
    model: str
    image_url: str
    captions: list[CaptionCandidate]


class MemeComposeResponse(BaseModel):
    model: str
    caption: str
    image_url: str
    score: int = Field(ge=0, le=100)
