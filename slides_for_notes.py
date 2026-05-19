#!/usr/bin/env python3
# /// script
# requires-python = ">=3.10"
# dependencies = [
#     "pypdf>=4.0",
#     "reportlab>=4.0",
# ]
# ///
"""Extend each page of a slide PDF to the right to make room for notes."""

import argparse
import io
import sys
from pathlib import Path

from pypdf import PdfReader, PdfWriter, PageObject, Transformation


LINE_SPACING_MM = 13.0
MM_TO_PT = 72 / 25.4
LINE_COLOR = (0.722, 0.722, 0.722)  # #B8B8B8
LINE_WIDTH_PT = 0.3

# Letter portrait layout for 3-up handout mode
LETTER_W = 612.0
LETTER_H = 792.0
MARGIN = 36.0
GUTTER = 18.0


def build_lines_overlay(width: float, height: float) -> PageObject:
    from reportlab.pdfgen import canvas

    buf = io.BytesIO()
    c = canvas.Canvas(buf, pagesize=(width, height))
    c.setStrokeColorRGB(*LINE_COLOR)
    c.setLineWidth(LINE_WIDTH_PT)

    spacing = LINE_SPACING_MM * MM_TO_PT
    y = height - spacing
    while y > 0:
        c.line(0, y, width, y)
        y -= spacing
    c.save()
    buf.seek(0)
    return PdfReader(buf).pages[0]


def extend_page(page: PageObject, ratio: float, overlay_cache: dict) -> PageObject:
    box = page.mediabox
    slide_w = float(box.width)
    slide_h = float(box.height)
    notes_w = slide_w * ratio
    new_w = slide_w + notes_w

    new_page = PageObject.create_blank_page(width=new_w, height=slide_h)

    if overlay_cache.get("enabled"):
        key = (round(notes_w, 3), round(slide_h, 3))
        overlay = overlay_cache.get(key)
        if overlay is None:
            overlay = build_lines_overlay(notes_w, slide_h)
            overlay_cache[key] = overlay
        new_page.merge_translated_page(overlay, tx=slide_w, ty=0)

    new_page.merge_page(page)
    return new_page


def build_one_big_page(
    pages: list[PageObject], ratio: float, overlay_cache: dict
) -> PageObject:
    """Stack every slide vertically on a single page, with notes on the right of each."""
    slide_w = float(pages[0].mediabox.width)
    slide_h = float(pages[0].mediabox.height)
    notes_w = slide_w * ratio
    new_w = slide_w + notes_w
    n = len(pages)
    new_page = PageObject.create_blank_page(width=new_w, height=slide_h * n)

    if overlay_cache.get("enabled"):
        key = (round(notes_w, 3), round(slide_h, 3))
        overlay = overlay_cache.get(key)
        if overlay is None:
            overlay = build_lines_overlay(notes_w, slide_h)
            overlay_cache[key] = overlay
    else:
        overlay = None

    for i, slide in enumerate(pages):
        y_bottom = slide_h * (n - 1 - i)
        new_page.merge_translated_page(slide, tx=0, ty=y_bottom)
        if overlay is not None:
            new_page.merge_translated_page(overlay, tx=slide_w, ty=y_bottom)

    return new_page


def build_3up_page(
    slides: list[PageObject], ratio: float, overlay_cache: dict
) -> PageObject:
    """Lay 1-3 slides on a Letter portrait page: slide left, notes right, per row."""
    new_page = PageObject.create_blank_page(width=LETTER_W, height=LETTER_H)

    usable_w = LETTER_W - 2 * MARGIN
    usable_h = LETTER_H - 2 * MARGIN
    slide_col_w = (usable_w - GUTTER) / (1 + ratio)
    notes_col_w = (usable_w - GUTTER) - slide_col_w
    row_h = (usable_h - 2 * GUTTER) / 3
    slide_col_x = MARGIN
    notes_col_x = MARGIN + slide_col_w + GUTTER

    for i, slide in enumerate(slides):
        y_bottom = MARGIN + (2 - i) * (row_h + GUTTER)

        W = float(slide.mediabox.width)
        H = float(slide.mediabox.height)
        scale = min(slide_col_w / W, row_h / H)
        new_w = W * scale
        new_h = H * scale
        tx = slide_col_x + (slide_col_w - new_w) / 2
        ty = y_bottom + (row_h - new_h) / 2

        op = Transformation().scale(scale).translate(tx, ty)
        new_page.merge_transformed_page(slide, op)

        if overlay_cache.get("enabled"):
            key = (round(notes_col_w, 3), round(row_h, 3))
            overlay = overlay_cache.get(key)
            if overlay is None:
                overlay = build_lines_overlay(notes_col_w, row_h)
                overlay_cache[key] = overlay
            new_page.merge_translated_page(overlay, tx=notes_col_x, ty=y_bottom)

    return new_page


def main(argv=None) -> int:
    parser = argparse.ArgumentParser(
        description="Extend each page of a slide PDF to the right for notes.",
    )
    parser.add_argument("input", type=Path, help="Input PDF")
    parser.add_argument(
        "--ratio",
        type=float,
        default=1.0,
        help="Notes-area width as a fraction of slide width (default: 1.0)",
    )
    parser.add_argument(
        "--lines",
        action="store_true",
        help="Draw ruled lines on the notes area",
    )
    parser.add_argument(
        "--per-page",
        default="1",
        help="Slides per output page: 1 (extend right), 3 (Letter handout), or 'all' (one tall page). Default: 1",
    )
    parser.add_argument(
        "-o", "--output", type=Path, default=None, help="Output PDF path"
    )
    parser.add_argument(
        "--force", action="store_true", help="Overwrite existing output"
    )
    args = parser.parse_args(argv)

    if not args.input.is_file():
        parser.error(f"Input not found: {args.input}")
    if args.ratio <= 0:
        parser.error(f"--ratio must be positive (got {args.ratio})")

    output = args.output or args.input.with_name(f"{args.input.stem}-notes.pdf")
    if output.exists() and not args.force:
        parser.error(f"Output already exists (use --force): {output}")

    reader = PdfReader(str(args.input))
    writer = PdfWriter()
    overlay_cache = {"enabled": args.lines}

    pages = list(reader.pages)
    mode = args.per_page.lower()
    if mode == "1":
        for page in pages:
            writer.add_page(extend_page(page, args.ratio, overlay_cache))
    elif mode == "3":
        for start in range(0, len(pages), 3):
            writer.add_page(
                build_3up_page(pages[start : start + 3], args.ratio, overlay_cache)
            )
    elif mode == "all":
        writer.add_page(build_one_big_page(pages, args.ratio, overlay_cache))
    else:
        parser.error(f"--per-page must be 1, 3, or 'all' (got {args.per_page!r})")

    with output.open("wb") as f:
        writer.write(f)

    print(
        f"Wrote {output} ({len(pages)} input slides → {len(writer.pages)} output pages)"
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
