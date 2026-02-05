import { formatPriceCOP, formatPriceUSD, copToUsd } from '@/lib/utils'

interface PriceDisplayProps {
  /** Precio en COP */
  cop: number
  /** Tasa de cambio COP/USD (opcional, si no se pasa no muestra USD) */
  exchangeRate?: number
  /** Clase para el contenedor principal */
  className?: string
  /** Si el precio USD debe mostrarse más pequeño y sutil */
  showUsdSubtle?: boolean
}

/** Muestra precio en COP con equivalente en USD en tipografía más pequeña */
export function PriceDisplay({ cop, exchangeRate, className = '', showUsdSubtle = true }: PriceDisplayProps) {
  const usd = exchangeRate ? copToUsd(cop, exchangeRate) : null

  return (
    <span className={className}>
      <span>{formatPriceCOP(cop)}</span>
      {usd !== null && (
        <span className={showUsdSubtle ? 'ml-1.5 text-xs text-muted-foreground font-normal' : 'ml-1.5 text-sm text-muted-foreground'}>
          ({formatPriceUSD(usd)})
        </span>
      )}
    </span>
  )
}
