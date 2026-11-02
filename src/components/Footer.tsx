import React from 'react';
import { motion } from 'motion/react';
import { WebsiteSettings } from '../types';
import { ShieldCheck, Mail, Phone, MapPin, Twitter, Github, Linkedin, Instagram } from 'lucide-react';

interface FooterProps {
  settings: WebsiteSettings;
  onNavigateToPolicy: (policy: 'privacy' | 'terms' | 'refund') => void;
  onNavigateToSection: (sectionId: string) => void;
}

export const Footer: React.FC<FooterProps> = ({
  settings,
  onNavigateToPolicy,
  onNavigateToSection
}) => {
  return (
    <footer className="bg-[var(--ct-bg-surface)] text-[var(--ct-text-secondary)] border-t border-[var(--ct-border-subtle)]">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand & Mission */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-[var(--ct-radius-lg)] bg-[var(--ct-accent)] text-[var(--ct-text-inverse)] flex items-center justify-center font-black text-sm shadow-[var(--ct-shadow-sm)] shadow-blue-500/20">
                CT
              </div>
              <div className="text-lg font-black tracking-tight text-[var(--ct-text-primary)]">
                {settings.appName}
              </div>
            </div>

            <div className="text-[10px] text-[var(--ct-accent-hover)] font-semibold tracking-wide uppercase flex flex-wrap gap-x-1">
              {(settings.tagline || 'Scan It to Find It').split(' ').map((word, i) => (
                <motion.span
                  key={`footer-tagline-${i}`}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.28, delay: 0.04 * i, ease: [0.25, 1, 0.5, 1] }}
                  className="inline-block"
                >
                  {word}
                </motion.span>
              ))}
            </div>

            <p className="text-[var(--ct-text-muted)] text-[10px] leading-relaxed max-w-sm">
              {settings.footerDescription}
            </p>

            <div className="flex items-center gap-3 pt-2">
              {settings.socialLinks.twitter && (
                <a
                  href={settings.socialLinks.twitter}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 bg-[var(--ct-bg-elevated)] hover:bg-[var(--ct-accent)] text-[var(--ct-text-muted)] hover:text-white rounded-[var(--ct-radius-md)] transition-colors"
                >
                  <Twitter className="w-4 h-4" />
                </a>
              )}
              {settings.socialLinks.github && (
                <a
                  href={settings.socialLinks.github}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 bg-[var(--ct-bg-elevated)] hover:bg-slate-800 text-[var(--ct-text-muted)] hover:text-white rounded-[var(--ct-radius-md)] transition-colors"
                >
                  <Github className="w-4 h-4" />
                </a>
              )}
              {settings.socialLinks.linkedin && (
                <a
                  href={settings.socialLinks.linkedin}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 bg-[var(--ct-bg-elevated)] hover:bg-blue-900/20 text-[var(--ct-text-muted)] hover:text-white rounded-[var(--ct-radius-md)] transition-colors"
                >
                  <Linkedin className="w-4 h-4" />
                </a>
              )}
              {settings.socialLinks.instagram && (
                <a
                  href={settings.socialLinks.instagram}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 bg-[var(--ct-bg-elevated)] hover:bg-pink-900/20 text-[var(--ct-text-muted)] hover:text-white rounded-[var(--ct-radius-md)] transition-colors"
                >
                  <Instagram className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>

          {/* Navigation Links */}
          <div className="space-y-3">
            <h4 className="text-[9px] font-bold text-[var(--ct-text-primary)] uppercase tracking-wider">
              Product & Platform
            </h4>
            <ul className="space-y-2 text-[var(--ct-text-muted)] text-[10px]">
              <li>
                <button
                  onClick={() => onNavigateToSection('how-it-works')}
                  className="hover:text-[var(--ct-accent-hover)] transition-colors cursor-pointer"
                >
                  How Campus Tag Works
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateToSection('features')}
                  className="hover:text-[var(--ct-accent-hover)] transition-colors cursor-pointer"
                >
                  Privacy-First Features
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateToSection('pricing')}
                  className="hover:text-[var(--ct-accent-hover)] transition-colors cursor-pointer"
                >
                  Campus & Lab Pricing
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateToSection('future-benefits')}
                  className="hover:text-[var(--ct-accent-hover)] transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <span>Future Use & Benefits</span>
                  <span className="text-[9px] bg-blue-950/50 text-[var(--ct-accent-hover)] px-1.5 py-0.2 rounded font-bold border border-blue-500/20">NEW</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateToSection('contact')}
                  className="hover:text-[var(--ct-accent-hover)] transition-colors cursor-pointer"
                >
                  Support & Helpdesk
                </button>
              </li>
            </ul>
          </div>

          {/* Legal & Compliance */}
          <div className="space-y-3">
            <h4 className="text-[9px] font-bold text-[var(--ct-text-primary)] uppercase tracking-wider">
              Legal & Privacy
            </h4>
            <ul className="space-y-2 text-[var(--ct-text-muted)] text-[10px]">
              <li>
                <button
                  onClick={() => onNavigateToPolicy('privacy')}
                  className="hover:text-[var(--ct-accent-hover)] transition-colors cursor-pointer"
                >
                  Privacy Policy (Zero PII)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateToPolicy('terms')}
                  className="hover:text-[var(--ct-accent-hover)] transition-colors cursor-pointer"
                >
                  Terms of Service
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateToPolicy('refund')}
                  className="hover:text-[var(--ct-accent-hover)] transition-colors cursor-pointer"
                >
                  Refund & Cancellation Policy
                </button>
              </li>
              <li className="pt-1 flex items-center gap-1.5 text-emerald-500 text-[10px]">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>FERPA / GDPR Conscious</span>
              </li>
            </ul>
          </div>

          {/* Campus Office & Support */}
          <div className="space-y-3">
            <h4 className="text-[9px] font-bold text-[var(--ct-text-primary)] uppercase tracking-wider">
              Campus Operations
            </h4>
            <div className="space-y-2.5 text-[var(--ct-text-muted)] text-[10px]">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[var(--ct-accent-hover)] shrink-0 mt-0.5" />
                <span>{settings.campusOfficeAddress}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[var(--ct-accent-hover)] shrink-0" />
                <a href={`mailto:${settings.contactEmail}`} className="hover:underline hover:text-[var(--ct-accent-hover)]">
                  {settings.contactEmail}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[var(--ct-accent-hover)] shrink-0" />
                <span>{settings.supportPhone}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-[var(--ct-border-subtle)] flex flex-col md:flex-row items-center justify-between gap-4 text-[10px] text-[var(--ct-text-muted)]">
          <div>{settings.copyrightText}</div>
          <div className="flex items-center gap-6">
            <span>Built for Modern University Safety Ecosystems</span>
            <span>·</span>
            <span>Version 2.4 Production Ready</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
