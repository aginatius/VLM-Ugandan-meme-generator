export const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

function wrapCaption(context, text, width) {
  const lines = [];
  let line = "";
  for (const word of text.trim().split(/\s+/)) {
    if (line && context.measureText(`${line} ${word}`).width > width) {
      lines.push(line);
      line = "";
    }
    if (line) line += " ";
    for (const character of word) {
      if (context.measureText(line + character).width > width && line) {
        lines.push(line.trim());
        line = "";
      }
      line += character;
    }
  }
  if (line.trim()) lines.push(line.trim());
  return lines;
}

export function drawCaptionMeme(canvas, image, caption, { position, fontScale, background }) {
  canvas.width = image.naturalWidth;
  canvas.height = image.naturalHeight;
  const { width, height } = canvas;
  const context = canvas.getContext("2d");
  const padding = Math.max(6, Math.round(width * 0.025));
  let fontSize = Math.max(10, Math.round(Math.min(width, height) * fontScale));
  let lines;
  let lineHeight;
  do {
    context.font = `800 ${fontSize}px Arial, sans-serif`;
    lines = wrapCaption(context, caption, width - padding * 4);
    lineHeight = fontSize * 1.2;
    if (lines.length * lineHeight + padding * 2 <= height - padding * 2 || fontSize <= 10) break;
    fontSize -= 1;
  } while (fontSize >= 10);
  const panelHeight = Math.min(height, lines.length * lineHeight + padding * 2);
  const travel = Math.max(0, height - panelHeight - padding * 2);
  const top = Math.max(0, Math.min(padding, (height - panelHeight) / 2)) + clamp(position, 0, 1) * travel;
  context.drawImage(image, 0, 0);
  if (background) {
    context.fillStyle = "rgba(0, 0, 0, 0.72)";
    context.fillRect(0, top, width, panelHeight);
  }
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.lineJoin = "round";
  context.lineWidth = Math.max(2, fontSize * 0.065);
  context.strokeStyle = "#000";
  context.fillStyle = "#fff";
  lines.forEach((line, index) => {
    const y = top + padding + lineHeight * (index + 0.5);
    context.strokeText(line, width / 2, y);
    context.fillText(line, width / 2, y);
  });
  return { top, height: panelHeight, travel };
}
