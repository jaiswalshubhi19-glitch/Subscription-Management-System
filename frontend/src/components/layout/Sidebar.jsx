import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Package,
  Layers,
  Repeat,
  FileText,
  CreditCard,
  Tag,
  BarChart3,
  ShieldAlert,
  Bot,
  Settings,
  ShieldCheck,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useData } from '../../context/DataContext';

export const Sidebar = ({ isCollapsed, setIsCollapsed, isMobileOpen, setIsMobileOpen }) => {
  const { alerts } = useData();
  const activeAlertsCount = alerts.filter(a => a.recoveryStatus !== 'resolved').length;

  const navSections = [
    {
      title: "Core",
      items: [
        { name: "Overview", path: "/dashboard", icon: LayoutDashboard },
        { name: "Customers", path: "/customers", icon: Users },
      ]
    },
    {
      title: "Catalog",
      items: [
        { name: "Products", path: "/products", icon: Package },
        { name: "Subscription Plans", path: "/plans", icon: Layers },
      ]
    },
    {
      title: "Billing & Revenue",
      items: [
        { name: "Subscriptions", path: "/subscriptions", icon: Repeat },
        { name: "Invoices", path: "/invoices", icon: FileText },
        { name: "Payments", path: "/payments", icon: CreditCard },
        { name: "Discounts", path: "/discounts", icon: Tag },
      ]
    },
    {
      title: "Intelligence",
      items: [
        { name: "Revenue Analytics", path: "/analytics", icon: BarChart3 },
        {
          name: "Revenue Protection",
          path: "/revenue-protection",
          icon: ShieldAlert,
          badge: activeAlertsCount > 0 ? activeAlertsCount : null,
          badgeColor: "bg-rose-500 text-white"
        },
        { name: "AI Assistant", path: "/ai-assistant", icon: Bot, isSpecial: true },
      ]
    },
    {
      title: "Configuration",
      items: [
        { name: "Settings", path: "/settings", icon: Settings },
      ]
    }
  ];

  const handleLinkClick = () => {
    if (setIsMobileOpen) setIsMobileOpen(false);
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 bg-[#172554] text-slate-300 flex flex-col transition-all duration-200 border-r border-slate-800 ${
          isCollapsed ? 'w-18' : 'w-64'
        } ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800/80 bg-[#0F172A]/40">
          <div className="flex items-center space-x-3 overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0 text-white shadow-sm font-semibold text-lg tracking-wider">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            {!isCollapsed && (
              <div className="leading-tight">
                <span className="font-bold text-white text-base tracking-tight">Subscript<span className="text-blue-400">IQ</span></span>
                <span className="block text-[10px] uppercase font-semibold text-slate-400 tracking-wider">Revenue Platform</span>
              </div>
            )}
          </div>

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex items-center justify-center w-6 h-6 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation items */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {navSections.map((section, idx) => (
            <div key={idx} className="space-y-1">
              {!isCollapsed && (
                <div className="px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5 select-none">
                  {section.title}
                </div>
              )}
              {section.items.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={handleLinkClick}
                  className={({ isActive }) =>
                    `group flex items-center px-3 py-2 text-xs font-medium rounded-lg transition-all ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-sm font-semibold'
                        : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                    } ${isCollapsed ? 'justify-center' : 'justify-between'}`
                  }
                  title={isCollapsed ? item.name : undefined}
                >
                  <div className="flex items-center space-x-3">
                    <item.icon className={`w-4 h-4 flex-shrink-0 transition-colors`} />
                    {!isCollapsed && <span className="truncate">{item.name}</span>}
                  </div>
                  {!isCollapsed && item.badge && (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${item.badgeColor || 'bg-slate-700 text-slate-200'}`}>
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              ))}
            </div>
          ))}
        </div>

        {/* Footer info */}
        {!isCollapsed && (
          <div className="p-3 border-t border-slate-800/80 bg-[#0F172A]/30">
            <div className="flex items-center justify-between text-[11px] text-slate-400 px-2">
              <span className="flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Gateway Live</span>
              </span>
              <span className="text-slate-400 font-mono">v2.4-ent</span>
            </div>
          </div>
        )}
      </aside>
    </>
  );
};

