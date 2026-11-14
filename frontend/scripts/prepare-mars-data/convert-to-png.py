#!/usr/bin/env python3
"""
Convert cropped GeoTIFF to browser-ready RGBA PNG with transparency for no-data (0) pixels.
"""
from pathlib import Path
import numpy as np
from PIL import Image

def find_paths() -> tuple[Path, Path]:
    # Check if run from frontend or root
    cwd = Path.cwd()
    if (cwd / "public_data").exists():
        source = cwd / "public_data" / "processed" / "themis-day" / "jezero" / "themis-day-jezero.tif"
        output = cwd / "public" / "data" / "mars" / "jezero" / "themis-day" / "themis-day.png"
    elif (cwd / "frontend" / "public_data").exists():
        source = cwd / "frontend" / "public_data" / "processed" / "themis-day" / "jezero" / "themis-day-jezero.tif"
        output = cwd / "frontend" / "public" / "data" / "mars" / "jezero" / "themis-day" / "themis-day.png"
    else:
        # Fallback to script location relative
        base = Path(__file__).resolve().parent.parent.parent
        source = base / "public_data" / "processed" / "themis-day" / "jezero" / "themis-day-jezero.tif"
        output = base / "public" / "data" / "mars" / "jezero" / "themis-day" / "themis-day.png"
    return source, output

def main() -> None:
    source, output = find_paths()
    if not source.exists():
        raise FileNotFoundError(f"Source raster not found: {source}")

    output.parent.mkdir(parents=True, exist_ok=True)

    # Read the raster as an 8-bit grayscale image.
    with Image.open(source) as image:
        grayscale = np.asarray(image.convert("L"), dtype=np.uint8)

    if grayscale.ndim != 2:
        raise ValueError("Expected a single-band grayscale raster")

    # Repeat grayscale values across RGB channels and add alpha.
    rgba = np.empty((*grayscale.shape, 4), dtype=np.uint8)
    rgba[:, :, 0] = grayscale
    rgba[:, :, 1] = grayscale
    rgba[:, :, 2] = grayscale

    # The ASU product documents zero-valued black gaps as missing data.
    rgba[:, :, 3] = np.where(grayscale == 0, 0, 255)

    Image.fromarray(rgba, mode="RGBA").save(
        output,
        format="PNG",
        optimize=True,
    )

    print(f"Output: {output}")
    print(f"Dimensions: {grayscale.shape[1]} x {grayscale.shape[0]}")
    print(f"File size: {output.stat().st_size / 1024:.1f} KB")

if __name__ == "__main__":
    main()
