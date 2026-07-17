#!/usr/bin/env python3
# scripts/extract-video-frames.py
# ---------------------------------------------------------------------------
# Extracts a representative middle frame from each customer-feedback / demo
# video and saves it as WebP (quality 82) for CasesSection:
#   public/images/cases/<name>.webp
#
# No ffmpeg / ImageMagick on this machine or the server, so we use OpenCV to
# read frames directly. For each video we sample three candidate frames in the
# 40%-60% window and keep the one with the best (brightness * sharpness) score,
# which avoids black / blurred / half-composed frames.
#
# Run with the project venv, e.g.:
#   .workbuddy/binaries/python/envs/default/Scripts/python.exe scripts/extract-video-frames.py
# ---------------------------------------------------------------------------
from __future__ import annotations

import sys
from pathlib import Path

try:
    import cv2
    import numpy as np
    from PIL import Image
except ImportError as exc:  # pragma: no cover
    sys.exit(f"[extract-frames] OpenCV + Pillow required: {exc}")

REPO = Path(__file__).resolve().parent.parent
DST_CASES = REPO / "public" / "images" / "cases"

SRC_BASE = Path(
    "C:/Users/Administrator/Desktop/网站建设资料/网站建设资料"
)

# (relative source path, output base name)
VIDEOS = [
    ("网站介绍/公司介绍/客户反馈视频/cotton candy vending feedback video.mp4",
     "cotton-candy-vending-feedback-video"),
    ("网站介绍/公司介绍/客户反馈视频/feedback in hosiptal.mp4",
     "feedback-in-hospital"),
    ("网站介绍/公司介绍/客户反馈视频/feedback video (1).mp4",
     "feedback-video-1"),
    ("网站介绍/公司介绍/客户反馈视频/feedback video.mp4",
     "feedback-video"),
    ("网站介绍/公司介绍/客户反馈视频/feedback.mp4",
     "feedback"),
    ("网站介绍/公司介绍/客户反馈视频/Flower vending-feedback.mp4",
     "flower-vending-feedback"),
    ("网站介绍/公司介绍/客户反馈视频/ice cream vending.mp4",
     "ice-cream-vending"),
    ("产品图和资料/9-宠物自助机/视频.mp4",
     "pet-wash-demo"),
]

WEBP_QUALITY = 82


def best_frame(cap: cv2.VideoCapture) -> tuple[np.ndarray | None, int]:
    """Pick the brightest+clearliest frame in the 40%-60% window."""
    total = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    if total <= 0:
        return None, total
    target = int(total * 0.5)
    candidates = [max(0, target - 2), target, min(total - 1, target + 2)]

    best: np.ndarray | None = None
    best_score = -1.0
    for cf in candidates:
        cap.set(cv2.CAP_PROP_POS_FRAMES, cf)
        ok, frame = cap.read()
        if not ok or frame is None:
            continue
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        brightness = float(gray.mean()) / 255.0
        sharpness = float(cv2.Laplacian(gray, cv2.CV_64F).var()) / 1000.0
        score = 0.5 * brightness + 0.5 * min(sharpness, 1.0)
        if score > best_score:
            best_score = score
            best = frame
    return best, total


def save_webp(frame: np.ndarray, dst: Path) -> bool:
    dst.parent.mkdir(parents=True, exist_ok=True)
    ok = cv2.imwrite(str(dst), frame, [cv2.IMWRITE_WEBP_QUALITY, WEBP_QUALITY])
    if ok:
        return True
    # Fallback via Pillow if cv2 WebP encoder is unavailable.
    try:
        rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        Image.fromarray(rgb).save(dst, "WEBP", quality=WEBP_QUALITY)
        return True
    except Exception as exc:  # pragma: no cover
        print(f"  [err]  save failed {dst}: {exc}")
        return False


def main() -> None:
    DST_CASES.mkdir(parents=True, exist_ok=True)
    print("[extract-frames] extracting customer-feedback frames -> .webp")
    for rel, name in VIDEOS:
        src = SRC_BASE / rel
        if not src.exists():
            print(f"  [skip] missing video: {src}")
            continue
        cap = cv2.VideoCapture(str(src))
        if not cap.isOpened():
            print(f"  [skip] cannot open: {src}")
            cap.release()
            continue
        frame, total = best_frame(cap)
        cap.release()
        if frame is None:
            print(f"  [skip] no readable frame: {src} (frames={total})")
            continue
        dst = DST_CASES / f"{name}.webp"
        if save_webp(frame, dst):
            print(f"  [ok]   {dst.relative_to(REPO)}  (from {total} frames)")
    print("[extract-frames] done ✓")


if __name__ == "__main__":
    main()
