/**
 * SubscriptIQ API Client
 * Connects frontend to the Express/PostgreSQL REST API (/api/v1)
 */
const rawApiBase = import.meta.env.VITE_API_URL;

function getApiBase() {
  if (!rawApiBase) return '/api/v1';
  let host = rawApiBase.trim();
  if (host.startsWith('http://') || host.startsWith('https://')) {
    return `${host.replace(/\/+$/, '')}/api/v1`;
  }
  // If Render passed just the service name without domain (e.g. 'subscriptiq-backend')
  if (!host.includes('.') && !host.includes('localhost')) {
    host = `${host}.onrender.com`;
  }
  return `https://${host.replace(/\/+$/, '')}/api/v1`;
}

const API_BASE = getApiBase();

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const config = {
    ...options,
    credentials: 'include', // sends HTTP-only session cookie
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  };

  try {
    const res = await fetch(url, config);
    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.error?.message || `HTTP ${res.status}`);
    }
    return json.data;
  } catch (err) {
    console.warn(`API call failed for ${endpoint}:`, err.message);
    throw err;
  }
}

export const api = {
  // Auth
  login: (email, password) => request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  getMe: () => request('/auth/me'),
  logout: () => request('/auth/logout', { method: 'POST' }),

  // Dashboard & Analytics
  getDashboardSummary: () => request('/dashboard/summary'),
  getRevenueAnalytics: (months = 6) => request(`/analytics/revenue?months=${months}`),

  // Customers
  getCustomers: (params = '') => request(`/customers${params ? `?${params}` : ''}`),
  createCustomer: (data) => request('/customers', { method: 'POST', body: JSON.stringify(data) }),
  updateCustomer: (id, data) => request(`/customers/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteCustomer: (id) => request(`/customers/${id}`, { method: 'DELETE' }),

  // Products & Plans
  getProducts: () => request('/products'),
  createProduct: (data) => request('/products', { method: 'POST', body: JSON.stringify(data) }),
  getPlans: () => request('/plans'),
  createPlan: (data) => request('/plans', { method: 'POST', body: JSON.stringify(data) }),

  // Subscriptions
  getSubscriptions: (params = '') => request(`/subscriptions${params ? `?${params}` : ''}`),
  createSubscription: (data) => request('/subscriptions', { method: 'POST', body: JSON.stringify(data) }),
  cancelSubscription: (id, immediate = false, reason = '') =>
    request(`/subscriptions/${id}/cancel`, { method: 'POST', body: JSON.stringify({ immediate, reason }) }),
  pauseSubscription: (id) => request(`/subscriptions/${id}/pause`, { method: 'POST' }),
  resumeSubscription: (id) => request(`/subscriptions/${id}/resume`, { method: 'POST' }),
  renewSubscription: (id) => request(`/subscriptions/${id}/renew`, { method: 'POST' }),

  // Invoices
  getInvoices: () => request('/invoices'),
  createInvoice: (data) => request('/invoices', { method: 'POST', body: JSON.stringify(data) }),
  voidInvoice: (id) => request(`/invoices/${id}/void`, { method: 'POST' }),

  // Payments
  getPayments: () => request('/payments'),
  recordPayment: (data) => request('/payments', { method: 'POST', body: JSON.stringify(data) }),
  refundPayment: (id, amount, reason) => request(`/payments/${id}/refund`, { method: 'POST', body: JSON.stringify({ amount, reason }) }),

  // Discounts
  getDiscounts: () => request('/discounts'),
  createDiscount: (data) => request('/discounts', { method: 'POST', body: JSON.stringify(data) }),
  deleteDiscount: (id) => request(`/discounts/${id}`, { method: 'DELETE' }),

  // Revenue Protection
  getProtectionOverview: () => request('/revenue-protection/overview'),
  getProtectionIssues: () => request('/revenue-protection/issues'),
  resolveProtectionIssue: (id, status, notes) =>
    request(`/revenue-protection/issues/${id}/resolve`, { method: 'POST', body: JSON.stringify({ status, resolutionNotes: notes }) }),
  runProtectionScan: () => request('/revenue-protection/scan', { method: 'POST' }),

  // AI Assistant
  askAssistant: (message) => request('/assistant/chat', { method: 'POST', body: JSON.stringify({ message }) }),
};
