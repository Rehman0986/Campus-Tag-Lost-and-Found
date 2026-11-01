/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { User, WebsiteSettings, SubscriptionPlan } from './types';
import { db } from './mock/storage';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { ToastContainer, ToastMessage, ToastType } from './components/Toast';
import { PublicWebsite } from './views/PublicWebsite';
import { CustomerDashboard } from './views/CustomerDashboard';
import { SuperAdminDashboard } from './views/SuperAdminDashboard';
import { PublicFinderPage } from './views/PublicFinderPage';
import { CustomerAuthModal } from './views/CustomerAuthModal';
import { AdminAuthModal } from './views/AdminAuthModal';
import { FirstAdminSetupModal } from './views/FirstAdminSetupModal';
import { ShieldAlert, ArrowLeft, KeyRound, Sparkles } from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<'public' | 'customer' | 'admin' | 'finder'>('public');
  const [finderPublicId, setFinderPublicId] = useState<string>('cpt-8f92-a1b4');
  
  // Separate Authentication Modals
  const [isCustomerAuthOpen, setIsCustomerAuthOpen] = useState(false);
  const [customerAuthMode, setCustomerAuthMode] = useState<'login' | 'register'>('login');
  const [isAdminAuthOpen, setIsAdminAuthOpen] = useState(false);
  const [isFirstAdminSetupOpen, setIsFirstAdminSetupOpen] = useState(false);

  // Policy Modal & Settings
  const [activePolicy, setActivePolicy] = useState<'privacy' | 'terms' | 'refund' | null>(null);
  const [settings, setSettings] = useState<WebsiteSettings>(db.getSettings());
  const [plans, setPlans] = useState<SubscriptionPlan[]>(db.getPlans());

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = (type: ToastType, title: string, message?: string) => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    setToasts((prev) => [...prev, { id, type, title, message }]);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Check URL query parameters and load persistent session on initial mount
  useEffect(() => {
    const user = db.getCurrentUser();
    setCurrentUser(user);

    const urlParams = new URLSearchParams(window.location.search);
    const modeParam = urlParams.get('mode');
    const publicIdParam = urlParams.get('public_id');

    if (modeParam === 'finder' && publicIdParam) {
      setFinderPublicId(publicIdParam);
      setCurrentView('finder');
    } else if (window.location.pathname.startsWith('/f/')) {
      const idFromPath = window.location.pathname.replace('/f/', '');
      if (idFromPath) {
        setFinderPublicId(idFromPath);
        setCurrentView('finder');
      }
    }
  }, []);

  const handleOpenCustomerAuth = (mode: 'login' | 'register' = 'login') => {
    setCustomerAuthMode(mode);
    setIsCustomerAuthOpen(true);
  };

  const handleCustomerLoginSuccess = (user: User) => {
    setCurrentUser(user);
    setCurrentView('customer');
    showToast('success', 'Welcome Back', `Logged into ${user.fullName}'s workspace.`);
  };

  const handleAdminLoginSuccess = (adminUser: User) => {
    setCurrentUser(adminUser);
    setCurrentView('admin');
    showToast('success', 'Security Clearance Granted', 'Authenticated as Platform Super Admin.');
  };

  const handleFirstAdminSetupSuccess = (adminUser: User) => {
    setCurrentUser(adminUser);
    setCurrentView('admin');
    setSettings(db.getSettings());
    showToast('success', 'Platform Initialized', `Super Admin ${adminUser.fullName} initialized with master CRUD authority.`);
  };

  const handleLogout = () => {
    localStorage.removeItem('campus_tag_jwt_token');
    localStorage.removeItem('campus_tag_admin_jwt');
    const fallbackCustomer = db.getUsers().find(u => u.role === 'customer') || db.getUsers()[1];
    db.setCurrentUser(fallbackCustomer);
    setCurrentUser(fallbackCustomer);
    setCurrentView('public');
    showToast('info', 'Logged Out', 'You have been signed out safely.');
  };

  const handleSimulateFinderScan = (publicId: string) => {
    setFinderPublicId(publicId);
    setCurrentView('finder');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateToSection = (sectionId: string) => {
    if (currentView !== 'public') {
      setCurrentView('public');
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        el?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const el = document.getElementById(sectionId);
      el?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
      {/* Top Navigation */}
      {currentView !== 'finder' && (
        <Navbar
          settings={settings}
          currentUser={currentUser}
          currentView={currentView}
          onNavigate={(view) => setCurrentView(view)}
          onOpenCustomerAuth={handleOpenCustomerAuth}
          onOpenAdminAuth={() => setIsAdminAuthOpen(true)}
          onLogout={handleLogout}
        />
      )}

      {/* Main Content Router with Role-Based Route Protection */}
      <div className="flex-1">
        {currentView === 'public' && (
          <PublicWebsite
            settings={settings}
            plans={plans}
            onOpenAuth={handleOpenCustomerAuth}
            onSimulateFinderScan={handleSimulateFinderScan}
            activePolicy={activePolicy}
            onClosePolicy={() => setActivePolicy(null)}
          />
        )}

        {/* Customer Portal */}
        {currentView === 'customer' && (
          currentUser?.role === 'customer' ? (
            <CustomerDashboard
              currentUser={currentUser}
              onSimulateFinderScan={handleSimulateFinderScan}
              onShowToast={showToast}
            />
          ) : currentUser?.role === 'super_admin' ? (
            <div>
              <div className="bg-amber-500/10 border-b border-amber-500/30 px-6 py-2.5 text-xs text-amber-800 flex items-center justify-between">
                <span>
                  <strong>Super Admin Delegation Mode:</strong> Viewing customer inventory as Platform Director.
                </span>
                <button
                  onClick={() => setCurrentView('admin')}
                  className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-semibold cursor-pointer"
                >
                  Return to Admin Console
                </button>
              </div>
              <CustomerDashboard
                currentUser={currentUser}
                onSimulateFinderScan={handleSimulateFinderScan}
                onShowToast={showToast}
              />
            </div>
          ) : (
            <div className="max-w-md mx-auto my-20 p-8 bg-white border border-slate-200 rounded-2xl shadow-xl text-center space-y-4">
              <h3 className="text-lg font-bold text-slate-900">Sign in to Access Your Workspace</h3>
              <p className="text-xs text-slate-500">
                Log in to register campus gear, manage emergency Lost Mode, and view anonymous finder reports.
              </p>
              <button
                onClick={() => handleOpenCustomerAuth('login')}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs cursor-pointer shadow-sm"
              >
                Sign In to Customer Portal
              </button>
            </div>
          )
        )}

        {/* Super Admin Protected Route */}
        {currentView === 'admin' && (
          currentUser?.role === 'super_admin' ? (
            <SuperAdminDashboard
              currentUser={currentUser}
              onSimulateFinderScan={handleSimulateFinderScan}
            />
          ) : (
            /* Dedicated Access Restricted Barrier */
            <div className="max-w-lg mx-auto my-20 p-8 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl text-center text-slate-100 space-y-5">
              <div className="w-14 h-14 rounded-2xl bg-red-600/20 border border-red-500/40 text-red-500 flex items-center justify-center mx-auto shadow-sm">
                <ShieldAlert className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white uppercase tracking-wider">
                  Administrative Clearance Required
                </h3>
                <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                  You are currently authenticated as a standard customer or non-privileged user. The Super Admin Console is strictly restricted to platform operators with master root credentials.
                </p>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={() => setIsAdminAuthOpen(true)}
                  className="px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-red-600/30 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <KeyRound className="w-4 h-4" />
                  <span>Authenticate as Super Admin</span>
                </button>
                <button
                  onClick={() => setIsFirstAdminSetupOpen(true)}
                  className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-red-300 border border-red-900/60 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-red-400" />
                  <span>First Admin Setup Wizard</span>
                </button>
                <button
                  onClick={() => setCurrentView('customer')}
                  className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Customer Portal</span>
                </button>
              </div>
            </div>
          )
        )}

        {/* Public Mobile-First Finder Route */}
        {currentView === 'finder' && (
          <div>
            {/* Quick Return Bar when in Finder Simulation Mode */}
            <div className="bg-slate-950 text-slate-300 text-xs px-4 py-2.5 flex items-center justify-between border-b border-slate-800">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[11px]">
                  Public Finder Experience (Tag ID: <strong className="font-mono text-blue-400">{finderPublicId}</strong>) · Zero Login Required
                </span>
              </span>
              <button
                onClick={() => setCurrentView('customer')}
                className="text-blue-400 hover:text-white font-semibold cursor-pointer underline text-[11px]"
              >
                ← Return to Dashboard
              </button>
            </div>

            <PublicFinderPage
              publicId={finderPublicId}
              onNavigateHome={() => setCurrentView('public')}
              onShowToast={showToast}
            />
          </div>
        )}
      </div>

      {/* Dynamic Footer for non-finder pages */}
      {currentView !== 'finder' && currentView !== 'customer' && currentView !== 'admin' && (
        <Footer
          settings={settings}
          onNavigateToPolicy={(policy) => setActivePolicy(policy)}
          onNavigateToSection={handleNavigateToSection}
        />
      )}

      {/* Customer Authentication Modal */}
      <CustomerAuthModal
        isOpen={isCustomerAuthOpen}
        onClose={() => setIsCustomerAuthOpen(false)}
        onSuccess={handleCustomerLoginSuccess}
        initialMode={customerAuthMode}
      />

      {/* Super Admin Authentication Modal */}
      <AdminAuthModal
        isOpen={isAdminAuthOpen}
        onClose={() => setIsAdminAuthOpen(false)}
        onSuccess={handleAdminLoginSuccess}
      />

      {/* First Super Admin Setup Modal */}
      <FirstAdminSetupModal
        isOpen={isFirstAdminSetupOpen}
        onClose={() => setIsFirstAdminSetupOpen(false)}
        onSuccess={handleFirstAdminSetupSuccess}
      />

      {/* Floating Toast Notification Container */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
