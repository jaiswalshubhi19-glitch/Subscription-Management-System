import { BillingInterval } from '@prisma/client';

export class BillingDateUtil {
  /**
   * Calculate the end of a billing period from a start date, interval, and intervalCount
   */
  static calculatePeriodEnd(
    startDate: Date,
    interval: BillingInterval,
    intervalCount = 1
  ): Date {
    const end = new Date(startDate.getTime());

    switch (interval) {
      case 'DAILY':
        end.setDate(end.getDate() + intervalCount);
        break;
      case 'WEEKLY':
        end.setDate(end.getDate() + intervalCount * 7);
        break;
      case 'MONTHLY': {
        const expectedMonth = end.getMonth() + intervalCount;
        end.setMonth(expectedMonth);
        // Handle month-end rollover (e.g. Jan 31 -> Feb 28/29)
        if (end.getMonth() !== expectedMonth % 12) {
          end.setDate(0); // Set to last day of previous month
        }
        break;
      }
      case 'QUARTERLY': {
        const expectedMonth = end.getMonth() + intervalCount * 3;
        end.setMonth(expectedMonth);
        if (end.getMonth() !== expectedMonth % 12) {
          end.setDate(0);
        }
        break;
      }
      case 'YEARLY':
        end.setFullYear(end.getFullYear() + intervalCount);
        break;
      default:
        end.setMonth(end.getMonth() + intervalCount);
    }

    return end;
  }

  /**
   * Determine default invoice due date based on payment terms (e.g. "Net 30", "Net 15", "Due on receipt")
   */
  static calculateDueDate(issueDate: Date, paymentTerms = 'Due on receipt'): Date {
    const due = new Date(issueDate.getTime());
    const terms = paymentTerms.toLowerCase();

    if (terms.includes('30')) {
      due.setDate(due.getDate() + 30);
    } else if (terms.includes('15')) {
      due.setDate(due.getDate() + 15);
    } else if (terms.includes('60')) {
      due.setDate(due.getDate() + 60);
    } else if (terms.includes('7')) {
      due.setDate(due.getDate() + 7);
    } else {
      // Due on receipt default (same day or +1 day buffer)
      due.setDate(due.getDate() + 1);
    }

    return due;
  }
}
