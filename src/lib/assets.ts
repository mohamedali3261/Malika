import { bottleAssets } from "@/data/bottleAssets";

/**
 * Resolve an image reference. Built-in bottle cut-outs are inlined into the
 * bundle, so a path like "/images/bottles/dark.webp" is swapped for its data
 * URI. Anything else (an https link, an uploaded data URL) passes through.
 */
export function resolveAsset(src: string): string {
  return bottleAssets[src] ?? src;
}
