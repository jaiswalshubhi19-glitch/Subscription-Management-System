import { describe, it, expect } from 'vitest';
import { MoneyUtil } from '../../src/utils/money.js';

describe('MoneyUtil - Integer Minor Units Financial Math', () => {
  it('converts minor units (cents) to decimal representation correctly', () => {
    expect(MoneyUtil.toDecimal(1999)).toBe(19.99);
    expect(MoneyUtil.toDecimal(0)).toBe(0);
    expect(MoneyUtil.toDecimal(50)).toBe(0.5);
  });

  it('converts decimal to minor units without floating-point rounding errors', () => {
    // Floating point 0.1 + 0.2 = 0.30000000000000004
    expect(MoneyUtil.fromDecimal(0.1 + 0.2)).toBe(30);
    expect(MoneyUtil.fromDecimal(19.99)).toBe(1999);
    expect(MoneyUtil.fromDecimal(2499.50)).toBe(249950);
  });

  it('calculates percentage discounts using integer basis points accurately', () => {
    // 20% discount on $100.00 (10000 cents) -> 2000 basis points -> 2000 cents ($20.00)
    const discount = MoneyUtil.calculatePercentageDiscount(10000, 2000);
    expect(discount).toBe(2000);

    // 15% discount on $99.00 (9900 cents) -> 1500 basis points -> 1485 cents ($14.85)
    const discount2 = MoneyUtil.calculatePercentageDiscount(9900, 1500);
    expect(discount2).toBe(1485);

    // Discount cannot exceed original amount
    const cappedDiscount = MoneyUtil.calculatePercentageDiscount(5000, 15000); // 150%
    expect(cappedDiscount).toBe(5000);
  });

  it('calculates tax based on tax rate in basis points', () => {
    // 10% tax (1000 basis points) on taxable $200.00 (20000 cents) -> 2000 cents ($20.00)
    const tax = MoneyUtil.calculateTax(20000, 1000);
    expect(tax).toBe(2000);

    // 8.25% tax (825 basis points) on $49.00 (4900 cents)
    // 4900 * 825 / 10000 = 404.25 -> rounded to 404 cents ($4.04)
    const tax2 = MoneyUtil.calculateTax(4900, 825);
    expect(tax2).toBe(404);

    expect(MoneyUtil.calculateTax(4900, 0)).toBe(0);
  });

  it('calculates line total accurately: gross - discount + tax', () => {
    // 2 seats * $99.00 (9900 cents) = 19800 cents ($198.00)
    // discount = 1800 cents ($18.00)
    // tax = 1800 cents ($18.00)
    // total = 19800 - 1800 + 1800 = 19800 cents ($198.00)
    const total = MoneyUtil.calculateLineTotal(2, 9900, 1800, 1800);
    expect(total).toBe(19800);
  });

  it('formats currency correctly for presentation', () => {
    expect(MoneyUtil.format(1999, 'USD')).toBe('$19.99');
    expect(MoneyUtil.format(50000, 'USD')).toBe('$500.00');
  });
});
