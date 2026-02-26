#!/bin/bash
# =============================================================================
# MAXIOS Video Compression Script
# =============================================================================
# Compresses background-video.mp4 (61MB) into two optimized versions:
#   - Desktop: 720p, ~5-8MB
#   - Mobile:  480p, ~2-3MB
#
# INSTALL FFMPEG FIRST:
#   Windows: https://www.gyan.dev/ffmpeg/builds/ (download "ffmpeg-release-essentials.zip")
#            Extract → add the bin/ folder to your system PATH
#   Mac:     brew install ffmpeg
#   Linux:   sudo apt install ffmpeg
#
# USAGE:
#   bash compress-video.sh
# =============================================================================

INPUT="public/background-video.mp4"

echo ""
echo "============================================"
echo "  MAXIOS Video Compression"
echo "============================================"
echo "  Source: $INPUT"
echo "  Size:   $(du -h "$INPUT" | cut -f1)"
echo "============================================"
echo ""

# ─────────────────────────────────────────────
# DESKTOP VERSION — 720p, ~5-8MB
# ─────────────────────────────────────────────
echo "[1/2] Creating DESKTOP version (1280x720, 24fps, CRF 28)..."
echo ""

ffmpeg -i "$INPUT" \
  -vcodec libx264 \
  -crf 28 \
  -preset slow \
  -vf "scale=1280:720:force_original_aspect_ratio=decrease,pad=1280:720:(ow-iw)/2:(oh-ih)/2" \
  -r 24 \
  -an \
  -movflags +faststart \
  -t 15 \
  -y \
  "public/background-video-desktop.mp4"

# ─────────────────────────────────────────────
# MOBILE VERSION — 480p, ~2-3MB
# ─────────────────────────────────────────────
echo ""
echo "[2/2] Creating MOBILE version (854x480, 20fps, CRF 31)..."
echo ""

ffmpeg -i "$INPUT" \
  -vcodec libx264 \
  -crf 31 \
  -preset slow \
  -vf "scale=854:480:force_original_aspect_ratio=decrease,pad=854:480:(ow-iw)/2:(oh-ih)/2" \
  -r 20 \
  -an \
  -movflags +faststart \
  -t 15 \
  -y \
  "public/background-video-mobile.mp4"

echo ""
echo "============================================"
echo "  DONE!"
echo "============================================"
echo "  Original:  $(du -h "$INPUT" | cut -f1)"
echo "  Desktop:   $(du -h "public/background-video-desktop.mp4" | cut -f1)  (public/background-video-desktop.mp4)"
echo "  Mobile:    $(du -h "public/background-video-mobile.mp4" | cut -f1)  (public/background-video-mobile.mp4)"
echo ""
echo "  NEXT STEPS:"
echo "    1. Preview both videos — make sure they look good"
echo "    2. Replace the original desktop video:"
echo "       mv public/background-video.mp4 public/background-video-original.mp4"
echo "       mv public/background-video-desktop.mp4 public/background-video.mp4"
echo "    3. Mobile version is already at: public/background-video-mobile.mp4"
echo "    4. Deploy!"
echo ""
