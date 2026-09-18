#!/usr/bin/env python3
"""Reusable Markdown -> human-facing PDF renderer.

Design goals:
- reuse the forest-style visual language from the Textastic customization;
- render fenced code with Pygments without relying on a browser CDN;
- support an intentionally small Mermaid flowchart subset through Graphviz;
- preserve a graceful fallback when a Mermaid block is outside the supported subset;
- support <!-- pagebreak --> as an opt-in print break;
- never require the source Markdown to be rewritten just for PDF output.
"""

from __future__ import annotations

import argparse
import html
import re
import subprocess
from pathlib import Path

import mistune
from pygments import highlight
from pygments.formatters import HtmlFormatter
from pygments.lexers import TextLexer, get_lexer_by_name
from pygments.util import ClassNotFound
from weasyprint import HTML


FOREST_CSS = r"""
@page { size: A4; margin: 18mm 17mm 20mm; }
:root {
  --bg:#efede8; --panel:#f7f9f7; --line:#c7d4cc; --text:#2f3a35;
  --muted:#5c6b63; --link:#3f6a55; --accent:#557f6e; --bq-bg:#f0f5f2;
  --table-head:#c9d7d2; --code-bg:#2b3330; --code-fg:#dfe5e0;
}
html, body { margin:0; padding:0; color:var(--text); background:white; }
body {
  font-family:"Noto Sans CJK TC","Noto Sans TC","PingFang TC","Microsoft JhengHei",sans-serif;
  font-size:10.5pt; line-height:1.72;
}
h1,h2,h3,h4 { line-height:1.3; page-break-after:avoid; }
h1 { font-size:24pt; margin:0 0 10mm; letter-spacing:.02em; }
h2 { font-size:16pt; color:#3e584e; margin:9mm 0 3mm; padding-bottom:2mm; border-bottom:1px solid #e0e5e2; }
h3 { font-size:13pt; margin:6mm 0 2mm; }
p { margin:2.2mm 0; }
a { color:var(--link); text-decoration:none; }
blockquote { margin:4mm 0; padding:3mm 4mm; border-left:4px solid #b9c8c0; background:var(--bq-bg); color:#4f6258; }
ul,ol { margin:2mm 0 4mm; padding-left:7mm; }
hr { border:0; border-top:1px solid #e1e5e3; margin:7mm 0; }
img { max-width:100%; max-height:210mm; display:block; margin:5mm auto; object-fit:contain; }
.missing-image { border:1px dashed #aebcb4; background:#f8faf8; color:#627168; padding:5mm; margin:5mm 0; border-radius:6px; }
.missing-image strong { color:#45584e; }
table { width:100%; border-collapse:collapse; margin:5mm 0; font-size:9.5pt; }
th { background:var(--table-head); }
th,td { border:1px solid #bdc9c2; padding:2.2mm 2.5mm; vertical-align:top; }
pre { background:var(--code-bg); color:var(--code-fg); border:1px solid #1e2422; border-radius:7px; padding:4mm; overflow-wrap:anywhere; white-space:pre-wrap; margin:4mm 0; font-size:8.8pt; line-height:1.5; }
code { font-family:"Noto Sans Mono CJK TC","SFMono-Regular",Consolas,monospace; }
:not(pre) > code { background:#f0ebe5; color:#3f4a45; padding:.3mm 1mm; border-radius:3px; }
.codehilite { break-inside:avoid; }
.codehilite .k, .codehilite .kc, .codehilite .kd, .codehilite .kn, .codehilite .kp, .codehilite .kr, .codehilite .kt { color:#9fe0b6; font-weight:700; }
.codehilite .s, .codehilite .s1, .codehilite .s2 { color:#f2cf72; }
.codehilite .mi, .codehilite .mf { color:#f0aa72; }
.codehilite .c, .codehilite .c1, .codehilite .cm { color:#9aa9a2; font-style:italic; }
.codehilite .nb, .codehilite .nc, .codehilite .nt { color:#79d3c2; }
.codehilite .nf { color:#9fc6e5; }
.page-break { break-before:page; page-break-before:always; height:0; }
.mermaid-render { margin:5mm 0; padding:3mm; border:1px solid #d6dfda; border-radius:7px; background:#fbfcfb; break-inside:avoid; }
.mermaid-render svg { width:100%; height:auto; max-height:145mm; }
.mermaid-fallback { border:1px dashed #c4cec8; background:#f7faf8; padding:3mm; border-radius:7px; }
.render-note { color:#6b756f; font-size:8.5pt; margin-bottom:2mm; }
"""


