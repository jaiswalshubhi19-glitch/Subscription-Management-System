import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Plus,
  MoreVertical,
  Mail,
  Building,
  CreditCard,
  Edit2,
  Trash2,
  Eye,
  ArrowUpDown,
  Download,
  AlertTriangle,
  UserCheck
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { Pagination } from '../components/common/Pagination';
import { EmptyState } from '../components/common/EmptyState';

export const Customers = () => {
  const { customers, plans, addCustomer, updateCustomer, deleteCustomer } = useData();

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortField, setSortField] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [viewingCustomer, setViewingCustomer] = useState(null);
  const [deletingCustomer, setDeletingCustomer] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    contactName: '',
    email: '',
    company: '',
    plan: 'Growth Pro',
    planId: 'plan_growth',
    mrr: 450,
    status: 'active',
    billingCycle: 'monthly',
    country: 'US'
  });

  // Filtered & Sorted Customers
  const filteredCustomers = useMemo(() => {
    return customers.filter((c) => {
      const matchesSearch =
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.company.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'all' || c.status === statusFilter;

      return matchesSearch && matchesStatus;
    }).sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];
      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }
      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [customers, searchTerm, statusFilter, sortField, sortOrder]);

  const totalPages = Math.ceil(filteredCustomers.length / pageSize);
  const paginatedCustomers = filteredCustomers.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const handleOpenAdd = () => {
    setFormData({
      name: '',
      contactName: '',
      email: '',
      company: '',
      plan: 'Growth Pro',
      planId: 'plan_growth',
      mrr: 450,
      status: 'active',
      billingCycle: 'monthly',
      country: 'US'
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (customer) => {
    setEditingCustomer(customer);
    setFormData({
      name: customer.name,
      contactName: customer.contactName,
      email: customer.email,
      company: customer.company,
      plan: customer.plan,
      planId: customer.planId,
      mrr: customer.mrr,
      status: customer.status,
      billingCycle: customer.billingCycle,
      country: customer.country
    });
  };

  const handleSaveAdd = (e) => {
    e.preventDefault();
    addCustomer(formData);
    setIsAddModalOpen(false);
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (editingCustomer) {
      updateCustomer(editingCustomer.id, formData);
      setEditingCustomer(null);
    }
  };

  const confirmDelete = () => {
    if (deletingCustomer) {
      deleteCustomer(deletingCustomer.id);
      setDeletingCustomer(null);
    }
  };

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Customer Directory</h1>
          <p className="text-xs text-slate-500 mt-1">
            Accounts, subscribed plans, MRR contribution, and billing statuses.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="secondary"
            size="sm"
            icon={Download}
            onClick={() => window.print()}
          >
            Export CSV
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={Plus}
            onClick={handleOpenAdd}
          >
            Add Customer
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by company, contact or email..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600"
          />
        </div>

        {/* Filter Badges & Status */}
        <div className="flex items-center space-x-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <span className="text-xs font-medium text-slate-500 flex items-center mr-1">
            <Filter className="w-3.5 h-3.5 mr-1" />
            Status:
          </span>
          {['all', 'active', 'past_due', 'trialing', 'canceled'].map((st) => (
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

      {/* Customers Data Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        {filteredCustomers.length === 0 ? (
          <EmptyState
            title="No matching customers"
            description="Adjust your search criteria or clear status filters to view customer accounts."
            actionLabel="Reset Filters"
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
                  <th
                    className="px-4 py-3 cursor-pointer hover:text-slate-800 select-none"
                    onClick={() => handleSort('name')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Customer / Company</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                  <th className="px-4 py-3">Plan & Tier</th>
                  <th
                    className="px-4 py-3 cursor-pointer hover:text-slate-800 select-none"
                    onClick={() => handleSort('mrr')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>MRR Contribution</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                  <th className="px-4 py-3">Payment Instrument</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Risk Assessment</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {paginatedCustomers.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-3">
                        <img
                          src={c.avatar || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face"}
                          alt={c.name}
                          className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-200"
                        />
                        <div>
                          <p className="font-semibold text-slate-900">{c.name}</p>
                          <p className="text-[11px] text-slate-400">{c.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-800">
                      {c.plan}
                      <span className="block text-[10px] text-slate-400 capitalize">{c.billingCycle}</span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-900">
                      ${c.mrr.toLocaleString()}
                      <span className="text-[10px] text-slate-400 font-normal"> /mo</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-1.5 text-slate-600">
                        <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                        <span className="text-xs">{c.paymentMethod?.brand} •••• {c.paymentMethod?.last4}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge status={c.status} />
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        status={c.riskScore === 'high' ? 'critical' : c.riskScore === 'medium' ? 'high' : 'low'}
                        label={`${c.riskScore || 'low'} risk`}
                      />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end space-x-1">
                        <button
                          onClick={() => setViewingCustomer(c)}
                          className="p-1 rounded text-slate-400 hover:text-blue-600 hover:bg-slate-100 transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(c)}
                          className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                          title="Edit Customer"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeletingCustomer(c)}
                          className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Delete Customer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalItems={filteredCustomers.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* Add Customer Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Customer"
        subtitle="Provision an enterprise account with immediate subscription entitlements."
      >
        <form onSubmit={handleSaveAdd} className="space-y-3.5 text-xs">
          <div>
            <label className="block font-medium text-slate-700 mb-1">Company / Organization Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value, company: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600"
              placeholder="e.g. Supabase Infrastructure"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Primary Contact Name *</label>
              <input
                type="text"
                required
                value={formData.contactName}
                onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600"
                placeholder="Jane Doe"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Billing Email *</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600"
                placeholder="billing@company.com"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Plan Subscription</label>
              <select
                value={formData.plan}
                onChange={(e) => {
                  const selected = plans.find(p => p.name === e.target.value);
                  setFormData({
                    ...formData,
                    plan: e.target.value,
                    planId: selected ? selected.id : 'plan_growth',
                    mrr: selected ? selected.price : 450
                  });
                }}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-blue-600"
              >
                {plans.map(p => (
                  <option key={p.id} value={p.name}>{p.name} (${p.price}/mo)</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Billing Cadence</label>
              <select
                value={formData.billingCycle}
                onChange={(e) => setFormData({ ...formData, billingCycle: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-blue-600"
              >
                <option value="monthly">Monthly</option>
                <option value="annual">Annual (Prepaid)</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
            <Button variant="secondary" size="sm" type="button" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Create Customer
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Customer Modal */}
      <Modal
        isOpen={!!editingCustomer}
        onClose={() => setEditingCustomer(null)}
        title="Edit Customer Profile"
        subtitle={`Update account profile and billing configurations for ${editingCustomer?.name}`}
      >
        <form onSubmit={handleSaveEdit} className="space-y-3.5 text-xs">
          <div>
            <label className="block font-medium text-slate-700 mb-1">Company Name</label>
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
              <label className="block font-medium text-slate-700 mb-1">Contact Name</label>
              <input
                type="text"
                required
                value={formData.contactName}
                onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Billing Email</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-blue-600"
              >
                <option value="active">Active</option>
                <option value="past_due">Past Due</option>
                <option value="trialing">Trialing</option>
                <option value="canceled">Canceled</option>
              </select>
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Monthly MRR ($)</label>
              <input
                type="number"
                value={formData.mrr}
                onChange={(e) => setFormData({ ...formData, mrr: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
            <Button variant="secondary" size="sm" type="button" onClick={() => setEditingCustomer(null)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>

      {/* Customer Detail Drawer / Modal */}
      <Modal
        isOpen={!!viewingCustomer}
        onClose={() => setViewingCustomer(null)}
        title="Customer Record"
        subtitle={viewingCustomer?.id}
      >
        {viewingCustomer && (
          <div className="space-y-4 text-xs">
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 flex items-center space-x-3">
              <img
                src={viewingCustomer.avatar || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face"}
                alt={viewingCustomer.name}
                className="w-12 h-12 rounded-full ring-2 ring-slate-300"
              />
              <div>
                <h4 className="text-sm font-bold text-slate-900">{viewingCustomer.name}</h4>
                <p className="text-slate-500">{viewingCustomer.email}</p>
                <div className="flex items-center space-x-2 mt-1">
                  <Badge status={viewingCustomer.status} />
                  <span className="text-slate-400">• Joined {viewingCustomer.joinedDate}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-slate-700">
              <div className="p-3 bg-white border border-slate-200 rounded-lg">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Subscription Plan</span>
                <span className="text-sm font-semibold text-slate-900">{viewingCustomer.plan}</span>
                <span className="text-slate-500 block text-[11px] capitalize">{viewingCustomer.billingCycle} billing</span>
              </div>
              <div className="p-3 bg-white border border-slate-200 rounded-lg">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Monthly Recurring Value</span>
                <span className="text-sm font-bold text-emerald-700">${viewingCustomer.mrr} / mo</span>
                <span className="text-slate-500 block text-[11px]">${viewingCustomer.mrr * 12} Annual Run Rate</span>
              </div>
            </div>

            <div className="p-3 bg-white border border-slate-200 rounded-lg">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block mb-1.5">Payment Instrument</span>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CreditCard className="w-4 h-4 text-slate-500" />
                  <span className="font-medium text-slate-800">{viewingCustomer.paymentMethod?.brand} ending in {viewingCustomer.paymentMethod?.last4}</span>
                </div>
                <span className="text-slate-500 text-[11px]">Exp: {viewingCustomer.paymentMethod?.expiry}</span>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button variant="secondary" size="sm" onClick={() => setViewingCustomer(null)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deletingCustomer}
        onClose={() => setDeletingCustomer(null)}
        title="Confirm Account Deletion"
        subtitle="This action is permanent and will void future billings."
      >
        <div className="space-y-4 text-xs">
          <p className="text-slate-600">
            Are you sure you want to delete customer account <span className="font-semibold text-slate-900">{deletingCustomer?.name}</span>? All associated subscription tokens will be revoked.
          </p>
          <div className="flex justify-end space-x-2">
            <Button variant="secondary" size="sm" onClick={() => setDeletingCustomer(null)}>
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

