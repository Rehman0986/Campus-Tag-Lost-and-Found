import React, { useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
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
import { drawerPanel, staggerItem, tapPress } from '../components/motion';

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
  const reduced = useReducedMotion();
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

  const drawerTransition = reduced ? { duration: 0 } : { type: 'spring' as const, stiffness: 320, damping: 30 };

  return (
    <header className="sticky top-0 z-50 bg-[var(--ct-bg-surface)]/90 backdrop-blur-md border-b border-[var(--ct-border-subtle)] shadow-xs transition-all">
      {/* Subtle University Accent Bar */}
      <div className="h-1 bg-gradient-to-r from-[var(--ct-accent)] via-indigo-600 to-emerald-500 w-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
        {/* Brand */}
        <div className="flex items-center gap-6 shrink-0">
          <button
            onClick={() => onNavigate('public')}
            className="flex items-center gap-3 text-left cursor-pointer group focus:outline-none ct-touch-target"
            title="Go to Campus Tag Homepage"
          >
            <div className="relative">
              <div className="w-9 h-9 rounded-[var(--ct-radius-lg)] bg-gradient-to-br from-[var(--ct-accent)] to-indigo-700 text-[var(--ct-text-inverse)] flex items-center justify-center font-black text-xs shadow-[var(--ct-shadow-sm)] shadow-blue-500/25 group-hover:scale-105 group-hover:shadow-blue-500/40 transition-all duration-200">
                CT
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white ring-1 ring-emerald-500/30" />
            </div>

            <div>
              <div className="text-sm font-black tracking-tight text-[var(--ct-text-primary)] group-hover:text-[var(--ct-accent-hover)] transition-colors flex items-center gap-1.5">
                <span>{settings.appName}</span>
                <span className="text-[9px] bg-blue-950/20 text-[var(--ct-accent-hover)] border border-blue-500/20 px-1.5 py-0.5 rounded-md font-semibold tracking-normal hidden sm:inline-block">
                  SaaS 2.4
                </span>
              </div>
              <div className="text-[10px] text-[var(--ct-accent-hover)] font-semibold tracking-wider uppercase flex flex-wrap gap-x-1">
                {(settings.tagline || 'Scan It to Find It').split(' ').map((word, i) => (
                  <motion.span
                    key={`nav-tagline-${i}`}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.28, delay: 0.04 * i, ease: [0.25, 1, 0.5, 1] }}
                    className="inline-block"
                  >
                    {word}
                  </motion.span>
                ))}
              </div>
            </div>
          </button>

          {/* Nav links on public view (Desktop) */}
          {currentView === 'public' && (
            <div className="hidden lg:flex items-center gap-6 text-xs font-semibold text-[var(--ct-text-muted)]">
              <button
                onClick={() => handleScrollToSection('how-it-works')}
                className="hover:text-[var(--ct-accent-hover)] transition-colors cursor-pointer py-1 ct-touch-target"
              >
                How It Works
              </button>
              <button
                onClick={() => handleScrollToSection('features')}
                className="hover:text-[var(--ct-accent-hover)] transition-colors cursor-pointer py-1 ct-touch-target"
              >
                Features
              </button>
              <button
                onClick={() => handleScrollToSection('pricing')}
                className="hover:text-[var(--ct-accent-hover)] transition-colors cursor-pointer py-1 ct-touch-target"
              >
                Pricing
              </button>
              <button
                onClick={() => handleScrollToSection('future-benefits')}
                className="hover:text-[var(--ct-accent-hover)] transition-colors cursor-pointer py-1 flex items-center gap-1.5 text-[var(--ct-accent-hover)] font-bold group ct-touch-target"
              >
                <span>Future Benefits</span>
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--ct-accent)] animate-pulse group-hover:scale-125 transition-transform" />
              </button>
              <button
                onClick={() => handleScrollToSection('contact')}
                className="hover:text-[var(--ct-accent-hover)] transition-colors cursor-pointer py-1 ct-touch-target"
              >
                Support
              </button>
            </div>
          )}
        </div>

        {/* View Switcher & Role Badges (Desktop) */}
        <div className="hidden md:flex items-center gap-3">
          {/* Segmented View Switcher */}
          <div className="flex items-center bg-[var(--ct-bg-elevated)]/90 p-1 rounded-[var(--ct-radius-lg)] text-xs font-semibold border border-[var(--ct-border-subtle)] shadow-xs">
            <button
              onClick={() => onNavigate('public')}
              className={`px-3 py-1.5 rounded-[var(--ct-radius-md)] transition-all cursor-pointer ct-touch-target ${
                currentView === 'public'
                  ? 'bg-[var(--ct-card-elevated)] text-[var(--ct-text-primary)] shadow-xs font-bold'
                  : 'text-[var(--ct-text-secondary)] hover:text-[var(--ct-text-primary)]'
              }`}
            >
              Public Site
            </button>

            <button
              onClick={() => onNavigate('customer')}
              className={`px-3 py-1.5 rounded-[var(--ct-radius-md)] transition-all cursor-pointer flex items-center gap-1.5 ct-touch-target ${
                currentView === 'customer'
                  ? 'bg-[var(--ct-card-elevated)] text-[var(--ct-accent-hover)] shadow-xs font-bold'
                  : 'text-[var(--ct-text-secondary)] hover:text-[var(--ct-text-primary)]'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Customer Portal</span>
            </button>

            <button
              onClick={() => onNavigate('admin')}
              className={`px-3 py-1.5 rounded-[var(--ct-radius-md)] transition-all cursor-pointer flex items-center gap-1.5 ct-touch-target ${
                currentView === 'admin'
                  ? 'bg-red-600 text-white shadow-xs font-bold'
                  : 'text-red-600 hover:text-[var(--ct-status-critical)] hover:bg-red-900/20'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Super Admin</span>
            </button>
          </div>

          {/* User Session / Auth Controls */}
          {currentUser ? (
            <div className="flex items-center gap-2 pl-2 border-l border-[var(--ct-border-subtle)]">
              <div className="flex items-center gap-2 px-2.5 py-1 rounded-[var(--ct-radius-lg)] bg-[var(--ct-bg-elevated)]/90 border border-[var(--ct-border-subtle)] text-left">
                <div className={`w-7 h-7 rounded-[var(--ct-radius-md)] text-white flex items-center justify-center font-bold text-xs shadow-xs ${
                  currentUser.role === 'super_admin' ? 'bg-red-600' : 'bg-[var(--ct-accent)]'
                }`}>
                  {currentUser.fullName ? currentUser.fullName[0] : 'U'}
                </div>
                <div className="hidden lg:block">
                  <div className="text-xs font-bold text-[var(--ct-text-primary)] truncate max-w-[120px]">
                    {currentUser.fullName}
                  </div>
                  <div className="text-[9px] font-semibold uppercase tracking-wider flex items-center gap-1">
                    {currentUser.role === 'super_admin' ? (
                      <span className="text-red-600 font-bold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
                        SUPER ADMIN
                      </span>
                    ) : (
                      <span className="text-[var(--ct-accent-hover)] font-bold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-[var(--ct-accent)]" />
                        CUSTOMER
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <button
                onClick={onLogout}
                title="Sign out of current account"
                className="p-2 text-[var(--ct-text-muted)] hover:text-[var(--ct-status-critical)] hover:bg-red-900/20 rounded-[var(--ct-radius-lg)] transition-all cursor-pointer interactive-btn border border-transparent hover:border-red-100/30 ct-touch-target"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onOpenCustomerAuth('login')}
                className="ct-btn-primary px-4 py-1.5 text-[10px]"
              >
                Sign In
              </button>
              <button
                onClick={onOpenAdminAuth}
                title="Super Admin Login Portal"
                className="p-1.5 text-[var(--ct-text-muted)] hover:text-red-600 hover:bg-red-900/20 rounded-[var(--ct-radius-lg)] transition-all cursor-pointer border border-[var(--ct-border-subtle)] interactive-btn ct-touch-target"
              >
                <KeyRound className="w-4 h-4 text-[var(--ct-text-muted)]" />
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
                className={`w-7 h-7 rounded-[var(--ct-radius-md)] text-white flex items-center justify-center font-bold text-xs ${
                  currentUser.role === 'super_admin' ? 'bg-red-600' : 'bg-[var(--ct-accent)]'
                } ct-touch-target`}
              >
                {currentUser.fullName ? currentUser.fullName[0] : 'U'}
              </button>
            </div>
          ) : (
            <button
              onClick={() => onOpenCustomerAuth('login')}
              className="ct-btn-primary px-2.5 py-1 text-[10px]"
            >
              Sign In
            </button>
          )}

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-[var(--ct-text-secondary)] hover:text-[var(--ct-text-primary)] hover:bg-[var(--ct-bg-elevated)] rounded-[var(--ct-radius-lg)] border border-[var(--ct-border-subtle)] transition-colors ct-touch-target"
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
          >
            <motion.button
              whileTap={{ scale: 0.9 }}
              style={{ borderRadius: '0.5rem' }}
              className="p-1.5 shrink-0"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </motion.button>
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer / Dropdown */}
      {mobileMenuOpen && (
        <motion.div
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={drawerPanel}
          transition={drawerTransition}
          className="md:hidden bg-[var(--ct-bg-surface)]/95 backdrop-blur-lg border-b border-[var(--ct-border-subtle)] shadow-[var(--ct-shadow-lg)] px-4 py-4 space-y-4"
        >
          {/* Quick Role View Switcher in Mobile */}
          <div className="space-y-1.5">
            <div className="text-[10px] font-bold text-[var(--ct-text-muted)] uppercase tracking-wider px-1">
              Switch Workspace View
            </div>
            <div className="grid grid-cols-3 gap-1.5 bg-[var(--ct-bg-elevated)] p-1 rounded-[var(--ct-radius-lg)] text-[10px] font-semibold">
              <button
                onClick={() => handleMobileNavClick('public')}
                className={`py-2 px-1 rounded-[var(--ct-radius-md)] text-center transition-all ct-touch-target ${
                  currentView === 'public'
                    ? 'bg-[var(--ct-card-elevated)] text-[var(--ct-text-primary)] shadow-xs font-bold'
                    : 'text-[var(--ct-text-secondary)]'
                }`}
              >
                Public Site
              </button>
              <button
                onClick={() => handleMobileNavClick('customer')}
                className={`py-2 px-1 rounded-[var(--ct-radius-md)] text-center transition-all ct-touch-target ${
                  currentView === 'customer'
                    ? 'bg-[var(--ct-card-elevated)] text-[var(--ct-accent-hover)] shadow-xs font-bold'
                    : 'text-[var(--ct-text-secondary)]'
                }`}
              >
                Customer
              </button>
              <button
                onClick={() => handleMobileNavClick('admin')}
                className={`py-2 px-1 rounded-[var(--ct-radius-md)] text-center transition-all ct-touch-target ${
                  currentView === 'admin'
                    ? 'bg-red-600 text-white shadow-xs font-bold'
                    : 'text-red-600'
                }`}
              >
                Super Admin
              </button>
            </div>
          </div>

          {/* Public Sections */}
          <div className="pt-2 border-t border-[var(--ct-border-subtle)] space-y-1">
            <div className="text-[10px] font-bold text-[var(--ct-text-muted)] uppercase tracking-wider px-1 mb-1">
              Platform Navigation
            </div>
            {[
              { id: 'how-it-works', label: 'How It Works' },
              { id: 'features', label: 'Security & Privacy Features' },
              { id: 'pricing', label: 'Campus Plans & Pricing' },
              { id: 'future-benefits', label: 'Future Use & Campus Benefits', isNew: true },
              { id: 'contact', label: 'Campus Helpdesk & Support' },
            ].map((section) => (
              <motion.div
                key={section.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: 0.05 * ['how-it-works','features','pricing','future-benefits','contact'].indexOf(section.id) }}
                className="my-1"
              >
                <button
                  onClick={() => handleScrollToSection(section.id)}
                  className={`w-full text-left px-3 py-2 text-[10px] font-semibold rounded-[var(--ct-radius-md)] flex items-center justify-between ct-touch-target ${
                    section.id === 'future-benefits'
                      ? 'text-[var(--ct-accent-hover)] bg-blue-950/10 hover:bg-blue-900/20'
                      : 'text-[var(--ct-text-secondary)] hover:bg-[var(--ct-bg-elevated)]'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    {section.id === 'future-benefits' && <Sparkles className="w-3.5 h-3.5 text-[var(--ct-accent-hover)]" />}
                    {section.label}
                  </span>
                  {section.id !== 'future-benefits' ? (
                    <ChevronRight className="w-3.5 h-3.5 text-[var(--ct-text-muted)]" />
                  ) : (
                    <span className="text-[9px] bg-[var(--ct-accent)] text-white px-1.5 py-0.5 rounded-full font-bold">NEW</span>
                  )}
                </button>
              </motion.div>
            ))}
          </div>

          {/* Account Footer in Mobile */}
          <div className="pt-2 border-t border-[var(--ct-border-subtle)] flex items-center justify-between">
            {currentUser ? (
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-[var(--ct-radius-md)] text-white flex items-center justify-center font-bold text-xs ${
                    currentUser.role === 'super_admin' ? 'bg-red-600' : 'bg-[var(--ct-accent)]'
                  }`}>
                    {currentUser.fullName ? currentUser.fullName[0] : 'U'}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[var(--ct-text-primary)]">{currentUser.fullName}</div>
                    <div className="text-[10px] text-[var(--ct-text-muted)] font-semibold uppercase">{currentUser.role}</div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    onLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="px-3 py-1.5 text-[10px] text-red-600 font-bold hover:bg-red-900/20 rounded-[var(--ct-radius-md)] flex items-center gap-1 ct-touch-target transition-colors"
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
                  className="ct-btn-primary py-2 text-[10px]"
                >
                  Customer Sign In
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenAdminAuth();
                  }}
                  className="py-2 border border-red-600/30 text-red-600 bg-red-900/10 rounded-[var(--ct-radius-md)] text-[10px] font-bold text-center flex items-center justify-center gap-1 ct-touch-target transition-colors"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Admin Login</span>
                </button>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </header>
  );
};