class PDFRenderer(mistune.HTMLRenderer):
    """HTML renderer with deterministic fenced-code and image behavior."""

    def __init__(self, source_dir: Path):
        super().__init__(escape=False)
        self.source_dir = source_dir

    def block_code(self, code: str, info: str | None = None) -> str:
        language = (info or "").strip().split()[0].lower() if info else ""
        if language == "mermaid":
            svg = render_mermaid_subset(code)
            if svg:
                return f'<div class="mermaid-render">{svg}</div>'
            escaped = html.escape(code)
            return (
                '<div class="mermaid-fallback">'
                '<div class="render-note">Mermaid source preserved: unsupported by the local subset renderer.</div>'
                f'<pre><code>{escaped}</code></pre></div>'
            )

        try:
            lexer = get_lexer_by_name(language) if language else TextLexer()
        except ClassNotFound:
            lexer = TextLexer()
        return highlight(code, lexer, HtmlFormatter(cssclass="codehilite", nowrap=False))

    def image(self, text: str, url: str, title: str | None = None) -> str:
        """Resolve local images; preserve a visible placeholder if bytes are unavailable."""
        candidate = (self.source_dir / url).resolve()
        if candidate.exists() and candidate.is_file():
            safe = candidate.as_uri()
            alt = html.escape(text or "")
            return f'<img src="{safe}" alt="{alt}">'

        return (
            '<div class="missing-image">'
            '<strong>Referenced image not materialized in the current renderer workspace.</strong><br>'
            f'{html.escape(text or url)}<br><code>{html.escape(url)}</code>'
            '</div>'
        )


def render_mermaid_subset(source: str) -> str | None:
    """Render a deliberately bounded Mermaid flowchart subset with Graphviz.

    Supported input:
      flowchart TD|LR
      A[Label] --> B[Label]
      A --> B

    This is not a full Mermaid implementation. Unsupported constructs fall back to
    source display instead of silently producing a misleading diagram.
    """
    lines = [line.strip() for line in source.splitlines() if line.strip()]
    if not lines or not re.match(r"^(flowchart|graph)\s+(TD|TB|LR|RL)$", lines[0], re.I):
        return None
    direction = lines[0].split()[1].upper()
    rankdir = "LR" if direction in {"LR", "RL"} else "TB"
    reverse = direction in {"RL"}

    node_labels: dict[str, str] = {}
    edges: list[tuple[str, str]] = []
    node_pat = r"([A-Za-z0-9_]+)(?:\[([^\]]+)\])?"
    edge_re = re.compile(rf"^{node_pat}\s*--?>\s*{node_pat}$")

    for line in lines[1:]:
        match = edge_re.match(line)
        if not match:
            return None
        a, a_label, b, b_label = match.groups()
        node_labels[a] = a_label or node_labels.get(a, a)
        node_labels[b] = b_label or node_labels.get(b, b)
        edges.append((b, a) if reverse else (a, b))

    if not edges:
        return None

    dot_lines = [
        "digraph G {",
        f"rankdir={rankdir};",
        'graph [bgcolor="transparent", pad="0.25", nodesep="0.45", ranksep="0.55"];',
        'node [shape=box, style="rounded,filled", fillcolor="#f0f5f2", color="#8ba698", fontcolor="#2f3a35", fontname="Noto Sans CJK TC"];',
        'edge [color="#557f6e", penwidth=1.4, arrowsize=0.8];',
    ]
    for node_id, label in node_labels.items():
        safe_label = label.replace('"', '\\"')
        dot_lines.append(f'{node_id} [label="{safe_label}"];')
    for a, b in edges:
        dot_lines.append(f"{a} -> {b};")
    dot_lines.append("}")

    try:
        proc = subprocess.run(
            ["dot", "-Tsvg"],
            input="\n".join(dot_lines).encode("utf-8"),
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            check=True,
        )
    except (subprocess.CalledProcessError, FileNotFoundError):
        return None

    svg = proc.stdout.decode("utf-8", errors="replace")
    svg = re.sub(r"<\?xml[^>]*>\s*", "", svg)
    svg = re.sub(r"<!DOCTYPE[^>]*>\s*", "", svg)
    return svg


def preprocess_markdown(text: str) -> str:
    """Convert the authoring contract's manual page-break marker to printable HTML."""
    return re.sub(
        r"<!--\s*pagebreak\s*-->",
        '<div class="page-break" aria-hidden="true"></div>',
        text,
        flags=re.I,
    )


def build_html(markdown_text: str, source_dir: Path, title: str) -> str:
    renderer = PDFRenderer(source_dir)
    markdown = mistune.create_markdown(
        renderer=renderer,
        plugins=["table", "strikethrough", "task_lists", "url"],
    )
    body = markdown(preprocess_markdown(markdown_text))
    return f"""<!doctype html>
<html lang="zh-Hant">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{html.escape(title)}</title>
<style>{FOREST_CSS}</style>
</head>
<body>{body}</body>
</html>"""


def main() -> int:
    parser = argparse.ArgumentParser(description="Render Markdown into a human-facing PDF.")
    parser.add_argument("input", type=Path)
    parser.add_argument("-o", "--output", required=True, type=Path)
    parser.add_argument("--html-output", type=Path, help="Optional debug HTML snapshot.")
    args = parser.parse_args()

    source = args.input.resolve()
    output = args.output.resolve()
    text = source.read_text(encoding="utf-8")
    first_heading = next((line[2:].strip() for line in text.splitlines() if line.startswith("# ")), source.stem)
    rendered_html = build_html(text, source.parent, first_heading)

    output.parent.mkdir(parents=True, exist_ok=True)
    if args.html_output:
        args.html_output.parent.mkdir(parents=True, exist_ok=True)
        args.html_output.write_text(rendered_html, encoding="utf-8")

    HTML(string=rendered_html, base_url=str(source.parent)).write_pdf(str(output))
    if not output.exists() or output.stat().st_size == 0:
        raise RuntimeError("PDF output was not created")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
