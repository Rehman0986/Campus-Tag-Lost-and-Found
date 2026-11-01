import React, { useState } from 'react';
import { User, WebsiteSettings } from '../types';
import { 
  ShieldCheck, 
  User as UserIcon, 
  LogOut, 
  LogIn, 
  ShieldAlert, 
  LayoutDashboard,
  Building,
  KeyRound,
  Menu,
  X,
  Sparkles,
  QrCode,
  Compass,
  ChevronRight,
  ExternalLink
} from 'lucide-react';

interface NavbarProps {
  settings: WebsiteSettings;
  currentUser: User | null;
  currentView: 'public' | 'customer' | 'admin' | 'finder';
  onNavigate: (view: 'public' | 'customer' | 'admin' | 'finder') => void;
  onOpenCustomerAuth: (mode?: 'login' | 'register') => void;
  onOpenAdminAuth: () => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  settings,
  currentUser,
  currentView,
  onNavigate,
  onOpenCustomerAuth,
  onOpenAdminAuth,
  onLogout,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleMobileNavClick = (view: 'public' | 'customer' | 'admin' | 'finder') => {
    onNavigate(view);
    setMobileMenuOpen(false);
  };

  const handleScrollToSection = (sectionId: string) => {
    setMobileMenuOpen(false);
    if (currentView !== 'public') {
      onNavigate('public');
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
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-xs transition-all">
      {/* Subtle University Accent Bar */}
      <div className="h-1 bg-gradient-to-r from-blue-700 via-indigo-600 to-emerald-500 w-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
        {/* Brand */}
        <div className="flex items-center gap-6 shrink-0">
          <button
            onClick={() => onNavigate('public')}
            className="flex items-center gap-3 text-left cursor-pointer group focus:outline-none"
            title="Go to Campus Tag Homepage"
          >
            <div className="relative">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center font-black text-xs shadow-md shadow-blue-500/25 group-hover:scale-105 group-hover:shadow-blue-500/40 transition-all duration-200">
                CT
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white ring-1 ring-emerald-500/30" />
            </div>

            <div>
              <div className="text-sm font-black tracking-tight text-slate-900 group-hover:text-blue-600 transition-colors flex items-center gap-1.5">
                <span>{settings.appName}</span>
                <span className="text-[9px] bg-blue-50 text-blue-700 border border-blue-200 px-1.5 py-0.5 rounded-md font-semibold tracking-normal hidden sm:inline-block">
                  SaaS 2.4
                </span>
              </div>
              <div className="text-[10px] text-blue-600 font-semibold tracking-wider uppercase">
                {settings.tagline}
              </div>
            </div>
          </button>

          {/* Nav links on public view (Desktop) */}
          {currentView === 'public' && (
            <div className="hidden lg:flex items-center gap-6 text-xs font-semibold text-slate-600">
              <button 
                onClick={() => handleScrollToSection('how-it-works')} 
                className="hover:text-blue-600 transition-colors cursor-pointer py-1"
              >
                How It Works
              </button>
              <button 
                onClick={() => handleScrollToSection('features')} 
                className="hover:text-blue-600 transition-colors cursor-pointer py-1"
              >
                Features
              </button>
              <button 
                onClick={() => handleScrollToSection('pricing')} 
                className="hover:text-blue-600 transition-colors cursor-pointer py-1"
              >
                Pricing
              </button>
              <button 
                onClick={() => handleScrollToSection('future-benefits')} 
                className="hover:text-blue-600 transition-colors cursor-pointer py-1 flex items-center gap-1.5 text-blue-600 font-bold group"
              >
                <span>Future Benefits</span>
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse group-hover:scale-125 transition-transform" />
              </button>
              <button 
                onClick={() => handleScrollToSection('contact')} 
                className="hover:text-blue-600 transition-colors cursor-pointer py-1"
              >
                Support
              </button>
            </div>
          )}
        </div>

        {/* View Switcher & Role Badges (Desktop) */}
        <div className="hidden md:flex items-center gap-3">
          {/* Segmented View Switcher */}
          <div className="flex items-center bg-slate-100/90 p-1 rounded-xl text-xs font-semibold border border-slate-200/60 shadow-xs">
            <button
              onClick={() => onNavigate('public')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                currentView === 'public'
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Public Site
            </button>

            <button
              onClick={() => onNavigate('customer')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                currentView === 'customer'
                  ? 'bg-white text-blue-600 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Customer Portal</span>
            </button>

            <button
              onClick={() => onNavigate('admin')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                currentView === 'admin'
                  ? 'bg-red-600 text-white shadow-xs font-bold'
                  : 'text-red-700 hover:text-red-900 hover:bg-red-50/50'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Super Admin</span>
            </button>
          </div>

          {/* User Session / Auth Controls */}
          {currentUser ? (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              <div className="flex items-center gap-2 px-2.5 py-1 rounded-xl bg-slate-50 border border-slate-200/90 text-left">
                <div className={`w-7 h-7 rounded-lg text-white flex items-center justify-center font-bold text-xs shadow-xs ${
                  currentUser.role === 'super_admin' ? 'bg-red-600' : 'bg-blue-600'
                }`}>
                  {currentUser.fullName ? currentUser.fullName[0] : 'U'}
                </div>
                <div className="hidden lg:block">
                  <div className="text-xs font-bold text-slate-900 truncate max-w-[120px]">
                    {currentUser.fullName}
                  </div>
                  <div className="text-[9px] font-semibold uppercase tracking-wider flex items-center gap-1">
                    {currentUser.role === 'super_admin' ? (
                      <span className="text-red-600 font-bold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
                        SUPER ADMIN
                      </span>
                    ) : (
                      <span className="text-blue-600 font-bold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                        CUSTOMER
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <button
                onClick={onLogout}
                title="Sign out of current account"
                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all cursor-pointer interactive-btn border border-transparent hover:border-red-100"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onOpenCustomerAuth('login')}
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm hover:shadow-blue-500/20 cursor-pointer interactive-btn"
              >
                Sign In
              </button>
              <button
                onClick={onOpenAdminAuth}
                title="Super Admin Login Portal"
                className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all cursor-pointer border border-slate-200 interactive-btn"
              >
                <KeyRound className="w-4 h-4 text-slate-600" />
              </button>
            </div>
          )}
        </div>

        {/* Mobile Hamburger & Actions Button */}
        <div className="flex md:hidden items-center gap-2">
          {currentUser ? (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => handleMobileNavClick(currentUser.role === 'super_admin' ? 'admin' : 'customer')}
                className={`w-7 h-7 rounded-lg text-white flex items-center justify-center font-bold text-xs ${
                  currentUser.role === 'super_admin' ? 'bg-red-600' : 'bg-blue-600'
                }`}
              >
                {currentUser.fullName ? currentUser.fullName[0] : 'U'}
              </button>
            </div>
          ) : (
            <button
              onClick={() => onOpenCustomerAuth('login')}
              className="px-2.5 py-1 bg-blue-600 text-white rounded-lg text-xs font-bold"
            >
              Sign In
            </button>
          )}

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer / Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-lg border-b border-slate-200 shadow-xl animate-slide-down px-4 py-4 space-y-4">
          {/* Quick Role View Switcher in Mobile */}
          <div className="space-y-1.5">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1">
              Switch Workspace View
            </div>
            <div className="grid grid-cols-3 gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
              <button
                onClick={() => handleMobileNavClick('public')}
                className={`py-2 px-1 rounded-lg text-center transition-all ${
                  currentView === 'public'
                    ? 'bg-white text-slate-900 shadow-xs font-bold'
                    : 'text-slate-600'
                }`}
              >
                Public Site
              </button>
              <button
                onClick={() => handleMobileNavClick('customer')}
                className={`py-2 px-1 rounded-lg text-center transition-all ${
                  currentView === 'customer'
                    ? 'bg-white text-blue-600 shadow-xs font-bold'
                    : 'text-slate-600'
                }`}
              >
                Customer
              </button>
              <button
                onClick={() => handleMobileNavClick('admin')}
                className={`py-2 px-1 rounded-lg text-center transition-all ${
                  currentView === 'admin'
                    ? 'bg-red-600 text-white shadow-xs font-bold'
                    : 'text-red-700'
                }`}
              >
                Super Admin
              </button>
            </div>
          </div>

          {/* Public Sections */}
          <div className="pt-2 border-t border-slate-100 space-y-1">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1 mb-1">
              Platform Navigation
            </div>
            <button
              onClick={() => handleScrollToSection('how-it-works')}
              className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 rounded-lg flex items-center justify-between"
            >
              <span>How It Works</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            </button>
            <button
              onClick={() => handleScrollToSection('features')}
              className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 rounded-lg flex items-center justify-between"
            >
              <span>Security & Privacy Features</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            </button>
            <button
              onClick={() => handleScrollToSection('pricing')}
              className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 rounded-lg flex items-center justify-between"
            >
              <span>Campus Plans & Pricing</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            </button>
            <button
              onClick={() => handleScrollToSection('future-benefits')}
              className="w-full text-left px-3 py-2 text-xs font-bold text-blue-600 bg-blue-50/50 hover:bg-blue-50 rounded-lg flex items-center justify-between"
            >
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <span>Future Use & Campus Benefits</span>
              </span>
              <span className="text-[9px] bg-blue-600 text-white px-1.5 py-0.5 rounded-full font-bold">NEW</span>
            </button>
            <button
              onClick={() => handleScrollToSection('contact')}
              className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 rounded-lg flex items-center justify-between"
            >
              <span>Campus Helpdesk & Support</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </div>

          {/* Account Footer in Mobile */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
            {currentUser ? (
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-lg text-white flex items-center justify-center font-bold text-xs ${
                    currentUser.role === 'super_admin' ? 'bg-red-600' : 'bg-blue-600'
                  }`}>
                    {currentUser.fullName ? currentUser.fullName[0] : 'U'}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">{currentUser.fullName}</div>
                    <div className="text-[10px] text-slate-500 font-semibold uppercase">{currentUser.role}</div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    onLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="px-3 py-1.5 text-xs text-red-600 font-bold hover:bg-red-50 rounded-lg flex items-center gap-1"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 w-full">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenCustomerAuth('login');
                  }}
                  className="py-2 bg-blue-600 text-white rounded-xl text-xs font-bold text-center"
                >
                  Customer Sign In
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenAdminAuth();
                  }}
                  className="py-2 border border-red-200 text-red-600 bg-red-50/50 rounded-xl text-xs font-bold text-center flex items-center justify-center gap-1"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Admin Login</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
