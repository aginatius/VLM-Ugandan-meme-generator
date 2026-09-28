from dataclasses import dataclass

from app.domain.value_objects import Caption, ModelName


@dataclass(frozen=True)
class MemeRequest:
    intention: str
    model: ModelName


@dataclass(frozen=True)
class MemeCandidate:
    caption: Caption
    model: ModelName
