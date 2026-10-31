import React, { useState } from 'react';
import {
  FileText,
  Plus,
  Search,
  Download,
  Send,
  CheckCircle2,
  XCircle,
  Eye,
  Filter,
  DollarSign,
  Printer
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { Pagination } from '../components/common/Pagination';
import { EmptyState } from '../components/common/EmptyState';

export const Invoices = () => {
  const {
    invoices,
    customers,
    createInvoice,
    markInvoicePaid,
    voidInvoice,
    sendInvoiceReminder
  } = useData();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [previewingInvoice, setPreviewingInvoice] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    customerId: '',
    amount: 500,
    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    itemDescription: 'Enterprise Platform Custom Addon & Usage'
  });

  const filteredInvoices = invoices.filter(inv => {
    const matchesSearch =
      inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.customerEmail.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || inv.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const paginatedInvoices = filteredInvoices.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleOpenCreate = () => {
    setFormData({
      customerId: customers[0]?.id || '',
      amount: 450,
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      itemDescription: 'Growth Pro Subscription & Professional Services'
    });
    setIsCreateModalOpen(true);
  };

  const handleSaveCreate = (e) => {
    e.preventDefault();
    const customer = customers.find(c => c.id === formData.customerId);
    createInvoice({
      customerId: formData.customerId,
      customerName: customer ? customer.name : 'Unknown Customer',
      customerEmail: customer ? customer.email : 'billing@company.com',
      amount: Number(formData.amount),
      dueDate: formData.dueDate,
      lineItems: [
        {
          description: formData.itemDescription,
          qty: 1,
          unitPrice: Number(formData.amount),
          total: Number(formData.amount)
        }
      ]
    });
    setIsCreateModalOpen(false);
  };

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Invoices & Billing Statements</h1>
          <p className="text-xs text-slate-500 mt-1">
            Track receivables, overdue dunning cycles, and customer statement history.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="primary"
            size="sm"
            icon={Plus}
            onClick={handleOpenCreate}
          >
            Create Invoice
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search invoice #, customer name, email..."
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
          {['all', 'paid', 'open', 'overdue', 'void'].map((st) => (
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
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        {filteredInvoices.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No invoices found"
            description="No billing statements match your current search or status criteria."
            actionLabel="Reset Filter"
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
                  <th className="px-4 py-3">Invoice Number</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Issue Date</th>
                  <th className="px-4 py-3">Due Date</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {paginatedInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3">
                      <span className="font-mono font-semibold text-slate-900">{inv.invoiceNumber}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <span className="font-semibold text-slate-900 block">{inv.customerName}</span>
                        <span className="text-[11px] text-slate-400">{inv.customerEmail}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-bold text-slate-900">
                      ${inv.amount.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-slate-500">{inv.issueDate}</td>
                    <td className="px-4 py-3">
                      <span className={inv.status === 'overdue' ? 'text-rose-600 font-semibold' : 'text-slate-500'}>
                        {inv.dueDate}
                      </span>
                      {inv.daysOverdue && (
                        <span className="block text-[10px] text-rose-500 font-medium">({inv.daysOverdue}d overdue)</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Badge status={inv.status} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        <button
                          onClick={() => setPreviewingInvoice(inv)}
                          className="p-1 rounded text-slate-400 hover:text-blue-600 hover:bg-slate-100 transition-colors"
                          title="Preview PDF"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {inv.status === 'overdue' || inv.status === 'open' ? (
                          <>
                            <button
                              onClick={() => sendInvoiceReminder(inv.invoiceNumber, inv.customerEmail)}
                              className="p-1 rounded text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                              title="Send Reminder"
                            >
                              <Send className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => markInvoicePaid(inv.id)}
                              className="p-1 rounded text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                              title="Mark as Paid"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </button>
                          </>
                        ) : null}

                        {inv.status !== 'void' && inv.status !== 'paid' && (
                          <button
                            onClick={() => voidInvoice(inv.id)}
                            className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                            title="Void Invoice"
                          >
                            <XCircle className="w-4 h-4" />
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
          totalItems={filteredInvoices.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* Invoice PDF Preview Modal */}
      <Modal
        isOpen={!!previewingInvoice}
        onClose={() => setPreviewingInvoice(null)}
        maxWidth="max-w-2xl"
        title="Commercial Billing Statement"
        subtitle={previewingInvoice?.invoiceNumber}
        footer={
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="xs"
              icon={Printer}
              onClick={() => window.print()}
            >
              Print Receipt
            </Button>
            <Button
              variant="secondary"
              size="xs"
              onClick={() => setPreviewingInvoice(null)}
            >
              Close
            </Button>
          </div>
        }
      >
        {previewingInvoice && (
          <div className="bg-white p-6 rounded-lg border border-slate-200 text-xs font-sans space-y-6">
            {/* Invoice Top Header */}
            <div className="flex justify-between items-start pb-5 border-b border-slate-200">
              <div>
                <span className="font-bold text-lg text-slate-900 tracking-tight block">
                  Subscript<span className="text-blue-600">IQ</span>
                </span>
                <p className="text-[11px] text-slate-500 mt-0.5">SubscriptIQ Cloud Platform Inc.</p>
                <p className="text-[11px] text-slate-400">100 Montgomery St, Suite 1400</p>
                <p className="text-[11px] text-slate-400">San Francisco, CA 94104</p>
              </div>
              <div className="text-right">
                <span className="text-base font-bold text-slate-900 block font-mono">{previewingInvoice.invoiceNumber}</span>
                <div className="mt-1">
                  <Badge status={previewingInvoice.status} />
                </div>
              </div>
            </div>

            {/* Billed To / Dates */}
            <div className="grid grid-cols-2 gap-4 pb-4 border-b border-slate-100">
              <div>
                <span className="text-[10px] uppercase font-semibold text-slate-400 block mb-1">Billed To</span>
                <p className="font-bold text-slate-900">{previewingInvoice.customerName}</p>
                <p className="text-slate-500">{previewingInvoice.customerEmail}</p>
              </div>
              <div className="text-right space-y-1">
                <div>
                  <span className="text-slate-400 text-[11px]">Issue Date: </span>
                  <span className="font-medium text-slate-800">{previewingInvoice.issueDate}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[11px]">Payment Due: </span>
                  <span className="font-semibold text-slate-900">{previewingInvoice.dueDate}</span>
                </div>
              </div>
            </div>

            {/* Line Items */}
            <div>
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-[10px] uppercase text-slate-500 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-2 px-3">Description</th>
                    <th className="py-2 px-3 text-center">Qty</th>
                    <th className="py-2 px-3 text-right">Price</th>
                    <th className="py-2 px-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(previewingInvoice.lineItems || []).map((item, idx) => (
                    <tr key={idx}>
                      <td className="py-3 px-3 font-medium text-slate-800">{item.description}</td>
                      <td className="py-3 px-3 text-center text-slate-500">{item.qty}</td>
                      <td className="py-3 px-3 text-right text-slate-600">${item.unitPrice.toFixed(2)}</td>
                      <td className="py-3 px-3 text-right font-semibold text-slate-900">${item.total.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="mt-4 pt-3 border-t border-slate-200 flex justify-end">
                <div className="w-48 space-y-1.5 text-right text-xs">
                  <div className="flex justify-between text-slate-500">
                    <span>Subtotal:</span>
                    <span>${previewingInvoice.amount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Tax (0%):</span>
                    <span>$0.00</span>
                  </div>
                  <div className="flex justify-between font-bold text-slate-900 text-sm pt-1 border-t border-slate-200">
                    <span>Total Due:</span>
                    <span>${previewingInvoice.amount.toFixed(2)} USD</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Create Manual Invoice Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Issue Manual Invoice"
        subtitle="Create an out-of-band billing statement or custom services charge."
      >
        <form onSubmit={handleSaveCreate} className="space-y-3.5 text-xs">
          <div>
            <label className="block font-medium text-slate-700 mb-1">Customer *</label>
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

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Amount ($) *</label>
              <input
                type="number"
                step="0.01"
                required
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Due Date *</label>
              <input
                type="date"
                required
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600"
              />
            </div>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Line Item Description *</label>
            <input
              type="text"
              required
              value={formData.itemDescription}
              onChange={(e) => setFormData({ ...formData, itemDescription: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
            <Button variant="secondary" size="sm" type="button" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Dispatch Invoice
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

