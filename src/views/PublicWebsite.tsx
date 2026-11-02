import React, { useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { SubscriptionPlan, WebsiteSettings, Item } from '../types';
import { db } from '../mock/storage';
import {
  ShieldCheck,
  QrCode,
  MapPin,
  Lock,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Send,
  Building,
  Smartphone,
  Check,
  ChevronDown,
  ChevronUp,
  Sparkles,
  HelpCircle,
  FileText,
  Radio,
  Zap,
  Laptop,
  Cpu,
  Award,
  Clock,
  Compass,
  Layers,
  Search,
  ExternalLink
} from 'lucide-react';
import { staggerContainer, staggerItem, fadeInUp, cardHover, tapPress, accordionContent, ScrollReveal, reducedVariants } from '../components/motion';

interface PublicWebsiteProps {
  settings: WebsiteSettings;
  plans: SubscriptionPlan[];
  onOpenAuth: (initialMode?: 'login' | 'register') => void;
  onSimulateFinderScan: (publicId: string) => void;
  activePolicy: 'privacy' | 'terms' | 'refund' | null;
  onClosePolicy: () => void;
}

export const PublicWebsite: React.FC<PublicWebsiteProps> = ({
  settings,
  plans,
  onOpenAuth,
  onSimulateFinderScan,
  activePolicy,
  onClosePolicy
}) => {
  const reduced = useReducedMotion();
  const headlineWords = (settings.heroHeadline || 'Protect Your Campus Gear.').split(' ');
  const taglineWords = (settings.tagline || 'Scan It to Find It').split(' ');
  const [demoInputId, setDemoInputId] = useState('cpt-8f92-a1b4');
  const [contactSubject, setContactSubject] = useState('Campus Department Fleet Inquiry');
  const [contactEmail, setContactEmail] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [contactSubmitted, setContactSubmitted] = useState(false);

  // FAQ state
  const [expandedFaqId, setExpandedFaqId] = useState<string | null>('faq_1');
  const [faqCategoryFilter, setFaqCategoryFilter] = useState<string>('ALL');

  // Real-world scenario tab state
  const [activeScenarioIdx, setActiveScenarioIdx] = useState(0);

  const sampleItems = db.getItems();

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactEmail.trim() || !contactMessage.trim()) return;

    db.logAudit(
      contactEmail,
      'SUPPORT_TICKET_SUBMITTED',
      'Settings',
      'contact_form',
      `Subject: "${contactSubject}" - Message length: ${contactMessage.length} chars`
    );

    setContactSubmitted(true);
    setTimeout(() => {
      setContactEmail('');
      setContactMessage('');
    }, 4000);
  };

  const realWorldScenarios = [
    {
      title: 'University Main Library 4th Floor',
      category: 'Electronics & Laptops',
      item: 'MacBook Air M3 & Research Notes',
      finderRole: 'Student Peer at adjacent study desk',
      recoveryTime: '24 minutes',
      description: 'Owner left laptop to grab coffee. A student scanned the discrete QR code on the shell, dropped an OSM map pin for Table #42, and communicated via anonymous chat without trading phone numbers.',
      status: 'Safely Handed Over'
    },
    {
      title: 'Chemistry 101 Lecture Hall',
      category: 'Lab & Research Equipment',
      item: 'TI-Nspire CAS CX II Calculator',
      finderRole: 'Graduate Teaching Assistant',
      recoveryTime: '45 minutes',
      description: 'Found under lecture seat 14B. Teaching assistant scanned tag, verified owner name was masked, and notified student that it was deposited in the Chemistry Dept administrative safe.',
      status: 'Held at Department Desk'
    },
    {
      title: 'North Residence Quad Bike Racks',
      category: 'Bicycles & Scooters',
      item: 'Trek FX Commuter Hybrid Bike',
      finderRole: 'Campus Public Safety Officer',
      recoveryTime: '1 hour 12 minutes',
      description: 'Owner accidentally left their cable lock unlatched. Campus patrol officer scanned the tag, confirmed emergency contact relay, and moved bike into secured dorm storage.',
      status: 'Secured by Campus Safety'
    },
    {
      title: 'Biomedical Research Transit Corridor',
      category: 'Lab & Research Equipment',
      item: 'Temperature-Monitored Sample Carrier',
      finderRole: 'Biohazard Logistics Technician',
      recoveryTime: '18 minutes',
      description: 'Misplaced outside autoclave suite. Immediate automated scan alert warned the research lead instantly, preventing specimen degradation.',
      status: 'Critical Recovery Complete'
    }
  ];

  const faqs = settings.faqList && settings.faqList.length > 0 ? settings.faqList : [
    {
      id: 'faq_1',
      question: 'Will my personal phone number or email be shown to anyone who scans my item?',
      answer: 'Never. Campus Tag is architected with a strict privacy firewall. Finders only see the non-sensitive public name and category you chose to disclose. All communications occur through our secure, anonymous two-way relay.',
      category: 'Privacy'
    },
    {
      id: 'faq_2',
      question: 'Do finders need to create an account or download an app to report my item?',
      answer: 'No! Finders do not need an account, password, or application download. When they scan your QR code with their standard mobile camera, a lightweight web page opens instantly where they can write a message, upload a photo, and share their GPS or dropped pin location.',
      category: 'Equipment'
    },
    {
      id: 'faq_3',
      question: 'What happens to my physical tags if my subscription plan ends or lapses?',
      answer: 'Your tags never stop working. Our Tag Longevity Guarantee ensures that even if you downgrade or lapse your subscription, any physical tag you printed will remain 100% active and scannable forever. Found items will always trigger alerts to your registered account.',
      category: 'Pricing'
    },
    {
      id: 'faq_4',
      question: 'How does the interactive map work for the finder and owner?',
      answer: 'Our map uses free open-source OpenStreetMap with Leaflet. Finders can search campus buildings, tap "Use Current Location" for high-accuracy GPS coordinates, or drag and drop a pin anywhere on the campus map. Owners view the exact timestamp, coordinates, and resolved address in their dashboard.',
      category: 'Campus Security'
    },
    {
      id: 'faq_5',
      question: 'Can academic departments, robotics labs, or student clubs manage equipment in bulk?',
      answer: 'Yes. Campus Tag supports multi-tenant workspaces. Department heads can manage hundreds of assets, generate bulk printable sticker sheets, filter by research cohort, and download comprehensive CSV audits.',
      category: 'Equipment'
    },
    {
      id: 'faq_6',
      question: 'Is Campus Tag compliant with student privacy laws like FERPA?',
      answer: 'Yes. Because no student education records, personal contact directories, or student IDs are ever publicly exposed or cross-indexed, Campus Tag complies with strict university data security standards and FERPA privacy regulations.',
      category: 'Privacy'
    }
  ];

  const filteredFaqs = faqs.filter(f => 
    faqCategoryFilter === 'ALL' || f.category.toLowerCase() === faqCategoryFilter.toLowerCase()
  );

  return (
    <div className="min-h-screen flex flex-col bg-[var(--ct-bg-deep)] text-[var(--ct-text-primary)]">
      {/* Announcement Banner if enabled */}
      {settings.announcementBanner?.enabled && (
        <div className="bg-blue-950/50 text-white text-xs py-2 px-4 text-center font-medium flex items-center justify-center gap-2 border-b border-[var(--ct-border-accent)]">
          <span>{settings.announcementBanner.text}</span>
          {settings.announcementBanner.linkUrl && (
            <a
              href={settings.announcementBanner.linkUrl}
              className="underline text-[var(--ct-accent-hover)] hover:text-white font-semibold cursor-pointer"
            >
              Learn More →
            </a>
          )}
        </div>
      )}

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-[var(--ct-bg-deep)] text-[var(--ct-text-primary)] pt-24 pb-20 px-6">
      <ScrollReveal once={true}>
        {/* Subtle Background Pattern */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

        <div className="max-w-6xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="text-center max-w-3xl mx-auto space-y-6"
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[var(--ct-accent)]/10 border border-[var(--ct-accent)]/30 text-[var(--ct-accent-hover)] text-xs font-semibold backdrop-blur-xs animate-scale-in">
              <ShieldCheck className="w-4 h-4 text-[var(--ct-accent-hover)]" />
              <span>University-Grade Campus Gear Recovery System</span>
            </div>

            <motion.div
              initial="hidden"
              animate="visible"
              variants={reduced ? reducedVariants(staggerContainer, true) : staggerContainer}
              className="text-display text-[var(--ct-text-primary)] leading-[1.1] flex flex-wrap gap-x-2 gap-y-1 justify-center"
            >
              {headlineWords.map((word, i) => (
                <motion.span
                  key={`headline-${i}`}
                  variants={reduced ? reducedVariants(staggerItem, true) : staggerItem}
                  className="inline-block"
                >
                  {word}
                </motion.span>
              ))}
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--ct-accent-hover)] via-sky-300 to-blue-200 inline-flex flex-wrap gap-x-2 justify-center">
                {taglineWords.map((word, i) => (
                  <motion.span
                    key={`tagline-${i}`}
                    variants={reduced ? reducedVariants(staggerItem, true) : staggerItem}
                    className="inline-block"
                  >
                    {word}
                  </motion.span>
                ))}
              </span>
            </motion.div>

            <p className="text-body text-[var(--ct-text-secondary)] leading-relaxed max-w-xl mx-auto">
              {settings.heroDescription ||
                'The privacy-first QR tagging platform for students, researchers, and campus faculty. Recover lost laptops, bikes, and lab equipment with zero personal phone numbers or emails exposed.'}
            </p>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="flex flex-wrap items-center justify-center gap-4 pt-4"
            >
              <button
                onClick={() => onOpenAuth('register')}
                className="ct-btn-primary"
              >
                <span>Protect Your First 5 Items Free</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  const el = document.getElementById('interactive-demo');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-6 py-3.5 bg-[var(--ct-bg-surface)]/80 hover:bg-[var(--ct-bg-elevated)]/80 border border-[var(--ct-border-subtle)] text-[var(--ct-text-secondary)] rounded-[var(--ct-radius-lg)] text-sm font-semibold transition-all cursor-pointer backdrop-blur-xs ct-touch-target"
              >
                Try Live Scanner Demo
              </button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.18 }}
              className="pt-8 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs text-[var(--ct-text-muted)]"
            >
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[var(--ct-status-success)]" />
                <span>Zero PII Exposed to Finders</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[var(--ct-status-success)]" />
                <span>Tags Work Even If Plan Expires</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[var(--ct-status-success)]" />
                <span>Print-Ready Waterproof Labels</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </ScrollReveal>
      </section>

      {/* Institutional Trust & Campus Metric Strip */}
      <section className="bg-[var(--ct-bg-surface)] border-b border-[var(--ct-border-subtle)] py-6 px-6">
      <ScrollReveal once={true}>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center"
        >
          <motion.div
            key="m1"
            initial={reduced ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0, ease: [0.25, 1, 0.5, 1] }}
            className="space-y-1"
          >
            <div className="text-2xl sm:text-3xl font-black text-[var(--ct-text-primary)]">87.4%</div>
            <div className="text-xs text-[var(--ct-text-muted)]">Recovery Rate Within 4 Hours</div>
          </motion.div>
          <motion.div
            key="m2"
            initial={reduced ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.07, ease: [0.25, 1, 0.5, 1] }}
            className="space-y-1"
          >
            <div className="text-2xl sm:text-3xl font-black text-[var(--ct-accent-hover)]">0 PII</div>
            <div className="text-xs text-[var(--ct-text-muted)]">Zero Personal Phone Numbers Shared</div>
          </motion.div>
          <motion.div
            key="m3"
            initial={reduced ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.14, ease: [0.25, 1, 0.5, 1] }}
            className="space-y-1"
          >
            <div className="text-2xl sm:text-3xl font-black text-[var(--ct-status-success)]">100% Free</div>
            <div className="text-xs text-[var(--ct-text-muted)]">OpenStreetMap Interactive Pin Drop</div>
          </motion.div>
          <motion.div
            key="m4"
            initial={reduced ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.21, ease: [0.25, 1, 0.5, 1] }}
            className="space-y-1"
          >
            <div className="text-2xl sm:text-3xl font-black text-[var(--ct-text-primary)]">&lt; 15s</div>
            <div className="text-xs text-[var(--ct-text-muted)]">Finder Report Submission Time</div>
          </motion.div>
        </motion.div>
      </ScrollReveal>
      </section>

      {/* Interactive Finder Simulator Bar */}
      <section id="interactive-demo" className="py-12 bg-[var(--ct-bg-surface)]/95 border-b border-[var(--ct-border-subtle)] px-6">
      <ScrollReveal once={true}>
        <div className="max-w-4xl mx-auto">
          <div className="ct-card-glass p-6 sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
              <div>
                <span className="text-caption text-[var(--ct-accent-hover)] flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4" />
                  Live QR Finder Simulator
                </span>
                <h3 className="text-title text-[var(--ct-text-primary)] mt-1">
                  Test what a stranger sees when they scan your item
                </h3>
              </div>
              <span className="text-[10px] text-[var(--ct-text-muted)] bg-[var(--ct-bg-elevated)] px-3 py-1 rounded-[var(--ct-radius-sm)] border border-[var(--ct-border-subtle)]">
                Privacy-First · No Login Needed
              </span>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <div className="relative flex-1">
                <QrCode className="w-4 h-4 text-[var(--ct-text-muted)] absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  value={demoInputId}
                  onChange={(e) => setDemoInputId(e.target.value)}
                  placeholder="Enter sample public tag ID..."
                  className="ct-input w-full pl-10 pr-4 py-3 bg-[var(--ct-bg-surface)] font-mono"
                />
              </div>
              <button
                onClick={() => onSimulateFinderScan(demoInputId)}
                className="px-6 py-3 bg-[var(--ct-accent)] hover:bg-[var(--ct-accent-hover)] text-white rounded-[var(--ct-radius-lg)] text-xs font-bold transition-colors cursor-pointer shadow-[var(--ct-shadow-sm)] shadow-blue-500/20 shrink-0 flex items-center justify-center gap-2"
              >
                <span>Simulate Scan (/f/{demoInputId})</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-[var(--ct-text-muted)]">
              <span>Or click a registered item:</span>
              {sampleItems.slice(0, 3).map(item => (
                <button
                  key={item.id}
                  onClick={() => {
                    setDemoInputId(item.publicId);
                    onSimulateFinderScan(item.publicId);
                  }}
                  className="px-2.5 py-1 bg-[var(--ct-bg-elevated)] hover:bg-[var(--ct-bg-surface)] border border-[var(--ct-border-subtle)] text-[var(--ct-accent-hover)] font-mono text-[11px] cursor-pointer transition-colors rounded-[var(--ct-radius-sm)]"
                >
                  {item.publicId} ({item.name.slice(0, 16)}...)
                </button>
              ))}
            </div>
          </div>
        </div>
      </ScrollReveal>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-6 bg-[var(--ct-bg-deep)]">
      <ScrollReveal once={true}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-caption text-[var(--ct-accent-hover)] uppercase tracking-wider">
              Simple 4-Step Recovery Workflow
            </span>
            <h2 className="text-headline text-[var(--ct-text-primary)]">
              How Campus Tag Works
            </h2>
            <p className="text-body text-[var(--ct-text-secondary)]">
              Engineered specifically for university campus life where items are often left in study lounges, libraries, and lab desks.
            </p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-4 gap-8"
          >
            {(settings.howItWorksSteps && settings.howItWorksSteps.length > 0
              ? settings.howItWorksSteps
              : [
                  { stepNumber: '01', title: 'Register Gear', description: 'Add laptops, calculators, lab instruments, or bikes. Each receives a unique unguessable ID.' },
                  { stepNumber: '02', title: 'Affix QR Label', description: 'Print ready-to-peel weatherproof stickers or download vector SVGs for laser etching onto campus equipment.' },
                  { stepNumber: '03', title: 'Lost Mode & Scan', description: 'If lost, toggle Lost Mode with 1 click. Any good Samaritan who scans the QR gets urgent recovery steps without your private info.' },
                  { stepNumber: '04', title: 'Safe Handover', description: 'Finder drops a pin or leaves the item at campus lost & found, notifying you instantly through anonymous two-way chat.' }
                ]
            ).map((s, idx) => (
              <motion.div
                key={idx}
                initial={reduced ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.07 * idx, ease: [0.25, 1, 0.5, 1] }}
                whileHover={{ y: -4 }}
                className="ct-card p-6 relative"
              >
                <div className={`w-10 h-10 rounded-[var(--ct-radius-lg)] text-[var(--ct-text-inverse)] font-black text-sm flex items-center justify-center mb-4 shadow-[var(--ct-shadow-sm)] ${
                  idx === 2 ? 'bg-[var(--ct-status-warning)]' : idx === 3 ? 'bg-[var(--ct-status-success)]' : 'bg-[var(--ct-accent)]'
                }`}>
                  0{s.stepNumber || idx + 1}
                </div>
                <h3 className="text-base font-bold text-[var(--ct-text-primary)] mb-2">{s.title}</h3>
                <p className="text-[var(--ct-text-secondary)] leading-relaxed text-[11px]">
                  {s.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </ScrollReveal>
      </section>

      {/* Real-World Recovery Scenarios Section */}
      <section className="py-20 px-6 bg-[var(--ct-bg-surface)] border-t border-[var(--ct-border-subtle)]">
      <ScrollReveal once={true}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
            <span className="text-caption text-[var(--ct-accent-hover)] uppercase tracking-wider">
              Proven Across Campus Realities
            </span>
            <h2 className="text-headline text-[var(--ct-text-primary)]">
              Real-World Recovery Scenarios
            </h2>
            <p className="text-body text-[var(--ct-text-secondary)]">
              See how everyday items get returned safely across libraries, residence halls, and research labs.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Scenario Selector */}
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4 }}
              className="lg:col-span-5 space-y-3"
            >
              {realWorldScenarios.map((sc, i) => (
                <motion.button
                  key={i}
                  whileHover={{ x: -4 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveScenarioIdx(i)}
                  className={`w-full text-left p-4 rounded-[var(--ct-radius-lg)] border transition-all cursor-pointer ${
                    activeScenarioIdx === i
                      ? 'bg-[var(--ct-card-elevated)] border-[var(--ct-accent)] shadow-[var(--ct-shadow-md)] ring-1 ring-[var(--ct-accent)]/20'
                      : 'bg-[var(--ct-card)]/50 border-[var(--ct-border-subtle)] hover:bg-[var(--ct-card-elevated)] text-[var(--ct-text-secondary)]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-[var(--ct-accent-hover)] uppercase tracking-wider">
                      {sc.category}
                    </span>
                    <span className="text-[10px] text-[var(--ct-text-muted)] font-mono flex items-center gap-1">
                      <Clock className="w-3 h-3 text-[var(--ct-text-muted)]" />
                      {sc.recoveryTime}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-[var(--ct-text-primary)] mt-1">{sc.title}</h4>
                  <p className="text-[10px] text-[var(--ct-text-muted)] mt-1 truncate">{sc.item}</p>
                </motion.button>
              ))}
            </motion.div>

            {/* Active Scenario Detailed Breakdown */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="lg:col-span-7 ct-card p-6 sm:p-8 space-y-5"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--ct-border-subtle)] pb-4">
                <div>
                  <span className="text-[10px] font-bold text-[var(--ct-accent-hover)] uppercase tracking-wider">
                    Incident Case Breakdown
                  </span>
                  <h3 className="text-title text-[var(--ct-text-primary)] mt-0.5">
                    {realWorldScenarios[activeScenarioIdx].item}
                  </h3>
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[var(--ct-status-success)]/10 text-[var(--ct-status-success)] border border-[var(--ct-status-success)]/20 rounded-full text-[10px] font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[var(--ct-status-success)]" />
                  <span>{realWorldScenarios[activeScenarioIdx].status}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-[10px]">
                <div className="p-3 bg-[var(--ct-bg-elevated)] rounded-[var(--ct-radius-lg)] border border-[var(--ct-border-subtle)]/60">
                  <span className="text-[var(--ct-text-muted)] uppercase font-semibold text-[9px] block">Location Incident</span>
                  <span className="font-bold text-[var(--ct-text-primary)] mt-0.5 block">{realWorldScenarios[activeScenarioIdx].title}</span>
                </div>
                <div className="p-3 bg-[var(--ct-bg-elevated)] rounded-[var(--ct-radius-lg)] border border-[var(--ct-border-subtle)]/60">
                  <span className="text-[var(--ct-text-muted)] uppercase font-semibold text-[9px] block">Good Samaritan</span>
                  <span className="font-bold text-[var(--ct-text-primary)] mt-0.5 block">{realWorldScenarios[activeScenarioIdx].finderRole}</span>
                </div>
              </div>

              <p className="text-[var(--ct-text-secondary)] leading-relaxed text-[11px]">
                {realWorldScenarios[activeScenarioIdx].description}
              </p>

              <div className="p-4 bg-[var(--ct-accent)]/10 border border-[var(--ct-accent)]/20 rounded-[var(--ct-radius-lg)] text-[var(--ct-accent-hover)] flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-[var(--ct-accent-hover)] shrink-0 mt-0.5" />
                <div>
                  <strong className="font-bold block">Privacy Firewall In Effect:</strong>
                  The finder was never shown the owner's phone number, dorm room number, or email address. Both parties coordinated purely through Campus Tag's anonymous session relay.
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </ScrollReveal>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-20 px-6 bg-[var(--ct-bg-deep)] border-t border-[var(--ct-border-subtle)]">
      <ScrollReveal once={true}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-caption text-[var(--ct-accent-hover)] uppercase tracking-wider">
              Zero Compromise
            </span>
            <h2 className="text-headline text-[var(--ct-text-primary)]">
              Engineered for Modern Campus Security
            </h2>
            <p className="text-body text-[var(--ct-text-secondary)]">
              Unlike traditional pet tags or luggage trackers, Campus Tag is designed strictly around student and researcher safety.
            </p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {(settings.featuresList && settings.featuresList.length > 0
              ? settings.featuresList
              : [
                  { id: '1', title: 'Complete Privacy Shield', description: 'Never put your personal phone number on a sticker. Finders contact you through an anonymous relay that masks all identities.' },
                  { id: '2', title: 'Interactive Map & GPS Pins', description: 'Finders can search any location, use device GPS, or drop a pin directly on an interactive open map.' },
                  { id: '3', title: 'Multi-Tenant Workspaces', description: 'Dedicated isolated workspaces for bio labs, robotics cohorts, athletics departments, and student organizations.' },
                  { id: '4', title: 'Forever Active Public Tags', description: 'Even if your subscription period ends or lapses, your printed QR tags remain 100% active and scannable forever.' },
                  { id: '5', title: 'Printable Sticker Sheets', description: 'Built-in print layouts matching standard sticker paper sheets. Print 20 tags in 30 seconds straight from your browser.' },
                  { id: '6', title: 'Emergency Lost Broadcast', description: 'Broadcast custom reward notices and instructions to campus security desks the moment you realize something is missing.' }
                ]
            ).map((feat, idx) => (
              <motion.div
                key={feat.id || idx}
                initial={reduced ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.07 * idx }}
                whileHover={{ y: -4 }}
                className="ct-card p-6 space-y-3"
              >
                <div className={`w-10 h-10 rounded-[var(--ct-radius-lg)] bg-[var(--ct-accent)]/10 text-[var(--ct-accent-hover)] flex items-center justify-center font-bold`}>
                  {idx === 0 && <Lock className="w-5 h-5" />}
                  {idx === 1 && <MapPin className="w-5 h-5" />}
                  {idx === 2 && <Building className="w-5 h-5" />}
                  {idx === 3 && <Sparkles className="w-5 h-5" />}
                  {idx === 4 && <QrCode className="w-5 h-5" />}
                  {idx >= 5 && <AlertTriangle className="w-5 h-5" />}
                </div>
                <h3 className="text-base font-bold text-[var(--ct-text-primary)]">{feat.title}</h3>
                <p className="text-[var(--ct-text-secondary)] leading-relaxed text-[11px]">
                  {feat.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </ScrollReveal>
      </section>

      {/* Dynamic Pricing (Directly from database) */}
      <section id="pricing" className="py-20 px-6 bg-[var(--ct-bg-deep)] border-t border-[var(--ct-border-subtle)]">
      <ScrollReveal once={true}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-caption text-[var(--ct-accent-hover)] uppercase tracking-wider">
              Transparent Campus Rates
            </span>
            <h2 className="text-headline text-[var(--ct-text-primary)]">
              Simple, Affordable Pricing
            </h2>
            <p className="text-body text-[var(--ct-text-secondary)]">
              Configured dynamically by platform administrators. No hidden charges or renewal traps.
            </p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {plans.map((p) => (
              <motion.div
                key={p.id}
                initial={reduced ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.07 * plans.indexOf(p) }}
                whileHover={{ y: -4 }}
                className={`rounded-[var(--ct-radius-xl)] border p-8 flex flex-col justify-between transition-all ${
                  p.isPopular
                    ? 'border-[var(--ct-accent)] bg-[var(--ct-card-elevated)] shadow-[var(--ct-shadow-lg)] shadow-blue-500/10 ring-1 ring-[var(--ct-accent)]/20 relative'
                    : 'border-[var(--ct-border-subtle)] bg-[var(--ct-card)] shadow-[var(--ct-shadow-sm)]'
                }`}
              >
                {p.isPopular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[var(--ct-accent)] text-white text-[10px] font-bold px-3 py-0.5 rounded-full uppercase tracking-wider shadow-[var(--ct-shadow-sm)]">
                    Most Popular for Students
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-bold text-[var(--ct-accent-hover)] uppercase tracking-wider">
                      {p.billingCycle}
                    </span>
                    {p.trialDays > 0 && (
                      <span className="text-[9px] font-bold text-[var(--ct-status-success)] bg-[var(--ct-status-success)]/10 px-2 py-0.5 rounded border border-[var(--ct-status-success)]/20">
                        {p.trialDays} Days Free Trial
                      </span>
                    )}
                  </div>

                  <h3 className="text-title text-[var(--ct-text-primary)]">{p.name}</h3>
                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="text-4xl font-black text-[var(--ct-text-primary)]">${p.price}</span>
                    <span className="text-[10px] text-[var(--ct-text-muted)]">/{p.billingCycle}</span>
                  </div>

                  <div className="mt-2 text-[10px] font-semibold text-[var(--ct-text-secondary)]">
                    Capacity: Up to {p.itemLimit} campus items
                  </div>

                  <ul className="mt-6 space-y-3 text-[var(--ct-text-secondary)] text-[11px]">
                    {p.features.map((feat, i) => (
                      <li key={i} className="flex items-start gap-2.5">
                        <Check className="w-4 h-4 text-[var(--ct-accent-hover)] shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-8 pt-6 border-t border-[var(--ct-border-subtle)]">
                  <button
                    onClick={() => onOpenAuth('register')}
                    className={`w-full py-3 rounded-[var(--ct-radius-lg)] text-[10px] font-bold transition-all cursor-pointer shadow-sm ${
                      p.isPopular
                        ? 'bg-[var(--ct-accent)] hover:bg-[var(--ct-accent-hover)] text-white shadow-blue-500/20 ct-btn-primary'
                        : 'bg-[var(--ct-bg-surface)] hover:bg-[var(--ct-bg-elevated)] text-[var(--ct-text-secondary)] border border-[var(--ct-border-subtle)] ct-touch-target'
                    }`}
                  >
                    Get Started with {p.name}
                  </button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </ScrollReveal>
      </section>

      {/* Interactive FAQ Accordion */}
      <section className="py-20 px-6 bg-[var(--ct-bg-deep)] border-t border-[var(--ct-border-subtle)]">
      <ScrollReveal once={true}>
        <div className="max-w-4xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
            <span className="text-caption text-[var(--ct-accent-hover)] uppercase tracking-wider">
              Answers & Clarifications
            </span>
            <h2 className="text-headline text-[var(--ct-text-primary)]">
              Frequently Asked Questions
            </h2>
            <p className="text-body text-[var(--ct-text-secondary)]">
              Everything you need to know about campus privacy, QR durability, and map tracking.
            </p>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-4">
              {['ALL', 'Privacy', 'Equipment', 'Campus Security', 'Pricing'].map(cat => (
                <button
                  key={cat}
                  onClick={() => setFaqCategoryFilter(cat)}
                  className={`px-3 py-1.5 rounded-[var(--ct-radius-sm)] text-[10px] font-semibold cursor-pointer transition-colors ${
                    faqCategoryFilter === cat
                      ? 'bg-[var(--ct-accent)] text-white font-bold'
                      : 'bg-[var(--ct-bg-surface)] border border-[var(--ct-border-subtle)] text-[var(--ct-text-secondary)] hover:text-[var(--ct-text-primary)]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            {filteredFaqs.map((faq) => {
              const isOpen = expandedFaqId === faq.id;
              return (
                <motion.div
                  key={faq.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="ct-card border-[var(--ct-border-subtle)] overflow-hidden transition-colors"
                >
                  <button
                    onClick={() => setExpandedFaqId(isOpen ? null : faq.id)}
                    className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-[var(--ct-bg-elevated)] ct-touch-target"
                  >
                    <span className="text-sm font-bold text-[var(--ct-text-primary)] flex items-center gap-2.5">
                      <HelpCircle className="w-4 h-4 text-[var(--ct-accent-hover)] shrink-0" />
                      <span>{faq.question}</span>
                    </span>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-[var(--ct-text-muted)] shrink-0 transition-transform duration-200" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-[var(--ct-text-muted)] shrink-0 transition-transform duration-200" />
                    )}
                  </button>

                  <motion.div
                    initial="hidden"
                    animate={isOpen ? 'visible' : 'hidden'}
                    exit="exit"
                    variants={accordionContent}
                    className="px-5 pb-5 pt-1 text-[var(--ct-text-secondary)] leading-relaxed border-t border-[var(--ct-border-subtle)]"
                  >
                    {faq.answer}
                  </motion.div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </ScrollReveal>
      </section>

      {/* NEW PROMINENT SECTION DIRECTLY ABOVE FOOTER: FUTURE USE & BENEFITS */}
      {settings.futureUseSection?.enabled !== false && (
        <section
          id="future-benefits"
          className="py-24 px-6 bg-gradient-to-b from-[var(--ct-bg-deep)] via-blue-950/10 to-[var(--ct-bg-surface)] text-[var(--ct-text-primary)] border-t border-[var(--ct-border-subtle)] relative overflow-hidden"
        >
        <ScrollReveal once={true}>
          {/* Subtle Ambient Glow */}
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-6xl mx-auto relative z-10">
            <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[var(--ct-accent)]/10 border border-[var(--ct-accent)]/30 text-[var(--ct-accent-hover)] text-[10px] font-semibold backdrop-blur-xs">
                <Sparkles className="w-4 h-4 text-[var(--ct-accent-hover)]" />
                <span>{settings.futureUseSection?.badge || 'Next-Generation Campus Architecture'}</span>
              </div>

              <h2 className="text-headline text-[var(--ct-text-primary)] tracking-tight">
                {settings.futureUseSection?.headline || 'Future Use & Long-Term Campus Benefits'}
              </h2>

              <p className="text-body text-[var(--ct-text-secondary)] leading-relaxed">
                {settings.futureUseSection?.subheadline ||
                  'How Campus Tag is expanding beyond sticker recovery into an integrated smart IoT and automated campus security network for higher education.'}
              </p>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {(settings.futureUseSection?.items && settings.futureUseSection.items.length > 0
                ? settings.futureUseSection.items
                : [
                    {
                      id: 'fut_1',
                      badge: 'Hardware Innovation',
                      title: 'NFC Dual-Protocol Instant Tap Badges',
                      description: 'Next-generation tags combining tamper-evident micro-QR codes with NTAG-424 DNA cryptographic NFC chips. Finders simply tap with any iPhone or Android without opening camera apps.',
                      highlight: 'Instant tap · Zero app needed · Ruggedized polymer',
                      readinessStatus: 'Campus Pilot'
                    },
                    {
                      id: 'fut_2',
                      badge: 'Public Safety Integration',
                      title: 'Campus Police & Dispatch Desk Webhooks',
                      description: 'Direct institutional API dispatch connecting lost reports straight into university public safety software, security guard tablets, and central student union lost & found desks.',
                      highlight: 'Real-time alert relay · Centralized chain of custody',
                      readinessStatus: 'Active Beta'
                    },
                    {
                      id: 'fut_3',
                      badge: 'Automated Return',
                      title: 'Smart Locker Drop-Box Integration',
                      description: 'Partnership with automated campus parcel lockers. Finders can deposit found laptops or keys into a 24/7 security locker; the system automatically texts the owner a pickup OTP.',
                      highlight: '24/7 safe drop-off · Contactless secure handover',
                      readinessStatus: 'In Deployment'
                    },
                    {
                      id: 'fut_4',
                      badge: 'Computer Vision',
                      title: 'AI Visual Match & Asset OCR Verification',
                      description: 'Automated photo analysis compares finder photos against registered equipment photos, identifying matching scratches, lab asset barcodes, and serial numbers with zero human data exposure.',
                      highlight: 'Instant photo verification · Zero PII disclosure',
                      readinessStatus: 'Phase 2 Architecture'
                    },
                    {
                      id: 'fut_5',
                      badge: 'Consortium Network',
                      title: 'Inter-Campus Student Roaming Federation',
                      description: 'Cross-institutional tag verification across participating universities, regional athletic conferences, and cross-enrollment research stations.',
                      highlight: 'Multi-university coverage · Roaming recovery',
                      readinessStatus: 'Campus Pilot'
                    },
                    {
                      id: 'fut_6',
                      badge: 'Institutional ESG',
                      title: 'Departmental Asset Lifecycle & E-Waste Reduction',
                      description: 'Comprehensive retention analytics showing departments how many research instruments and loaner laptops were spared from replacement, supporting campus green initiatives.',
                      highlight: 'Quantifiable ROI · Reduced replacement budgets',
                      readinessStatus: 'In Deployment'
                    }
                  ]
              ).map((item, idx) => (
                <motion.div
                  key={item.id || idx}
                  initial={reduced ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: 0.07 * idx }}
                  whileHover={{ y: -4 }}
                  className="ct-card p-6 sm:p-7 flex flex-col justify-between hover:border-[var(--ct-border-accent)] hover:bg-[var(--ct-card-elevated)] transition-all hover:-translate-y-1 shadow-[var(--ct-shadow-sm)] group"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-bold text-[var(--ct-accent-hover)] uppercase tracking-wider">
                        {item.badge}
                      </span>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-[var(--ct-radius-sm)] border ${
                        item.readinessStatus === 'Active Beta'
                          ? 'bg-blue-950/20 text-[var(--ct-accent-hover)] border-[var(--ct-accent)]/30'
                          : item.readinessStatus === 'In Deployment'
                          ? 'bg-[var(--ct-status-success)]/10 text-[var(--ct-status-success)] border-[var(--ct-status-success)]/20'
                          : item.readinessStatus === 'Campus Pilot'
                          ? 'bg-purple-950/20 text-purple-300 border-purple-800/30'
                          : 'bg-slate-800/20 text-[var(--ct-text-muted)] border-[var(--ct-border-subtle)]'
                      }`}>
                        {item.readinessStatus}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-[var(--ct-radius-md)] bg-[var(--ct-accent)]/20 border border-[var(--ct-accent)]/30 text-[var(--ct-accent-hover)] flex items-center justify-center font-bold shrink-0 group-hover:scale-105 transition-transform`}>
                        {idx === 0 && <Radio className="w-4 h-4" />}
                        {idx === 1 && <Building className="w-4 h-4" />}
                        {idx === 2 && <Lock className="w-4 h-4" />}
                        {idx === 3 && <Cpu className="w-4 h-4" />}
                        {idx === 4 && <Layers className="w-4 h-4" />}
                        {idx === 5 && <Award className="w-4 h-4" />}
                      </div>
                      <h3 className="text-base font-bold text-[var(--ct-text-primary)] leading-snug">
                        {item.title}
                      </h3>
                    </div>

                    <p className="text-[var(--ct-text-secondary)] leading-relaxed text-[11px]">
                      {item.description}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-[var(--ct-border-subtle)]/50 flex items-center justify-between text-[10px] text-[var(--ct-text-muted)]">
                    <span className="font-mono text-[var(--ct-text-secondary)]">{item.highlight}</span>
                    <Sparkles className="w-3.5 h-3.5 text-[var(--ct-accent-hover)] opacity-60 group-hover:opacity-100 transition-opacity" />
                  </div>
                </motion.div>
              ))}
            </motion.div>

            <div className="mt-12 p-6 bg-[var(--ct-bg-elevated)]/50 border border-[var(--ct-border-subtle)] rounded-[var(--ct-radius-xl)] flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1 text-center sm:text-left">
                <h4 className="text-sm font-bold text-[var(--ct-text-primary)]">Want to Pilot Campus Tag at Your Institution?</h4>
                <p className="text-[10px] text-[var(--ct-text-muted)]">
                  We partner with university CIOs, campus security desks, and academic department fleets.
                </p>
              </div>
              <button
                onClick={() => {
                  const el = document.getElementById('contact');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-5 py-2.5 bg-[var(--ct-accent)] hover:bg-[var(--ct-accent-hover)] text-white rounded-[var(--ct-radius-lg)] text-[10px] font-bold transition-colors cursor-pointer shrink-0 shadow-[var(--ct-shadow-sm)]"
              >
                Inquire for Institutional Pilot
              </button>
            </div>
          </div>
        </ScrollReveal>
        </section>
      )}

      {/* Support / Contact Form */}
      <section id="contact" className="py-20 px-6 bg-[var(--ct-bg-surface)] text-[var(--ct-text-primary)]">
      <ScrollReveal once={true}>
        <div className="max-w-4xl mx-auto">
          <div className="text-center max-w-xl mx-auto mb-12 space-y-3">
            <span className="text-caption text-[var(--ct-accent-hover)] uppercase tracking-wider">
              Direct Campus Helpdesk
            </span>
            <h2 className="text-headline text-[var(--ct-text-primary)]">
              Get in Touch with Campus Tag
            </h2>
            <p className="text-body text-[var(--ct-text-secondary)]">
              Have questions about batch lab onboarding or integration with campus security desks?
            </p>
          </div>

          <div className="ct-card p-8 shadow-[var(--ct-shadow-lg)]">
            {contactSubmitted ? (
              <div className="p-8 text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-[var(--ct-status-success)] mx-auto" />
                <h3 className="text-lg font-bold text-[var(--ct-text-primary)]">Message Dispatched</h3>
                <p className="text-[var(--ct-text-secondary)] max-w-md mx-auto">
                  Your ticket has been logged into our support queue. A campus integration engineer will respond to {contactEmail} within 24 hours.
                </p>
              </div>
            ) : (
              <form onSubmit={handleContactSubmit} className="space-y-4 text-[10px]">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[var(--ct-text-secondary)] font-bold uppercase tracking-wider mb-1">
                      Campus / Institutional Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      placeholder="e.g. jsmith@university.edu"
                      className="ct-input"
                    />
                  </div>

                  <div>
                    <label className="block text-[var(--ct-text-secondary)] font-bold uppercase tracking-wider mb-1">
                      Inquiry Category
                    </label>
                    <select
                      value={contactSubject}
                      onChange={(e) => setContactSubject(e.target.value)}
                      className="ct-input"
                    >
                      <option value="Campus Department Fleet Inquiry">Campus Department Fleet Inquiry</option>
                      <option value="Student Organization Bulk Tags">Student Organization Bulk Tags</option>
                      <option value="Campus Police / Security Partnership">Campus Police / Security Partnership</option>
                      <option value="Billing & Subscription Question">Billing & Subscription Question</option>
                      <option value="General Technical Support">General Technical Support</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[var(--ct-text-secondary)] font-bold uppercase tracking-wider mb-1">
                    Message / Equipment Details *
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={contactMessage}
                    onChange={(e) => setContactMessage(e.target.value)}
                    placeholder="Tell us about your campus department or questions..."
                    className="ct-input"
                  />
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    className="px-6 py-3 bg-[var(--ct-accent)] hover:bg-[var(--ct-accent-hover)] text-white font-bold rounded-[var(--ct-radius-lg)] text-[10px] flex items-center gap-2 cursor-pointer shadow-[var(--ct-shadow-md)] shadow-blue-500/30 transition-colors"
                  >
                    <Send className="w-4 h-4" />
                    <span>Submit Helpdesk Inquiry</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </ScrollReveal>
      </section>

      {/* Policy Modal Overlay if user clicked a policy in footer */}
      {activePolicy && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="ct-card-elevated rounded-[var(--ct-radius-xl)] max-w-3xl w-full max-h-[85vh] overflow-y-auto border border-[var(--ct-border-subtle)] shadow-[var(--ct-shadow-lg)] p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-[var(--ct-border-subtle)]">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-[var(--ct-accent-hover)]" />
                <h3 className="text-title text-[var(--ct-text-primary)]">
                  {activePolicy === 'privacy' && 'Campus Tag Privacy Policy'}
                  {activePolicy === 'terms' && 'Campus Tag Terms of Service'}
                  {activePolicy === 'refund' && 'Refund & Cancellation Policy'}
                </h3>
              </div>
              <button
                onClick={onClosePolicy}
                className="p-1.5 rounded-[var(--ct-radius-sm)] text-[var(--ct-text-muted)] hover:text-[var(--ct-text-primary)] hover:bg-[var(--ct-bg-elevated)] transition-colors text-[10px] font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="text-[var(--ct-text-secondary)] space-y-4 leading-relaxed text-[11px]">
              {activePolicy === 'privacy' && (
                <>
                  <p className="font-semibold text-[var(--ct-text-primary)]">
                    1. Fundamental Privacy Guarantee (Zero PII on QR Scans)
                  </p>
                  <p>
                    Campus Tag is architected specifically to shield students, university researchers, and faculty members from doxxing, harassment, and identity exposure. When a stranger scans your physical tag, our system renders only the non-sensitive public item description you chose to provide. Your personal email address, phone number, and physical student dorm address are strictly blocked from public view.
                  </p>
                  <p className="font-semibold text-[var(--ct-text-primary)]">
                    2. Location Data Collection & Disclosure
                  </p>
                  <p>
                    Campus Tag does NOT perform continuous background location tracking or GPS beacon polling. Location coordinates are logged exclusively when an anonymous finder chooses to click "Share Current Location" or drops a pin on the Leaflet map. Location logs are retained solely for the owner's recovery purposes and are never resold or mined.
                  </p>
                  <p className="font-semibold text-[var(--ct-text-primary)]">
                    3. Compliance with FERPA & Institutional Guidelines
                  </p>
                  <p>
                    We maintain tenant isolation at the database layer. No cross-institutional data sharing occurs. Customer databases are logically separated by tenant ID.
                  </p>
                </>
              )}

              {activePolicy === 'terms' && (
                <>
                  <p className="font-semibold text-[var(--ct-text-primary)]">
                    1. Permitted Campus Usage
                  </p>
                  <p>
                    Campus Tag provides digital lost & found indexing for educational, personal, and research equipment. Users must only register equipment they own or have explicit administrative authority to tag on behalf of a university department.
                  </p>
                  <p className="font-semibold text-[var(--ct-text-primary)]">
                    2. Tag Longevity Guarantee
                  </p>
                  <p>
                    Physical QR codes generated via Campus Tag will remain operational and scannable indefinitely. If an account subscription lapses, public scan pages will continue to render the recovery prompt and forward alerts without disruption.
                  </p>
                  <p className="font-semibold text-[var(--ct-text-primary)]">
                    3. Prohibited Conduct
                  </p>
                  <p>
                    You agree not to use Campus Tag to track individuals without consent, affix tags to persons or unauthorized third-party property, or transmit abusive messages through our anonymous finder relay.
                  </p>
                </>
              )}

              {activePolicy === 'refund' && (
                <>
                  <p className="font-semibold text-[var(--ct-text-primary)]">
                    1. 14-Day Academic Refund Window
                  </p>
                  <p>
                    If Campus Tag does not fulfill your student group or lab's requirements, you may request a 100% full refund within 14 calendar days of your initial plan upgrade.
                  </p>
                  <p className="font-semibold text-[var(--ct-text-primary)]">
                    2. Cancellation Terms
                  </p>
                  <p>
                    You can cancel recurring monthly or yearly subscriptions at any time directly through your dashboard with zero penalty or early termination fees. Your account remains active until the end of the paid billing period.
                  </p>
                </>
              )}
            </div>

            <div className="pt-4 border-t border-[var(--ct-border-subtle)] flex justify-end">
              <button
                onClick={onClosePolicy}
                className="px-5 py-2 bg-[var(--ct-accent)] hover:bg-[var(--ct-accent-hover)] text-white font-bold rounded-[var(--ct-radius-lg)] text-[10px] cursor-pointer"
              >
                Acknowledge & Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
