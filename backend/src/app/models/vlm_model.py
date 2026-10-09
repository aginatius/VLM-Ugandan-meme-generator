class VlmModel:
    def __init__(self) -> None:
        self.loaded = False

    def generate(self, image: bytes, intention: str) -> str:
        if not self.loaded:
            return f"VLM placeholder caption for: {intention}"
        raise NotImplementedError
