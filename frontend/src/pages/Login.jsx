import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Lock, Mail, Building, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/common/Button';

export const Login = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('alex.vance@subscriptiq.io');
  const [password, setPassword] = useState('••••••••••••');
  const [companyName, setCompanyName] = useState('SubscriptIQ Cloud Corp');
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      login(email, password);
      setIsLoading(false);
      navigate('/dashboard');
    }, 600);
  };

  const handleDemoLogin = (role) => {
    if (role === 'admin') {
      setEmail('finance.director@subscriptiq.io');
    } else {
      setEmail('billing.ops@subscriptiq.io');
    }
    setIsLoading(true);
    setTimeout(() => {
      login(email, 'password123');
      setIsLoading(false);
      navigate('/dashboard');
    }, 400);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Brand Logo */}
        <div className="flex items-center justify-center space-x-2.5">
          <div className="w-10 h-10 rounded-xl bg-[#172554] flex items-center justify-center text-white shadow-md">
            <ShieldCheck className="w-6 h-6 text-blue-400" />
          </div>
          <span className="font-bold text-2xl text-slate-900 tracking-tight">
            Subscript<span className="text-blue-600">IQ</span>
          </span>
        </div>
        <h2 className="mt-4 text-center text-xl font-bold tracking-tight text-slate-900">
          {isRegister ? 'Start your revenue operations' : 'Sign in to SubscriptIQ Platform'}
        </h2>
        <p className="mt-1 text-center text-xs text-slate-500">
          Intelligent Subscription Management & Enterprise Revenue Protection
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl shadow-slate-200/50 sm:rounded-xl sm:px-10 border border-slate-200">
          {/* Mode Switch Tabs */}
          <div className="flex border-b border-slate-200 mb-6">
            <button
              onClick={() => setIsRegister(false)}
              className={`flex-1 pb-3 text-xs font-semibold text-center border-b-2 transition-colors ${
                !isRegister
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setIsRegister(true)}
              className={`flex-1 pb-3 text-xs font-semibold text-center border-b-2 transition-colors ${
                isRegister
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              Create Account
            </button>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            {isRegister && (
              <div>
                <label className="block text-xs font-medium text-slate-700">Company Name</label>
                <div className="mt-1 relative rounded-lg shadow-2xs">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Building className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    required
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="block w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-xs placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600"
                    placeholder="Acme Global Inc"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-700">Work Email</label>
              <div className="mt-1 relative rounded-lg shadow-2xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-xs placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600"
                  placeholder="name@company.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700">Password</label>
              <div className="mt-1 relative rounded-lg shadow-2xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-xs placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600"
                  placeholder="••••••••••••"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-3.5 w-3.5 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
                />
                <span className="ml-2 text-slate-600">Remember this browser</span>
              </label>

              {!isRegister && (
                <button
                  type="button"
                  className="font-medium text-blue-600 hover:text-blue-500"
                >
                  Forgot password?
                </button>
              )}
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isLoading}
              className="w-full bg-[#172554] hover:bg-slate-800 text-xs font-semibold py-2.5 mt-2"
              icon={ArrowRight}
              iconPosition="right"
            >
              {isRegister ? 'Create Production Account' : 'Sign In to Workspace'}
            </Button>
          </form>

          {/* 1-Click Fast Sandbox Demo Access */}
          <div className="mt-6 pt-5 border-t border-slate-200">
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2.5 text-center">
              Quick 1-Click Demo Profiles
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleDemoLogin('admin')}
                className="px-2.5 py-2 text-left bg-slate-50 hover:bg-blue-50/60 border border-slate-200 rounded-lg text-xs transition-colors"
              >
                <span className="font-semibold text-slate-800 block">Finance Director</span>
                <span className="text-[10px] text-slate-500">Full admin & dunning control</span>
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin('ops')}
                className="px-2.5 py-2 text-left bg-slate-50 hover:bg-blue-50/60 border border-slate-200 rounded-lg text-xs transition-colors"
              >
                <span className="font-semibold text-slate-800 block">Billing Analyst</span>
                <span className="text-[10px] text-slate-500">Invoices & customer audit</span>
              </button>
            </div>
          </div>

          <div className="mt-5 flex items-center justify-center space-x-2 text-[11px] text-slate-400">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>256-bit TLS Encryption • SOC2 Type II Certified</span>
          </div>
        </div>
      </div>
    </div>
  );
};

