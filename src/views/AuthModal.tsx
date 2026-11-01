import React, { useState } from 'react';
import { User, Tenant } from '../types';
import { db } from '../mock/storage';
import { X, ShieldAlert, UserCheck, Lock, Mail, Building, Sparkles, Check } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: User) => void;
  initialMode?: 'login' | 'register';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  initialMode = 'login'
}) => {
  if (!isOpen) return null;

  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [campusName, setCampusName] = useState('');
  const [orgName, setOrgName] = useState('');
  const [error, setError] = useState('');

  const users = db.getUsers();

  const handleQuickSwitch = (targetUser: User) => {
    db.setCurrentUser(targetUser);
    onLoginSuccess(targetUser);
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (mode === 'login') {
      const found = users.find(u => u.email.toLowerCase() === email.trim().toLowerCase());
      if (found) {
        db.setCurrentUser(found);
        onLoginSuccess(found);
        onClose();
      } else {
        setError('No account found with this email. Use one of the demo accounts or register below.');
      }
    } else {
      if (!fullName.trim() || !email.trim()) {
        setError('Please fill in all required fields.');
        return;
      }

      const tenantId = `tenant_${Math.random().toString(36).substring(2, 7)}`;
      const newTenant: Tenant = {
        id: tenantId,
        name: orgName.trim() || `${fullName}'s Campus Workspace`,
        campusName: campusName.trim() || 'University Campus',
        slug: orgName.toLowerCase().replace(/[^a-z0-9]/g, '-') || 'campus-user',
        ownerId: `usr_${Date.now()}`,
        planId: 'plan_7day',
        itemLimit: 5,
        contactEmail: email.trim(),
        createdAt: new Date().toISOString(),
        isVerified: true
      };
      db.saveTenant(newTenant);

      const newUser: User = {
        id: newTenant.ownerId,
        email: email.trim(),
        fullName: fullName.trim(),
        role: 'customer',
        tenantId,
        createdAt: new Date().toISOString(),
        status: 'active'
      };
      db.saveUser(newUser);
      db.setCurrentUser(newUser);
      onLoginSuccess(newUser);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              {mode === 'login' ? 'Sign In to Campus Tag' : 'Create Campus Workspace'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Secure JWT authentication & tenant isolation
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Demo Switcher */}
        <div className="p-4 bg-blue-50/60 border-b border-blue-100 text-xs space-y-2">
          <div className="font-bold text-blue-900 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span>Instant Role Quick Switcher</span>
          </div>
          <div className="grid grid-cols-1 gap-1.5">
            <button
              onClick={() => handleQuickSwitch(users[0])} // Super Admin
              className="text-left px-3 py-2 bg-white hover:bg-red-50 border border-slate-200 hover:border-red-300 rounded-xl transition-all flex items-center justify-between cursor-pointer"
            >
              <div>
                <span className="font-bold text-slate-900 block text-[11px]">Super Admin (Elena Vance)</span>
                <span className="text-[10px] text-slate-500 font-mono">admin@campustag.edu</span>
              </div>
              <span className="text-[10px] font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded">
                PLATFORM OWNER
              </span>
            </button>

            <button
              onClick={() => handleQuickSwitch(users[1])} // Stanford Customer
              className="text-left px-3 py-2 bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-300 rounded-xl transition-all flex items-center justify-between cursor-pointer"
            >
              <div>
                <span className="font-bold text-slate-900 block text-[11px]">Dr. Marcus Chen (Bio-Robotics Lab)</span>
                <span className="text-[10px] text-slate-500 font-mono">dr.chen@stanford.edu</span>
              </div>
              <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded">
                CUSTOMER
              </span>
            </button>
          </div>
        </div>

        {/* Regular Login / Register Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs">
              {error}
            </div>
          )}

          {mode === 'register' && (
            <>
              <div>
                <label className="block text-slate-700 font-bold uppercase tracking-wider mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Alex Morgan"
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold uppercase tracking-wider mb-1">
                  University / College *
                </label>
                <input
                  type="text"
                  required
                  value={campusName}
                  onChange={(e) => setCampusName(e.target.value)}
                  placeholder="e.g. UC Berkeley, Oxford, MIT"
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-slate-700 font-bold uppercase tracking-wider mb-1">
              Campus Email Address *
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. yourname@university.edu"
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-bold uppercase tracking-wider mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-colors shadow-sm cursor-pointer"
          >
            {mode === 'login' ? 'Sign In' : 'Create Free Account & Workspace'}
          </button>

          <div className="pt-2 text-center text-slate-500">
            {mode === 'login' ? (
              <span>
                Need a new workspace?{' '}
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
                Already have an account?{' '}
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
