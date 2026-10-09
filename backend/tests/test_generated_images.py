import io
import unittest

from PIL import Image, ImageDraw

from app.services.meme_service import MemeService


class GeneratedImageTests(unittest.TestCase):
    @staticmethod
    def image_bytes(color, varied=False):
        image = Image.new("RGB", (64, 64), color)
        if varied:
            ImageDraw.Draw(image).rectangle((16, 16, 48, 48), fill="white")
        output = io.BytesIO()
        image.save(output, format="PNG")
        return output.getvalue()

    def test_rejects_blank_black_and_white_images(self):
        for color in ("black", "white"):
            with self.subTest(color=color), self.assertRaisesRegex(ValueError, "blank"):
                MemeService._validate_generated_image(self.image_bytes(color))

    def test_rejects_corrupt_images(self):
        with self.assertRaisesRegex(ValueError, "damaged"):
            MemeService._validate_generated_image(b"not image data")

    def test_accepts_nonblank_image(self):
        MemeService._validate_generated_image(self.image_bytes("black", varied=True))


if __name__ == "__main__":
    unittest.main()
