import type { StyleSpecification, ExpressionSpecification } from 'maplibre-gl'

export const TRAILS_SOURCE = 'trails'
export const TRAILS_LAYER = 'segments'
/** Od tohto priblíženia sa dajú úseky vyberať. */
export const MIN_EDIT_ZOOM = 12

export const TRAIL_COLORS: Record<string, string> = {
  red: '#d32f2f',
  blue: '#1565c0',
  green: '#2e7d32',
  yellow: '#f9a825',
  other: '#6d4c41',
  multi: '#455a64',
}

/** Farba prejdených úsekov – nesmie sa pliesť so značením KST/KČT. */
export const WALKED_COLOR = '#9c27b0'

const trailColor: ExpressionSpecification = [
  'match',
  ['get', 'color'],
  ...Object.entries(TRAIL_COLORS).flat(),
  TRAIL_COLORS.other,
] as unknown as ExpressionSpecification

const state = (name: string): ExpressionSpecification => ['boolean', ['feature-state', name], false]

export function buildStyle(apiKey: string): StyleSpecification {
  const retina = window.devicePixelRatio > 1 ? '256@2x' : '256'
  return {
    version: 8,
    sources: {
      mapy: {
        type: 'raster',
        tiles: [`https://api.mapy.com/v1/maptiles/outdoor/${retina}/{z}/{x}/{y}?apikey=${apiKey}`],
        tileSize: 256,
        minzoom: 0,
        maxzoom: 19,
        attribution: '<a href="https://api.mapy.com/copyright" target="_blank" rel="noopener">&copy; Seznam.cz a.s. and others</a>',
      },
      [TRAILS_SOURCE]: {
        type: 'vector',
        url: `pmtiles://${new URL(`${import.meta.env.BASE_URL}trails.pmtiles`, window.location.href).href}`,
        attribution: '<a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">&copy; OpenStreetMap contributors</a>',
      },
    },
    layers: [
      { id: 'mapy', type: 'raster', source: 'mapy' },
      {
        // Ladiaca vrstva: celá sieť úsekov, na kontrolu lícovania s podkladom.
        id: 'trails-network',
        type: 'line',
        source: TRAILS_SOURCE,
        'source-layer': TRAILS_LAYER,
        minzoom: 9,
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: {
          'line-color': trailColor,
          'line-width': ['interpolate', ['linear'], ['zoom'], 9, 1, 14, 2.5],
          'line-opacity': 0.8,
          'line-dasharray': [2, 1.5],
        },
      },
      {
        id: 'trails-walked-casing',
        type: 'line',
        source: TRAILS_SOURCE,
        'source-layer': TRAILS_LAYER,
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: {
          'line-color': '#ffffff',
          'line-width': ['interpolate', ['linear'], ['zoom'], 9, 4, 15, 11],
          'line-opacity': ['case', state('walked'), 1, 0],
        },
      },
      {
        id: 'trails-walked',
        type: 'line',
        source: TRAILS_SOURCE,
        'source-layer': TRAILS_LAYER,
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: {
          'line-color': WALKED_COLOR,
          'line-width': ['interpolate', ['linear'], ['zoom'], 9, 2.5, 15, 7],
          'line-opacity': ['case', state('walked'), 0.9, 0],
        },
      },
      {
        id: 'trails-highlight',
        type: 'line',
        source: TRAILS_SOURCE,
        'source-layer': TRAILS_LAYER,
        minzoom: MIN_EDIT_ZOOM,
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: {
          'line-color': '#ffeb3b',
          'line-width': 12,
          'line-opacity': ['case', state('selected'), 0.7, state('hover'), 0.45, 0],
        },
      },
      {
        // Neviditeľná široká línia, aby sa na úsek dalo pohodlne kliknúť.
        id: 'trails-hit',
        type: 'line',
        source: TRAILS_SOURCE,
        'source-layer': TRAILS_LAYER,
        minzoom: MIN_EDIT_ZOOM,
        paint: { 'line-color': '#000000', 'line-width': 16, 'line-opacity': 0 },
      },
    ],
  }
}
