# slides-for-notes

Extend each page of a slide PDF to the right, leaving blank space for handwritten notes.

## Usage

```sh
uv run slides_for_notes.py deck.pdf                  # writes deck-notes.pdf
uv run slides_for_notes.py deck.pdf --lines          # with college-ruled lines
uv run slides_for_notes.py deck.pdf --ratio 0.5      # half-width notes column
uv run slides_for_notes.py deck.pdf -o out.pdf --force
```

`uv` reads the inline PEP 723 metadata and installs `pypdf` + `reportlab` on first run.

## Flags

- `--ratio FLOAT` — notes width as a fraction of the slide width (default `1.0`, page doubles)
- `--lines` — draw faint college-ruled horizontal lines (7.1 mm spacing) on the notes area
- `-o PATH` — output path (default: `<input-stem>-notes.pdf` next to the input)
- `--force` — overwrite an existing output file
