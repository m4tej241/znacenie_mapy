"""Rozdelí značené turistické trasy z OSM na úseky medzi bodmi rezu.

Bod rezu je uzol, kde:
  - stupeň v sieti trás nie je 2 (križovatka / koniec trasy),
  - sa mení množina trás, ktoré po chodníku vedú,
  - stojí rozcestník (tourism=information + information=guidepost).

Úsek je fyzický kus chodníka; ak po ňom vedie viac trás, je jeden so zoznamom trás.

Použitie:
  python segment.py data/slovakia-latest.osm.pbf data/czech-republic-latest.osm.pbf \
      -o data/segments.geojsonl
"""

import argparse
import hashlib
import json
import math
import sys
from collections import Counter, defaultdict

import osmium

COLORS = {"red", "blue", "green", "yellow"}


def trail_color(tags):
    """Farba značky z osmc:symbol (prvá časť = farba cesty), inak z colour."""
    sym = tags.get("osmc:symbol")
    if sym:
        c = sym.split(":", 1)[0].strip().lower()
        if c in COLORS:
            return c
    c = (tags.get("colour") or "").strip().lower()
    return c if c in COLORS else "other"


class RouteHandler(osmium.SimpleHandler):
    """1. prechod: turistické relácie a ich členské cesty."""

    def __init__(self):
        super().__init__()
        self.routes = {}                     # rel_id -> info
        self.way_routes = defaultdict(set)   # way_id -> {rel_id}

    def relation(self, r):
        t = r.tags
        if t.get("type") != "route" or t.get("route") != "hiking":
            return
        if t.get("state") in ("proposed", "disused") or "disused:route" in t:
            return
        self.routes[r.id] = {
            "osm_id": r.id,
            "name": t.get("name", ""),
            "ref": t.get("ref", ""),
            "network": t.get("network", ""),
            "color": trail_color(t),
        }
        for m in r.members:
            if m.type == "w":
                self.way_routes[m.ref].add(r.id)


class WayHandler(osmium.SimpleHandler):
    """2. prechod: geometria členských ciest + rozcestníky."""

    def __init__(self, way_routes):
        super().__init__()
        self.way_routes = way_routes
        self.coords = {}                     # node_id -> (lon, lat)
        self.guideposts = set()
        # hrana (u, v) s u < v -> množina trás
        self.edges = defaultdict(set)

    def node(self, n):
        t = n.tags
        if t.get("information") == "guidepost" and t.get("tourism") == "information":
            self.guideposts.add(n.id)

    def way(self, w):
        routes = self.way_routes.get(w.id)
        if not routes:
            return
        prev = None
        for nd in w.nodes:
            if not nd.location.valid():
                prev = None
                continue
            self.coords[nd.ref] = (nd.location.lon, nd.location.lat)
            if prev is not None and prev != nd.ref:
                self.edges[(min(prev, nd.ref), max(prev, nd.ref))] |= routes
            prev = nd.ref


def haversine(a, b):
    lon1, lat1, lon2, lat2 = map(math.radians, (*a, *b))
    h = math.sin((lat2 - lat1) / 2) ** 2 + math.cos(lat1) * math.cos(lat2) * math.sin((lon2 - lon1) / 2) ** 2
    return 2 * 6371008.8 * math.asin(math.sqrt(h))


def segment_id(nodes):
    """Deterministické ID nezávislé od smeru úseku."""
    fwd, rev = nodes, nodes[::-1]
    canon = min(fwd, rev)
    return hashlib.sha1(",".join(map(str, canon)).encode()).hexdigest()[:16]


def build_segments(edges, guideposts):
    adj = defaultdict(list)
    for (u, v), routes in edges.items():
        key = frozenset(routes)
        adj[u].append((v, key))
        adj[v].append((u, key))

    def is_cut(n):
        nb = adj[n]
        return len(nb) != 2 or n in guideposts or nb[0][1] != nb[1][1]

    cuts = {n for n in adj if is_cut(n)}
    visited = set()

    def walk(start, nxt):
        path = [start, nxt]
        visited.add((min(start, nxt), max(start, nxt)))
        prev, cur = start, nxt
        while cur not in cuts:
            a, b = adj[cur]
            step = a[0] if a[0] != prev else b[0]
            e = (min(cur, step), max(cur, step))
            if e in visited:          # uzavretý kruh
                break
            visited.add(e)
            path.append(step)
            prev, cur = cur, step
        return path

    for c in cuts:
        for nb, _ in adj[c]:
            if (min(c, nb), max(c, nb)) not in visited:
                yield walk(c, nb)

    # kruhy bez jediného bodu rezu
    for n in adj:
        for nb, _ in adj[n]:
            if (min(n, nb), max(n, nb)) not in visited:
                cuts.add(n)
                yield walk(n, nb)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("pbf", nargs="+")
    ap.add_argument("-o", "--out", required=True, help="GeoJSON Lines výstup")
    args = ap.parse_args()

    rh = RouteHandler()
    for f in args.pbf:
        rh.apply_file(f)
    print(f"trasy: {len(rh.routes)}, členské cesty: {len(rh.way_routes)}", file=sys.stderr)

    wh = WayHandler(rh.way_routes)
    for f in args.pbf:
        wh.apply_file(f, locations=True, idx="flex_mem")
    print(f"hrany: {len(wh.edges)}, rozcestníky: {len(wh.guideposts)}", file=sys.stderr)

    count, total_m, short, seen = 0, 0.0, 0, set()
    lengths = []
    with open(args.out, "w") as out:
        for nodes in build_segments(wh.edges, wh.guideposts):
            sid = segment_id(nodes)
            if sid in seen:
                continue
            seen.add(sid)
            coords = [wh.coords[n] for n in nodes]
            length = sum(haversine(a, b) for a, b in zip(coords, coords[1:]))
            route_ids = sorted(wh.edges[(min(nodes[0], nodes[1]), max(nodes[0], nodes[1]))])
            routes = [rh.routes[r] for r in route_ids]
            colors = sorted({r["color"] for r in routes})
            names = sorted({r["name"] or r["ref"] for r in routes if r["name"] or r["ref"]})
            feat = {
                "type": "Feature",
                "id": count,
                "properties": {
                    "sid": sid,
                    "len": round(length),
                    "colors": ",".join(colors),
                    "color": colors[0] if len(colors) == 1 else "multi",
                    "names": " / ".join(names),
                    "routes": json.dumps(routes, ensure_ascii=False),
                },
                "geometry": {"type": "LineString", "coordinates": [[round(x, 7), round(y, 7)] for x, y in coords]},
            }
            out.write(json.dumps(feat, ensure_ascii=False) + "\n")
            count += 1
            total_m += length
            lengths.append(length)
            short += length < 30

    lengths.sort()
    med = lengths[len(lengths) // 2] if lengths else 0
    print(
        f"úseky: {count}, spolu {total_m / 1000:.0f} km, medián {med:.0f} m, "
        f"kratšie ako 30 m: {short} ({100 * short / max(count, 1):.1f} %)",
        file=sys.stderr,
    )


if __name__ == "__main__":
    main()
