import React, { useState } from 'react';
import {
  Repeat,
  Plus,
  Search,
  Filter,
  Play,
  Pause,
  XCircle,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowRight
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { Pagination } from '../components/common/Pagination';
import { EmptyState } from '../components/common/EmptyState';

export const Subscriptions = () => {
  const {
    subscriptions,
    customers,
    plans,
    addSubscription,
    cancelSubscription,
    pauseSubscription,
    resumeSubscription
  } = useData();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  // New Subscription Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedSub, setSelectedSub] = useState(null);

  const [formData, setFormData] = useState({
    customerId: '',
    planId: ''
  });

  const filteredSubs = subscriptions.filter(sub => {
    const matchesSearch =
      sub.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.planName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || sub.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const paginatedSubs = filteredSubs.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleOpenAdd = () => {
    setFormData({
      customerId: customers[0]?.id || '',
      planId: plans[0]?.id || ''
    });
    setIsAddModalOpen(true);
  };

  const handleSaveAdd = (e) => {
    e.preventDefault();
    if (formData.customerId && formData.planId) {
      addSubscription(formData);
      setIsAddModalOpen(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Active Subscriptions</h1>
          <p className="text-xs text-slate-500 mt-1">
            Contract lifecycles, billing renewals, pause states, and churn prevention.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="primary"
            size="sm"
            icon={Plus}
            onClick={handleOpenAdd}
          >
            Create Subscription
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search subscriptions by customer or plan..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600"
          />
        </div>

        {/* Status Filters */}
        <div className="flex items-center space-x-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          {['all', 'active', 'past_due', 'trialing', 'paused', 'canceled'].map((st) => (
            <button
              key={st}
              onClick={() => {
                setStatusFilter(st);
                setCurrentPage(1);
              }}
              className={`px-2.5 py-1 text-xs font-medium rounded-lg capitalize transition-colors ${
                statusFilter === st
                  ? 'bg-[#172554] text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Subscriptions Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        {filteredSubs.length === 0 ? (
          <EmptyState
            icon={Repeat}
            title="No subscriptions found"
            description="No active or past contracts match your current filter selection."
            actionLabel="Reset Search"
            onAction={() => {
              setSearchTerm('');
              setStatusFilter('all');
            }}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/90 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold text-[10px]">
                <tr>
                  <th className="px-4 py-3">Subscription / Customer</th>
                  <th className="px-4 py-3">Plan Tier</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Current Period</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Lifecycle Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {paginatedSubs.map((sub) => (
                  <tr key={sub.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3">
                      <div>
                        <span className="font-semibold text-slate-900 block">{sub.customerName}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{sub.id} • {sub.customerEmail}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-800">
                      {sub.planName}
                      <span className="block text-[10px] text-slate-400 capitalize">{sub.billingInterval}</span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-900">
                      ${sub.amount.toLocaleString()}
                      <span className="text-[10px] text-slate-400 font-normal"> /cycle</span>
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-[11px]">
                      {sub.currentPeriodStart} <span className="text-slate-300">→</span> {sub.currentPeriodEnd}
                    </td>
                    <td className="px-4 py-3">
                      <Badge status={sub.status} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        {sub.status === 'paused' ? (
                          <button
                            onClick={() => resumeSubscription(sub.id)}
                            className="inline-flex items-center space-x-1 px-2 py-1 rounded bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-[11px] font-medium transition-colors"
                            title="Resume billing"
                          >
                            <Play className="w-3 h-3" />
                            <span>Resume</span>
                          </button>
                        ) : sub.status === 'active' || sub.status === 'past_due' ? (
                          <button
                            onClick={() => pauseSubscription(sub.id)}
                            className="inline-flex items-center space-x-1 px-2 py-1 rounded bg-slate-100 text-slate-600 hover:bg-slate-200 text-[11px] font-medium transition-colors"
                            title="Pause billing"
                          >
                            <Pause className="w-3 h-3" />
                            <span>Pause</span>
                          </button>
                        ) : null}

                        {sub.status !== 'canceled' && (
                          <button
                            onClick={() => cancelSubscription(sub.id)}
                            className="inline-flex items-center space-x-1 px-2 py-1 rounded bg-rose-50 text-rose-700 hover:bg-rose-100 text-[11px] font-medium transition-colors"
                            title="Cancel subscription"
                          >
                            <XCircle className="w-3 h-3" />
                            <span>Cancel</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <Pagination
          currentPage={currentPage}
          totalItems={filteredSubs.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* New Subscription Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Provision New Subscription"
        subtitle="Attach a recurring product tier to an enterprise account."
      >
        <form onSubmit={handleSaveAdd} className="space-y-4 text-xs">
          <div>
            <label className="block font-medium text-slate-700 mb-1">Select Customer Account *</label>
            <select
              value={formData.customerId}
              onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-blue-600"
              required
            >
              <option value="">-- Choose Customer --</option>
              {customers.map(c => (
                <option key={c.id} value={c.id}>{c.name} ({c.email})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Select Pricing Plan *</label>
            <select
              value={formData.planId}
              onChange={(e) => setFormData({ ...formData, planId: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-blue-600"
              required
            >
              <option value="">-- Choose Plan --</option>
              {plans.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} - ${p.price}/{p.billingInterval}
                </option>
              ))}
            </select>
          </div>

          <div className="p-3 bg-blue-50/60 rounded-lg border border-blue-100 text-[11px] text-blue-900 leading-relaxed">
            Provisioning a subscription automatically activates customer entitlements and dispatches the initial invoice receipt with payment synchronization.
          </div>

          <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
            <Button variant="secondary" size="sm" type="button" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Activate Subscription
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

