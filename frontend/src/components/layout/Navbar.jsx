import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Menu,
  Search,
  Bell,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  LogOut,
  User,
  Sliders,
  ExternalLink,
  ShieldAlert
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';

export const Navbar = ({ onOpenMobileMenu, onOpenSearch }) => {
  const { user, logout, switchEnvironment } = useData ? { ...useAuth(), ...useData() } : useAuth();
  const { alerts } = useData();
  const navigate = useNavigate();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const activeAlerts = alerts.filter(a => a.recoveryStatus !== 'resolved');

  return (
    <header className="h-16 bg-white border-b border-slate-200/90 sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6">
      {/* Left side: Mobile hamburger & Global quick search */}
      <div className="flex items-center space-x-3">
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Search trigger */}
        <button
          onClick={onOpenSearch}
          className="flex items-center space-x-2.5 px-3 py-1.5 bg-slate-100/80 hover:bg-slate-100 text-slate-500 rounded-lg text-xs font-medium border border-slate-200/60 transition-colors w-48 sm:w-72 justify-between"
        >
          <div className="flex items-center space-x-2 truncate">
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <span className="truncate">Search customers, invoices, plans...</span>
          </div>
          <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono text-slate-500 bg-white border border-slate-200 rounded shadow-2xs">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right side: Environment, Notifications, User */}
      <div className="flex items-center space-x-2.5 sm:space-x-3.5">
        {/* Environment toggle badge */}
        <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs font-medium">
          <button
            onClick={() => switchEnvironment('production')}
            className={`px-2.5 py-1 rounded-md transition-all ${
              user?.environment === 'production'
                ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Live
          </button>
          <button
            onClick={() => switchEnvironment('sandbox')}
            className={`px-2.5 py-1 rounded-md transition-all ${
              user?.environment === 'sandbox'
                ? 'bg-amber-100 text-amber-800 shadow-2xs font-semibold'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Sandbox
          </button>
        </div>

        {/* Notifications Popover */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowUserMenu(false);
            }}
            className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 relative transition-colors"
            title="Revenue Protection Alerts"
          >
            <Bell className="w-4 h-4" />
            {activeAlerts.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-1">
              <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <ShieldAlert className="w-4 h-4 text-rose-600" />
                  <span className="text-xs font-semibold text-slate-900">Revenue Protection Alerts</span>
                </div>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold bg-rose-100 text-rose-700">
                  {activeAlerts.length} Active
                </span>
              </div>
              <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                {activeAlerts.length === 0 ? (
                  <div className="py-6 text-center text-xs text-slate-500">
                    <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto mb-1" />
                    All revenue risks normalized.
                  </div>
                ) : (
                  activeAlerts.slice(0, 4).map((alert) => (
                    <div
                      key={alert.id}
                      onClick={() => {
                        setShowNotifications(false);
                        navigate('/revenue-protection');
                      }}
                      className="p-3 hover:bg-slate-50 cursor-pointer transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <span className="text-xs font-semibold text-slate-800">{alert.customerName}</span>
                        <span className="text-xs font-bold text-rose-600">${alert.amountAtRisk.toLocaleString()}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">{alert.reason}</p>
                    </div>
                  ))
                )}
              </div>
              <div className="p-2 border-t border-slate-100 bg-slate-50 text-center">
                <button
                  onClick={() => {
                    setShowNotifications(false);
                    navigate('/revenue-protection');
                  }}
                  className="text-xs font-medium text-blue-600 hover:text-blue-700 flex items-center justify-center space-x-1 mx-auto"
                >
                  <span>Open Revenue Protection Radar</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User profile menu */}
        <div className="relative">
          <button
            onClick={() => {
              setShowUserMenu(!showUserMenu);
              setShowNotifications(false);
            }}
            className="flex items-center space-x-2.5 p-1 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <img
              src={user?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face"}
              alt="User Avatar"
              className="w-7 h-7 rounded-full object-cover ring-1 ring-slate-300"
            />
            <div className="hidden sm:block text-left leading-tight">
              <span className="text-xs font-semibold text-slate-800 block">{user?.name || "Alex Vance"}</span>
              <span className="text-[10px] text-slate-500 block">{user?.role || "Finance Ops"}</span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in slide-in-from-top-1">
              <div className="px-3.5 py-2 border-b border-slate-100">
                <p className="text-xs font-semibold text-slate-900">{user?.name}</p>
                <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
              </div>
              <button
                onClick={() => {
                  setShowUserMenu(false);
                  navigate('/settings');
                }}
                className="w-full text-left px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center space-x-2"
              >
                <Sliders className="w-3.5 h-3.5 text-slate-400" />
                <span>Workspace Settings</span>
              </button>
              <div className="my-1 border-t border-slate-100" />
              <button
                onClick={() => {
                  setShowUserMenu(false);
                  logout();
                  navigate('/login');
                }}
                className="w-full text-left px-3.5 py-2 text-xs text-rose-600 hover:bg-rose-50 flex items-center space-x-2"
              >
                <LogOut className="w-3.5 h-3.5 text-rose-500" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

