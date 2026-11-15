#!/usr/bin/env bash
# ==============================================================================
# Studio 3D Character Asset Pipeline (gltf-transform Draco + WebP / KTX2)
# Usage:
#   ./scripts/optimize_glb.sh input.glb output.opt.glb [webp|ktx2]
# ==============================================================================
set -euo pipefail

INPUT_GLB="${1:-}"
OUTPUT_GLB="${2:-}"
TEX_CODEC="${3:-webp}"

if [[ -z "$INPUT_GLB" || -z "$OUTPUT_GLB" ]]; then
  echo "Usage: ./scripts/optimize_glb.sh <input.glb> <output.opt.glb> [webp|ktx2]"
  exit 1
fi

echo "🔍 [1/4] Inspecting raw character asset: $INPUT_GLB"
npx --yes @gltf-transform/cli inspect "$INPUT_GLB"

echo "🧪 [2/4] Validating glTF schema & bone weights..."
npx --yes @gltf-transform/cli validate "$INPUT_GLB" --ignore ACCESSOR_WEIGHTS_NON_NORMALIZED

echo "⚡ [3/4] Running Draco geometry compression + ${TEX_CODEC} texture optimization (max 2048px)..."
npx --yes @gltf-transform/cli optimize "$INPUT_GLB" "$OUTPUT_GLB" \
  --compress draco \
  --texture-compress "$TEX_CODEC" \
  --texture-size 2048 \
  --weld true \
  --prune true \
  --resample true

echo "✅ [4/4] Inspecting optimized output: $OUTPUT_GLB"
npx --yes @gltf-transform/cli inspect "$OUTPUT_GLB"
echo "🎉 Done! Optimized asset written to $OUTPUT_GLB"
