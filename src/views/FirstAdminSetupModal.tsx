import React, { useState } from 'react';
import { User } from '../types';
import { db } from '../mock/storage';
import { ShieldCheck, Building, Mail, Lock, User as UserIcon, Sparkles, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';

interface FirstAdminSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (adminUser: User) => void;
}

export const FirstAdminSetupModal: React.FC<FirstAdminSetupModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  if (!isOpen) return null;

  const [fullName, setFullName] = useState('System Administrator');
  const [email, setEmail] = useState('admin@campustag.edu');
  const [password, setPassword] = useState('CampusTag2026!Master');
  const [campusName, setCampusName] = useState('University Campus');
  const [appName, setAppName] = useState('Campus Tag');
  const [tagline, setTagline] = useState('Scan It to Find It');
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);

  const handleCompleteSetup = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      const superAdmin = db.completeFirstRunSetup({
        fullName: fullName.trim() || 'System Administrator',
        email: email.trim() || 'admin@campustag.edu',
        campusName: campusName.trim() || 'University Campus',
        appName: appName.trim() || 'Campus Tag',
        tagline: tagline.trim() || 'Scan It to Find It'
      });

      setIsLoading(false);
      onSuccess(superAdmin);
      onClose();
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 text-slate-100">
        {/* Banner Header */}
        <div className="p-7 bg-gradient-to-r from-red-950 via-slate-900 to-slate-950 border-b border-slate-800 relative">
          <div className="flex items-center gap-3.5 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-red-600 text-white flex items-center justify-center font-black shadow-lg shadow-red-600/30">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-widest font-extrabold text-red-400 bg-red-950/80 px-2 py-0.5 rounded border border-red-800">
                Initial Deployment Wizard
              </span>
              <h2 className="text-xl font-black text-white mt-0.5">
                First Super Admin Registration
              </h2>
            </div>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Configure the platform master administrator. Once registered, you will have complete master CRUD access over all campus tenants, items, subscription plans, and dynamic website content.
          </p>
        </div>

        {/* Setup Form */}
        <form onSubmit={handleCompleteSetup} className="p-7 space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-400 font-bold uppercase tracking-wider mb-1">
                Admin Full Name *
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="System Administrator"
                  className="w-full pl-9 pr-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder:text-slate-600 focus:outline-none focus:border-red-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-400 font-bold uppercase tracking-wider mb-1">
                Master Admin Email *
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
          </div>

          <div>
            <label className="block text-slate-400 font-bold uppercase tracking-wider mb-1">
              Platform Master Password *
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••••••"
                className="w-full pl-9 pr-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder:text-slate-600 focus:outline-none focus:border-red-500 font-mono"
              />
            </div>
            <p className="text-[10px] text-slate-500 mt-1">
              Encrypted with PBKDF2 / SimpleJWT root platform hash.
            </p>
          </div>

          <div className="pt-2 border-t border-slate-800">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-blue-400" />
              <span>Campus Identity & Global Platform Branding</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-400 font-bold uppercase tracking-wider mb-1">
                  Campus / University
                </label>
                <input
                  type="text"
                  value={campusName}
                  onChange={(e) => setCampusName(e.target.value)}
                  placeholder="e.g. University Campus"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold uppercase tracking-wider mb-1">
                  App Name
                </label>
                <input
                  type="text"
                  value={appName}
                  onChange={(e) => setAppName(e.target.value)}
                  placeholder="Campus Tag"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-red-500"
                />
              </div>
            </div>

            <div className="mt-3">
              <label className="block text-slate-400 font-bold uppercase tracking-wider mb-1">
                Official Tagline
              </label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                placeholder="Scan It to Find It"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-red-500"
              />
            </div>
          </div>

          <div className="p-3 bg-blue-950/40 border border-blue-900/60 rounded-xl text-[11px] text-blue-300 flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
            <span>
              Once registered, all landing page copy, plans, footer links, and user inventories are dynamically editable directly from the Super Admin dashboard without touching source code.
            </span>
          </div>

          <div className="pt-2 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              Skip / Use Existing Admin
            </button>

            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-red-600/30 cursor-pointer flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Provisioning Super Admin...</span>
                </>
              ) : (
                <>
                  <span>Initialize & Open Admin Console</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
