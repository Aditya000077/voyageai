/**
 * Utility for Indian Rupee (₹) formatting and currency conversion.
 * Conversion standard: 1 USD ≈ ₹85 INR.
 */

export const USD_TO_INR_RATE = 85

/**
 * Converts any price string (e.g. "$3,800", "$5,000", "3800") into Indian Rupees (₹).
 * If already formatted with '₹' or 'INR', normalizes it cleanly.
 */
export function formatPriceInRupees(priceInput?: string | number | null): string {
  if (priceInput === undefined || priceInput === null) return '₹0'

  if (typeof priceInput === 'number') {
    return `₹${Math.round(priceInput).toLocaleString('en-IN')}`
  }

  const str = String(priceInput).trim()
  if (!str) return '₹0'

  // If already has Rupee symbol
  if (str.includes('₹')) {
    return str
  }

  // If contains INR
  if (str.toUpperCase().includes('INR')) {
    return str.replace(/INR/gi, '₹').trim()
  }

  // If contains '$'
  if (str.includes('$')) {
    const rawNum = str.replace(/[^0-9.]/g, '')
    const parsed = parseFloat(rawNum)
    if (!isNaN(parsed)) {
      const inrValue = Math.round(parsed * USD_TO_INR_RATE)
      return `₹${inrValue.toLocaleString('en-IN')}`
    }
  }

  // If plain numeric string
  const plainNum = parseFloat(str.replace(/,/g, ''))
  if (!isNaN(plainNum)) {
    const inrValue = plainNum < 15000 ? Math.round(plainNum * USD_TO_INR_RATE) : Math.round(plainNum)
    return `₹${inrValue.toLocaleString('en-IN')}`
  }

  return str
}
