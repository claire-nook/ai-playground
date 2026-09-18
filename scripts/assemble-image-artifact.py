#!/usr/bin/env python3
"""
Reassemble a repository image artifact from UTF-8 Base64 chunks.

This exists because the agent-facing GitHub connector is reliable for UTF-8 text,
while direct binary blob publication has shown reliability problems. The script
validates declared byte length and SHA-256 before writing the image, then fully
decodes the produced image with Pillow.
"""

from __future__ import annotations

import argparse
import base64
import hashlib
import json
from pathlib import Path
from typing import Any

from PIL import Image


def sha256_bytes(data: bytes) -> str:
    """Return a SHA-256 digest for bytes."""
    return hashlib.sha256(data).hexdigest()


def load_manifest(path: Path) -> dict[str, Any]:
    """Load and minimally validate an ingest manifest."""
    data = json.loads(path.read_text(encoding="utf-8"))
    required = [
        "encoding",
        "expectedBytes",
        "expectedSha256",
        "chunks",
        "outputPath",
        "mediaType",
    ]
    missing = [key for key in required if key not in data]
    if missing:
        raise ValueError(f"Manifest missing fields: {', '.join(missing)}")
    if data["encoding"] != "base64-chunks":
        raise ValueError(f"Unsupported encoding: {data['encoding']}")
    if not isinstance(data["chunks"], list) or not data["chunks"]:
        raise ValueError("Manifest chunks must be a non-empty list")
    return data


def assemble(manifest_path: Path, report_path: Path | None = None) -> dict[str, Any]:
    """Reassemble, verify, write, and decode one artifact."""
    manifest = load_manifest(manifest_path)
    request_dir = manifest_path.parent

    parts: list[str] = []
    for chunk_name in manifest["chunks"]:
        chunk_path = request_dir / chunk_name
        if not chunk_path.is_file():
            raise FileNotFoundError(f"Missing Base64 chunk: {chunk_path}")
        parts.append("".join(chunk_path.read_text(encoding="utf-8").split()))

    joined = "".join(parts)

    try:
        binary = base64.b64decode(joined, validate=True)
    except Exception as exc:
        raise ValueError(f"Base64 decode failed: {exc}") from exc

    actual_bytes = len(binary)
    actual_sha256 = sha256_bytes(binary)

    if actual_bytes != int(manifest["expectedBytes"]):
        raise ValueError(
            f"Byte length mismatch: expected {manifest['expectedBytes']}, got {actual_bytes}"
        )

    if actual_sha256.lower() != str(manifest["expectedSha256"]).lower():
        raise ValueError(
            f"SHA-256 mismatch: expected {manifest['expectedSha256']}, got {actual_sha256}"
        )

    output_path = Path(manifest["outputPath"])
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_bytes(binary)

    # A successful byte write is not enough. Force a complete image decode.
    with Image.open(output_path) as image:
        image.load()
        decoded_format = image.format
        decoded_dimensions = list(image.size)
        exif_entries = len(image.getexif())

    report = {
        "status": "verified",
        "transport": "utf8-base64-chunks",
        "manifest": str(manifest_path),
        "outputPath": str(output_path),
        "mediaType": manifest["mediaType"],
        "chunks": len(manifest["chunks"]),
        "base64Characters": len(joined),
        "bytes": actual_bytes,
        "sha256": actual_sha256,
        "decodedFormat": decoded_format,
        "decodedDimensions": decoded_dimensions,
        "exifEntries": exif_entries,
    }

    if report_path is not None:
        report_path.parent.mkdir(parents=True, exist_ok=True)
        report_path.write_text(
            json.dumps(report, ensure_ascii=False, indent=2) + "\n",
            encoding="utf-8",
        )

    return report


def main() -> int:
    """CLI entry point."""
    parser = argparse.ArgumentParser(
        description="Reassemble and verify an image artifact from Base64 text chunks."
    )
    parser.add_argument("manifest", type=Path, help="Path to manifest.json")
    parser.add_argument("--report", type=Path, help="Optional JSON report output path")
    args = parser.parse_args()

    try:
        report = assemble(args.manifest, args.report)
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
