import React, { useState } from 'react';
import { User } from '../types';
import { db } from '../mock/storage';
import { loginAdmin, getCurrentUser } from '../services/api';
import { X, ShieldAlert, Lock, Mail, Loader2, AlertCircle, KeyRound, ShieldCheck } from 'lucide-react';

interface AdminAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (adminUser: User) => void;
}

export const AdminAuthModal: React.FC<AdminAuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  if (!isOpen) return null;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [securityPin, setSecurityPin] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const adminUsers = db.getUsers().filter(u => u.role === 'super_admin');
  const primaryAdmin = adminUsers[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const tokens = await loginAdmin(email.trim(), password);
      localStorage.setItem('campus_tag_access_token', tokens.access);
      localStorage.setItem('campus_tag_refresh_token', tokens.refresh);
      const user = await getCurrentUser();
      if (user.role !== 'super_admin') {
        setError('Access Denied: This account lacks Super Admin platform owner privileges. Use Customer Portal.');
        setIsLoading(false);
        return;
      }
      db.setCurrentUser({
        id: user.id,
        email: user.email,
        fullName: `${user.first_name} ${user.last_name}`.trim() || user.username,
        role: user.role,
        createdAt: user.created_at || new Date().toISOString(),
        status: user.status || 'active',
      } as any);
      db.logAudit(user.email, 'ADMIN_PORTAL_LOGIN', 'User', user.id, 'Super Admin logged in successfully.');
      setIsLoading(false);
      onSuccess({
        id: user.id,
        email: user.email,
        fullName: `${user.first_name} ${user.last_name}`.trim() || user.username,
        role: user.role,
        createdAt: user.created_at || new Date().toISOString(),
        status: user.status || 'active',
      } as any);
      onClose();
    } catch (err) {
      setError('Unauthorized: Administrative account not recognized.');
      setIsLoading(false);
    }
  };

  const handlePreFillAdmin = () => {
    if (primaryAdmin) {
      setEmail(primaryAdmin.email);
      setPassword('CampusTag2026!SecureAdmin');
      setSecurityPin('9921');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 text-slate-100">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center font-bold text-sm shadow-md shadow-red-600/30">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-white uppercase tracking-wider">
                  Platform Admin Portal
                </h3>
              </div>
              <p className="text-xs text-red-400 font-medium">
                Restricted to Platform Owners & Operators
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Security Warning Notice */}
        <div className="px-6 py-3 bg-red-950/40 border-b border-red-900/50 flex items-center justify-between text-xs text-red-300">
          <div className="flex items-center gap-2">
            <KeyRound className="w-3.5 h-3.5 text-red-400 shrink-0" />
            <span>Root-level security credentials required.</span>
          </div>
          <button
            type="button"
            onClick={handlePreFillAdmin}
            className="text-[11px] text-white hover:text-red-200 underline font-semibold cursor-pointer"
          >
            Auto-Fill Admin
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {error && (
            <div className="p-3 bg-red-900/40 border border-red-700 text-red-200 rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-slate-400 font-bold uppercase tracking-wider mb-1">
              Admin Platform Email *
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@campustag.edu"
                className="w-full pl-9 pr-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder:text-slate-600 focus:outline-none focus:border-red-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-400 font-bold uppercase tracking-wider mb-1">
              Super Admin Master Password *
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••••••"
                className="w-full pl-9 pr-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder:text-slate-600 focus:outline-none focus:border-red-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-400 font-bold uppercase tracking-wider mb-1">
              Security 2FA Token / PIN (Optional)
            </label>
            <input
              type="text"
              value={securityPin}
              onChange={(e) => setSecurityPin(e.target.value)}
              placeholder="e.g. 9921"
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder:text-slate-600 focus:outline-none focus:border-red-500 font-mono"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl text-xs transition-colors shadow-lg shadow-red-600/30 cursor-pointer flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Verifying Root Clearance...</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>Authenticate Platform Console</span>
              </>
            )}
          </button>

          <p className="text-[10px] text-slate-500 text-center leading-relaxed">
            All administrative access attempts, IP addresses, and database mutations are cryptographically recorded in the security audit ledger.
          </p>
        </form>
      </div>
    </div>
  );
};
