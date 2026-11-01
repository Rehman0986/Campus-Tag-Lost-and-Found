import React, { useState } from 'react';
import { User, Tenant } from '../types';
import { db } from '../mock/storage';
import { X, Mail, Lock, Building, User as UserIcon, Loader2, AlertCircle, ArrowRight, Check } from 'lucide-react';

interface CustomerAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: User) => void;
  initialMode?: 'login' | 'register';
}

export const CustomerAuthModal: React.FC<CustomerAuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialMode = 'login',
}) => {
  if (!isOpen) return null;

  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [campusName, setCampusName] = useState('');
  const [departmentName, setDepartmentName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const users = db.getUsers().filter(u => u.role === 'customer');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    setTimeout(() => {
      if (mode === 'login') {
        const found = db.getUsers().find(
          u => u.email.toLowerCase() === email.trim().toLowerCase()
        );

        if (!found) {
          setError('No customer account found with this email. Please register below or check credentials.');
          setIsLoading(false);
          return;
        }

        if (found.role === 'super_admin') {
          setError('This is a Super Admin account. Please use the dedicated Super Admin Portal to sign in.');
          setIsLoading(false);
          return;
        }

        if (found.status === 'suspended') {
          setError('This account has been suspended by the campus platform administrator.');
          setIsLoading(false);
          return;
        }

        // Generate and store mock JWT session token
        localStorage.setItem('campus_tag_jwt_token', `jwt_cust_${Date.now()}`);
        db.setCurrentUser(found);
        setIsLoading(false);
        onSuccess(found);
        onClose();
      } else {
        // Register flow
        if (!fullName.trim() || !email.trim() || !campusName.trim()) {
          setError('Please fill in all required campus registration fields.');
          setIsLoading(false);
          return;
        }

        const existing = db.getUsers().find(u => u.email.toLowerCase() === email.trim().toLowerCase());
        if (existing) {
          setError('An account with this email already exists. Please sign in instead.');
          setIsLoading(false);
          return;
        }

        const tenantId = `tenant_${Math.random().toString(36).substring(2, 8)}`;
        const newTenant: Tenant = {
          id: tenantId,
          name: departmentName.trim() || `${fullName}'s Campus Workspace`,
          campusName: campusName.trim(),
          slug: (departmentName || fullName).toLowerCase().replace(/[^a-z0-9]/g, '-') || 'campus-hub',
          ownerId: `usr_${Date.now()}`,
          planId: 'plan_7day',
          itemLimit: 5,
          contactEmail: email.trim(),
          createdAt: new Date().toISOString(),
          isVerified: true,
        };
        db.saveTenant(newTenant);

        const newUser: User = {
          id: newTenant.ownerId,
          email: email.trim(),
          fullName: fullName.trim(),
          role: 'customer',
          tenantId,
          createdAt: new Date().toISOString(),
          status: 'active',
        };
        db.saveUser(newUser);

        localStorage.setItem('campus_tag_jwt_token', `jwt_cust_${Date.now()}`);
        db.setCurrentUser(newUser);
        setIsLoading(false);
        onSuccess(newUser);
        onClose();
      }
    }, 600);
  };

  const handleQuickDemoCustomer = (customerUser: User) => {
    localStorage.setItem('campus_tag_jwt_token', `jwt_cust_demo_${Date.now()}`);
    db.setCurrentUser(customerUser);
    onSuccess(customerUser);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-blue-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
              CT
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {mode === 'login' ? 'Customer Portal Login' : 'Create Student / Lab Account'}
              </h3>
              <p className="text-xs text-slate-500">
                {mode === 'login' ? 'Access your campus gear inventory & tags' : 'Protect your laptops and research gear'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Demo Fast Login Bar */}
        <div className="px-6 py-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-xs">
          <span className="text-slate-500 font-medium">Demo Workspace:</span>
          {users[0] && (
            <button
              type="button"
              onClick={() => handleQuickDemoCustomer(users[0])}
              className="text-blue-600 hover:text-blue-800 font-semibold cursor-pointer underline flex items-center gap-1"
            >
              <span>1-Click: {users[0].fullName} ({db.getTenantById(users[0].tenantId || '')?.name || 'Campus Lab'})</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {mode === 'register' && (
            <>
              <div>
                <label className="block text-slate-700 font-bold uppercase tracking-wider mb-1">
                  Full Name *
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Alex Morgan"
                    className="w-full pl-9 pr-3.5 py-2.5 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold uppercase tracking-wider mb-1">
                  University / Institution *
                </label>
                <div className="relative">
                  <Building className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={campusName}
                    onChange={(e) => setCampusName(e.target.value)}
                    placeholder="e.g. Stanford University, MIT, UC Berkeley"
                    className="w-full pl-9 pr-3.5 py-2.5 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold uppercase tracking-wider mb-1">
                  Department / Student Club Name
                </label>
                <input
                  type="text"
                  value={departmentName}
                  onChange={(e) => setDepartmentName(e.target.value)}
                  placeholder="e.g. Robotics Club or Personal Workspace"
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-slate-700 font-bold uppercase tracking-wider mb-1">
              Institutional Email Address *
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="yourname@university.edu"
                className="w-full pl-9 pr-3.5 py-2.5 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-bold uppercase tracking-wider mb-1">
              Password *
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-9 pr-3.5 py-2.5 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-colors shadow-sm cursor-pointer flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Authenticating...</span>
              </>
            ) : mode === 'login' ? (
              <span>Sign In to Customer Workspace</span>
            ) : (
              <span>Create Free Customer Account</span>
            )}
          </button>

          <div className="pt-2 text-center text-slate-500">
            {mode === 'login' ? (
              <span>
                New to Campus Tag?{' '}
                <button
                  type="button"
                  onClick={() => setMode('register')}
                  className="text-blue-600 font-bold hover:underline cursor-pointer"
                >
                  Register here
                </button>
              </span>
            ) : (
              <span>
                Already registered?{' '}
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="text-blue-600 font-bold hover:underline cursor-pointer"
                >
                  Sign in
                </button>
              </span>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
