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

const MAX_D1_IMAGE_BYTES = 1_000_000;

function canvasBlob(canvas: HTMLCanvasElement, type: string, quality?: number): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob((blob) => resolve(blob), type, quality));
}

/**
 * Ensures an uploaded image fits within D1's 1 MB raw limit.
 * Files already <= 1 MB in JPEG/PNG/WebP are kept byte-for-byte; larger photos
 * are downscaled and re-encoded in the browser first.
 */
export async function prepareImageForUpload(file: File, maxBytes = MAX_D1_IMAGE_BYTES): Promise<File> {
  if (!file.type.startsWith("image/")) throw new ImageError("type");
  if (file.size > MAX_INPUT_BYTES) throw new ImageError("size");
  if (file.size >= 12 && file.size <= maxBytes && ["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
    return file;
  }

  let decoded;
  try {
    decoded = await decode(file);
  } catch {
    throw new ImageError("decode");
  }

  try {
    const baseName = file.name.replace(/\.[^.]+$/, "") || "image";
    const fallbackType = file.type === "image/jpeg" ? "image/jpeg" : "image/png";
    for (const side of [1600, 1280, 960, 720, 560]) {
      const scale = Math.min(1, side / Math.max(decoded.width, decoded.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(decoded.width * scale));
      canvas.height = Math.max(1, Math.round(decoded.height * scale));
      const context = canvas.getContext("2d");
      if (!context) throw new ImageError("decode");
      context.imageSmoothingQuality = "high";
      context.drawImage(decoded.source, 0, 0, canvas.width, canvas.height);

      for (const quality of [0.85, 0.75, 0.64]) {
        let blob = await canvasBlob(canvas, "image/webp", quality);
        if (!blob || blob.type !== "image/webp") {
          blob = await canvasBlob(canvas, fallbackType, quality);
        }
        if (blob && blob.size >= 12 && blob.size <= maxBytes) {
          const ext = blob.type === "image/webp" ? "webp" : blob.type === "image/jpeg" ? "jpg" : "png";
          return new File([blob], `${baseName}.${ext}`, { type: blob.type });
        }
      }
    }
    throw new ImageError("size");
  } finally {
    decoded.release();
  }
}

export async function uploadImageToD1(file: File): Promise<{ id: string; url: string }> {
  const prepared = await prepareImageForUpload(file);
  const data = new FormData();
  data.append("file", prepared);
  const response = await fetch("/api/admin/images", { method: "POST", body: data });
  if (response.status === 413) throw new ImageError("size");
  if (!response.ok) throw new Error("upload_failed");
  return (await response.json()) as { id: string; url: string };
}

/** Rough storage cost of a string, in kilobytes. */
export const kb = (value: string) => Math.round(value.length / 1024);
