export const PRICE_MONTHLY_EUR = 3
export const PRICE_YEARLY_EUR = 25
export const yearlyPerMonth = PRICE_YEARLY_EUR / 12
export const yearlySavingPct = Math.floor((1 - PRICE_YEARLY_EUR / (12 * PRICE_MONTHLY_EUR)) * 100)

export const formatEur = (v: number) =>
  new Intl.NumberFormat('sk-SK', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: Number.isInteger(v) ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(v)
