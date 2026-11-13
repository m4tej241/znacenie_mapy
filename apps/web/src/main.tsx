import ReactDOM from 'react-dom/client'
import '@fontsource-variable/archivo/wdth.css'
import '@fontsource/public-sans/400.css'
import '@fontsource/public-sans/600.css'
import '@fontsource/public-sans/700.css'
import './styles.css'
import { AuthGate } from './AuthGate'
import { restoreMapHash } from './auth'

// Musí prebehnúť pred vytvorením mapy, ktorá číta pozíciu z URL.
restoreMapHash()

// Bez React.StrictMode: dvojité pripojenie v dev režime by vytvorilo mapu dvakrát
// a MapLibre pri map.remove() zmaže pozíciu z URL (#zoom/lat/lon).
ReactDOM.createRoot(document.getElementById('root')!).render(<AuthGate />)
