import { describe, it, expect } from 'vitest';
import { DiscountService } from '../../src/modules/discount/discount.service.js';
import { Discount } from '@prisma/client';

describe('Revenue Protection & Discount Rules - Deterministic Business Logic', () => {
  it('correctly calculates percentage discount when conditions are met', () => {
    const discount: Discount = {
      id: 'd-1',
      organizationId: 'org-1',
      code: 'PROMO20',
      name: '20% Off',
      description: null,
      type: 'PERCENTAGE',
      value: 2000, // 20% in basis points
      currency: null,
      appliesTo: 'WHOLE_SUBSCRIPTION',
      productId: null,
      minPurchaseAmount: 5000, // $50.00
      minQuantity: 2,
      startDate: new Date('2026-01-01'),
      endDate: new Date('2026-12-31'),
      maxUses: 10,
      usedCount: 2,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Case 1: valid purchase ($100 = 10000 cents, quantity 2)
    const result1 = DiscountService.calculateDiscountAmount(discount, 10000, 2);
    expect(result1.valid).toBe(true);
    expect(result1.discountAmount).toBe(2000); // $20.00 discount

    // Case 2: fails minimum quantity condition (quantity 1 < minQuantity 2)
    const result2 = DiscountService.calculateDiscountAmount(discount, 10000, 1);
    expect(result2.valid).toBe(false);
    expect(result2.discountAmount).toBe(0);

    // Case 3: fails minimum purchase condition ($30 < $50 min)
    const result3 = DiscountService.calculateDiscountAmount(discount, 3000, 3);
    expect(result3.valid).toBe(false);
    expect(result3.discountAmount).toBe(0);

    // Case 4: fails max usage condition
    const exhaustedDiscount = { ...discount, usedCount: 10 };
    const result4 = DiscountService.calculateDiscountAmount(exhaustedDiscount, 10000, 2);
    expect(result4.valid).toBe(false);
  });

  it('correctly calculates fixed amount discount up to purchase cap', () => {
    const fixedDiscount: Discount = {
      id: 'd-2',
      organizationId: 'org-1',
      code: 'FLAT50',
      name: '$50 Off',
      description: null,
      type: 'FIXED_AMOUNT',
      value: 5000, // $50.00
      currency: 'USD',
      appliesTo: 'WHOLE_SUBSCRIPTION',
      productId: null,
      minPurchaseAmount: null,
      minQuantity: null,
      startDate: null,
      endDate: null,
      maxUses: null,
      usedCount: 0,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // On $100 purchase -> $50 discount
    const res1 = DiscountService.calculateDiscountAmount(fixedDiscount, 10000, 1);
    expect(res1.valid).toBe(true);
    expect(res1.discountAmount).toBe(5000);

    // On $30 purchase -> discount is capped at gross purchase ($30)
    const res2 = DiscountService.calculateDiscountAmount(fixedDiscount, 3000, 1);
    expect(res2.valid).toBe(true);
    expect(res2.discountAmount).toBe(3000);
  });
});
