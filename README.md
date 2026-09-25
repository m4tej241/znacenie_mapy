# Prejdené trasy

Mapa, na ktorej si označuješ prejdené úseky turistických trás. Špecifikácia: [specifikacia.md](specifikacia.md).

## Spustenie webu

```bash
cd apps/web
cp .env.example .env.local   # doplň VITE_MAPY_API_KEY
npm install
npm run dev                  # http://localhost:5173
```

Web potrebuje súbor `apps/web/public/trails.pmtiles`, ktorý vytvorí pipeline.

## Dátová pipeline (úseky trás z OSM)

Jednorazová príprava:

```bash
cd pipeline
python3 -m venv .venv && .venv/bin/pip install -r requirements.txt
git clone --depth 1 https://github.com/felt/tippecanoe.git .tippecanoe-src
make -C .tippecanoe-src -j tippecanoe
```

Stiahnutie dát SK + CZ, segmentácia a vygenerovanie dlaždíc (asi 10 minút):

```bash
./run.sh
```
