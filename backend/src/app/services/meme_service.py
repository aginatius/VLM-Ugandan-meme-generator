from app.domain.entities import MemeCandidate, MemeRequest
from app.domain.value_objects import Caption, ModelName
from app.models.lvm_model import LvmModel
from app.models.vlm_model import VlmModel


class MemeService:
    def __init__(self) -> None:
        self.vlm = VlmModel()
        self.lvm = LvmModel()

    def generate(
        self, image: bytes, intention: str, model: str
    ) -> dict[str, str]:
        request = MemeRequest(intention=intention, model=ModelName(model))
        generator = self.vlm if request.model.value == "vlm" else self.lvm
        caption_text = generator.generate(image, request.intention)
        candidate = MemeCandidate(
            caption=Caption(caption_text), model=request.model
        )
        return {"caption": candidate.caption.text, "model": candidate.model.value}
