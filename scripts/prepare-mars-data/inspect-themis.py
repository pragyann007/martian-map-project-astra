#!/usr/bin/env python3
"""
Inspect THEMIS source GeoTIFF and cropped AOI using GDAL.
"""
from pathlib import Path
import subprocess
import sys

def inspect_file(path: Path) -> None:
    if not path.exists():
        print(f"File not found: {path}")
        return
    print(f"\n--- Inspecting {path} ---")
    res = subprocess.run(["gdalinfo", "-stats", str(path)], capture_output=True, text=True)
    if res.returncode != 0:
        print(f"Error inspecting {path}:\n{res.stderr}")
    else:
        print(res.stdout)

def main() -> None:
    base = Path(__file__).resolve().parent.parent.parent
    geo_tif = base / "public_data" / "processed" / "themis-day" / "themis-day-georef.tif"
    crop_tif = base / "public_data" / "processed" / "themis-day" / "jezero" / "themis-day-jezero.tif"

    if crop_tif.exists():
        inspect_file(crop_tif)
    elif geo_tif.exists():
        inspect_file(geo_tif)
    else:
        print("No THEMIS GeoTIFF files found in public_data/processed/themis-day/")

if __name__ == "__main__":
    main()
