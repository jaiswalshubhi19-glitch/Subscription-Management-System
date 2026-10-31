import React, { useState } from 'react';
import {
  Tag,
  Plus,
  Search,
  Copy,
  Trash2,
  CheckCircle2,
  Clock,
  Percent,
  DollarSign
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { useToast } from '../context/ToastContext';
import { EmptyState } from '../components/common/EmptyState';

export const Discounts = () => {
  const { discounts, addDiscount, deleteDiscount } = useData();
  const { addToast } = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [deletingDiscount, setDeletingDiscount] = useState(null);

  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discountType: 'percentage',
    value: 20,
    duration: 'repeating',
    durationInMonths: 3,
    maxRedemptions: 50,
    validUntil: '2026-12-31'
  });

  const filteredDiscounts = discounts.filter(d =>
    d.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCopyCode = (code) => {
    navigator.clipboard?.writeText(code);
    addToast({
      title: 'Code Copied',
      message: `Coupon code ${code} copied to clipboard.`,
      type: 'info'
    });
  };

  const handleOpenAdd = () => {
    setFormData({
      code: '',
      description: '',
      discountType: 'percentage',
      value: 20,
      duration: 'repeating',
      durationInMonths: 3,
      maxRedemptions: 50,
      validUntil: '2026-12-31'
    });
    setIsAddModalOpen(true);
  };

  const handleSaveAdd = (e) => {
    e.preventDefault();
    addDiscount(formData);
    setIsAddModalOpen(false);
  };

  const confirmDelete = () => {
    if (deletingDiscount) {
      deleteDiscount(deletingDiscount.id);
      setDeletingDiscount(null);
    }
  };

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Discounts & Promotion Coupons</h1>
          <p className="text-xs text-slate-500 mt-1">
            Incentivize annual upgrades, customer retention offers, and campaign voucher codes.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="primary"
            size="sm"
            icon={Plus}
            onClick={handleOpenAdd}
          >
            Create Coupon
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search coupon code or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600"
          />
        </div>
        <span className="text-xs text-slate-500 font-medium">
          {filteredDiscounts.length} Active Codes
        </span>
      </div>

      {/* Discounts Grid */}
      {filteredDiscounts.length === 0 ? (
        <EmptyState
          icon={Tag}
          title="No discount codes found"
          description="Create coupon codes to offer price deductions on new subscriptions."
          actionLabel="Create Coupon"
          onAction={handleOpenAdd}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDiscounts.map((disc) => (
            <div
              key={disc.id}
              className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5 flex flex-col justify-between hover:shadow-sm transition-shadow"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-sm font-bold bg-slate-100 text-slate-900 px-2.5 py-1 rounded-md border border-slate-200">
                      {disc.code}
                    </span>
                    <button
                      onClick={() => handleCopyCode(disc.code)}
                      className="p-1 text-slate-400 hover:text-slate-600 transition-colors"
                      title="Copy promo code"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <Badge status={disc.status} />
                </div>

                <div className="mt-4 flex items-baseline space-x-1">
                  <span className="text-2xl font-bold text-slate-900">
                    {disc.discountType === 'percentage' ? `${disc.value}% OFF` : `$${disc.value} OFF`}
                  </span>
                  <span className="text-xs text-slate-500 capitalize">
                    • {disc.duration === 'repeating' ? `${disc.durationInMonths} months` : disc.duration}
                  </span>
                </div>

                <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                  {disc.description}
                </p>

                {/* Progress / Redemptions */}
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <div className="flex justify-between text-[11px] text-slate-500 mb-1">
                    <span>Redemptions</span>
                    <span className="font-semibold text-slate-800">
                      {disc.timesRedeemed} / {disc.maxRedemptions ? disc.maxRedemptions : '∞'}
                    </span>
                  </div>
                  {disc.maxRedemptions && (
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-blue-600 h-full rounded-full transition-all"
                        style={{ width: `${Math.min(100, (disc.timesRedeemed / disc.maxRedemptions) * 100)}%` }}
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-400 text-[11px]">
                  {disc.validUntil ? `Expires ${disc.validUntil}` : 'No expiration date'}
                </span>
                <button
                  onClick={() => setDeletingDiscount(disc)}
                  className="text-slate-400 hover:text-rose-600 p-1 transition-colors"
                  title="Retire coupon"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Discount Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Create Promotional Coupon"
        subtitle="Configure coupon code, deduction percentage, and duration rules."
      >
        <form onSubmit={handleSaveAdd} className="space-y-3.5 text-xs">
          <div>
            <label className="block font-medium text-slate-700 mb-1">Coupon Code *</label>
            <input
              type="text"
              required
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600 font-mono"
              placeholder="e.g. Q4ENTERPRISE"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Discount Type</label>
              <select
                value={formData.discountType}
                onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-blue-600"
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed_amount">Fixed Amount ($)</option>
              </select>
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Deduction Value *</label>
              <input
                type="number"
                required
                value={formData.value}
                onChange={(e) => setFormData({ ...formData, value: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Duration</label>
              <select
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-blue-600"
              >
                <option value="once">Once (Single invoice)</option>
                <option value="repeating">Repeating (X months)</option>
                <option value="forever">Forever (Lifetime)</option>
              </select>
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Max Redemptions</label>
              <input
                type="number"
                value={formData.maxRedemptions || ''}
                onChange={(e) => setFormData({ ...formData, maxRedemptions: Number(e.target.value) || null })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600"
                placeholder="Leave blank for unlimited"
              />
            </div>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Description</label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600"
              placeholder="Internal campaign description or customer reason..."
            />
          </div>

          <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
            <Button variant="secondary" size="sm" type="button" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Activate Coupon
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deletingDiscount}
        onClose={() => setDeletingDiscount(null)}
        title="Retire Coupon"
        subtitle="Confirm decommissioning promo code."
      >
        <div className="space-y-4 text-xs">
          <p className="text-slate-600">
            Are you sure you want to retire coupon code <span className="font-mono font-bold text-slate-900">{deletingDiscount?.code}</span>? Existing subscriptions with this discount applied will continue until renewed.
          </p>
          <div className="flex justify-end space-x-2">
            <Button variant="secondary" size="sm" onClick={() => setDeletingDiscount(null)}>
              Cancel
            </Button>
            <Button variant="danger" size="sm" onClick={confirmDelete}>
              Retire Coupon
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

