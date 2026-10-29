/**
 * Browser-side image preparation for studio uploads.
 *
 * A phone photo is 4–10 MB; the studio keeps its data in localStorage (~5 MB
 * for the whole site), so an upload is downscaled and re-encoded first. WebP is
 * used because it keeps transparency, which product cut-outs need. A browser
 * that cannot encode WebP (older Safari) falls back to a smaller PNG.
 */

const MAX_INPUT_BYTES = 15 * 1024 * 1024;

export class ImageError extends Error {
  constructor(public readonly code: "type" | "size" | "decode") {
    super(code);
  }
}

function decode(file: File): Promise<{ source: CanvasImageSource; width: number; height: number; release: () => void }> {
  if (typeof createImageBitmap === "function") {
    return createImageBitmap(file).then((bitmap) => ({
      source: bitmap,
      width: bitmap.width,
      height: bitmap.height,
      release: () => bitmap.close(),
    }));
  }
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () =>
      resolve({
        source: image,
        width: image.naturalWidth,
        height: image.naturalHeight,
        release: () => URL.revokeObjectURL(url),
      });
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new ImageError("decode"));
    };
    image.src = url;
  });
}

export async function compressImage(file: File, maxSide = 900, quality = 0.84): Promise<string> {
  if (!file.type.startsWith("image/")) throw new ImageError("type");
  if (file.size > MAX_INPUT_BYTES) throw new ImageError("size");

  let decoded;
  try {
    decoded = await decode(file);
  } catch {
    throw new ImageError("decode");
  }

  try {
    const draw = (side: number) => {
      const scale = Math.min(1, side / Math.max(decoded.width, decoded.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(decoded.width * scale));
      canvas.height = Math.max(1, Math.round(decoded.height * scale));
      const context = canvas.getContext("2d");
      if (!context) throw new ImageError("decode");
      context.imageSmoothingQuality = "high";
      context.drawImage(decoded.source, 0, 0, canvas.width, canvas.height);
      return canvas;
    };

    const webp = draw(maxSide).toDataURL("image/webp", quality);
    if (webp.startsWith("data:image/webp")) return webp;
    return draw(Math.min(maxSide, 640)).toDataURL("image/png");
  } finally {
    decoded.release();
  }
}

/** Rough storage cost of a string, in kilobytes. */
export const kb = (value: string) => Math.round(value.length / 1024);
