import type { ReactNode } from 'react'
import { HeroMap } from './HeroMap'
import { TRAIL_COLORS } from '../mapStyle'
import {
  PRICE_MONTHLY_EUR,
  PRICE_YEARLY_EUR,
  formatEur,
  yearlyPerMonth,
  yearlySavingPct,
} from './plans'

// Odkazy do appky sú relatívne, aby fungovali aj pod base cestou GitHub Pages.
const APP_URL = 'app/'

function Icon({ children, size = 28, stroke = '#17251c', width = 2, className }: {
  children: ReactNode
  size?: number
  stroke?: string
  width?: number
  className?: string
}) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke}
      strokeWidth={width} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {children}
    </svg>
  )
}

function Check({ light = false }: { light?: boolean }) {
  return (
    <Icon size={20} width={2.5} stroke={light ? '#8fd19a' : '#2e7d32'} className="check">
      <path d="M20 6 9 17l-5-5" />
    </Icon>
  )
}

function Logo() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <rect width="32" height="32" rx="8" fill="#17251c" />
      <path d="M6 23 C11 21 11 12 16 12 S 21 19 26 9" stroke="#ffffff" strokeWidth="5" strokeLinecap="round" />
      <path d="M6 23 C11 21 11 12 16 12 S 21 19 26 9" stroke="#d32f2f" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  )
}

function Nav() {
  return (
    <header className="nav">
      <nav className="nav__inner container">
        <a href="#top" className="nav__logo">
          <Logo />
          <span>Prejdené trasy</span>
        </a>
        <div className="nav__links">
          <a href="#ako" className="nav__anchor">Ako to funguje</a>
          <a href="#funkcie" className="nav__anchor">Funkcie</a>
          <a href="#cennik" className="nav__anchor">Cenník</a>
          <a href="#otazky" className="nav__anchor">Otázky</a>
          <a href={APP_URL} className="btn btn--outline btn--small">Prihlásiť sa</a>
        </div>
      </nav>
    </header>
  )
}

function Hero() {
  return (
    <section id="top" className="hero container">
      <div className="hero__text">
        <p className="tag">Značené trasy Slovenska a Česka</p>
        <h1 className="hero__title">Uvidíš, kde všade si <span className="accent">už bol.</span></h1>
        <p className="hero__lead">
          Turistická mapa, na ktorej si jedným klikom označíš prejdené úseky trás. Otvoríš hory a hneď
          vidíš, ktoré chodníky máš za sebou a ktoré ešte čakajú.
        </p>
        <div className="hero__actions">
          <a href="#cennik" className="btn btn--dark">Pozrieť cenník</a>
          <a href="#ako" className="btn btn--outline-soft">Ako to funguje</a>
        </div>
      </div>
      <div className="hero-map">
        <div className="hero-map__frame"><HeroMap /></div>
        <div className="hero-map__card">
          <Icon size={22} width={2.5} stroke="#2e7d32"><path d="M20 6 9 17l-5-5" /></Icon>
          <div className="hero-map__card-text">
            <span>Úsek označený ako prejdený</span>
            <strong>Sedlo → Pleso</strong>
          </div>
        </div>
      </div>
    </section>
  )
}

const STEPS = [
  ['Nájdi trasu na mape', 'Podkladom je podrobná turistická mapa Mapy.com so všetkými značenými trasami.'],
  ['Klikni na úsek', 'Trasy sú rozdelené na úseky medzi rozcestníkmi. Označíš presne to, čo si prešiel, nie celú magistrálu.'],
  ['Sleduj, ako mapa rastie', 'Prejdené úseky svietia vo farbe svojej trasy hrubou čiarou. Pri každom priblížení vidíš, kde si už bol.'],
]

