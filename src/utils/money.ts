/**
 * SubscriptIQ Financial Math Utility
 * Strictly enforces integer minor units (cents, paise) and integer basis-point arithmetic
 * to eliminate IEEE 754 floating-point inaccuracies.
 */

export class MoneyUtil {
  /**
   * Convert minor units (e.g. 1999 cents) to decimal representation (19.99)
   */
  static toDecimal(minorUnits: number): number {
    return minorUnits / 100;
  }

  /**
   * Convert decimal representation (e.g. 19.99) to minor units (1999 cents) safely
   */
  static fromDecimal(decimal: number): number {
    return Math.round(decimal * 100);
  }

  /**
   * Format minor units into standard currency string
   * e.g. 1999 cents, 'USD' -> "$19.99"
   */
  static format(minorUnits: number, currency = 'USD'): string {
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    });
    return formatter.format(minorUnits / 100);
  }

  /**
   * Calculate discount amount using integer math
   * If percentage: rateBasisPoints (e.g. 1500 = 15.00%)
   * formula: Math.round((subtotal * rateBasisPoints) / 10000)
   */
  static calculatePercentageDiscount(amount: number, basisPoints: number): number {
    if (basisPoints <= 0) return 0;
    const discount = Math.round((amount * basisPoints) / 10000);
    return Math.min(amount, discount);
  }

  /**
   * Calculate tax amount using integer math
   * taxRateBasisPoints (e.g. 1000 = 10.00%)
   * formula: Math.round((taxableAmount * taxRateBasisPoints) / 10000)
   */
  static calculateTax(taxableAmount: number, taxRateBasisPoints: number): number {
    if (taxRateBasisPoints <= 0 || taxableAmount <= 0) return 0;
    return Math.round((taxableAmount * taxRateBasisPoints) / 10000);
  }

  /**
   * Calculate line item total:
   * quantity * unitPrice - discountAmount + taxAmount
   */
  static calculateLineTotal(
    quantity: number,
    unitPrice: number,
    discountAmount = 0,
    taxAmount = 0
  ): number {
    const gross = quantity * unitPrice;
    const net = Math.max(0, gross - discountAmount);
    return net + taxAmount;
  }
}
