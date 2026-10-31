import { describe, it, expect } from 'vitest';
import { BillingDateUtil } from '../../src/utils/billing-dates.js';

describe('BillingDateUtil - Renewal and Due Date Calculations', () => {
  it('calculates daily interval correctly', () => {
    const start = new Date('2026-01-01T00:00:00Z');
    const end = BillingDateUtil.calculatePeriodEnd(start, 'DAILY', 1);
    expect(end.toISOString().split('T')[0]).toBe('2026-01-02');
  });

  it('calculates weekly interval correctly', () => {
    const start = new Date('2026-01-01T00:00:00Z');
    const end = BillingDateUtil.calculatePeriodEnd(start, 'WEEKLY', 2); // 2 weeks = 14 days
    expect(end.toISOString().split('T')[0]).toBe('2026-01-15');
  });

  it('calculates monthly interval with rollover protection', () => {
    const start = new Date('2026-01-15T00:00:00Z');
    const end = BillingDateUtil.calculatePeriodEnd(start, 'MONTHLY', 1);
    expect(end.getMonth()).toBe(1); // February
    expect(end.getDate()).toBe(15);
  });

  it('calculates quarterly interval correctly', () => {
    const start = new Date('2026-01-01T00:00:00Z');
    const end = BillingDateUtil.calculatePeriodEnd(start, 'QUARTERLY', 1);
    expect(end.getMonth()).toBe(3); // April (3 months later)
  });

  it('calculates yearly interval correctly', () => {
    const start = new Date('2026-01-01T00:00:00Z');
    const end = BillingDateUtil.calculatePeriodEnd(start, 'YEARLY', 1);
    expect(end.getFullYear()).toBe(2027);
  });

  it('calculates invoice due date from payment terms', () => {
    const issueDate = new Date('2026-03-01T00:00:00Z');

    const net30 = BillingDateUtil.calculateDueDate(issueDate, 'Net 30');
    expect(net30.getDate()).toBe(31); // March has 31 days -> March 31

    const net15 = BillingDateUtil.calculateDueDate(issueDate, 'Net 15');
    expect(net15.getDate()).toBe(16);

    const dueOnReceipt = BillingDateUtil.calculateDueDate(issueDate, 'Due on receipt');
    expect(dueOnReceipt.getDate()).toBe(2); // 1-day buffer
  });
});
