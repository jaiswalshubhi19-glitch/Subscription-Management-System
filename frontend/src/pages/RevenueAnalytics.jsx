import React, { useState } from 'react';
import {
  TrendingUp,
  DollarSign,
  Users,
  Repeat,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  PieChart as PieIcon,
  Download,
  Filter
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
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { useData } from '../context/DataContext';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { subscriptionPlanDistribution } from '../data/mockData';

export const RevenueAnalytics = () => {
  const { mrr, totalRevenue, totalCustomersCount, activeSubscriptionsCount, revenueTrends } = useData();

  const [timeRange, setTimeRange] = useState('12m');

  const arr = mrr * 12;
  const arpu = totalCustomersCount ? Math.round(mrr / totalCustomersCount) : 0;
  const ltv = arpu * 28; // Estimated LTV calculation based on 28-month retention average
  const grossChurnRate = 1.8;
  const netExpansionMrr = 3850;

  // Cohort data sample
  const cohorts = [
    { cohort: 'May 2026', size: 33, m1: '100%', m2: '96%', m3: '94%', m4: '92%', m5: '92%' },
    { cohort: 'Jun 2026', size: 38, m1: '100%', m2: '97%', m3: '95%', m4: '93%', m5: '-' },
    { cohort: 'Jul 2026', size: 30, m1: '100%', m2: '94%', m3: '91%', m4: '-', m5: '-' },
    { cohort: 'Aug 2026', size: 34, m1: '100%', m2: '97%', m3: '-', m4: '-', m5: '-' },
    { cohort: 'Sep 2026', size: 37, m1: '100%', m2: '-', m3: '-', m4: '-', m5: '-' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Revenue Analytics & Unit Economics</h1>
          <p className="text-xs text-slate-500 mt-1">
            SaaS recurring performance, cohort retention curves, and revenue growth trajectory.
          </p>
        </div>
        <div className="flex items-center space-x-2.5">
          <Button
            variant="secondary"
            size="sm"
            icon={Download}
            onClick={() => window.print()}
          >
            Export Financial Models
          </Button>
        </div>
      </div>

      {/* 6 High Impact Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5">
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Current MRR</span>
          <span className="text-xl font-bold text-slate-900 mt-1 block">${mrr.toLocaleString()}</span>
          <span className="text-[11px] text-emerald-600 font-medium flex items-center mt-1">
            <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
            +12.4% MoM
          </span>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Annual Run Rate</span>
          <span className="text-xl font-bold text-slate-900 mt-1 block">${arr.toLocaleString()}</span>
          <span className="text-[11px] text-slate-500 font-medium mt-1 block">Projected 12m billings</span>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">ARPU (Per User)</span>
          <span className="text-xl font-bold text-slate-900 mt-1 block">${arpu} <span className="text-xs font-normal text-slate-400">/mo</span></span>
          <span className="text-[11px] text-emerald-600 font-medium flex items-center mt-1">
            <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
            +4.2% expansion
          </span>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Gross Churn Rate</span>
          <span className="text-xl font-bold text-emerald-700 mt-1 block">{grossChurnRate}%</span>
          <span className="text-[11px] text-emerald-600 font-medium mt-1 block">Healthy (Target &lt; 2.5%)</span>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Net Expansion MRR</span>
          <span className="text-xl font-bold text-slate-900 mt-1 block">+${netExpansionMrr.toLocaleString()}</span>
          <span className="text-[11px] text-blue-600 font-medium mt-1 block">Upgrade momentum</span>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Estimated LTV</span>
          <span className="text-xl font-bold text-slate-900 mt-1 block">${ltv.toLocaleString()}</span>
          <span className="text-[11px] text-slate-500 font-medium mt-1 block">28-month lifetime avg</span>
        </div>
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* MRR Trajectory Area Chart (2 columns) */}
        <div className="lg:col-span-2 bg-white rounded-xl p-5 border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">MRR Progression & Net Revenue Retention</h3>
              <p className="text-xs text-slate-500 mt-0.5">Monthly compounding SaaS recurring growth in USD</p>
            </div>
            <div className="flex items-center space-x-2 text-xs">
              <span className="flex items-center space-x-1 text-slate-500">
                <span className="w-2.5 h-2.5 rounded-xs bg-[#2563EB]" />
                <span>Gross Billings</span>
              </span>
              <span className="flex items-center space-x-1 text-slate-500">
                <span className="w-2.5 h-2.5 rounded-xs bg-[#172554]" />
                <span>Net MRR</span>
              </span>
            </div>
          </div>

          <div className="h-72 mt-4 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueTrends} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <defs>
                  <linearGradient id="analyticsGross" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="analyticsMrr" x1="0" y1="0" x2="0" y2="1">
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
                <Area type="monotone" dataKey="revenue" stroke="#2563EB" strokeWidth={2} fillOpacity={1} fill="url(#analyticsGross)" name="Gross Billings" />
                <Area type="monotone" dataKey="mrr" stroke="#172554" strokeWidth={2} fillOpacity={1} fill="url(#analyticsMrr)" name="Net MRR" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Plan Volume Distribution (1 column) */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="pb-4 border-b border-slate-100">
              <h3 className="text-sm font-semibold text-slate-900">MRR Contribution by Plan</h3>
              <p className="text-xs text-slate-500 mt-0.5">Recurring revenue share per subscription tier</p>
            </div>

            <div className="h-52 mt-2 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={subscriptionPlanDistribution}
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {subscriptionPlanDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value, name) => [`${value} active accounts`, name]}
                    contentStyle={{ backgroundColor: '#0F172A', borderRadius: '8px', color: '#fff', fontSize: '11px', border: 'none' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Legend Breakdown */}
            <div className="space-y-2 mt-2">
              {subscriptionPlanDistribution.map((plan) => (
                <div key={plan.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-xs flex-shrink-0" style={{ backgroundColor: plan.color }} />
                    <span className="text-slate-700 font-medium">{plan.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-slate-900">${plan.mrrShare.toLocaleString()}</span>
                    <span className="text-slate-400 text-[10px] ml-1">({plan.value} subs)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Cohort Retention Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <h3 className="text-sm font-semibold text-slate-900">Cohort Retention Heatmap</h3>
          <p className="text-xs text-slate-500 mt-0.5">Percentage of customer accounts remaining active over consecutive months</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold text-[10px]">
              <tr>
                <th className="px-4 py-3">Cohort Month</th>
                <th className="px-4 py-3">New Accounts</th>
                <th className="px-4 py-3 text-center">Month 1</th>
                <th className="px-4 py-3 text-center">Month 2</th>
                <th className="px-4 py-3 text-center">Month 3</th>
                <th className="px-4 py-3 text-center">Month 4</th>
                <th className="px-4 py-3 text-center">Month 5</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
              {cohorts.map((c, idx) => (
                <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-4 py-3 font-semibold text-slate-900">{c.cohort}</td>
                  <td className="px-4 py-3 text-slate-600">{c.size} accounts</td>
                  <td className="px-4 py-3 text-center">
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded font-bold">{c.m1}</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    {c.m2 !== '-' ? (
                      <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded font-semibold">{c.m2}</span>
                    ) : <span className="text-slate-300">-</span>}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {c.m3 !== '-' ? (
                      <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded font-semibold">{c.m3}</span>
                    ) : <span className="text-slate-300">-</span>}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {c.m4 !== '-' ? (
                      <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded font-semibold">{c.m4}</span>
                    ) : <span className="text-slate-300">-</span>}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {c.m5 !== '-' ? (
                      <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded font-semibold">{c.m5}</span>
                    ) : <span className="text-slate-300">-</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

