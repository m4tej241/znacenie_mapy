import ReactDOM from 'react-dom/client'
import 'maplibre-gl/dist/maplibre-gl.css'
import './styles.css'
import { App } from './App'

// Bez React.StrictMode: dvojité pripojenie v dev režime by vytvorilo mapu dvakrát
// a MapLibre pri map.remove() zmaže pozíciu z URL (#zoom/lat/lon).
ReactDOM.createRoot(document.getElementById('root')!).render(<App />)
