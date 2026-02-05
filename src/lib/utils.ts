import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

/** Formatea precios en pesos colombianos (COP) */
export function formatPriceCOP(price: number) {
    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(price)
}

/** Formatea precios en dólares (USD) */
export function formatPriceUSD(price: number) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    }).format(price)
}

/** Convierte COP a USD según tasa de cambio */
export function copToUsd(cop: number, exchangeRate: number) {
    return exchangeRate > 0 ? cop / exchangeRate : 0
}
