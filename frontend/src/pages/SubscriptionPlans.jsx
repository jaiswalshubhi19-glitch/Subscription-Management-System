import React, { useState } from 'react';
import {
  Layers,
  Plus,
  Check,
  Edit2,
  Trash2,
  DollarSign,
  Repeat,
  Shield,
  Zap,
  Users
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';

export const SubscriptionPlans = () => {
  const { plans, products, addPlan, updatePlan, deletePlan } = useData();

  const [intervalFilter, setIntervalFilter] = useState('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [deletingPlan, setDeletingPlan] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    productId: 'prod_01',
    code: '',
    price: 99,
    billingInterval: 'monthly',
    trialDays: 14,
    currency: 'USD',
    features: ['Feature access', 'Standard reporting']
  });

  const [featureInput, setFeatureInput] = useState('');

  const filteredPlans = plans.filter(p => {
    if (intervalFilter === 'all') return true;
    return p.billingInterval === intervalFilter;
  });

  const handleOpenAdd = () => {
    setFormData({
      name: '',
      productId: products[0]?.id || 'prod_01',
      code: '',
      price: 199,
      billingInterval: 'monthly',
      trialDays: 14,
      currency: 'USD',
      features: ['Full API access', 'Priority support', 'Dunning workflows']
    });
    setFeatureInput('');
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (plan) => {
    setEditingPlan(plan);
    setFormData({
      name: plan.name,
      productId: plan.productId,
      code: plan.code,
      price: plan.price,
      billingInterval: plan.billingInterval,
      trialDays: plan.trialDays,
      currency: plan.currency || 'USD',
      features: plan.features || []
    });
    setFeatureInput('');
  };

  const handleAddFeature = (e) => {
    e.preventDefault();
    if (featureInput.trim()) {
      setFormData({
        ...formData,
        features: [...formData.features, featureInput.trim()]
      });
      setFeatureInput('');
    }
  };

  const handleRemoveFeature = (idx) => {
    setFormData({
      ...formData,
      features: formData.features.filter((_, i) => i !== idx)
    });
  };

  const handleSaveAdd = (e) => {
    e.preventDefault();
    const parentProd = products.find(p => p.id === formData.productId);
    addPlan({
      ...formData,
      productName: parentProd ? parentProd.name : 'SubscriptIQ Core Platform'
    });
    setIsAddModalOpen(false);
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (editingPlan) {
      updatePlan(editingPlan.id, formData);
      setEditingPlan(null);
    }
  };

  const confirmDelete = () => {
    if (deletingPlan) {
      deletePlan(deletingPlan.id);
      setDeletingPlan(null);
    }
  };

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Subscription Plans</h1>
          <p className="text-xs text-slate-500 mt-1">
            Configure pricing tiers, billing cadences, trial periods, and customer entitlements.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {/* Interval Filter Tabs */}
          <div className="flex items-center bg-white p-0.5 rounded-lg border border-slate-200 text-xs shadow-2xs">
            <button
              onClick={() => setIntervalFilter('all')}
              className={`px-3 py-1 rounded-md font-medium transition-colors ${
                intervalFilter === 'all' ? 'bg-[#172554] text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Tiers
            </button>
            <button
              onClick={() => setIntervalFilter('monthly')}
              className={`px-3 py-1 rounded-md font-medium transition-colors ${
                intervalFilter === 'monthly' ? 'bg-[#172554] text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setIntervalFilter('annual')}
              className={`px-3 py-1 rounded-md font-medium transition-colors ${
                intervalFilter === 'annual' ? 'bg-[#172554] text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Annual
            </button>
          </div>

          <Button
            variant="primary"
            size="sm"
            icon={Plus}
            onClick={handleOpenAdd}
          >
            Create Plan
          </Button>
        </div>
      </div>

      {/* Plan Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {filteredPlans.map((plan) => {
          const isEnterprise = plan.name.toLowerCase().includes('enterprise');
          return (
            <div
              key={plan.id}
              className={`bg-white rounded-xl border transition-all flex flex-col justify-between overflow-hidden shadow-2xs hover:shadow-sm ${
                isEnterprise ? 'border-blue-400 ring-1 ring-blue-100' : 'border-slate-200'
              }`}
            >
              <div className="p-5">
                <div className="flex items-start justify-between">
                  <Badge
                    status={plan.status}
                    label={plan.billingInterval}
                  />
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => handleOpenEdit(plan)}
                      className="p-1 text-slate-400 hover:text-slate-700 rounded transition-colors"
                      title="Edit Plan"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeletingPlan(plan)}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                      title="Delete Plan"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h3 className="text-base font-bold text-slate-900 mt-2.5">{plan.name}</h3>
                <p className="text-[11px] text-slate-500 font-medium">{plan.productName}</p>

                <div className="mt-4 flex items-baseline">
                  <span className="text-2xl font-bold text-slate-900 tracking-tight">
                    ${plan.price}
                  </span>
                  <span className="text-xs text-slate-500 ml-1">
                    /{plan.billingInterval === 'annual' ? 'yr' : 'mo'}
                  </span>
                </div>

                <div className="mt-2 text-[11px] text-slate-500">
                  {plan.trialDays > 0 ? `${plan.trialDays}-day free trial included` : 'No trial period'}
                </div>

                {/* Features List */}
                <div className="mt-5 pt-4 border-t border-slate-100 space-y-2">
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                    Entitlements
                  </p>
                  {(plan.features || []).map((feat, idx) => (
                    <div key={idx} className="flex items-start space-x-2 text-xs text-slate-600">
                      <Check className="w-3.5 h-3.5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <span className="leading-tight">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom Footer */}
              <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">
                  {plan.activeSubscribers || 0} active subscribers
                </span>
                <span className="font-semibold text-emerald-700">
                  ${((plan.activeSubscribers || 0) * plan.price).toLocaleString()} /mo
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Plan Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Create Subscription Plan"
        subtitle="Define a recurring price point and feature set."
      >
        <form onSubmit={handleSaveAdd} className="space-y-3.5 text-xs">
          <div>
            <label className="block font-medium text-slate-700 mb-1">Plan Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600"
              placeholder="e.g. Enterprise Tier"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Parent Product</label>
              <select
                value={formData.productId}
                onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-blue-600"
              >
                {products.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Plan Code *</label>
              <input
                type="text"
                required
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600 font-mono"
                placeholder="PLAN-ENT-04"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Price ($) *</label>
              <input
                type="number"
                required
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Billing Interval</label>
              <select
                value={formData.billingInterval}
                onChange={(e) => setFormData({ ...formData, billingInterval: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-blue-600"
              >
                <option value="monthly">Monthly</option>
                <option value="annual">Annual</option>
              </select>
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Trial Days</label>
              <input
                type="number"
                value={formData.trialDays}
                onChange={(e) => setFormData({ ...formData, trialDays: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600"
              />
            </div>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Features & Entitlements</label>
            <div className="flex space-x-2 mb-2">
              <input
                type="text"
                value={featureInput}
                onChange={(e) => setFeatureInput(e.target.value)}
                placeholder="Type a feature and click Add..."
                className="flex-1 px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600"
              />
              <Button size="xs" variant="secondary" onClick={handleAddFeature}>
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-1 bg-slate-50 rounded-lg border border-slate-200">
              {formData.features.map((feat, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center px-2 py-0.5 rounded bg-white border border-slate-200 text-[11px] text-slate-700"
                >
                  {feat}
                  <button
                    type="button"
                    onClick={() => handleRemoveFeature(idx)}
                    className="ml-1.5 text-slate-400 hover:text-rose-600"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
            <Button variant="secondary" size="sm" type="button" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Save Plan
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Plan Modal */}
      <Modal
        isOpen={!!editingPlan}
        onClose={() => setEditingPlan(null)}
        title="Edit Subscription Plan"
        subtitle={`Update configuration for ${editingPlan?.name}`}
      >
        <form onSubmit={handleSaveEdit} className="space-y-3.5 text-xs">
          <div>
            <label className="block font-medium text-slate-700 mb-1">Plan Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Price ($)</label>
              <input
                type="number"
                required
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Trial Days</label>
              <input
                type="number"
                value={formData.trialDays}
                onChange={(e) => setFormData({ ...formData, trialDays: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
            <Button variant="secondary" size="sm" type="button" onClick={() => setEditingPlan(null)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Plan Modal */}
      <Modal
        isOpen={!!deletingPlan}
        onClose={() => setDeletingPlan(null)}
        title="Delete Plan"
        subtitle="Confirm decommissioning this plan tier."
      >
        <div className="space-y-4 text-xs">
          <p className="text-slate-600">
            Are you sure you want to retire <span className="font-semibold text-slate-900">{deletingPlan?.name}</span>? Existing customers subscribed to this tier will keep grandfathered rates.
          </p>
          <div className="flex justify-end space-x-2">
            <Button variant="secondary" size="sm" onClick={() => setDeletingPlan(null)}>
              Cancel
            </Button>
            <Button variant="danger" size="sm" onClick={confirmDelete}>
              Confirm Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

