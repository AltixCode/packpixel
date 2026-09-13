#!/usr/bin/env bash
# Re-reads the JPEGs PackPixel actually wrote to the camera roll and fails if
# the app's "exported at <preset>" claim is not true of the bytes on disk.
#
# Exact canvas dimensions alone do not prove correctness: the build this gate
# replaces resized without padding and still reported the preset's dimensions.
# So this also measures where the source photo landed inside the canvas, which
# distinguishes letterboxing from stretching.
#
# Usage: .maestro/verify-exports.sh <simulator-udid> [expected-canvas]
set -euo pipefail
UDID="${1:?usage: verify-exports.sh <udid> [WxH]}"
EXPECT="${2:-2000x2000}"
DCIM="$HOME/Library/Developer/CoreSimulator/Devices/$UDID/data/Media/DCIM/100APPLE"
BIN="$(mktemp -d)/content-box"
swiftc -O "$(dirname "$0")/content-box.swift" -o "$BIN"

mapfile -t SHOTS < <(ls -t "$DCIM"/*.JPG 2>/dev/null | head -3)
[ "${#SHOTS[@]}" -eq 3 ] || { echo "FAIL: expected 3 exports, found ${#SHOTS[@]}"; exit 1; }

echo "expecting canvas $EXPECT"
"$BIN" "${SHOTS[@]}" | tee /tmp/pp-boxes.txt

# Fixtures are 1600x600, 600x1600 and 900x900. Padded into a square canvas the
# content boxes must be 2000x750, 750x2000 and 2000x2000 respectively, each
# centred. Anything filling the canvas edge-to-edge on a non-square source was
# stretched.
awk -v expect="$EXPECT" '
  { split(expect, e, "x"); W = e[1]
    split($2, c, "="); split(c[2], d, "x")
    split($4, m, "="); split(m[2], s, "x")
    cw = s[1]; ch = s[2]
    if (d[1] != W || d[2] != W) { print "FAIL canvas", $0; bad = 1; next }
    ar = cw / ch
    ok = (ar > 2.5 && ar < 2.8) || (ar > 0.35 && ar < 0.40) || (ar > 0.98 && ar < 1.02)
    if (!ok) { print "FAIL aspect", $0; bad = 1 }
  }
  END { exit bad ? 1 : 0 }
' /tmp/pp-boxes.txt

echo "RESULT: PASS - every export is exactly $EXPECT with the source letterboxed, not stretched"
