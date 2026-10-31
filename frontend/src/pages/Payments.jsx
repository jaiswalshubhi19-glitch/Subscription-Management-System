import React, { useState } from 'react';
import {
  CreditCard,
  RefreshCw,
  Search,
  CheckCircle2,
  AlertCircle,
  Clock,
  RotateCcw,
  Eye,
  Filter,
  DollarSign,
  ArrowRight
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { Pagination } from '../components/common/Pagination';
import { EmptyState } from '../components/common/EmptyState';

export const Payments = () => {
  const { payments, retryPayment, refundPayment } = useData();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  // Modals
  const [retryingPayment, setRetryingPayment] = useState(null);
  const [refundingPayment, setRefundingPayment] = useState(null);
  const [viewingPayment, setViewingPayment] = useState(null);
  const [refundReason, setRefundReason] = useState('Requested by customer');

  const filteredPayments = payments.filter(p => {
    const matchesSearch =
      p.transactionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const paginatedPayments = filteredPayments.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleConfirmRetry = () => {
    if (retryingPayment) {
      retryPayment(retryingPayment.id);
      setRetryingPayment(null);
    }
  };

  const handleConfirmRefund = () => {
    if (refundingPayment) {
      refundPayment(refundingPayment.id, refundingPayment.amount);
      setRefundingPayment(null);
    }
  };

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Payment Transactions</h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time gateway settlements, authorization attempts, chargebacks, and dunning retries.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search txn ID, customer, invoice..."
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
          {['all', 'succeeded', 'failed', 'pending', 'refunded'].map((st) => (
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

      {/* Payments Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        {filteredPayments.length === 0 ? (
          <EmptyState
            icon={CreditCard}
            title="No transactions found"
            description="No gateway payment records match your filters."
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
                  <th className="px-4 py-3">Transaction ID</th>
                  <th className="px-4 py-3">Customer / Invoice</th>
                  <th className="px-4 py-3">Payment Method</th>
                  <th className="px-4 py-3">Amount & Net</th>
                  <th className="px-4 py-3">Status & Decline Code</th>
                  <th className="px-4 py-3">Date (UTC)</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {paginatedPayments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3 font-mono font-medium text-slate-800">
                      {p.transactionId}
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <span className="font-semibold text-slate-900 block">{p.customerName}</span>
                        <span className="text-[11px] text-slate-400 font-mono">{p.invoiceNumber}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {p.method}
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-bold text-slate-900 block">${p.amount.toFixed(2)}</span>
                      {p.fee > 0 && (
                        <span className="text-[10px] text-slate-400 font-normal">Fee: ${p.fee.toFixed(2)}</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Badge status={p.status} />
                      {p.failureReason && (
                        <span className="block text-[10px] text-rose-600 mt-0.5 truncate max-w-xs font-mono">
                          {p.failureReason}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-[11px]">
                      {p.date}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        <button
                          onClick={() => setViewingPayment(p)}
                          className="p-1 rounded text-slate-400 hover:text-blue-600 hover:bg-slate-100 transition-colors"
                          title="View Gateway Payload"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {p.status === 'failed' && (
                          <button
                            onClick={() => setRetryingPayment(p)}
                            className="inline-flex items-center space-x-1 px-2 py-1 rounded bg-blue-50 text-blue-700 hover:bg-blue-100 text-[11px] font-semibold transition-colors"
                            title="Retry Charge"
                          >
                            <RefreshCw className="w-3 h-3" />
                            <span>Retry Charge</span>
                          </button>
                        )}

                        {p.status === 'succeeded' && (
                          <button
                            onClick={() => setRefundingPayment(p)}
                            className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Issue Refund"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
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
          totalItems={filteredPayments.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* Gateway Payload View Modal */}
      <Modal
        isOpen={!!viewingPayment}
        onClose={() => setViewingPayment(null)}
        title="Gateway Settlement Payload"
        subtitle={viewingPayment?.transactionId}
      >
        {viewingPayment && (
          <div className="space-y-4 text-xs font-mono">
            <div className="bg-slate-900 text-slate-200 p-4 rounded-lg overflow-x-auto text-[11px]">
              <pre>{JSON.stringify(viewingPayment, null, 2)}</pre>
            </div>
            <div className="flex justify-end">
              <Button variant="secondary" size="sm" onClick={() => setViewingPayment(null)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Retry Modal */}
      <Modal
        isOpen={!!retryingPayment}
        onClose={() => setRetryingPayment(null)}
        title="Retry Payment Charge"
        subtitle="Invoke payment gateway retry protocol."
      >
        <div className="space-y-4 text-xs">
          <p className="text-slate-600">
            Are you sure you want to re-execute authorization for <span className="font-semibold text-slate-900">{retryingPayment?.customerName}</span> ({retryingPayment?.method}) in the amount of <span className="font-bold text-slate-900">${retryingPayment?.amount.toFixed(2)}</span>?
          </p>
          <div className="flex justify-end space-x-2">
            <Button variant="secondary" size="sm" onClick={() => setRetryingPayment(null)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleConfirmRetry}>
              Execute Retry
            </Button>
          </div>
        </div>
      </Modal>

      {/* Refund Modal */}
      <Modal
        isOpen={!!refundingPayment}
        onClose={() => setRefundingPayment(null)}
        title="Issue Customer Refund"
        subtitle="Reverse authorized funds back to origin payment method."
      >
        <div className="space-y-4 text-xs">
          <p className="text-slate-600">
            You are about to issue a full refund of <span className="font-bold text-slate-900">${refundingPayment?.amount.toFixed(2)}</span> to <span className="font-semibold text-slate-900">{refundingPayment?.customerName}</span>.
          </p>
          <div>
            <label className="block font-medium text-slate-700 mb-1">Reason for refund</label>
            <select
              value={refundReason}
              onChange={(e) => setRefundReason(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-blue-600"
            >
              <option value="Customer request">Customer cancellation request within grace window</option>
              <option value="Duplicate charge">Accidental duplicate charge</option>
              <option value="Fraudulent">Suspected unauthorized transaction</option>
            </select>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="secondary" size="sm" onClick={() => setRefundingPayment(null)}>
              Cancel
            </Button>
            <Button variant="danger" size="sm" onClick={handleConfirmRefund}>
              Confirm Full Refund
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

