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

    async def test_generates_three_distinct_directions_in_one_model_call(self):
        service = self.service()
        a = "Negotiating over lemons in Kampala's bustling market."
        b = "My wallet just requested an emergency meeting."
        c = "When the discount costs more than the taxi home."
        service.client.generate_caption = AsyncMock(return_value=f"1. {a}\n2. {b}\n3. {c}")
        result = await self.generate(service)
        self.assertEqual([item.caption for item in result.captions], [a, b, c])
        self.assertEqual(service.client.generate_caption.await_count, 1)

    async def test_retries_missing_or_near_duplicate_batch_options(self):
        service = self.service()
        a = "Negotiating over lemons in Kampala's bustling market."
        b = "My wallet just requested an emergency meeting."
        c = "When the discount costs more than the taxi home."
        service.client.generate_caption = AsyncMock(side_effect=[f"{a}\n{a.upper()}\n{b}", c])
        result = await self.generate(service)
        self.assertEqual([item.caption for item in result.captions], [a, b, c])
        self.assertEqual(service.client.generate_caption.await_count, 2)
        self.assertIn(a, service.client.generate_caption.call_args_list[1].args[2])
        self.assertIn(b, service.client.generate_caption.call_args_list[1].args[2])

    async def test_returns_fewer_options_instead_of_duplicates(self):
        service = self.service()
        service.client.generate_caption = AsyncMock(return_value="My wallet has left the chat.")
        result = await self.generate(service)
        self.assertEqual(len(result.captions), 1)
        self.assertEqual(service.client.generate_caption.await_count, 7)

    async def test_regeneration_excludes_previous_captions(self):
        service = self.service()
        repeated = "My wallet has left the chat."
        service.client.generate_caption = AsyncMock(return_value=repeated)
        with self.assertRaisesRegex(HuggingFaceInferenceError, "repeating"):
            await self.generate(service, [repeated])
        self.assertEqual(service.client.generate_caption.await_count, 7)
        self.assertIn(repeated, service.client.generate_caption.call_args_list[0].args[2])

    def test_splits_numbered_caption_lines(self):
        self.assertEqual(
            MemeService._split_caption_candidates('1. "First caption"\n2) Second caption\n- Third caption'),
            ["First caption", "Second caption", "Third caption"],
        )

    def test_near_duplicates_and_different_ideas(self):
        self.assertTrue(MemeService._similar_caption("Bargaining over lemons at Kampala market!", "Bargaining over lemons in Kampala market."))
        self.assertFalse(MemeService._similar_caption("My wallet has left the chat.", "The vendor knows my salary before I do."))

    def test_removes_unsolicited_translations_and_hashtags(self):
        self.assertEqual(MemeService._candidate_text("Market bargaining! #Kampala \u67e0\u6aac", "en"), "Market bargaining!")
        self.assertEqual(MemeService._candidate_text("\u67e0\u6aac", "en"), "")
        self.assertEqual(MemeService._candidate_text("Nkulaba Ssebo.", "lg"), "Nkulaba Ssebo.")
