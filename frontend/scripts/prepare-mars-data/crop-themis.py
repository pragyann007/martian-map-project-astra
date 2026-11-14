#!/usr/bin/env python3
"""
Crop Jezero Crater AOI from the global/tile THEMIS GeoTIFF.
"""
from pathlib import Path
import subprocess
import sys

def main() -> None:
    base = Path(__file__).resolve().parent.parent.parent
    source = base / "public_data" / "processed" / "themis-day" / "themis-day-georef.tif"
    output_dir = base / "public_data" / "processed" / "themis-day" / "jezero"
    output = output_dir / "themis-day-jezero.tif"

    if not source.exists():
        print(f"Error: Source GeoTIFF not found: {source}")
        sys.exit(1)

    output_dir.mkdir(parents=True, exist_ok=True)

    cmd = [
        "gdal_translate",
        "-of", "GTiff",
        "-projwin", "76.5", "19.5", "78.5", "17.5",
        "-a_nodata", "0",
        str(source),
        str(output)
    ]
    print(f"Running: {' '.join(cmd)}")
    res = subprocess.run(cmd, check=True)
    print("Crop complete.")

if __name__ == "__main__":
    main()
