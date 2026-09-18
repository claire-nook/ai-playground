#!/usr/bin/env python3
"""
Batch-ingest image artifacts from temporary remote URLs.

Design goals:
- One workflow for one or many images.
- Keep binary payloads outside LLM text/context and Git history.
- Validate every item before publishing any output.
- Fail closed: if one item fails, publish none of the batch.
- Never persist source URLs in repository reports.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import re
import shutil
import tempfile
from pathlib import Path
from typing import Any
from urllib.request import Request, urlopen

from PIL import Image


ALLOWED_OUTPUT_PREFIX = Path("experiments/artifact-transport/publisher-output")
ALLOWED_FORMATS = {"JPEG", "PNG", "WEBP"}
REQUEST_ID_RE = re.compile(r"^[A-Za-z0-9._-]+$")


def sha256_bytes(data: bytes) -> str:
    """Return SHA-256 for a byte string."""
    return hashlib.sha256(data).hexdigest()


def download_bytes(url: str, timeout: int) -> bytes:
    """Download bytes without logging or persisting the source URL."""
    request = Request(
        url,
        headers={"User-Agent": "ai-playground-artifact-batch-ingest/1.0"},
    )
    with urlopen(request, timeout=timeout) as response:
        return response.read()


def load_batch(path: Path) -> dict[str, Any]:
    """Load and validate the batch envelope."""
    data = json.loads(path.read_text(encoding="utf-8"))

    if not isinstance(data, dict):
        raise ValueError("Batch payload must be a JSON object")

    request_id = data.get("requestId")
    items = data.get("items")

    if not isinstance(request_id, str) or not REQUEST_ID_RE.fullmatch(request_id):
        raise ValueError("requestId must use only letters, digits, dot, underscore, or hyphen")

    if not isinstance(items, list) or not items:
        raise ValueError("items must be a non-empty list")

    return data


def validate_output_path(raw_path: str) -> Path:
    """Restrict outputs to the experiment-owned publisher directory."""
    output_path = Path(raw_path)

    if output_path.is_absolute() or ".." in output_path.parts:
        raise ValueError(f"Unsafe outputPath: {raw_path}")

    try:
        output_path.relative_to(ALLOWED_OUTPUT_PREFIX)
    except ValueError as exc:
        raise ValueError(
            f"outputPath must stay under {ALLOWED_OUTPUT_PREFIX}: {raw_path}"
        ) from exc

    return output_path


def verify_image(binary: bytes, temp_path: Path) -> dict[str, Any]:
    """Fully decode one image and return non-sensitive image evidence."""
    temp_path.write_bytes(binary)

    with Image.open(temp_path) as image:
        image.load()
        decoded_format = image.format
        decoded_dimensions = list(image.size)
        exif_entries = len(image.getexif())

    if decoded_format not in ALLOWED_FORMATS:
        raise ValueError(f"Unsupported decoded format: {decoded_format}")

    return {
        "decodedFormat": decoded_format,
        "decodedDimensions": decoded_dimensions,
        "exifEntries": exif_entries,
    }


def ingest_batch(batch_path: Path, *, timeout: int) -> dict[str, Any]:
    """Download and validate all items, then publish the whole batch atomically."""
    batch = load_batch(batch_path)
    request_id = batch["requestId"]
    items = batch["items"]

    seen_outputs: set[Path] = set()
    verified_items: list[dict[str, Any]] = []
    staged: list[tuple[Path, Path]] = []

    with tempfile.TemporaryDirectory(prefix="artifact-batch-") as temp_dir_name:
        temp_dir = Path(temp_dir_name)

        for index, item in enumerate(items, start=1):
            if not isinstance(item, dict):
                raise ValueError(f"Item {index} must be a JSON object")

            required = [
                "sourceUrl",
                "expectedBytes",
                "expectedSha256",
                "outputPath",
                "mediaType",
            ]
            missing = [key for key in required if key not in item]
            if missing:
                raise ValueError(f"Item {index} missing fields: {', '.join(missing)}")

            source_url = str(item["sourceUrl"])
            output_path = validate_output_path(str(item["outputPath"]))
            expected_bytes = int(item["expectedBytes"])
            expected_sha256 = str(item["expectedSha256"]).lower()
            media_type = str(item["mediaType"])

            if output_path in seen_outputs:
                raise ValueError(f"Duplicate outputPath in batch: {output_path}")
            seen_outputs.add(output_path)

            binary = download_bytes(source_url, timeout)
            actual_bytes = len(binary)
            actual_sha256 = sha256_bytes(binary)

            if actual_bytes != expected_bytes:
                raise ValueError(
                    f"Item {index} byte mismatch: expected {expected_bytes}, got {actual_bytes}"
                )

            if actual_sha256 != expected_sha256:
                raise ValueError(
                    f"Item {index} SHA-256 mismatch: expected {expected_sha256}, got {actual_sha256}"
                )

            temp_path = temp_dir / f"item-{index:04d}.bin"
            image_evidence = verify_image(binary, temp_path)

            staged.append((temp_path, output_path))
            verified_items.append(
                {
                    "index": index,
                    "outputPath": str(output_path),
                    "mediaType": media_type,
                    "bytes": actual_bytes,
                    "sha256": actual_sha256,
                    **image_evidence,
                    "sourceUrlPersisted": False,
                }
            )

        # Publish only after every item has validated successfully.
        for temp_path, output_path in staged:
            output_path.parent.mkdir(parents=True, exist_ok=True)
            shutil.copyfile(temp_path, output_path)

    report_path = Path(
        f"experiments/artifact-transport/processed/{request_id}/report.json"
    )
    report_path.parent.mkdir(parents=True, exist_ok=True)

    report = {
        "status": "verified",
        "transport": "remote-binary-url-batch",
        "requestId": request_id,
        "itemCount": len(verified_items),
        "atomicPublication": True,
        "items": verified_items,
    }

    report_path.write_text(
        json.dumps(report, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )

    return report


def main() -> int:
    """CLI entry point."""
    parser = argparse.ArgumentParser(
        description="Batch-ingest one or more verified image artifacts from remote URLs."
    )
    parser.add_argument("batch", type=Path, help="JSON batch request file")
    parser.add_argument("--timeout", type=int, default=60)
    args = parser.parse_args()

    try:
        report = ingest_batch(args.batch, timeout=args.timeout)
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
