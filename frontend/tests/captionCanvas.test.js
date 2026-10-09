import assert from "node:assert/strict";
import test from "node:test";
import { drawCaptionMeme } from "../src/utils/captionCanvas.js";

function fixture() {
  const calls = [];
  const context = {
    measureText(text) { return { width: text.length * Number.parseFloat(this.font.split(" ")[1]) * 0.6 }; },
    drawImage() {},
    fillRect(...args) { calls.push({ type: "background", args }); },
    strokeText() {},
    fillText(...args) { calls.push({ type: "text", args }); },
  };
  return { canvas: { getContext: () => context }, image: { naturalWidth: 512, naturalHeight: 512 }, calls };
}

test("caption and background move together and remain inside the image", () => {
  const { canvas, image, calls } = fixture();
  const options = { fontScale: 0.09, background: true };
  const top = drawCaptionMeme(canvas, image, "A Kampala market joke", { ...options, position: 0 });
  const bottom = drawCaptionMeme(canvas, image, "A Kampala market joke", { ...options, position: 1 });
  assert.ok(bottom.top > top.top);
  assert.ok(bottom.top + bottom.height <= 512);
  const backgrounds = calls.filter((call) => call.type === "background");
  assert.equal(backgrounds[0].args[1], top.top);
  assert.equal(backgrounds[1].args[1], bottom.top);
});

test("removing the background keeps text and placement", () => {
  const { canvas, image, calls } = fixture();
  const layout = drawCaptionMeme(canvas, image, "Boda life", { position: 0.5, fontScale: 0.1, background: false });
  assert.equal(calls.filter((call) => call.type === "background").length, 0);
  assert.ok(calls.some((call) => call.type === "text"));
  assert.ok(layout.top > 0 && layout.top + layout.height < 512);
});

test("long words wrap and long captions fit within the image", () => {
  const { canvas, image, calls } = fixture();
  const layout = drawCaptionMeme(canvas, image, "Luganda".repeat(60), { position: 1, fontScale: 0.14, background: true });
  assert.ok(layout.top + layout.height <= 512);
  assert.ok(calls.filter((call) => call.type === "text").length > 1);
});
