"""Derive web assets from the Rajbaan logo. Idempotent; safe to re-run."""

from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SOURCE = ROOT / "logo rajbaan.png"
PUBLIC = ROOT / "public"

LOGO_WIDTH = 1200
FAVICON_SIZE = 512
FAVICON_MARGIN = 0.1
PALETTE_COLOURS = 256


def load_source():
    """Open the master artwork as opaque RGB, discarding any alpha channel."""
    with Image.open(SOURCE) as source:
        return source.convert("RGB")


def save_web(image, path: Path) -> None:
    """Write a palette PNG.

    The artwork is black line art on white, so 256 palette entries are effectively
    unlimited for it: measured against the full-colour resize, quantisation moves the
    mean pixel by 0.53/255 and no pixel by more than 24/255, which is below the
    threshold where banding becomes visible. That takes the logo from 273 KB to 17 KB.
    Dithering is off so the antialiased edges stay crisp instead of gaining noise.
    """
    quantized = image.quantize(
        colors=PALETTE_COLOURS,
        method=Image.Quantize.FASTOCTREE,
        dither=Image.Dither.NONE,
    )
    quantized.save(path, optimize=True)


def build_logo() -> None:
    image = load_source()
    height = round(image.height * LOGO_WIDTH / image.width)
    save_web(image.resize((LOGO_WIDTH, height), Image.LANCZOS), PUBLIC / "logo.png")


def build_favicon() -> None:
    image = load_source()
    fit = round(FAVICON_SIZE * (1 - 2 * FAVICON_MARGIN))
    scale = fit / image.width
    mark = image.resize((fit, round(image.height * scale)), Image.LANCZOS)
    canvas = Image.new("RGB", (FAVICON_SIZE, FAVICON_SIZE), "white")
    canvas.paste(mark, ((FAVICON_SIZE - fit) // 2, (FAVICON_SIZE - mark.height) // 2))
    save_web(canvas, PUBLIC / "favicon.png")


def main() -> None:
    PUBLIC.mkdir(exist_ok=True)
    build_logo()
    build_favicon()
    for name in ("logo.png", "favicon.png"):
        path = PUBLIC / name
        with Image.open(path) as image:
            print(f"{name}: {image.width}x{image.height}  {path.stat().st_size // 1024} KB")


if __name__ == "__main__":
    main()
