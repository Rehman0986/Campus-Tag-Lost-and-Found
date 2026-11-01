import React from 'react';
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
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand & Mission */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-sm shadow-md shadow-blue-500/20">
                CT
              </div>
              <div className="text-lg font-black tracking-tight text-white">
                {settings.appName}
              </div>
            </div>

            <p className="text-xs text-blue-400 font-semibold tracking-wide uppercase">
              {settings.tagline}
            </p>

            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              {settings.footerDescription}
            </p>

            <div className="flex items-center gap-3 pt-2">
              {settings.socialLinks.twitter && (
                <a
                  href={settings.socialLinks.twitter}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 bg-slate-800 hover:bg-blue-600 text-slate-400 hover:text-white rounded-lg transition-colors"
                >
                  <Twitter className="w-4 h-4" />
                </a>
              )}
              {settings.socialLinks.github && (
                <a
                  href={settings.socialLinks.github}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg transition-colors"
                >
                  <Github className="w-4 h-4" />
                </a>
              )}
              {settings.socialLinks.linkedin && (
                <a
                  href={settings.socialLinks.linkedin}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 bg-slate-800 hover:bg-blue-700 text-slate-400 hover:text-white rounded-lg transition-colors"
                >
                  <Linkedin className="w-4 h-4" />
                </a>
              )}
              {settings.socialLinks.instagram && (
                <a
                  href={settings.socialLinks.instagram}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 bg-slate-800 hover:bg-pink-600 text-slate-400 hover:text-white rounded-lg transition-colors"
                >
                  <Instagram className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>

          {/* Navigation Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Product & Platform</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <button
                  onClick={() => onNavigateToSection('how-it-works')}
                  className="hover:text-blue-400 transition-colors cursor-pointer"
                >
                  How Campus Tag Works
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateToSection('features')}
                  className="hover:text-blue-400 transition-colors cursor-pointer"
                >
                  Privacy-First Features
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateToSection('pricing')}
                  className="hover:text-blue-400 transition-colors cursor-pointer"
                >
                  Campus & Lab Pricing
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateToSection('future-benefits')}
                  className="hover:text-blue-400 transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <span>Future Use & Benefits</span>
                  <span className="text-[9px] bg-blue-900 text-blue-200 px-1.5 py-0.2 rounded font-bold">NEW</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateToSection('contact')}
                  className="hover:text-blue-400 transition-colors cursor-pointer"
                >
                  Support & Helpdesk
                </button>
              </li>
            </ul>
          </div>

          {/* Legal & Compliance */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Legal & Privacy</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <button
                  onClick={() => onNavigateToPolicy('privacy')}
                  className="hover:text-blue-400 transition-colors cursor-pointer"
                >
                  Privacy Policy (Zero PII)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateToPolicy('terms')}
                  className="hover:text-blue-400 transition-colors cursor-pointer"
                >
                  Terms of Service
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateToPolicy('refund')}
                  className="hover:text-blue-400 transition-colors cursor-pointer"
                >
                  Refund & Cancellation Policy
                </button>
              </li>
              <li className="pt-1 flex items-center gap-1.5 text-emerald-400 text-[11px]">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>FERPA / GDPR Conscious</span>
              </li>
            </ul>
          </div>

          {/* Campus Office & Support */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Campus Operations</h4>
            <div className="space-y-2.5 text-xs text-slate-400">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <span>{settings.campusOfficeAddress}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-blue-400 shrink-0" />
                <a href={`mailto:${settings.contactEmail}`} className="hover:underline">
                  {settings.contactEmail}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-blue-400 shrink-0" />
                <span>{settings.supportPhone}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
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
