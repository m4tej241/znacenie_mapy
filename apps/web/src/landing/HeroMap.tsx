import { TRAIL_COLORS } from '../mapStyle'

const { red, blue, green, yellow } = TRAIL_COLORS

/** Ilustrácia mapy s prejdenými (hrubými) a neprejdenými (tenkými) úsekmi. */
export function HeroMap() {
  const done = (d: string, color: string) => (
    <>
      <path d={d} stroke="#ffffff" strokeWidth="13" />
      <path d={d} stroke={color} strokeWidth="7" />
    </>
  )
  return (
    <svg viewBox="0 0 600 460" width="100%" className="hero-map__svg" role="img" aria-label="Ukážka mapy s prejdenými úsekmi trás">
      <rect width="600" height="460" fill="#e9efe0" />
      <path d="M0 380 C120 330 180 400 300 350 S 480 300 600 330 L600 460 L0 460 Z" fill="#dfe8d2" />
      <g fill="none" stroke="#c7d2b6" strokeWidth="1.2">
        <path d="M-10 120 C90 80 160 150 260 110 S 430 60 610 100" />
        <path d="M-10 160 C100 120 170 190 270 150 S 440 100 610 140" />
        <path d="M-10 205 C110 165 180 235 280 195 S 450 150 610 185" />
        <path d="M-10 250 C120 215 190 280 290 245 S 460 200 610 235" />
        <path d="M-10 300 C130 265 200 325 300 295 S 470 255 610 285" />
        <path d="M330 40 C380 20 450 40 470 80 C 480 110 420 120 380 100 C 350 85 310 60 330 40 Z" />
        <path d="M360 55 C390 45 430 55 440 75 C 445 90 410 95 390 85 C 370 77 350 65 360 55 Z" />
      </g>
      <path d="M150 300 C175 285 215 290 225 310 C 232 328 200 342 172 334 C 150 328 135 312 150 300 Z" fill="#a9cfe6" stroke="#8bbad6" strokeWidth="1" />

      {/* neprejdené úseky: tenká čiara vo farbe trasy */}
      <g fill="none" strokeLinecap="round" strokeWidth="3">
        <path d="M40 420 C90 380 120 360 150 345" stroke={blue} />
        <path d="M300 225 C340 200 370 160 400 120 S 450 70 470 40" stroke={red} />
        <path d="M300 225 C350 250 420 260 480 300 S 560 360 590 380" stroke={green} />
        <path d="M410 115 C450 140 500 150 560 140" stroke={yellow} />
        <path d="M235 315 C260 360 250 400 270 450" stroke={yellow} />
      </g>

      {/* prejdené úseky: hrubá čiara s bielym okrajom */}
      <g fill="none" strokeLinecap="round" strokeLinejoin="round">
        {done('M20 250 C70 240 110 255 150 270 S 210 300 228 312', red)}
        {done('M228 312 C250 280 270 250 300 225', red)}
        {done('M150 345 C170 335 200 325 228 312', blue)}
        {done('M300 225 C280 180 250 140 230 90 S 200 30 180 10', green)}
      </g>

      {/* rozcestníky */}
      <g fill="#ffffff" stroke="#17251c" strokeWidth="2">
        <circle cx="228" cy="312" r="5" />
        <circle cx="300" cy="225" r="5" />
        <circle cx="150" cy="345" r="5" />
        <circle cx="410" cy="115" r="5" />
      </g>
      <g fontFamily="Public Sans, sans-serif" fontSize="12" fontWeight="600" fill="#17251c">
        <text x="310" y="220">Sedlo</text>
        <text x="420" y="110">Chata</text>
        <text x="160" y="322" fill="#2a6f9a">Pleso</text>
      </g>
    </svg>
  )
}
