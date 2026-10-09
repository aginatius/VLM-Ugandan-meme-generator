import unittest
from unittest.mock import AsyncMock

from app.config import Settings
from app.models.hf_client import HuggingFaceInferenceError
from app.services.meme_service import MemeService


class CaptionDiversityTests(unittest.IsolatedAsyncioTestCase):
    def service(self):
        return MemeService(Settings(_env_file=None))

    async def generate(self, service, excluded=None):
        return await service.generate(b"image", "image/png", "Market bargaining", "en", "Relatable", "qwen25-vl", excluded)

    async def test_retries_repeated_and_near_identical_captions(self):
        service = self.service()
        a = "Negotiating over lemons in Kampala's bustling market."
        b = "My wallet just requested an emergency meeting."
        c = "When the discount costs more than the taxi home."
        service.client.generate_caption = AsyncMock(side_effect=[a, a.upper(), b, b + "!", c])
        result = await self.generate(service)
        self.assertEqual([item.caption for item in result.captions], [a, b, c])
        self.assertEqual(service.client.generate_caption.await_count, 5)
        self.assertIn(a, service.client.generate_caption.call_args_list[1].args[2])

    async def test_returns_fewer_options_instead_of_duplicates(self):
        service = self.service()
        service.client.generate_caption = AsyncMock(return_value="My wallet has left the chat.")
        result = await self.generate(service)
        self.assertEqual(len(result.captions), 1)
        self.assertLessEqual(service.client.generate_caption.await_count, 6)

    async def test_regeneration_excludes_previous_captions(self):
        service = self.service()
        repeated = "My wallet has left the chat."
        service.client.generate_caption = AsyncMock(return_value=repeated)
        with self.assertRaisesRegex(HuggingFaceInferenceError, "repeating"):
            await self.generate(service, [repeated])
        self.assertEqual(service.client.generate_caption.await_count, 6)

    def test_near_duplicates_and_different_ideas(self):
        self.assertTrue(MemeService._similar_caption("Bargaining over lemons at Kampala market!", "Bargaining over lemons in Kampala market."))
        self.assertFalse(MemeService._similar_caption("My wallet has left the chat.", "The vendor knows my salary before I do."))

    def test_removes_unsolicited_translations_and_hashtags(self):
        self.assertEqual(MemeService._candidate_text("Market bargaining! #Kampala \u67e0\u6aac", "en"), "Market bargaining!")
        self.assertEqual(MemeService._candidate_text("\u67e0\u6aac", "en"), "")
        self.assertEqual(MemeService._candidate_text("Nkulaba Ssebo.", "lg"), "Nkulaba Ssebo.")
