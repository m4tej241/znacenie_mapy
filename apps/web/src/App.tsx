import { useEffect, useRef, useState } from 'react'
import maplibregl, { type MapGeoJSONFeature } from 'maplibre-gl'
import { Protocol } from 'pmtiles'
import { buildStyle, MIN_EDIT_ZOOM, TRAIL_COLORS, TRAILS_LAYER, TRAILS_SOURCE } from './mapStyle'

const API_KEY = import.meta.env.VITE_MAPY_API_KEY

type Route = { osm_id: number; name: string; ref: string; network: string; color: string }

type Segment = {
  fid: number
  sid: string
  length: number
  routes: Route[]
}

const COLOR_NAMES: Record<string, string> = {
  red: 'červená',
  blue: 'modrá',
  green: 'zelená',
  yellow: 'žltá',
  other: 'iná',
}

function toSegment(f: MapGeoJSONFeature): Segment {
  const p = f.properties
  return { fid: f.id as number, sid: p.sid, length: p.len, routes: JSON.parse(p.routes) }
}

function formatLength(m: number) {
  return m >= 1000 ? `${(m / 1000).toFixed(1).replace('.', ',')} km` : `${m} m`
}

const protocol = new Protocol()
maplibregl.addProtocol('pmtiles', protocol.tile)

export function App() {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<maplibregl.Map | null>(null)
  const [selected, setSelected] = useState<Segment | null>(null)
  // Fáza 0: označenia sú len v pamäti prehliadača, neukladajú sa.
  const [walked, setWalked] = useState<Set<number>>(new Set())
  const [quickMode, setQuickMode] = useState(false)
  const [showNetwork, setShowNetwork] = useState(true)
  const [zoom, setZoom] = useState(0)

  const quickModeRef = useRef(quickMode)
  quickModeRef.current = quickMode

  function toggleWalked(fid: number) {
    setWalked((prev) => {
      const next = new Set(prev)
      const isWalked = !next.has(fid)
      if (isWalked) next.add(fid)
      else next.delete(fid)
      mapRef.current?.setFeatureState({ source: TRAILS_SOURCE, sourceLayer: TRAILS_LAYER, id: fid }, { walked: isWalked })
      return next
    })
  }
  const toggleRef = useRef(toggleWalked)
  toggleRef.current = toggleWalked

  useEffect(() => {
    if (!API_KEY || !containerRef.current) return
    const map = new maplibregl.Map({
      container: containerRef.current,
      style: buildStyle(API_KEY),
      center: [19.9, 49.15], // Tatry
      zoom: 11,
      maxZoom: 18,
      hash: true,
      attributionControl: { compact: false },
    })
    mapRef.current = map
    map.addControl(new maplibregl.NavigationControl(), 'top-right')
    map.addControl(new maplibregl.GeolocateControl({}), 'top-right')
    map.addControl(new maplibregl.ScaleControl({}), 'bottom-left')

    const ref = (id: number) => ({ source: TRAILS_SOURCE, sourceLayer: TRAILS_LAYER, id })
    let hovered: number | null = null
    let selectedFid: number | null = null

    const setHover = (id: number | null) => {
      if (hovered !== null) map.setFeatureState(ref(hovered), { hover: false })
      hovered = id
      if (id !== null) map.setFeatureState(ref(id), { hover: true })
    }
    const setSelectedFid = (id: number | null) => {
      if (selectedFid !== null) map.setFeatureState(ref(selectedFid), { selected: false })
      selectedFid = id
      if (id !== null) map.setFeatureState(ref(id), { selected: true })
    }

    map.on('mousemove', 'trails-hit', (e) => {
      map.getCanvas().style.cursor = 'pointer'
      setHover((e.features?.[0]?.id as number) ?? null)
    })
    map.on('mouseleave', 'trails-hit', () => {
      map.getCanvas().style.cursor = ''
      setHover(null)
    })
    map.on('click', (e) => {
      const f = map.queryRenderedFeatures(e.point, { layers: ['trails-hit'] })[0]
      if (!f) {
        setSelectedFid(null)
        setSelected(null)
        return
      }
      if (quickModeRef.current) {
        toggleRef.current(f.id as number)
        return
      }
      setSelectedFid(f.id as number)
      setSelected(toSegment(f))
    })
    map.on('zoomend', () => setZoom(map.getZoom()))
    setZoom(map.getZoom())

    return () => {
      map.remove()
      mapRef.current = null
    }
  }, [])

  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    const apply = () => map.setLayoutProperty('trails-network', 'visibility', showNetwork ? 'visible' : 'none')
    if (map.isStyleLoaded()) apply()
    else map.once('load', apply)
  }, [showNetwork])

  if (!API_KEY) {
    return (
      <div className="error">
        Chýba API kľúč Mapy.com. Doplň <code>VITE_MAPY_API_KEY</code> do <code>apps/web/.env.local</code> a reštartuj
        dev server.
      </div>
    )
  }

  const isWalked = selected ? walked.has(selected.fid) : false

  return (
    <>
      <div ref={containerRef} className="map" />

      <a className="mapy-logo" href="https://mapy.com/" target="_blank" rel="noopener">
        <img src="https://api.mapy.com/img/api/logo.svg" alt="Mapy.com" />
      </a>

      <div className="toolbar">
        <label>
          <input type="checkbox" checked={quickMode} onChange={(e) => setQuickMode(e.target.checked)} />
          Rýchly režim
        </label>
        <label>
          <input type="checkbox" checked={showNetwork} onChange={(e) => setShowNetwork(e.target.checked)} />
          Sieť úsekov
        </label>
        <span className="muted">Prejdené: {walked.size}</span>
      </div>

      {zoom < MIN_EDIT_ZOOM && <div className="hint">Priblíž mapu na označovanie trás</div>}

      {selected && !quickMode && (
        <div className="panel">
          <button className="close" onClick={() => setSelected(null)} aria-label="Zavrieť">
            ×
          </button>
          <div className="routes">
            {selected.routes.map((r) => (
              <div key={r.osm_id} className="route">
                <span className="swatch" style={{ background: TRAIL_COLORS[r.color] ?? TRAIL_COLORS.other }} />
                <span>
                  {r.name || r.ref || 'Bez názvu'}
                  <span className="muted"> · {COLOR_NAMES[r.color] ?? r.color}</span>
                </span>
              </div>
            ))}
          </div>
          <div className="muted">
            Dĺžka úseku: {formatLength(selected.length)} · ID {selected.sid}
          </div>
          <button className={isWalked ? 'secondary' : 'primary'} onClick={() => toggleWalked(selected.fid)}>
            {isWalked ? 'Zrušiť označenie' : 'Označiť ako prejdené'}
          </button>
        </div>
      )}
    </>
  )
}
