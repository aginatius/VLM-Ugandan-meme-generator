import io
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


class MemeRenderer:
    def render(self, image_bytes: bytes, caption: str) -> bytes:
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        width, height = image.size
        overlay = Image.new("RGBA", image.size, (0, 0, 0, 0))
        draw = ImageDraw.Draw(overlay)
        font = self._font(max(18, int(min(width, height) * 0.075)))
        lines = self._wrap(draw, caption, font, int(width * 0.9))
        line_height = max(20, int(font.size * 1.15))
        panel_height = min(int(height * 0.38), line_height * len(lines) + 32)
        draw.rectangle((0, height - panel_height, width, height), fill=(0, 0, 0, 185))

        y = height - panel_height + 16
        for line in lines:
            box = draw.textbbox((0, 0), line, font=font, stroke_width=2)
            x = (width - (box[2] - box[0])) / 2
            draw.text(
                (x, y), line, font=font, fill="white", stroke_width=2, stroke_fill="black"
            )
            y += line_height

        output = io.BytesIO()
        Image.alpha_composite(image.convert("RGBA"), overlay).convert("RGB").save(
            output, format="JPEG", quality=92
        )
        return output.getvalue()

    @staticmethod
    def _font(size: int) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
        candidates = [
            "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
            "C:/Windows/Fonts/arialbd.ttf",
        ]
        for path in candidates:
            if Path(path).exists():
                return ImageFont.truetype(path, size)
        return ImageFont.load_default()

    @staticmethod
    def _wrap(draw: ImageDraw.ImageDraw, text: str, font: ImageFont.ImageFont, max_width: int) -> list[str]:
        words = text.split()
        lines: list[str] = []
        current = ""
        for word in words:
            candidate = f"{current} {word}".strip()
            box = draw.textbbox((0, 0), candidate, font=font, stroke_width=2)
            if current and box[2] - box[0] > max_width:
                lines.append(current)
                current = word
            else:
                current = candidate
        if current:
            lines.append(current)
        return lines or [""]
