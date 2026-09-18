#!/usr/bin/env python3
"""
Process an image artifact into a repository-ready output.

Primary use:
- Conversation/local image -> deterministic cleaned image
- Validate the output before any GitHub binary transport step
- Produce size/hash/dimension evidence so a later publisher can verify round-trip integrity

The script intentionally does not upload anything. Publication is a separate concern.
"""

from __future__ import annotations

import argparse
import hashlib
import json
from pathlib import Path
from typing import Any

from PIL import Image, ImageOps


SUPPORTED_OUTPUT_FORMATS = {
    "jpeg": ("JPEG", ".jpg"),
    "jpg": ("JPEG", ".jpg"),
    "png": ("PNG", ".png"),
    "webp": ("WEBP", ".webp"),
}


def sha256_file(path: Path) -> str:
    """Return the SHA-256 digest for a file."""
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def normalized_output_format(value: str) -> tuple[str, str]:
    """Map CLI format aliases to Pillow format name and preferred extension."""
    key = value.lower()
    if key not in SUPPORTED_OUTPUT_FORMATS:
        raise ValueError(f"Unsupported output format: {value}")
    return SUPPORTED_OUTPUT_FORMATS[key]


def process_image(
    source: Path,
    destination: Path,
    *,
    max_dimension: int,
    output_format: str,
    quality: int,
) -> dict[str, Any]:
    """Decode, orient, resize, re-encode, strip metadata, and verify an image."""
    if not source.exists() or not source.is_file():
        raise FileNotFoundError(f"Source image not found: {source}")

    pillow_format, _ = normalized_output_format(output_format)
    destination.parent.mkdir(parents=True, exist_ok=True)

    source_size = source.stat().st_size
    source_hash = sha256_file(source)

    with Image.open(source) as original:
        original.load()

        source_format = original.format
        source_dimensions = list(original.size)
        source_exif_entries = len(original.getexif())

        # Normalize EXIF orientation before discarding metadata.
        image = ImageOps.exif_transpose(original)

        if image.mode not in ("RGB", "RGBA"):
            image = image.convert("RGBA" if "A" in image.getbands() else "RGB")

        width, height = image.size
        longest = max(width, height)

        if max_dimension > 0 and longest > max_dimension:
            scale = max_dimension / longest
            resized = (
                max(1, round(width * scale)),
                max(1, round(height * scale)),
            )
            image = image.resize(resized, Image.Resampling.LANCZOS)

        save_kwargs: dict[str, Any] = {}

        if pillow_format == "JPEG":
            # JPEG cannot preserve alpha. Flatten RGBA onto white if necessary.
            if image.mode == "RGBA":
                background = Image.new("RGB", image.size, "white")
                background.paste(image, mask=image.getchannel("A"))
                image = background
            elif image.mode != "RGB":
                image = image.convert("RGB")

            save_kwargs.update(
                quality=quality,
                optimize=True,
                progressive=False,
                exif=b"",
            )

        elif pillow_format == "PNG":
            save_kwargs.update(optimize=True)

        elif pillow_format == "WEBP":
            save_kwargs.update(quality=quality, method=6, exif=b"")

        image.save(destination, format=pillow_format, **save_kwargs)

    # Reopen the produced file. A successful write is not sufficient evidence.
    with Image.open(destination) as verified:
        verified.load()
        output_dimensions = list(verified.size)
        output_format_actual = verified.format
        output_exif_entries = len(verified.getexif())

    output_size = destination.stat().st_size
    output_hash = sha256_file(destination)

    return {
        "status": "verified",
        "source": {
            "path": str(source),
            "bytes": source_size,
            "sha256": source_hash,
            "format": source_format,
            "dimensions": source_dimensions,
            "exifEntries": source_exif_entries,
        },
        "output": {
            "path": str(destination),
            "bytes": output_size,
            "sha256": output_hash,
            "format": output_format_actual,
            "dimensions": output_dimensions,
            "exifEntries": output_exif_entries,
        },
        "settings": {
            "maxDimension": max_dimension,
            "outputFormat": pillow_format,
            "quality": quality,
            "stripMetadata": True,
            "autoOrient": True,
            "decodeVerification": True,
        },
    }


def build_parser() -> argparse.ArgumentParser:
    """Build the command-line interface."""
    parser = argparse.ArgumentParser(
        description="Create and verify a repository-ready image artifact."
    )
    parser.add_argument("source", type=Path, help="Source image path.")
    parser.add_argument("destination", type=Path, help="Output image path.")
    parser.add_argument(
        "--max-dimension",
        type=int,
        default=1600,
        help="Maximum width or height in pixels. Use 0 to keep original dimensions.",
    )
    parser.add_argument(
        "--format",
        default="jpeg",
        choices=sorted(SUPPORTED_OUTPUT_FORMATS),
        help="Output image format.",
    )
    parser.add_argument(
        "--quality",
        type=int,
        default=82,
        help="JPEG/WebP quality from 1 to 100.",
    )
    return parser


def main() -> int:
    """CLI entry point."""
    parser = build_parser()
    args = parser.parse_args()

    if args.max_dimension < 0:
        parser.error("--max-dimension must be 0 or greater")
    if not 1 <= args.quality <= 100:
        parser.error("--quality must be between 1 and 100")

    try:
        report = process_image(
            args.source,
            args.destination,
            max_dimension=args.max_dimension,
            output_format=args.format,
            quality=args.quality,
        )
    except Exception as exc:
        print(
            json.dumps(
                {
                    "status": "failed",
                    "error": type(exc).__name__,
                    "detail": str(exc),
                },
                ensure_ascii=False,
                indent=2,
            )
        )
        return 1

    print(json.dumps(report, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
