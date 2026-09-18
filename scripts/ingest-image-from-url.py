#!/usr/bin/env python3
"""
Download, validate, decode, and publish one image artifact from a remote URL.

Experiment purpose:
- Keep binary payload transport outside LLM text/context.
- Let a normal GitHub Actions runtime fetch the binary directly.
- Verify declared byte length and SHA-256 before writing the repository artifact.
"""

from __future__ import annotations

import argparse
import hashlib
import json
from pathlib import Path
from urllib.request import Request, urlopen

from PIL import Image


def sha256_bytes(data: bytes) -> str:
    """Return SHA-256 for a byte string."""
    return hashlib.sha256(data).hexdigest()


def download_bytes(url: str, timeout: int) -> bytes:
    """Download bytes without logging the source URL."""
    request = Request(
        url,
        headers={"User-Agent": "ai-playground-artifact-remote-ingest/1.0"},
    )
    with urlopen(request, timeout=timeout) as response:
        return response.read()


def ingest(
    *,
    source_url: str,
    destination: Path,
    expected_bytes: int,
    expected_sha256: str,
    report_path: Path | None,
    timeout: int,
) -> dict[str, object]:
    """Fetch, validate, write, fully decode, and report an image artifact."""
    binary = download_bytes(source_url, timeout)

    actual_bytes = len(binary)
    actual_sha256 = sha256_bytes(binary)

    if actual_bytes != expected_bytes:
        raise ValueError(
            f"Byte length mismatch: expected {expected_bytes}, got {actual_bytes}"
        )

    if actual_sha256.lower() != expected_sha256.lower():
        raise ValueError(
            f"SHA-256 mismatch: expected {expected_sha256}, got {actual_sha256}"
        )

    destination.parent.mkdir(parents=True, exist_ok=True)
    destination.write_bytes(binary)

    with Image.open(destination) as image:
        image.load()
        decoded_format = image.format
        decoded_dimensions = list(image.size)
        exif_entries = len(image.getexif())

    report: dict[str, object] = {
        "status": "verified",
        "transport": "remote-binary-url",
        "outputPath": str(destination),
        "bytes": actual_bytes,
        "sha256": actual_sha256,
        "decodedFormat": decoded_format,
        "decodedDimensions": decoded_dimensions,
        "exifEntries": exif_entries,
        "sourceUrlPersisted": False,
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
        description="Fetch and verify an image artifact from a remote URL."
    )
    parser.add_argument("--source-url", required=True)
    parser.add_argument("--destination", type=Path, required=True)
    parser.add_argument("--expected-bytes", type=int, required=True)
    parser.add_argument("--expected-sha256", required=True)
    parser.add_argument("--report", type=Path)
    parser.add_argument("--timeout", type=int, default=60)
    args = parser.parse_args()

    try:
        report = ingest(
            source_url=args.source_url,
            destination=args.destination,
            expected_bytes=args.expected_bytes,
            expected_sha256=args.expected_sha256,
            report_path=args.report,
            timeout=args.timeout,
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
