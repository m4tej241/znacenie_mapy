// Staré odkazy s pozíciou mapy (#zoom/lat/lon) patria do appky.
if (/^#\d+(\.\d+)?\/-?\d+(\.\d+)?\/-?\d+(\.\d+)?/.test(location.hash)) {
  location.replace('app/' + location.hash)
}

import ReactDOM from 'react-dom/client'
import '@fontsource-variable/archivo/wdth.css'
import '@fontsource/public-sans/400.css'
import '@fontsource/public-sans/500.css'
import '@fontsource/public-sans/600.css'
import '@fontsource/public-sans/700.css'
import './landing.css'
import { Landing } from './Landing'

ReactDOM.createRoot(document.getElementById('root')!).render(<Landing />)
