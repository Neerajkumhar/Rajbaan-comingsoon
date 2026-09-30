"""Derive web assets from the Rajbaan logo. Idempotent; safe to re-run.

The master artwork is white line art on a black ground. Luminance is therefore used
directly as the alpha channel: the ground keys out to fully transparent and the mark
stays black. The ink is never recoloured, only keyed.
"""

from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SOURCE = ROOT / "logo rajbaan.png"
PUBLIC = ROOT / "public"

LOGO_WIDTH = 1200
LOGO_TRIM_THRESHOLD = 8
FAVICON_SIZE = 512
FAVICON_MARGIN = 0.1
INK = (0, 0, 0)


def load_mark():
    """Key the source into an RGBA mark: black ink, luminance-driven alpha.

    Working at the master's native size keeps the antialiased edges intact for the
    trim, and trimming before the resize means no resampling happens against empty
    black padding.
    """
    with Image.open(SOURCE) as source:
        grey = source.convert("L")
        alpha = grey.point(lambda value: 0 if value <= LOGO_TRIM_THRESHOLD else value)
        mark = Image.new("RGBA", grey.size, (*INK, 0))
        mark.putalpha(alpha)
        return mark


def trim_to_ink(mark):
    """Crop away the fully transparent padding baked into the master's black ground.

    Trimmed tight on purpose: the hero card supplies the breathing room, so any inset
    here would only re-pad the mark and skew its aspect ratio.
    """
    box = mark.getchannel("A").getbbox()
    if box is None:
        raise SystemExit(f"no ink found in {SOURCE}")
    return mark.crop(box)


def fit_width(mark, width):
    height = round(mark.height * width / mark.width)
    return mark.resize((width, height), Image.LANCZOS)


def build_logo() -> None:
    mark = fit_width(trim_to_ink(load_mark()), LOGO_WIDTH)
    mark.save(PUBLIC / "logo.png", optimize=True)


def build_favicon() -> None:
    mark = trim_to_ink(load_mark())
    fit = round(FAVICON_SIZE * (1 - 2 * FAVICON_MARGIN))
    scale = fit / mark.width
    resized = mark.resize((fit, round(mark.height * scale)), Image.LANCZOS)
    # Kept on an opaque ground: a transparent black-ink favicon disappears on dark
    # browser chrome, which is the default in several popular browsers.
    canvas = Image.new("RGBA", (FAVICON_SIZE, FAVICON_SIZE), "white")
    canvas.alpha_composite(resized, ((FAVICON_SIZE - fit) // 2, (FAVICON_SIZE - resized.height) // 2))
    opaque = canvas.convert("RGB")
    # Flat line art, so 256 palette entries are effectively unlimited and dithering off
    # keeps the antialiased edges clean rather than noisy.
    opaque.quantize(
        colors=256, method=Image.Quantize.FASTOCTREE, dither=Image.Dither.NONE
    ).save(PUBLIC / "favicon.png", optimize=True)


def main() -> None:
    PUBLIC.mkdir(exist_ok=True)
    build_logo()
    build_favicon()
    for name in ("logo.png", "favicon.png"):
        path = PUBLIC / name
        with Image.open(path) as image:
            print(f"{name}: {image.width}x{image.height} {image.mode} {path.stat().st_size // 1024} KB")


if __name__ == "__main__":
    main()
