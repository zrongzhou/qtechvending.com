#!/usr/bin/env python3
# scripts/convert-images.py
# ---------------------------------------------------------------------------
# Converts source images to WebP (quality 82) for the Qtech V30 rebuild:
#   1. About-page official photos (replacing the AI-watermarked factory-*.png)
#      -> public/images/about/<key>.webp
#   2. A partnership overview image for CasesSection
#      -> public/images/cases/partnership.webp
#   3. All product images (public/images/products/<slug>/*.{jpg,jpeg,png})
#      -> <base>.webp, then the original raster is deleted.
#
# Run with the project venv, e.g.:
#   .workbuddy/binaries/python/envs/default/Scripts/python.exe scripts/convert-images.py
# ---------------------------------------------------------------------------
from __future__ import annotations

import sys
from pathlib import Path

try:
    from PIL import Image
except ImportError as exc:  # pragma: no cover
    sys.exit(f"[convert-images] Pillow is required: {exc}")

REPO = Path(__file__).resolve().parent.parent
DST_ABOUT = REPO / "public" / "images" / "about"
DST_CASES = REPO / "public" / "images" / "cases"
DST_PRODUCTS = REPO / "public" / "images" / "products"

# Official source folder on the local machine (per V30 design §10.3).
ABOUT_SRC = Path(
    "C:/Users/Administrator/Desktop/网站建设资料/网站建设资料/网站介绍/公司介绍"
)

WEBP_QUALITY = 82
RASTER_SUFFIXES = {".jpg", ".jpeg", ".png"}

# dst webp base name (no ext) -> source file name inside ABOUT_SRC
ABOUT_MAP = {
    "factory-assembly": "工厂车间图.png",
    "factory-rnd": "公司外观图.png",
    "factory-qc": "工厂车间图.png",
    "factory-warehouse": "公司外观图.png",
    "company-overview": "公司介绍图.png",
    "company-history": "公司历史图.png",
}

# Old watermarked PNGs to remove after conversion.
WATERMARKED_PNG = [
    "factory-assembly.png",
    "factory-rnd.png",
    "factory-qc.png",
    "factory-warehouse.png",
]


def to_webp(src: Path, dst: Path) -> bool:
    """Convert a single raster image to WebP. Returns True on success."""
    if not src.exists():
        print(f"  [skip] source missing: {src}")
        return False
    try:
        with Image.open(src) as img:
            img = img.convert("RGB")
            dst.parent.mkdir(parents=True, exist_ok=True)
            img.save(dst, "WEBP", quality=WEBP_QUALITY, method=4)
        print(f"  [ok]   {dst.relative_to(REPO)}  ({src.stat().st_size // 1024}KB -> {dst.stat().st_size // 1024}KB)")
        return True
    except Exception as exc:  # pragma: no cover
        print(f"  [err]  {src}: {exc}")
        return False


def convert_about() -> None:
    print("[convert-images] about official photos -> .webp")
    DST_ABOUT.mkdir(parents=True, exist_ok=True)
    for key, fname in ABOUT_MAP.items():
        to_webp(ABOUT_SRC / fname, DST_ABOUT / f"{key}.webp")

    # Remove the old watermarked PNGs now that .webp equivalents exist.
    for name in WATERMARKED_PNG:
        p = DST_ABOUT / name
        if p.exists():
            p.unlink()
            print(f"  [del]  {p.relative_to(REPO)} (watermarked original)")


def convert_partnership() -> None:
    print("[convert-images] cases/partnership.webp")
    DST_CASES.mkdir(parents=True, exist_ok=True)
    src = ABOUT_SRC / "合作.jpeg"
    if not src.exists():
        src = ABOUT_SRC / "合作案例.png"
    to_webp(src, DST_CASES / "partnership.webp")


def convert_products() -> None:
    print("[convert-images] product images -> .webp")
    if not DST_PRODUCTS.exists():
        print("  [skip] no public/images/products directory")
        return
    total = 0
    for slug_dir in sorted(p for p in DST_PRODUCTS.iterdir() if p.is_dir()):
        converted = 0
        for f in sorted(slug_dir.iterdir()):
            if f.suffix.lower() in RASTER_SUFFIXES:
                out = slug_dir / f"{f.stem}.webp"
                if to_webp(f, out):
                    f.unlink()  # remove the original raster
                    converted += 1
        if converted:
            total += converted
            print(f"  [dir]  {slug_dir.name}: {converted} image(s) converted")
    print(f"[convert-images] product images converted: {total}")


def main() -> None:
    convert_about()
    convert_partnership()
    convert_products()
    print("[convert-images] done ✓")


if __name__ == "__main__":
    main()
