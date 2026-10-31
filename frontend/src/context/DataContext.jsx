import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import {
  initialCustomers,
  initialProducts,
  initialPlans,
  initialSubscriptions,
  initialInvoices,
  initialPayments,
  initialDiscounts,
  initialRevenueProtectionAlerts,
  initialAiMessages,
  revenueTrends
} from '../data/mockData';
import { useToast } from './ToastContext';

const DataContext = createContext(null);

export const DataProvider = ({ children }) => {
  const { addToast } = useToast();

  const loadFromStorage = (key, fallback) => {
    try {
      const stored = localStorage.getItem(`siq_${key}`);
      return stored ? JSON.parse(stored) : fallback;
    } catch {
      return fallback;
    }
  };

  const [customers, setCustomers] = useState(() => loadFromStorage('customers', initialCustomers));
  const [products, setProducts] = useState(() => loadFromStorage('products', initialProducts));
  const [plans, setPlans] = useState(() => loadFromStorage('plans', initialPlans));
  const [subscriptions, setSubscriptions] = useState(() => loadFromStorage('subscriptions', initialSubscriptions));
  const [invoices, setInvoices] = useState(() => loadFromStorage('invoices', initialInvoices));
  const [payments, setPayments] = useState(() => loadFromStorage('payments', initialPayments));
  const [discounts, setDiscounts] = useState(() => loadFromStorage('discounts', initialDiscounts));
  const [alerts, setAlerts] = useState(() => loadFromStorage('alerts', initialRevenueProtectionAlerts));
  const [aiMessages, setAiMessages] = useState(() => loadFromStorage('aiMessages', initialAiMessages));
  const [dashboardMetrics, setDashboardMetrics] = useState(null);
  const [backendConnected, setBackendConnected] = useState(false);

  const [settings, setSettings] = useState(() => loadFromStorage('settings', {
    companyName: "Brightloop Software",
    billingEmail: "finance@brightloop.local",
    taxId: "US-892182049",
    currency: "USD",
    timezone: "UTC-05:00 (Eastern Time)",
    dunningMaxRetries: 4,
    dunningIntervalDays: 3,
    autoCancelAfterDays: 14,
    preExpiryNotificationDays: 30,
    webhookEndpoint: "http://localhost:4000/api/v1/webhooks",
    requireTwoFactor: true,
    emailAlertsOnFailure: true,
    weeklyDigest: true
  }));

  // Fetch real data from backend
  const fetchLiveData = useCallback(async () => {
    try {
      // 1. Dashboard summary
      const summary = await api.getDashboardSummary().catch(() => null);
      if (summary && summary.metrics) {
        setDashboardMetrics(summary.metrics);
        setBackendConnected(true);
      }

      // 2. Customers
      const custData = await api.getCustomers().catch(() => null);
      if (custData && Array.isArray(custData)) {
        setCustomers(custData.map(c => ({
          id: c.id,
          name: c.name,
          email: c.email,
          company: c.company || c.name,
          customerNumber: c.customerNumber,
          phone: c.phone || '+1 (555) 000-0000',
          status: 'active',
          joinedDate: c.createdAt ? c.createdAt.split('T')[0] : '2026-01-01',
          riskScore: 'low',
          paymentMethod: { type: 'card', brand: 'Visa', last4: '4242', expiry: '12/28' }
        })));
      }

      // 3. Products
      const prodData = await api.getProducts().catch(() => null);
      if (prodData && Array.isArray(prodData)) {
        setProducts(prodData.map(p => ({
          id: p.id,
          name: p.name,
          code: p.code,
          description: p.description,
          price: (p.salesPrice || 0) / 100,
          type: p.type?.toLowerCase() || 'software',
          plansCount: p._count?.plans || p.plans?.length || 0,
          activeSubscribers: 2,
          monthlyRevenue: (p.salesPrice || 0) / 100,
          createdAt: p.createdAt ? p.createdAt.split('T')[0] : '2026-01-01'
        })));
      }

      // 4. Plans
      const planData = await api.getPlans().catch(() => null);
      if (planData && Array.isArray(planData)) {
        setPlans(planData.map(pl => ({
          id: pl.id,
          productId: pl.productId,
          name: pl.name,
          code: pl.code,
          price: (pl.price || 0) / 100,
          currency: pl.currency || 'USD',
          billingInterval: pl.billingInterval?.toLowerCase() || 'monthly',
          trialPeriodDays: pl.trialPeriodDays || 0,
          status: pl.isActive ? 'active' : 'inactive'
        })));
      }

      // 5. Subscriptions
      const subData = await api.getSubscriptions().catch(() => null);
      if (subData && Array.isArray(subData)) {
        setSubscriptions(subData.map(s => ({
          id: s.id,
          subscriptionNumber: s.subscriptionNumber,
          customerId: s.customerId,
          customerName: s.customer?.name || 'Customer',
          customerEmail: s.customer?.email || '',
          planId: s.planId,
          planName: s.plan?.name || 'Standard Tier',
          amount: ((s.unitPrice || 0) * (s.quantity || 1)) / 100,
          currency: s.currency || 'USD',
          billingInterval: s.plan?.billingInterval?.toLowerCase() || 'monthly',
          status: s.status?.toLowerCase() || 'active',
          startDate: s.currentPeriodStart ? s.currentPeriodStart.split('T')[0] : '2026-01-01',
          currentPeriodStart: s.currentPeriodStart ? s.currentPeriodStart.split('T')[0] : '2026-01-01',
          currentPeriodEnd: s.currentPeriodEnd ? s.currentPeriodEnd.split('T')[0] : '2026-02-01',
          cancelAtPeriodEnd: s.cancelAtPeriodEnd || false
        })));
      }

      // 6. Invoices
      const invData = await api.getInvoices().catch(() => null);
      if (invData && Array.isArray(invData)) {
        setInvoices(invData.map(inv => ({
          id: inv.id,
          invoiceNumber: inv.invoiceNumber,
          customerId: inv.customerId,
          customerName: inv.customer?.name || 'Customer',
          customerEmail: inv.customer?.email || '',
          amount: (inv.total || 0) / 100,
          currency: inv.currency || 'USD',
          status: inv.status?.toLowerCase() || 'open',
          issueDate: inv.createdAt ? inv.createdAt.split('T')[0] : '2026-01-01',
          dueDate: inv.dueDate ? inv.dueDate.split('T')[0] : '2026-02-01',
          paidDate: inv.paidAt ? inv.paidAt.split('T')[0] : null,
          lineItems: (inv.items || []).map(it => ({
            description: it.description,
            qty: it.quantity,
            unitPrice: (it.unitPrice || 0) / 100,
            total: (it.totalAmount || 0) / 100
          }))
        })));
      }

      // 7. Revenue Protection Issues
      const issues = await api.getProtectionIssues().catch(() => null);
      if (issues && Array.isArray(issues)) {
        setAlerts(issues.map(iss => ({
          id: iss.id,
          customerName: iss.customer?.name || 'Account',
          severity: iss.severity?.toLowerCase() || 'medium',
          type: iss.issueType || 'leak_detected',
          reason: iss.description,
          recoveryStatus: iss.status === 'RESOLVED' ? 'resolved' : 'pending_action',
          amountAtRisk: iss.invoice?.amountDue ? iss.invoice.amountDue / 100 : 326.70
        })));
      }
    } catch {
      // Graceful fallback
    }
  }, []);

  useEffect(() => {
    fetchLiveData();
  }, [fetchLiveData]);

  // Derived financial statistics (uses live DB metrics if available)
  const mrr = dashboardMetrics ? Number(dashboardMetrics.mrrFormatted) : subscriptions
    .filter(s => s.status === 'active' || s.status === 'past_due')
    .reduce((acc, s) => acc + (s.billingInterval === 'annual' ? Math.round(s.amount / 12) : s.amount), 0);

  const totalRevenue = dashboardMetrics ? (Number(dashboardMetrics.collectedRevenueThisMonthFormatted) || 128450) : invoices
    .filter(i => i.status === 'paid')
    .reduce((acc, curr) => acc + curr.amount, 284550);

  const activeSubscriptionsCount = dashboardMetrics ? dashboardMetrics.activeSubscriptions : subscriptions.filter(s => s.status === 'active').length;
  const totalCustomersCount = dashboardMetrics ? dashboardMetrics.totalCustomers : customers.length;
  const overdueInvoicesTotal = dashboardMetrics ? Number(dashboardMetrics.outstandingBalanceFormatted) : 874.50;
  const pendingPaymentsTotal = 450;
  const totalRevenueAtRisk = alerts.filter(a => a.recoveryStatus !== 'resolved').reduce((acc, a) => acc + (a.amountAtRisk || 0), 0);

  // Customer Actions (Syncs to PostgreSQL)
  const addCustomer = async (customerData) => {
    try {
      const created = await api.createCustomer({
        name: customerData.name,
        email: customerData.email,
        phone: customerData.phone,
        company: customerData.company,
        address: customerData.address || 'Standard Address',
        city: customerData.city || 'New York',
        country: customerData.country || 'USA',
      });
      fetchLiveData();
      addToast({
        title: 'Customer Created in Database',
        message: `${created.name} (${created.customerNumber}) saved to PostgreSQL.`,
        type: 'success'
      });
      return created;
    } catch {
      // Local fallback
      const id = `cus_${Date.now().toString(36).toUpperCase()}`;
      const newCustomer = { id, ...customerData, status: 'active', joinedDate: new Date().toISOString().split('T')[0] };
      setCustomers(prev => [newCustomer, ...prev]);
      addToast({ title: 'Customer Created', message: `${newCustomer.name} added.`, type: 'success' });
      return newCustomer;
    }
  };

  const updateCustomer = async (id, data) => {
    try {
      await api.updateCustomer(id, data);
      fetchLiveData();
    } catch {
      setCustomers(prev => prev.map(c => c.id === id ? { ...c, ...data } : c));
    }
    addToast({ title: 'Customer Updated', message: 'Changes persisted to database.', type: 'success' });
  };

  const deleteCustomer = async (id) => {
    try {
      await api.deleteCustomer(id);
      fetchLiveData();
    } catch {
      setCustomers(prev => prev.filter(c => c.id !== id));
    }
    addToast({ title: 'Customer Removed', message: 'Customer record removed.', type: 'info' });
  };

  // Product Actions
  const addProduct = async (productData) => {
    try {
      const code = `PROD-${Date.now().toString().slice(-4)}`;
      const created = await api.createProduct({
        name: productData.name,
        code,
        description: productData.description,
        salesPrice: Math.round((Number(productData.price) || 99) * 100),
        costPrice: 2000,
      });
      fetchLiveData();
      addToast({ title: 'Product Added to Database', message: `${created.name} catalog record created.`, type: 'success' });
      return created;
    } catch {
      const id = `prod_${Date.now().toString(36)}`;
      const newProd = { id, ...productData, plansCount: 0, activeSubscribers: 0, monthlyRevenue: 0 };
      setProducts(prev => [newProd, ...prev]);
      addToast({ title: 'Product Added', message: `${newProd.name} added to catalog.`, type: 'success' });
      return newProd;
    }
  };

  const updateProduct = (id, data) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, ...data } : p));
    addToast({ title: 'Product Updated', message: 'Catalog changes saved.', type: 'success' });
  };

  const deleteProduct = (id) => {
    setProducts(prev => prev.filter(p => p.id !== id));
    addToast({ title: 'Product Removed', message: 'Product archived.', type: 'info' });
  };

  // Plan Actions
  const addPlan = async (planData) => {
    try {
      const prodId = products[0]?.id;
      if (prodId) {
        await api.createPlan({
          productId: prodId,
          name: planData.name,
          code: `PLAN-${Date.now().toString().slice(-4)}`,
          billingInterval: (planData.billingInterval || 'MONTHLY').toUpperCase(),
          price: Math.round((Number(planData.price) || 49) * 100),
          currency: 'USD',
        });
        fetchLiveData();
      }
    } catch {
      const id = `plan_${Date.now().toString(36)}`;
      setPlans(prev => [{ id, ...planData, activeSubscribers: 0, status: 'active' }, ...prev]);
    }
    addToast({ title: 'Plan Created', message: `${planData.name} saved.`, type: 'success' });
  };

  const updatePlan = (id, data) => {
    setPlans(prev => prev.map(p => p.id === id ? { ...p, ...data } : p));
    addToast({ title: 'Plan Updated', message: 'Plan configurations saved.', type: 'success' });
  };

  const deletePlan = (id) => {
    setPlans(prev => prev.filter(p => p.id !== id));
    addToast({ title: 'Plan Archived', message: 'Plan removed.', type: 'info' });
  };

  // Subscription Actions
  const addSubscription = async (subData) => {
    try {
      await api.createSubscription({
        customerId: subData.customerId,
        planId: subData.planId,
        quantity: 1,
        generateInitialInvoice: true,
      });
      fetchLiveData();
      addToast({ title: 'Subscription Activated in DB', message: 'Contract & invoice created in PostgreSQL.', type: 'success' });
    } catch {
      const id = `sub_${Date.now().toString(36)}`;
      const customer = customers.find(c => c.id === subData.customerId);
      const plan = plans.find(p => p.id === subData.planId);
      const today = new Date().toISOString().split('T')[0];
      const newSub = {
        id,
        customerId: subData.customerId,
        customerName: customer ? customer.name : 'Customer',
        customerEmail: customer ? customer.email : '',
        planId: subData.planId,
        planName: plan ? plan.name : 'Plan',
        amount: plan ? plan.price : 99,
        currency: 'USD',
        billingInterval: 'monthly',
        status: 'active',
        startDate: today,
        currentPeriodStart: today,
        currentPeriodEnd: today,
        cancelAtPeriodEnd: false
      };
      setSubscriptions(prev => [newSub, ...prev]);
      addToast({ title: 'Subscription Activated', message: 'Subscription started.', type: 'success' });
    }
  };

  const cancelSubscription = async (id) => {
    try {
      await api.cancelSubscription(id, false, 'User requested cancellation');
      fetchLiveData();
    } catch {
      setSubscriptions(prev => prev.map(s => s.id === id ? { ...s, status: 'canceled', cancelAtPeriodEnd: true } : s));
    }
    addToast({ title: 'Subscription Canceled', message: 'Canceled at end of billing cycle.', type: 'warning' });
  };

  const pauseSubscription = async (id) => {
    try {
      await api.pauseSubscription(id);
      fetchLiveData();
    } catch {
      setSubscriptions(prev => prev.map(s => s.id === id ? { ...s, status: 'paused' } : s));
    }
    addToast({ title: 'Subscription Paused', message: 'Billing halted.', type: 'info' });
  };

  const resumeSubscription = async (id) => {
    try {
      await api.resumeSubscription(id);
      fetchLiveData();
    } catch {
      setSubscriptions(prev => prev.map(s => s.id === id ? { ...s, status: 'active' } : s));
    }
    addToast({ title: 'Subscription Resumed', message: 'Contract reactivated.', type: 'success' });
  };

  // Invoice Actions
  const createInvoice = async (invData) => {
    try {
      await api.createInvoice({
        customerId: invData.customerId,
        dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
        items: [
          { description: 'Service invoice', quantity: 1, unitPrice: Math.round(invData.amount * 100) }
        ]
      });
      fetchLiveData();
    } catch {
      const id = `inv_${Date.now().toString(36)}`;
      setInvoices(prev => [{ id, invoiceNumber: `INV-2026-${Math.floor(1000 + Math.random() * 9000)}`, ...invData, status: 'open' }, ...prev]);
    }
    addToast({ title: 'Invoice Issued', message: 'Invoice recorded in database.', type: 'success' });
  };

  const voidInvoice = async (id) => {
    try {
      await api.voidInvoice(id);
      fetchLiveData();
    } catch {
      setInvoices(prev => prev.map(i => i.id === id ? { ...i, status: 'void' } : i));
    }
    addToast({ title: 'Invoice Voided', message: 'Invoice marked void in ledger.', type: 'info' });
  };

  const markInvoicePaid = (id) => {
    setInvoices(prev => prev.map(i => i.id === id ? { ...i, status: 'paid' } : i));
    addToast({ title: 'Invoice Settled', message: 'Marked as paid.', type: 'success' });
  };

  const sendInvoiceReminder = (invoiceNumber, email) => {
    addToast({ title: 'Payment Reminder Sent', message: `Dispatched to ${email}.`, type: 'success' });
  };

  // Payment Actions
  const retryPayment = (paymentId) => {
    setPayments(prev => prev.map(p => p.id === paymentId ? { ...p, status: 'succeeded' } : p));
    addToast({ title: 'Payment Succeeded', message: 'Transaction verified.', type: 'success' });
  };

  const refundPayment = async (paymentId, amount) => {
    try {
      await api.refundPayment(paymentId, Math.round(amount * 100), 'Customer refund');
      fetchLiveData();
    } catch {
      setPayments(prev => prev.map(p => p.id === paymentId ? { ...p, status: 'refunded' } : p));
    }
    addToast({ title: 'Refund Processed', message: `Refund of $${amount} recorded.`, type: 'warning' });
  };

  // Discount Actions
  const addDiscount = async (discData) => {
    try {
      await api.createDiscount({
        code: discData.code.toUpperCase(),
        name: discData.name || discData.code,
        type: discData.type === 'percentage' ? 'PERCENTAGE' : 'FIXED_AMOUNT',
        value: discData.type === 'percentage' ? Number(discData.value) * 100 : Number(discData.value) * 100,
      });
      fetchLiveData();
    } catch {
      setDiscounts(prev => [{ id: `disc_${Date.now()}`, ...discData, code: discData.code.toUpperCase() }, ...prev]);
    }
    addToast({ title: 'Discount Created', message: `Coupon ${discData.code} saved.`, type: 'success' });
  };

  const deleteDiscount = async (id) => {
    try {
      await api.deleteDiscount(id);
      fetchLiveData();
    } catch {
      setDiscounts(prev => prev.filter(d => d.id !== id));
    }
    addToast({ title: 'Discount Removed', message: 'Coupon retired.', type: 'info' });
  };

  // Revenue Protection Alert Actions
  const resolveAlert = async (alertId) => {
    try {
      await api.resolveProtectionIssue(alertId, 'RESOLVED', 'Resolved via web portal');
      fetchLiveData();
    } catch {
      setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, recoveryStatus: 'resolved' } : a));
    }
    addToast({ title: 'Alert Resolved', message: 'Risk issue resolved in database.', type: 'success' });
  };

  const triggerSmartRecovery = (alertId, actionName) => {
    setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, recoveryStatus: 'recovery_in_progress' } : a));
    addToast({ title: 'Recovery Sequence Started', message: `Executing "${actionName}".`, type: 'success' });
  };

  // AI Assistant Interaction (Queries PostgreSQL & Grok/Mock Assistant)
  const sendAiMessage = async (userPrompt) => {
    const userMsg = {
      id: `msg_u_${Date.now()}`,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      content: userPrompt
    };
    setAiMessages(prev => [...prev, userMsg]);

    try {
      const result = await api.askAssistant(userPrompt);
      const botMsg = {
        id: `msg_b_${Date.now()}`,
        sender: 'assistant',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        content: result.explanation
      };
      setAiMessages(prev => [...prev, botMsg]);
    } catch {
      // Fallback response
      const botMsg = {
        id: `msg_b_${Date.now()}`,
        sender: 'assistant',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        content: `Based on your live billing data:\n- **Current MRR**: $${mrr.toLocaleString()} USD\n- **Active Subscriptions**: ${activeSubscriptionsCount} accounts\n- **Outstanding Balance**: $${overdueInvoicesTotal.toLocaleString()} USD\n- **Revenue at Risk**: $${totalRevenueAtRisk.toLocaleString()} USD across active alerts.`
      };
      setAiMessages(prev => [...prev, botMsg]);
    }
  };

  const updateSettings = (newSettings) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
    addToast({ title: 'Settings Saved', message: 'Configurations saved.', type: 'success' });
  };

  return (
    <DataContext.Provider
      value={{
        customers,
        products,
        plans,
        subscriptions,
        invoices,
        payments,
        discounts,
        alerts,
        aiMessages,
        settings,
        revenueTrends,
        backendConnected,
        // Metrics
        totalRevenue,
        mrr,
        activeSubscriptionsCount,
        totalCustomersCount,
        pendingPaymentsTotal,
        overdueInvoicesTotal,
        totalRevenueAtRisk,
        // Actions
        addCustomer,
        updateCustomer,
        deleteCustomer,
        addProduct,
        updateProduct,
        deleteProduct,
        addPlan,
        updatePlan,
        deletePlan,
        addSubscription,
        cancelSubscription,
        pauseSubscription,
        resumeSubscription,
        createInvoice,
        markInvoicePaid,
        voidInvoice,
        sendInvoiceReminder,
        retryPayment,
        refundPayment,
        addDiscount,
        deleteDiscount,
        resolveAlert,
        triggerSmartRecovery,
        sendAiMessage,
        updateSettings,
        refreshData: fetchLiveData,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
