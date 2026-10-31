import React from 'react';

const statusStyles = {
  // Subscriptions & Customers
  active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  trialing: 'bg-blue-50 text-blue-700 border-blue-200',
  past_due: 'bg-amber-50 text-amber-700 border-amber-200',
  paused: 'bg-slate-100 text-slate-700 border-slate-200',
  canceled: 'bg-rose-50 text-rose-700 border-rose-200',
  
  // Invoices & Payments
  paid: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  succeeded: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  open: 'bg-sky-50 text-sky-700 border-sky-200',
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  overdue: 'bg-rose-50 text-rose-700 border-rose-200',
  failed: 'bg-rose-50 text-rose-700 border-rose-200',
  refunded: 'bg-purple-50 text-purple-700 border-purple-200',
  void: 'bg-slate-100 text-slate-500 border-slate-200',

  // Severity
  critical: 'bg-rose-100 text-rose-800 border-rose-200 font-semibold',
  high: 'bg-amber-100 text-amber-800 border-amber-200 font-medium',
  medium: 'bg-blue-50 text-blue-700 border-blue-200',
  low: 'bg-slate-100 text-slate-700 border-slate-200',

  // Discounts
  expired: 'bg-slate-100 text-slate-500 border-slate-200'
};

const dotColors = {
  active: 'bg-emerald-500',
  trialing: 'bg-blue-500',
  past_due: 'bg-amber-500',
  paused: 'bg-slate-400',
  canceled: 'bg-rose-500',
  paid: 'bg-emerald-500',
  succeeded: 'bg-emerald-500',
  open: 'bg-sky-500',
  pending: 'bg-amber-500',
  overdue: 'bg-rose-500',
  failed: 'bg-rose-500',
  refunded: 'bg-purple-500',
  void: 'bg-slate-400',
  critical: 'bg-rose-600',
  high: 'bg-amber-600',
  medium: 'bg-blue-500',
  low: 'bg-slate-400'
};

export const Badge = ({ status, label, showDot = true, className = '' }) => {
  const normalized = (status || '').toLowerCase().replace(/ /g, '_');
  const style = statusStyles[normalized] || 'bg-slate-100 text-slate-700 border-slate-200';
  const dotColor = dotColors[normalized] || 'bg-slate-400';
  const displayLabel = label || status?.replace(/_/g, ' ') || 'unknown';

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border capitalize tracking-tight ${style} ${className}`}
    >
      {showDot && (
        <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${dotColor}`} />
      )}
      {displayLabel}
    </span>
  );
};

