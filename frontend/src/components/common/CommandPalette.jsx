import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  LayoutDashboard,
  Users,
  Repeat,
  FileText,
  CreditCard,
  ShieldAlert,
  Bot,
  Settings,
  ArrowRight,
  Package,
  Layers,
  Tag
} from 'lucide-react';
import { useData } from '../../context/DataContext';

export const CommandPalette = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const { customers, invoices, subscriptions } = useData();
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else setQuery('');
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const quickPages = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Customers', path: '/customers', icon: Users },
    { name: 'Products', path: '/products', icon: Package },
    { name: 'Subscription Plans', path: '/plans', icon: Layers },
    { name: 'Subscriptions', path: '/subscriptions', icon: Repeat },
    { name: 'Invoices', path: '/invoices', icon: FileText },
    { name: 'Payments', path: '/payments', icon: CreditCard },
    { name: 'Discounts & Coupons', path: '/discounts', icon: Tag },
    { name: 'Revenue Protection Radar', path: '/revenue-protection', icon: ShieldAlert },
    { name: 'AI Business Assistant', path: '/ai-assistant', icon: Bot },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  const filteredPages = quickPages.filter(p =>
    p.name.toLowerCase().includes(query.toLowerCase())
  );

  const matchedCustomers = query
    ? customers.filter(c =>
        c.name.toLowerCase().includes(query.toLowerCase()) ||
        c.email.toLowerCase().includes(query.toLowerCase()) ||
        c.company.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 4)
    : [];

  const matchedInvoices = query
    ? invoices.filter(i =>
        i.invoiceNumber.toLowerCase().includes(query.toLowerCase()) ||
        i.customerName.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 3)
    : [];

  const handleSelect = (path) => {
    navigate(path);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto p-4 sm:p-6 md:p-20">
      <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity" onClick={onClose} />

      <div className="relative mx-auto max-w-xl transform rounded-xl bg-white shadow-2xl ring-1 ring-black/5 transition-all overflow-hidden border border-slate-200">
        <div className="flex items-center px-4 border-b border-slate-100">
          <Search className="w-5 h-5 text-slate-400 mr-3" />
          <input
            type="text"
            className="h-12 w-full border-0 bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
            placeholder="Type a command, search customer, invoice..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono text-slate-500 bg-slate-100 rounded border border-slate-200">
            ESC
          </kbd>
        </div>

        <div className="max-h-80 overflow-y-auto p-2 space-y-3">
          {/* Matched Customers */}
          {matchedCustomers.length > 0 && (
            <div>
              <div className="px-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Customers
              </div>
              {matchedCustomers.map(c => (
                <button
                  key={c.id}
                  onClick={() => handleSelect(`/customers?search=${encodeURIComponent(c.name)}`)}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-left text-xs hover:bg-slate-50 transition-colors group"
                >
                  <div className="flex items-center space-x-2.5">
                    <Users className="w-4 h-4 text-slate-400 group-hover:text-blue-600" />
                    <div>
                      <p className="font-medium text-slate-800">{c.name}</p>
                      <p className="text-[11px] text-slate-400">{c.email} • {c.plan}</p>
                    </div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-600" />
                </button>
              ))}
            </div>
          )}

          {/* Matched Invoices */}
          {matchedInvoices.length > 0 && (
            <div>
              <div className="px-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Invoices
              </div>
              {matchedInvoices.map(inv => (
                <button
                  key={inv.id}
                  onClick={() => handleSelect('/invoices')}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-left text-xs hover:bg-slate-50 transition-colors group"
                >
                  <div className="flex items-center space-x-2.5">
                    <FileText className="w-4 h-4 text-slate-400 group-hover:text-blue-600" />
                    <div>
                      <p className="font-medium text-slate-800">{inv.invoiceNumber} - ${inv.amount.toFixed(2)}</p>
                      <p className="text-[11px] text-slate-400">{inv.customerName} • {inv.status}</p>
                    </div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-600" />
                </button>
              ))}
            </div>
          )}

          {/* Pages */}
          <div>
            <div className="px-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
              Navigation
            </div>
            {filteredPages.map(page => (
              <button
                key={page.path}
                onClick={() => handleSelect(page.path)}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-left text-xs hover:bg-blue-50/70 hover:text-blue-900 transition-colors group"
              >
                <div className="flex items-center space-x-2.5">
                  <page.icon className="w-4 h-4 text-slate-400 group-hover:text-blue-600" />
                  <span className="font-medium text-slate-700 group-hover:text-slate-900">{page.name}</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-blue-600" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

