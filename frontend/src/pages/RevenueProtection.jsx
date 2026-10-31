import React, { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Clock,
  RefreshCw,
  Send,
  CheckCircle2,
  Filter,
  DollarSign,
  ArrowRight,
  Zap,
  Info,
  CreditCard,
  FileText,
  UserX
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';

export const RevenueProtection = () => {
  const { alerts, totalRevenueAtRisk, resolveAlert, triggerSmartRecovery } = useData();

  const [activeTab, setActiveTab] = useState('all');
  const [selectedAlertForAction, setSelectedAlertForAction] = useState(null);
  const [actionType, setActionType] = useState('dunning');

  const filteredAlerts = alerts.filter(a => {
    if (activeTab === 'all') return true;
    if (activeTab === 'overdue') return a.type === 'overdue_invoice';
    if (activeTab === 'failed') return a.type === 'failed_payment';
    if (activeTab === 'cards') return a.type === 'card_expiring';
    if (activeTab === 'duplicate') return a.type === 'duplicate_billing_risk';
    return true;
  });

  const activeCount = alerts.filter(a => a.recoveryStatus !== 'resolved').length;
  const resolvedCount = alerts.filter(a => a.recoveryStatus === 'resolved').length;

  const handleOpenAction = (alert, type) => {
    setSelectedAlertForAction(alert);
    setActionType(type);
  };

  const handleExecuteAction = () => {
    if (selectedAlertForAction) {
      const actionName =
        actionType === 'retry'
          ? 'Smart ML-Based Gateway Retry'
          : actionType === 'dunning'
          ? 'Automated Executive Dunning Email & SMS Sequence'
          : actionType === 'portal'
          ? 'Customer Self-Serve Card Refresh Link'
          : 'Idempotency Charge Quarantine Verification';

      triggerSmartRecovery(selectedAlertForAction.id, actionName);
      setSelectedAlertForAction(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Revenue Protection Radar</h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
              Shield Engine
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Automated dunning heuristics, involuntary churn mitigation, and payment decline recovery.
          </p>
        </div>
      </div>

      {/* Hero Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Estimated Capital at Risk */}
        <div className="bg-gradient-to-br from-rose-50 to-white p-4 rounded-xl border border-rose-200/90 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold text-rose-700 uppercase tracking-wider">Revenue at Risk</span>
            <ShieldAlert className="w-4 h-4 text-rose-600" />
          </div>
          <div className="mt-2.5">
            <span className="text-2xl font-extrabold text-slate-900 tracking-tight">
              ${totalRevenueAtRisk.toLocaleString()}
            </span>
          </div>
          <div className="mt-1 text-[11px] text-rose-700 font-medium">
            Across {activeCount} active risk alerts
          </div>
        </div>

        {/* Projected Recovery Rate */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Avg Recovery Rate</span>
            <Zap className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2.5">
            <span className="text-2xl font-bold text-slate-900 tracking-tight">
              74.2%
            </span>
          </div>
          <div className="mt-1 text-[11px] text-emerald-600 font-medium">
            Recovered within 72 hours
          </div>
        </div>

        {/* Active Protection Rules */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Automated Sequences</span>
            <RefreshCw className="w-4 h-4 text-blue-600" />
          </div>
          <div className="mt-2.5">
            <span className="text-2xl font-bold text-slate-900 tracking-tight">
              4 Cadences
            </span>
          </div>
          <div className="mt-1 text-[11px] text-slate-500 font-medium">
            Smart Retry, Email, SMS, Portal
          </div>
        </div>

        {/* Resolved This Cycle */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Normalized Items</span>
            <ShieldCheck className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="mt-2.5">
            <span className="text-2xl font-bold text-slate-900 tracking-tight">
              {resolvedCount} Resolved
            </span>
          </div>
          <div className="mt-1 text-[11px] text-indigo-600 font-medium">
            Protected $14,800 this quarter
          </div>
        </div>
      </div>

      {/* Info notice about sample simulation */}
      <div className="p-3.5 bg-blue-50/70 border border-blue-200/80 rounded-xl flex items-start space-x-3 text-xs text-blue-900">
        <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong className="font-semibold">Simulated Protection Engine:</strong> This interface demonstrates SubscriptIQ’s intelligent revenue protection workflow. Actions taken update live state, recalculate capital at risk, and generate simulated recovery sequences for demonstrations and reviews.
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white p-1 rounded-xl border border-slate-200 shadow-2xs flex items-center space-x-1 overflow-x-auto text-xs">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
            activeTab === 'all' ? 'bg-[#172554] text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          All Risk Items ({alerts.length})
        </button>
        <button
          onClick={() => setActiveTab('overdue')}
          className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
            activeTab === 'overdue' ? 'bg-[#172554] text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Overdue Invoices
        </button>
        <button
          onClick={() => setActiveTab('failed')}
          className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
            activeTab === 'failed' ? 'bg-[#172554] text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Declined Payments
        </button>
        <button
          onClick={() => setActiveTab('cards')}
          className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
            activeTab === 'cards' ? 'bg-[#172554] text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Expiring Payment Methods
        </button>
        <button
          onClick={() => setActiveTab('duplicate')}
          className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
            activeTab === 'duplicate' ? 'bg-[#172554] text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Duplicate Billing Safeguards
        </button>
      </div>

      {/* Risk Items List */}
      <div className="space-y-3.5">
        {filteredAlerts.map((alert) => {
          const isResolved = alert.recoveryStatus === 'resolved';
          return (
            <div
              key={alert.id}
              className={`bg-white rounded-xl border transition-all p-5 shadow-2xs ${
                isResolved
                  ? 'border-slate-200 opacity-60 bg-slate-50/50'
                  : alert.severity === 'critical'
                  ? 'border-rose-300 ring-1 ring-rose-100'
                  : 'border-slate-200'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                {/* Left details */}
                <div className="space-y-2 flex-1">
                  <div className="flex items-center space-x-2.5">
                    <Badge
                      status={alert.severity}
                      label={`${alert.severity} priority`}
                    />
                    <Badge
                      status={alert.recoveryStatus === 'resolved' ? 'paid' : alert.recoveryStatus === 'action_needed' ? 'overdue' : 'pending'}
                      label={alert.recoveryStatus.replace(/_/g, ' ')}
                    />
                    <span className="text-[11px] text-slate-400">Detected: {alert.detectedAt}</span>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{alert.title}</h3>
                    <p className="text-xs text-slate-600 font-medium mt-0.5">
                      Customer: <span className="text-slate-900">{alert.customerName}</span> ({alert.customerEmail})
                    </p>
                  </div>

                  {/* Diagnosis description */}
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80 text-xs text-slate-700">
                    <span className="font-semibold text-slate-900 block mb-0.5">Diagnosis:</span>
                    {alert.reason}
                  </div>

                  {/* Recommended Action */}
                  <div className="flex items-center space-x-2 text-xs text-blue-900 font-medium">
                    <Zap className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                    <span>Recommended Protocol: {alert.recommendedAction}</span>
                  </div>
                </div>

                {/* Right Action Box */}
                <div className="md:w-60 flex flex-col justify-between items-start md:items-end border-t md:border-t-0 md:border-l border-slate-100 pt-3 md:pt-0 md:pl-5 space-y-3">
                  <div className="md:text-right">
                    <span className="text-[10px] uppercase font-semibold text-slate-400 block">At-Risk Capital</span>
                    <span className="text-xl font-bold text-slate-900 block">
                      ${alert.amountAtRisk.toLocaleString()}
                    </span>
                    {alert.daysOverdue > 0 && (
                      <span className="text-[11px] text-rose-600 font-medium">{alert.daysOverdue} days past due</span>
                    )}
                  </div>

                  <div className="w-full space-y-1.5">
                    {!isResolved ? (
                      <>
                        {alert.type === 'failed_payment' ? (
                          <Button
                            variant="accent"
                            size="sm"
                            className="w-full text-xs font-semibold"
                            icon={RefreshCw}
                            onClick={() => handleOpenAction(alert, 'retry')}
                          >
                            Execute Smart Retry
                          </Button>
                        ) : alert.type === 'overdue_invoice' ? (
                          <Button
                            variant="primary"
                            size="sm"
                            className="w-full text-xs font-semibold bg-[#172554]"
                            icon={Send}
                            onClick={() => handleOpenAction(alert, 'dunning')}
                          >
                            Send Dunning Notice
                          </Button>
                        ) : alert.type === 'card_expiring' ? (
                          <Button
                            variant="primary"
                            size="sm"
                            className="w-full text-xs font-semibold bg-[#172554]"
                            icon={CreditCard}
                            onClick={() => handleOpenAction(alert, 'portal')}
                          >
                            Deploy Card Portal
                          </Button>
                        ) : (
                          <Button
                            variant="secondary"
                            size="sm"
                            className="w-full text-xs"
                            onClick={() => handleOpenAction(alert, 'quarantine')}
                          >
                            Review Duplicate
                          </Button>
                        )}

                        <Button
                          variant="ghost"
                          size="xs"
                          className="w-full text-slate-500 hover:text-slate-800 text-[11px]"
                          onClick={() => resolveAlert(alert.id)}
                        >
                          Mark as Resolved
                        </Button>
                      </>
                    ) : (
                      <div className="flex items-center space-x-1.5 text-xs text-emerald-700 font-medium py-1">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Risk Normalized</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Action Execution Confirmation Modal */}
      <Modal
        isOpen={!!selectedAlertForAction}
        onClose={() => setSelectedAlertForAction(null)}
        title="Execute Automated Recovery Workflow"
        subtitle={selectedAlertForAction?.customerName}
      >
        <div className="space-y-4 text-xs">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <span className="font-semibold text-slate-900 block mb-1">Target Account:</span>
            <p className="text-slate-700">{selectedAlertForAction?.customerName} • ${selectedAlertForAction?.amountAtRisk.toLocaleString()} at risk</p>
            <p className="text-slate-500 text-[11px] mt-1">{selectedAlertForAction?.reason}</p>
          </div>

          <p className="text-slate-600 leading-relaxed">
            Executing this workflow will initiate the configured dunning schedule, send multi-channel notifications (email, in-app portal banner, SMS link), and apply intelligent card retry heuristics.
          </p>

          <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
            <Button variant="secondary" size="sm" onClick={() => setSelectedAlertForAction(null)}>
              Cancel
            </Button>
            <Button variant="accent" size="sm" onClick={handleExecuteAction}>
              Confirm & Launch
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

