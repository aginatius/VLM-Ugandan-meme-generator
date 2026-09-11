from dataclasses import dataclass


@dataclass(frozen=True)
class Caption:
    text: str

    def __post_init__(self) -> None:
        if not self.text.strip():
            raise ValueError("Caption cannot be empty")


@dataclass(frozen=True)
class ModelName:
    value: str

    def __post_init__(self) -> None:
        if self.value not in {"vlm", "lvm"}:
            raise ValueError("Model must be 'vlm' or 'lvm'")
