import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  Building,
  Shield,
  Key,
  Users,
  Bell,
  Copy,
  RefreshCw,
  Plus,
  Check,
  Lock,
  Globe,
  Sliders
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { useToast } from '../context/ToastContext';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { Badge } from '../components/common/Badge';

export const Settings = () => {
  const { settings, updateSettings } = useData();
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState('general');
  const [formData, setFormData] = useState({ ...settings });
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('Billing Ops');

  const [teamMembers, setTeamMembers] = useState([
    { name: 'Alex Vance', email: 'alex.vance@subscriptiq.io', role: 'Owner', status: 'active' },
    { name: 'Marcus Sterling', email: 'marcus@subscriptiq.io', role: 'Finance Director', status: 'active' },
    { name: 'Sarah Jenkins', email: 'sarah.j@subscriptiq.io', role: 'Billing Ops', status: 'active' },
    { name: 'Elena Rostova', email: 'elena.r@subscriptiq.io', role: 'Viewer', status: 'active' }
  ]);

  const handleCopyKey = (keyText, label) => {
    navigator.clipboard?.writeText(keyText);
    addToast({
      title: 'Copied',
      message: `${label} copied to clipboard.`,
      type: 'info'
    });
  };

  const handleRotateKey = (keyField) => {
    const newKey = `siq_${keyField.includes('live') ? 'live' : 'test'}_${Math.random().toString(36).substring(2, 14)}`;
    setFormData(prev => ({ ...prev, [keyField]: newKey }));
    updateSettings({ [keyField]: newKey });
    addToast({
      title: 'API Key Rotated',
      message: 'New credentials generated. Update your server environment.',
      type: 'warning'
    });
  };

  const handleTestWebhook = () => {
    addToast({
      title: 'Webhook Ping Sent',
      message: `200 OK received from ${formData.webhookEndpoint}`,
      type: 'success'
    });
  };

  const handleSaveGeneral = (e) => {
    e.preventDefault();
    updateSettings(formData);
  };

  const handleInviteSubmit = (e) => {
    e.preventDefault();
    if (inviteEmail) {
      setTeamMembers(prev => [
        ...prev,
        {
          name: inviteEmail.split('@')[0],
          email: inviteEmail,
          role: inviteRole,
          status: 'invited'
        }
      ]);
      addToast({
        title: 'Invitation Sent',
        message: `Workspace invite dispatched to ${inviteEmail}.`,
        type: 'success'
      });
      setIsInviteModalOpen(false);
      setInviteEmail('');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">Workspace Settings</h1>
        <p className="text-xs text-slate-500 mt-1">
          Configure financial organization details, dunning schedules, API access, and access control.
        </p>
      </div>

      {/* Tabs */}
      <div className="bg-white p-1 rounded-xl border border-slate-200 shadow-2xs flex items-center space-x-1 overflow-x-auto text-xs">
        <button
          onClick={() => setActiveTab('general')}
          className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg font-medium transition-all ${
            activeTab === 'general' ? 'bg-[#172554] text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Building className="w-3.5 h-3.5" />
          <span>Organization Profile</span>
        </button>
        <button
          onClick={() => setActiveTab('dunning')}
          className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg font-medium transition-all ${
            activeTab === 'dunning' ? 'bg-[#172554] text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Shield className="w-3.5 h-3.5" />
          <span>Revenue Shield & Dunning</span>
        </button>
        <button
          onClick={() => setActiveTab('api')}
          className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg font-medium transition-all ${
            activeTab === 'api' ? 'bg-[#172554] text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Key className="w-3.5 h-3.5" />
          <span>API Keys & Webhooks</span>
        </button>
        <button
          onClick={() => setActiveTab('team')}
          className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg font-medium transition-all ${
            activeTab === 'team' ? 'bg-[#172554] text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Team Members & RBAC</span>
        </button>
      </div>

      {/* Tab 1: Organization Profile */}
      {activeTab === 'general' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-6 space-y-6">
          <form onSubmit={handleSaveGeneral} className="space-y-4 text-xs max-w-2xl">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 mb-0.5">Commercial Profile</h3>
              <p className="text-slate-500 mb-4">Official legal company information appearing on invoice headers and receipts.</p>
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Company Legal Name</label>
              <input
                type="text"
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Billing Support Email</label>
                <input
                  type="email"
                  value={formData.billingEmail}
                  onChange={(e) => setFormData({ ...formData, billingEmail: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">Tax ID / VAT Registration</label>
                <input
                  type="text"
                  value={formData.taxId}
                  onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Billing Currency</label>
                <select
                  value={formData.currency}
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-blue-600"
                >
                  <option value="USD">USD ($) - United States Dollar</option>
                  <option value="EUR">EUR (€) - Euro</option>
                  <option value="GBP">GBP (£) - British Pound</option>
                </select>
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">Accounting Timezone</label>
                <select
                  value={formData.timezone}
                  onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-blue-600"
                >
                  <option value="UTC-05:00 (Eastern Time)">UTC-05:00 (Eastern Time)</option>
                  <option value="UTC-08:00 (Pacific Time)">UTC-08:00 (Pacific Time)</option>
                  <option value="UTC+00:00 (London, GMT)">UTC+00:00 (London, GMT)</option>
                  <option value="UTC+01:00 (Berlin, CET)">UTC+01:00 (Berlin, CET)</option>
                </select>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <Button variant="primary" size="sm" type="submit">
                Save Organization Settings
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Tab 2: Revenue Shield & Dunning */}
      {activeTab === 'dunning' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-6 space-y-6">
          <form onSubmit={handleSaveGeneral} className="space-y-4 text-xs max-w-2xl">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 mb-0.5">Automated Dunning Heuristics</h3>
              <p className="text-slate-500 mb-4">Control how aggressively SubscriptIQ attempts to recover failed card payments before subscription cancellation.</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Max Retry Attempts</label>
                <input
                  type="number"
                  value={formData.dunningMaxRetries}
                  onChange={(e) => setFormData({ ...formData, dunningMaxRetries: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">Default: 4 retry attempts</span>
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">Retry Interval (Days)</label>
                <input
                  type="number"
                  value={formData.dunningIntervalDays}
                  onChange={(e) => setFormData({ ...formData, dunningIntervalDays: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">Days between smart retry attempts</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Auto-Cancel Grace Period (Days)</label>
                <input
                  type="number"
                  value={formData.autoCancelAfterDays}
                  onChange={(e) => setFormData({ ...formData, autoCancelAfterDays: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">Days past due before canceling service</span>
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">Pre-Expiry Notification (Days)</label>
                <input
                  type="number"
                  value={formData.preExpiryNotificationDays}
                  onChange={(e) => setFormData({ ...formData, preExpiryNotificationDays: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">Alert customer before card expires</span>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <Button variant="primary" size="sm" type="submit">
                Update Dunning Configurations
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Tab 3: API Keys & Webhooks */}
      {activeTab === 'api' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-6 space-y-6">
          <div className="max-w-2xl space-y-5 text-xs">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 mb-0.5">Developer Keys & Webhooks</h3>
              <p className="text-slate-500 mb-4">Authenticate your application backend or SDK with SubscriptIQ REST endpoints.</p>
            </div>

            {/* Live Key */}
            <div>
              <label className="block font-medium text-slate-700 mb-1">Live Secret API Key</label>
              <div className="flex items-center space-x-2">
                <input
                  type="password"
                  readOnly
                  value={formData.liveApiKey}
                  className="flex-1 px-3 py-2 border border-slate-300 rounded-lg font-mono bg-slate-50 text-slate-700 text-xs"
                />
                <Button
                  variant="outline"
                  size="sm"
                  icon={Copy}
                  onClick={() => handleCopyKey(formData.liveApiKey, 'Live Key')}
                >
                  Copy
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  icon={RefreshCw}
                  onClick={() => handleRotateKey('liveApiKey')}
                >
                  Rotate
                </Button>
              </div>
            </div>

            {/* Test Key */}
            <div>
              <label className="block font-medium text-slate-700 mb-1">Sandbox Test API Key</label>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  readOnly
                  value={formData.testApiKey}
                  className="flex-1 px-3 py-2 border border-slate-300 rounded-lg font-mono bg-slate-50 text-slate-700 text-xs"
                />
                <Button
                  variant="outline"
                  size="sm"
                  icon={Copy}
                  onClick={() => handleCopyKey(formData.testApiKey, 'Test Key')}
                >
                  Copy
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  icon={RefreshCw}
                  onClick={() => handleRotateKey('testApiKey')}
                >
                  Rotate
                </Button>
              </div>
            </div>

            {/* Webhook Endpoint */}
            <div className="pt-4 border-t border-slate-100">
              <label className="block font-medium text-slate-700 mb-1">Webhook Endpoint URL</label>
              <div className="flex items-center space-x-2">
                <input
                  type="url"
                  value={formData.webhookEndpoint}
                  onChange={(e) => setFormData({ ...formData, webhookEndpoint: e.target.value })}
                  className="flex-1 px-3 py-2 border border-slate-300 rounded-lg font-mono text-xs focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleTestWebhook}
                >
                  Test Ping
                </Button>
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">SubscriptIQ dispatches `invoice.payment_failed`, `subscription.canceled`, and `dunning.recovered` events to this endpoint.</span>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Team Members & RBAC */}
      {activeTab === 'team' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Workspace Collaborators</h3>
              <p className="text-xs text-slate-500 mt-0.5">Manage permissions and role assignments across your billing team.</p>
            </div>
            <Button
              variant="primary"
              size="sm"
              icon={Plus}
              onClick={() => setIsInviteModalOpen(true)}
            >
              Invite Teammate
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold text-[10px]">
                <tr>
                  <th className="px-4 py-3">User</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {teamMembers.map((member, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3">
                      <div>
                        <span className="font-semibold text-slate-900 block">{member.name}</span>
                        <span className="text-[11px] text-slate-400">{member.email}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-800">
                      {member.role}
                    </td>
                    <td className="px-4 py-3">
                      <Badge status={member.status === 'active' ? 'paid' : 'pending'} label={member.status} />
                    </td>
                    <td className="px-4 py-3 text-right text-slate-400">
                      {member.role !== 'Owner' && (
                        <button
                          onClick={() => {
                            setTeamMembers(prev => prev.filter((_, i) => i !== idx));
                            addToast({ title: 'Access Revoked', message: 'Team member removed.', type: 'info' });
                          }}
                          className="text-xs text-rose-600 hover:text-rose-700 font-medium"
                        >
                          Revoke
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Invite Modal */}
      <Modal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        title="Invite Team Collaborator"
        subtitle="Grant financial access to your SubscriptIQ workspace."
      >
        <form onSubmit={handleInviteSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="block font-medium text-slate-700 mb-1">Teammate Work Email *</label>
            <input
              type="email"
              required
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600"
              placeholder="colleague@subscriptiq.io"
            />
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Role Assignment</label>
            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-blue-600"
            >
              <option value="Administrator">Administrator (Full Access)</option>
              <option value="Finance Director">Finance Director (Billing & Invoicing)</option>
              <option value="Billing Ops">Billing Ops (Recoveries & Dunning)</option>
              <option value="Viewer">Viewer (Read-only)</option>
            </select>
          </div>

          <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
            <Button variant="secondary" size="sm" type="button" onClick={() => setIsInviteModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Send Invite
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

