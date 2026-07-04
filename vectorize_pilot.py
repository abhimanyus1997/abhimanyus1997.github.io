"""
Convert pilot_sync.png to an animated SVG:
1. Vectorize the image with vtracer (color mode, layered paths)
2. Inject CSS animations: scan-line sweep, reveal fade-in, glitch pulse on eye highlights
3. Output a self-contained animated SVG
"""

import vtracer
import os
import re

INPUT  = "/tmp/pilot_true.png"
OUTPUT = "/home/abhimanyu/projects/abhimanyus1997.github.io/public/static/images/pilot_sync.svg"

# Resize to 512px for faster, cleaner tracing
from PIL import Image as PILImage
img = PILImage.open(INPUT)
if max(img.size) > 512:
    img.thumbnail((512, 512), PILImage.LANCZOS)
    INPUT_RESIZED = "/tmp/pilot_512.png"
    img.save(INPUT_RESIZED, "PNG")
    INPUT = INPUT_RESIZED
    print(f"Resized to {img.size}")


print("🔵 Vectorizing with vtracer (color, spline mode)…")
vtracer.convert_image_to_svg_py(
    INPUT,
    OUTPUT,
    colormode   = "color",      # full-color vectorization
    hierarchical= "stacked",    # stack paths like layers
    mode        = "spline",     # smooth bezier curves
    filter_speckle      = 4,    # remove tiny noise
    color_precision     = 6,    # color buckets
    layer_difference    = 16,   # contrast sensitivity
    corner_threshold    = 60,   # angle for corners
    length_threshold    = 4.0,  # min path length
    max_iterations      = 10,
    splice_threshold    = 45,
    path_precision      = 3,
)
print(f"✅ Raw SVG written ({os.path.getsize(OUTPUT)//1024} KB)")

# ── Read and inject animations ─────────────────────────────────────
with open(OUTPUT, "r", encoding="utf-8") as f:
    svg = f.read()

# Get viewBox / dimensions
vb_match = re.search(r'viewBox="([^"]+)"', svg)
vb = vb_match.group(1) if vb_match else "0 0 1024 1024"
parts = vb.split()
W = float(parts[2]) if len(parts) >= 4 else 1024
H = float(parts[3]) if len(parts) >= 4 else 1024

CSS = f"""
<style>
/* ── Entrance: fade up ── */
svg {{
  animation: svgReveal 1.4s cubic-bezier(0.25,1,0.5,1) both;
}}
@keyframes svgReveal {{
  from {{ opacity: 0; transform: translateY(12px) scale(0.98); }}
  to   {{ opacity: 1; transform: translateY(0) scale(1); }}
}}

/* ── Horizontal scan-line sweep ── */
#scan-overlay rect {{
  animation: scanSweep 3.8s infinite linear;
}}
@keyframes scanSweep {{
  0%   {{ transform: translateY(-{H*0.1:.0f}px); opacity: 0.18; }}
  80%  {{ opacity: 0.12; }}
  100% {{ transform: translateY({H*1.1:.0f}px); opacity: 0; }}
}}

/* ── Subtle flicker on the whole image ── */
#main-art {{
  animation: subtleFlicker 8s infinite;
}}
@keyframes subtleFlicker {{
  0%, 93%, 97%, 100% {{ opacity: 1; }}
  94%  {{ opacity: 0.88; }}
  96%  {{ opacity: 0.94; }}
}}

/* ── Glow pulse overlay ── */
#glow-overlay {{
  animation: glowPulse 4s infinite ease-in-out alternate;
}}
@keyframes glowPulse {{
  from {{ opacity: 0.04; }}
  to   {{ opacity: 0.12; }}
}}
</style>
"""

# ── Build the scan-line + glow overlays ──────────────────────────
OVERLAYS = f"""
<!-- Scan-line sweep -->
<g id="scan-overlay" pointer-events="none">
  <rect x="0" y="0" width="{W:.0f}" height="{H*0.015:.0f}"
        fill="rgba(201,255,54,0.18)" rx="1"/>
</g>

<!-- Acid-green glow wash -->
<g id="glow-overlay" pointer-events="none">
  <rect x="0" y="0" width="{W:.0f}" height="{H:.0f}"
        fill="rgba(201,255,54,0.06)"/>
</g>
"""

# ── Wrap existing paths in a group ────────────────────────────────
# Find the opening <svg ...> tag end
svg_open_end = svg.index(">") + 1
svg_tag  = svg[:svg_open_end]
svg_body = svg[svg_open_end:]

# Remove closing </svg> so we can append
svg_body = svg_body.rstrip()
if svg_body.endswith("</svg>"):
    svg_body = svg_body[:-6]

animated_svg = (
    svg_tag
    + "\n" + CSS
    + '\n<g id="main-art">\n'
    + svg_body
    + "\n</g>\n"
    + OVERLAYS
    + "\n</svg>"
)

with open(OUTPUT, "w", encoding="utf-8") as f:
    f.write(animated_svg)

final_size = os.path.getsize(OUTPUT) // 1024
print(f"✅ Animated SVG written → {OUTPUT}  ({final_size} KB)")
