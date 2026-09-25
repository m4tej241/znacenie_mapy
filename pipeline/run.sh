#!/usr/bin/env bash
# Stiahne OSM dáta pre SK + CZ, rozdelí trasy na úseky a vygeneruje trails.pmtiles.
set -euo pipefail
cd "$(dirname "$0")"

mkdir -p data
for c in slovakia czech-republic; do
  curl -sSfL -o "data/$c-latest.osm.pbf" "https://download.geofabrik.de/europe/$c-latest.osm.pbf"
done

.venv/bin/python segment.py data/slovakia-latest.osm.pbf data/czech-republic-latest.osm.pbf \
  -o data/segments.geojsonl

.tippecanoe-src/tippecanoe -q -P -o ../apps/web/public/trails.pmtiles --force \
  -l segments -Z9 -z14 --drop-densest-as-needed --extend-zooms-if-still-dropping \
  data/segments.geojsonl
