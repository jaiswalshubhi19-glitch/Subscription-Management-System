import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  DollarSign,
  TrendingUp,
  Repeat,
  Users,
  Clock,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  ShieldAlert,
  ArrowRight,
  Plus,
  FileText,
  Calendar,
  CheckCircle2,
  Download
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar
} from 'recharts';
import { useData } from '../context/DataContext';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';

export const Dashboard = () => {
  const {
    totalRevenue,
    mrr,
    activeSubscriptionsCount,
    totalCustomersCount,
    pendingPaymentsTotal,
    overdueInvoicesTotal,
    totalRevenueAtRisk,
    revenueTrends,
    subscriptions,
    payments,
    invoices,
    alerts
  } = useData();

  const navigate = useNavigate();
  const [timeRange, setTimeRange] = useState('12m');

  const activeAlerts = alerts.filter(a => a.recoveryStatus !== 'resolved');
  const recentPayments = payments.slice(0, 5);
  const upcomingRenewals = subscriptions
    .filter(s => s.status === 'active')
    .slice(0, 4);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Executive Financial Overview</h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time subscription billing health, recurring cash flow, and dunning radar.
          </p>
        </div>
        <div className="flex items-center space-x-2.5">
          <Button
            variant="secondary"
            size="sm"
            icon={Download}
            onClick={() => window.print()}
          >
            Export Report
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={Plus}
            onClick={() => navigate('/subscriptions')}
          >
            New Subscription
          </Button>
        </div>
      </div>

      {/* Revenue At Risk Banner if active alerts exist */}
      {activeAlerts.length > 0 && (
        <div className="bg-gradient-to-r from-rose-50 via-amber-50 to-white border border-rose-200/80 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-start space-x-3">
            <div className="p-2 rounded-lg bg-rose-100 text-rose-700 flex-shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Revenue Protection Radar</h4>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-600 text-white">
                  ${totalRevenueAtRisk.toLocaleString()} at risk
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                {activeAlerts.length} accounts have overdue invoices or payment gateway declines requiring automated dunning intervention.
              </p>
            </div>
          </div>
          <Button
            variant="danger"
            size="sm"
            icon={ArrowRight}
            iconPosition="right"
            onClick={() => navigate('/revenue-protection')}
            className="flex-shrink-0"
          >
            Inspect At-Risk Revenue
          </Button>
        </div>
      )}

      {/* 6 Core Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5">
        {/* Total Revenue */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Total Revenue</span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5">
            <span className="text-xl font-bold text-slate-900 tracking-tight">
              ${totalRevenue.toLocaleString()}
            </span>
          </div>
          <div className="mt-1 flex items-center text-[11px] text-emerald-600 font-medium">
            <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
            <span>+14.8% vs last cycle</span>
          </div>
        </div>

        {/* MRR */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Monthly Recurring</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5">
            <span className="text-xl font-bold text-slate-900 tracking-tight">
              ${mrr.toLocaleString()}
            </span>
          </div>
          <div className="mt-1 flex items-center text-[11px] text-emerald-600 font-medium">
            <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
            <span>+12.4% MoM</span>
          </div>
        </div>

        {/* Active Subscriptions */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Active Subs</span>
            <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Repeat className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5">
            <span className="text-xl font-bold text-slate-900 tracking-tight">
              {activeSubscriptionsCount}
            </span>
          </div>
          <div className="mt-1 flex items-center text-[11px] text-emerald-600 font-medium">
            <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
            <span>+8 net this month</span>
          </div>
        </div>

        {/* Total Customers */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Total Accounts</span>
            <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5">
            <span className="text-xl font-bold text-slate-900 tracking-tight">
              {totalCustomersCount}
            </span>
          </div>
          <div className="mt-1 flex items-center text-[11px] text-slate-500 font-medium">
            <span>98.2% retention rate</span>
          </div>
        </div>

        {/* Pending Payments */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Pending ACH</span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5">
            <span className="text-xl font-bold text-slate-900 tracking-tight">
              ${pendingPaymentsTotal.toLocaleString()}
            </span>
          </div>
          <div className="mt-1 flex items-center text-[11px] text-amber-600 font-medium">
            <span>Settling in 1-2 days</span>
          </div>
        </div>

        {/* Overdue Invoices */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Overdue Invoices</span>
            <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5">
            <span className="text-xl font-bold text-rose-600 tracking-tight">
              ${overdueInvoicesTotal.toLocaleString()}
            </span>
          </div>
          <div className="mt-1 flex items-center text-[11px] text-rose-600 font-medium">
            <span>{invoices.filter(i => i.status === 'overdue').length} open past due</span>
          </div>
        </div>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Revenue Growth Trend (2 columns) */}
        <div className="lg:col-span-2 bg-white rounded-xl p-5 border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 tracking-tight">Monthly Revenue & MRR Velocity</h3>
              <p className="text-xs text-slate-500 mt-0.5">Historical progression over last 12 months in USD</p>
            </div>
            <div className="flex items-center space-x-1.5 text-xs">
              <span className="flex items-center space-x-1 mr-3 text-slate-500">
                <span className="w-2.5 h-2.5 rounded-xs bg-[#2563EB]" />
                <span>Gross Billings</span>
              </span>
              <span className="flex items-center space-x-1 text-slate-500">
                <span className="w-2.5 h-2.5 rounded-xs bg-[#172554]" />
                <span>MRR</span>
              </span>
            </div>
          </div>

          <div className="h-64 mt-4 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueTrends} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <defs>
                  <linearGradient id="grossRevGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.18} />
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="mrrGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#172554" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#172554" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748B' }} stroke="#E2E8F0" />
                <YAxis tick={{ fontSize: 11, fill: '#64748B' }} stroke="#E2E8F0" tickFormatter={(v) => `$${v/1000}k`} />
                <Tooltip
                  formatter={(value) => [`$${value.toLocaleString()}`, '']}
                  contentStyle={{ backgroundColor: '#0F172A', borderRadius: '8px', color: '#fff', fontSize: '11px', border: 'none' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#2563EB" strokeWidth={2} fillOpacity={1} fill="url(#grossRevGrad)" name="Gross Revenue" />
                <Area type="monotone" dataKey="mrr" stroke="#172554" strokeWidth={2} fillOpacity={1} fill="url(#mrrGrad)" name="MRR" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Subscription Net Acquisition Growth (1 column) */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-2xs">
          <div className="pb-4 border-b border-slate-100">
            <h3 className="text-sm font-semibold text-slate-900 tracking-tight">Subscriber Net Additions</h3>
            <p className="text-xs text-slate-500 mt-0.5">New signups vs churned per month</p>
          </div>

          <div className="h-64 mt-4 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueTrends.slice(-6)} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748B' }} stroke="#E2E8F0" />
                <YAxis tick={{ fontSize: 11, fill: '#64748B' }} stroke="#E2E8F0" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0F172A', borderRadius: '8px', color: '#fff', fontSize: '11px', border: 'none' }}
                />
                <Bar dataKey="newSubscriptions" fill="#2563EB" name="New Subscriptions" radius={[4, 4, 0, 0]} />
                <Bar dataKey="churned" fill="#DC2626" name="Cancellations" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Tables Row: Recent Transactions & Upcoming Renewals */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Recent Transactions (2 columns) */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Recent Payment Transactions</h3>
              <p className="text-xs text-slate-500 mt-0.5">Latest attempts processed through payment gateways</p>
            </div>
            <Button
              variant="outline"
              size="xs"
              onClick={() => navigate('/payments')}
            >
              View All
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-100 text-slate-500 uppercase tracking-wider font-semibold text-[10px]">
                <tr>
                  <th className="px-4 py-2.5">Customer</th>
                  <th className="px-4 py-2.5">Invoice</th>
                  <th className="px-4 py-2.5">Payment Method</th>
                  <th className="px-4 py-2.5">Amount</th>
                  <th className="px-4 py-2.5">Status</th>
                  <th className="px-4 py-2.5 text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {recentPayments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-900">{p.customerName}</div>
                      <div className="text-[11px] text-slate-400">{p.customerEmail}</div>
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-600">{p.invoiceNumber}</td>
                    <td className="px-4 py-3 text-slate-600">{p.method}</td>
                    <td className="px-4 py-3 font-semibold text-slate-900">${p.amount.toFixed(2)}</td>
                    <td className="px-4 py-3">
                      <Badge status={p.status} />
                    </td>
                    <td className="px-4 py-3 text-right text-slate-500">{p.date.split(' ')[0]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Upcoming Renewals (1 column) */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden flex flex-col justify-between">
          <div>
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">Upcoming Renewals</h3>
                <p className="text-xs text-slate-500 mt-0.5">Subscriptions cycling within 15 days</p>
              </div>
              <Calendar className="w-4 h-4 text-slate-400" />
            </div>

            <div className="divide-y divide-slate-100">
              {upcomingRenewals.map((sub) => (
                <div key={sub.id} className="p-3.5 hover:bg-slate-50 transition-colors flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-slate-800">{sub.customerName}</p>
                    <p className="text-[11px] text-slate-500">{sub.planName} • Renewal {sub.currentPeriodEnd}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-slate-900">${sub.amount}</span>
                    <span className="block text-[10px] text-emerald-600 font-medium">Auto-renew</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-3.5 border-t border-slate-100 bg-slate-50/50">
            <button
              onClick={() => navigate('/subscriptions')}
              className="w-full text-center text-xs font-medium text-blue-600 hover:text-blue-700 flex items-center justify-center space-x-1"
            >
              <span>Manage all active subscriptions</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

