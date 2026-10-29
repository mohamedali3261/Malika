#!/usr/bin/env bash
# Turn a chroma-key product shot into a transparent WebP for the product cards.
#
#   scripts/cutout-bottle.sh <source.png> <output.webp> [green|magenta]
#
# Why this exists: image models cannot write a real alpha channel — asked for a
# "transparent background" they paint a checkerboard instead. So bottles are
# shot on a flat key colour and keyed out here.
set -euo pipefail
src="$1"; out="$2"; key="${3:-green}"
SIZE="${SIZE:-540x760}"; QUALITY="${QUALITY:-86}"
tmp="$(mktemp -d)"; trap 'rm -rf "$tmp"' EXIT

if [ "$key" = "magenta" ]; then KEY='srgb(249,3,249)'; else KEY='srgb(3,249,3)'; fi
W=$(identify -format %w "$src"); H=$(identify -format %h "$src"); X=$((W-2)); Y=$((H-2))

# 1. Flood-fill from the four corners. Only the connected background is
#    removed, so a coloured reflection *inside* the glass is never punched out.
convert "$src" -alpha set -fuzz 30% \
  -fill none -floodfill +1+1 "$KEY" \
  -fill none -floodfill +${X}+1 "$KEY" \
  -fill none -floodfill +1+${Y} "$KEY" \
  -fill none -floodfill +${X}+${Y} "$KEY" "$tmp/keyed.png"

# 2. Tighten + feather the alpha edge.
convert "$tmp/keyed.png" -channel A -morphology Erode Octagon:1 -blur 0x0.8 -level 25%,75% +channel "$tmp/feather.png"

# 3. Despill: stop the key colour surviving as a rim on the glass edges.
if [ "$key" = "magenta" ]; then
  convert "$tmp/feather.png" -channel R -fx 'min(u,(g+b)/2+0.14)' +channel \
    -channel B -fx 'min(u,(r+g)/2+0.14)' +channel "$tmp/despill.png"
else
  convert "$tmp/feather.png" -channel G -fx 'min(u,(r+b)/2+0.10)' +channel "$tmp/despill.png"
fi

# 4. Trim the margin, pad, scale, export WebP (≈15–50 KB each).
convert "$tmp/despill.png" -trim +repage -bordercolor none -border 20 -resize "$SIZE" \
  -quality "$QUALITY" -define webp:alpha-quality=92 "$out"