function HowItWorks() {
  return (
    <section id="ako" className="how">
      <div className="container how__inner">
        <h2 className="h2">Tri kroky od túry k vyfarbenej mape</h2>
        <div className="how__steps">
          {STEPS.map(([title, text], i) => (
            <div className="step" key={title}>
              <span className="step__num">{String(i + 1).padStart(2, '0')}</span>
              <h3>{title}</h3>
              <p>{text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function Features() {
  const stripes = [TRAIL_COLORS.red, TRAIL_COLORS.blue, TRAIL_COLORS.green, TRAIL_COLORS.yellow]
  return (
    <section id="funkcie" className="features container">
      <h2 className="h2">Všetko, čo potrebuješ na zbieranie kilometrov</h2>
      <div className="features__grid">
        <div className="card">
          <Icon><path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2Z" /><path d="M9 4v14" /><path d="M15 6v14" /></Icon>
          <h3>Mapa Mapy.com</h3>
          <p>Rovnaká turistická mapa, akú poznáš z mapy.com: vrstevnice, chaty, rozcestníky.</p>
        </div>
        <div className="card">
          <Icon><circle cx="6" cy="18" r="2.5" /><circle cx="18" cy="6" r="2.5" /><path d="M8.5 18H15a3.5 3.5 0 0 0 0-7H9a3.5 3.5 0 0 1 0-7h6.5" /></Icon>
          <h3>Úseky medzi rozcestníkmi</h3>
          <p>Každá značená trasa je rozdelená na kúsky, takže označíš aj polovicu hrebeňovky.</p>
        </div>
        <div className="card">
          <Icon><path d="M4 7h16" /><path d="M4 12h16" /><path d="M4 17h16" /></Icon>
          <h3>Farby trás</h3>
          <div className="stripes" aria-hidden="true">
            {stripes.map((c) => <span key={c} style={{ background: c }} />)}
          </div>
          <p>Prejdený úsek sa vyfarbí farbou svojej značky: červená, modrá, zelená, žltá.</p>
        </div>
        <div className="card">
          <Icon><rect x="2" y="4" width="14" height="11" rx="1.5" /><path d="M6 19h6" /><rect x="17" y="8" width="5" height="11" rx="1" /></Icon>
          <h3>Počítač aj mobil</h3>
          <p>Funguje v prehliadači. Doma plánuješ na veľkej obrazovke, na chate označuješ v mobile.</p>
        </div>
        <div className="card">
          <Icon><path d="M3 12a9 9 0 1 0 18 0 9 9 0 1 0-18 0" /><path d="M3 12h18" /><path d="M12 3a14 14 0 0 1 0 18" /><path d="M12 3a14 14 0 0 0 0 18" /></Icon>
          <h3>Slovensko a Česko</h3>
          <p>Všetky značené turistické trasy oboch krajín, z dát OpenStreetMap.</p>
        </div>
        <div className="card card--soon">
          <Icon><path d="M12 3v12" /><path d="m7 10 5 5 5-5" /><path d="M4 21h16" /></Icon>
          <h3>Import GPX a štatistiky <span className="badge">Pripravujeme</span></h3>
          <p>Nahráš záznam z hodiniek a prejdené úseky sa označia samy.</p>
        </div>
      </div>
    </section>
  )
}

function Pricing() {
  return (
    <section id="cennik" className="pricing">
      <div className="container pricing__inner">
        <div className="pricing__head">
          <h2 className="h2">Jednoduchý cenník</h2>
          <p className="pricing__sub">Rovnaké funkcie v oboch plánoch. Vyber si, ako chceš platiť.</p>
        </div>
        <div className="plans">
          <div className="plan plan--monthly">
            <div>
              <h3>Mesačné</h3>
              <p className="plan__desc">Pre tých, čo chodia hlavne v sezóne.</p>
            </div>
            <div className="plan__price">
              <span className="plan__amount">{formatEur(PRICE_MONTHLY_EUR)}</span>
              <span className="plan__unit">/ mesiac</span>
            </div>
            <ul className="plan__list">
              {['Všetky značené trasy SK a CZ', 'Neobmedzené označovanie úsekov', 'Na počítači aj v mobile', 'Zrušíš kedykoľvek'].map((t) => (
                <li key={t}><Check />{t}</li>
              ))}
            </ul>
            <a href={APP_URL} className="btn btn--outline plan__cta">Zvoliť mesačné</a>
          </div>
          <div className="plan plan--yearly plan--featured">
            <span className="plan__ribbon">Výhodnejšie</span>
            <div>
              <h3>Ročné</h3>
              <p className="plan__desc">Celý rok hôr, zima aj leto.</p>
            </div>
            <div className="plan__price-box">
              <div className="plan__price">
                <span className="plan__amount">{formatEur(PRICE_YEARLY_EUR)}</span>
                <span className="plan__unit">/ rok</span>
              </div>
              <span className="plan__note">
                vychádza na {formatEur(yearlyPerMonth)} mesačne, ušetríš {yearlySavingPct} %
              </span>
            </div>
            <ul className="plan__list">
              {['Všetko z mesačného plánu', 'Jedna platba ročne', 'Nižšia cena za mesiac', 'Zrušíš kedykoľvek'].map((t) => (
                <li key={t}><Check light />{t}</li>
              ))}
            </ul>
            <a href={APP_URL} className="btn btn--light plan__cta">Zvoliť ročné</a>
          </div>
        </div>
        <p className="pricing__note">
          Platby bezpečne spracúva Paddle: karta, Apple Pay, Google Pay alebo PayPal. Paddle vystaví faktúru
          a postará sa o DPH. Predplatné zrušíš alebo zmeníš v zákazníckom portáli.
        </p>
      </div>
    </section>
  )
}

const FAQ = [
  ['Funguje appka aj bez signálu?', 'Nie, appka funguje iba online. Podmienky Mapy.com nedovoľujú ukladať mapu do zariadenia. Úseky si môžeš označiť aj doma po túre.'],
  ['Ktoré krajiny pokrýva?', 'Slovensko a Česko, všetky značené turistické trasy. Ďalšie krajiny plánujeme neskôr.'],
  ['Môžem predplatné zrušiť?', 'Áno, kedykoľvek v zákazníckom portáli. Prístup ti zostane do konca zaplateného obdobia.'],
  ['Môžem prejsť z mesačného na ročné?', 'Áno, plán zmeníš v zákazníckom portáli.'],
]

function Faq() {
  return (
    <section id="otazky" className="faq">
      <h2 className="h2">Časté otázky</h2>
      <div className="faq__list">
        {FAQ.map(([q, a]) => (
          <div className="faq__item" key={q}>
            <h3>{q}</h3>
            <p>{a}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

function FinalCta() {
  return (
    <section className="container cta">
      <div className="cta__box">
        <h2>Vyfarbi si hory, ktoré už poznáš.</h2>
        <a href="#cennik" className="btn btn--light">Vybrať plán</a>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="footer">
      <div className="container footer__inner">
        <strong>Prejdené trasy</strong>
        <span>
          Mapové podklady: <a href="https://mapy.com">Mapy.com</a> · © Seznam.cz a.s. and others · © OpenStreetMap contributors
        </span>
      </div>
    </footer>
  )
}

export function Landing() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <HowItWorks />
        <Features />
        <Pricing />
        <Faq />
        <FinalCta />
      </main>
      <Footer />
    </>
  )
}
