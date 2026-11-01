import React, { useState } from 'react';
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
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Announcement Banner if enabled */}
      {settings.announcementBanner?.enabled && (
        <div className="bg-blue-900 text-white text-xs py-2 px-4 text-center font-medium flex items-center justify-center gap-2">
          <span>{settings.announcementBanner.text}</span>
          {settings.announcementBanner.linkUrl && (
            <a
              href={settings.announcementBanner.linkUrl}
              className="underline text-blue-200 hover:text-white font-semibold cursor-pointer"
            >
              Learn More →
            </a>
          )}
        </div>
      )}

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-950 via-slate-900 to-slate-900 text-white pt-24 pb-20 px-6">
        {/* Subtle Background Pattern */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-400/30 text-blue-300 text-xs font-semibold backdrop-blur-xs">
              <ShieldCheck className="w-4 h-4 text-blue-400" />
              <span>University-Grade Campus Gear Recovery System</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.1]">
              {settings.heroHeadline || 'Protect Your Campus Gear.'} <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-sky-300 to-blue-200">
                {settings.tagline}
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-300 leading-relaxed font-normal">
              {settings.heroDescription ||
                'The privacy-first QR tagging platform for students, researchers, and campus faculty. Recover lost laptops, bikes, and lab equipment with zero personal phone numbers or emails exposed.'}
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
              <button
                onClick={() => onOpenAuth('register')}
                className="px-7 py-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-bold transition-all shadow-xl shadow-blue-600/30 flex items-center gap-2 cursor-pointer hover:-translate-y-0.5 active:translate-y-0"
              >
                <span>Protect Your First 5 Items Free</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  const el = document.getElementById('interactive-demo');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-6 py-3.5 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-200 rounded-xl text-sm font-semibold transition-all cursor-pointer backdrop-blur-xs"
              >
                Try Live Scanner Demo
              </button>
            </div>

            <div className="pt-8 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Zero PII Exposed to Finders</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Tags Work Even If Plan Expires</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Print-Ready Waterproof Labels</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Institutional Trust & Campus Metric Strip */}
      <section className="bg-slate-900 border-b border-slate-800 py-6 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-black text-white">87.4%</div>
            <div className="text-xs text-slate-400">Recovery Rate Within 4 Hours</div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-black text-blue-400">0 PII</div>
            <div className="text-xs text-slate-400">Zero Personal Phone Numbers Shared</div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-black text-emerald-400">100% Free</div>
            <div className="text-xs text-slate-400">OpenStreetMap Interactive Pin Drop</div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-black text-white">&lt; 15s</div>
            <div className="text-xs text-slate-400">Finder Report Submission Time</div>
          </div>
        </div>
      </section>

      {/* Interactive Finder Simulator Bar */}
      <section id="interactive-demo" className="py-12 bg-slate-900/95 border-b border-slate-800 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
              <div>
                <span className="text-xs font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4" />
                  Live QR Finder Simulator
                </span>
                <h3 className="text-lg font-bold text-white mt-1">
                  Test what a stranger sees when they scan your item
                </h3>
              </div>
              <span className="text-xs text-slate-400 bg-slate-900 px-3 py-1 rounded-lg border border-slate-800">
                Privacy-First · No Login Needed
              </span>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <div className="relative flex-1">
                <QrCode className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  value={demoInputId}
                  onChange={(e) => setDemoInputId(e.target.value)}
                  placeholder="Enter sample public tag ID..."
                  className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>
              <button
                onClick={() => onSimulateFinderScan(demoInputId)}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-md shrink-0 flex items-center justify-center gap-2"
              >
                <span>Simulate Scan (/f/{demoInputId})</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-slate-400">
              <span>Or click a registered item:</span>
              {sampleItems.slice(0, 3).map(item => (
                <button
                  key={item.id}
                  onClick={() => {
                    setDemoInputId(item.publicId);
                    onSimulateFinderScan(item.publicId);
                  }}
                  className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-blue-300 font-mono text-[11px] cursor-pointer transition-colors"
                >
                  {item.publicId} ({item.name.slice(0, 16)}...)
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
              Simple 4-Step Recovery Workflow
            </span>
            <h2 className="text-3xl font-black text-slate-900">
              How Campus Tag Works
            </h2>
            <p className="text-sm text-slate-600">
              Engineered specifically for university campus life where items are often left in study lounges, libraries, and lab desks.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {(settings.howItWorksSteps && settings.howItWorksSteps.length > 0
              ? settings.howItWorksSteps
              : [
                  { stepNumber: '01', title: 'Register Gear', description: 'Add laptops, calculators, lab instruments, or bikes. Each receives a unique unguessable ID.' },
                  { stepNumber: '02', title: 'Affix QR Label', description: 'Print ready-to-peel weatherproof stickers or download vector SVGs for laser etching onto campus equipment.' },
                  { stepNumber: '03', title: 'Lost Mode & Scan', description: 'If lost, toggle Lost Mode with 1 click. Any good Samaritan who scans the QR gets urgent recovery steps without your private info.' },
                  { stepNumber: '04', title: 'Safe Handover', description: 'Finder drops a pin or leaves the item at campus lost & found, notifying you instantly through anonymous two-way chat.' }
                ]
            ).map((s, idx) => (
              <div key={idx} className="bg-slate-50 border border-slate-200/80 rounded-2xl p-6 relative hover:shadow-md transition-shadow">
                <div className={`w-10 h-10 rounded-xl text-white font-black text-sm flex items-center justify-center mb-4 shadow-sm ${
                  idx === 2 ? 'bg-amber-500 text-slate-950' : idx === 3 ? 'bg-emerald-600' : 'bg-blue-600'
                }`}>
                  0{s.stepNumber || idx + 1}
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2">{s.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {s.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Real-World Recovery Scenarios Section */}
      <section className="py-20 px-6 bg-slate-100/70 border-t border-slate-200">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
              Proven Across Campus Realities
            </span>
            <h2 className="text-3xl font-black text-slate-900">
              Real-World Recovery Scenarios
            </h2>
            <p className="text-sm text-slate-600">
              See how everyday items get returned safely across libraries, residence halls, and research labs.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Scenario Selector */}
            <div className="lg:col-span-5 space-y-3">
              {realWorldScenarios.map((sc, i) => (
                <button
                  key={i}
                  onClick={() => setActiveScenarioIdx(i)}
                  className={`w-full text-left p-4 rounded-xl border transition-all cursor-pointer ${
                    activeScenarioIdx === i
                      ? 'bg-white border-blue-600 shadow-md ring-2 ring-blue-500/10'
                      : 'bg-white/60 border-slate-200 hover:bg-white text-slate-600'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">
                      {sc.category}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {sc.recoveryTime}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 mt-1">{sc.title}</h4>
                  <p className="text-xs text-slate-500 mt-1 truncate">{sc.item}</p>
                </button>
              ))}
            </div>

            {/* Active Scenario Detailed Breakdown */}
            <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-4">
                <div>
                  <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                    Incident Case Breakdown
                  </span>
                  <h3 className="text-xl font-bold text-slate-900 mt-0.5">
                    {realWorldScenarios[activeScenarioIdx].item}
                  </h3>
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{realWorldScenarios[activeScenarioIdx].status}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
                  <span className="text-slate-400 uppercase font-semibold text-[10px] block">Location Incident</span>
                  <span className="font-bold text-slate-800 mt-0.5 block">{realWorldScenarios[activeScenarioIdx].title}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
                  <span className="text-slate-400 uppercase font-semibold text-[10px] block">Good Samaritan</span>
                  <span className="font-bold text-slate-800 mt-0.5 block">{realWorldScenarios[activeScenarioIdx].finderRole}</span>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                {realWorldScenarios[activeScenarioIdx].description}
              </p>

              <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-xl text-xs text-blue-900 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="font-bold block">Privacy Firewall In Effect:</strong>
                  The finder was never shown the owner's phone number, dorm room number, or email address. Both parties coordinated purely through Campus Tag's anonymous session relay.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-20 px-6 bg-slate-50 border-t border-slate-200/80">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
              Zero Compromise
            </span>
            <h2 className="text-3xl font-black text-slate-900">
              Engineered for Modern Campus Security
            </h2>
            <p className="text-sm text-slate-600">
              Unlike traditional pet tags or luggage trackers, Campus Tag is designed strictly around student and researcher safety.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
              <div key={feat.id || idx} className="bg-white p-7 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow space-y-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                  {idx === 0 && <Lock className="w-5 h-5" />}
                  {idx === 1 && <MapPin className="w-5 h-5" />}
                  {idx === 2 && <Building className="w-5 h-5" />}
                  {idx === 3 && <Sparkles className="w-5 h-5" />}
                  {idx === 4 && <QrCode className="w-5 h-5" />}
                  {idx >= 5 && <AlertTriangle className="w-5 h-5" />}
                </div>
                <h3 className="text-base font-bold text-slate-900">{feat.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {feat.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Dynamic Pricing (Directly from database) */}
      <section id="pricing" className="py-20 px-6 bg-white border-t border-slate-200">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
              Transparent Campus Rates
            </span>
            <h2 className="text-3xl font-black text-slate-900">
              Simple, Affordable Pricing
            </h2>
            <p className="text-sm text-slate-600">
              Configured dynamically by platform administrators. No hidden charges or renewal traps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((p) => (
              <div
                key={p.id}
                className={`rounded-2xl border p-8 flex flex-col justify-between transition-all ${
                  p.isPopular
                    ? 'border-2 border-blue-600 bg-white shadow-xl shadow-blue-500/10 ring-4 ring-blue-500/5 relative'
                    : 'border-slate-200 bg-slate-50/50 shadow-xs'
                }`}
              >
                {p.isPopular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[11px] font-bold px-3 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
                    Most Popular for Students
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                      {p.billingCycle}
                    </span>
                    {p.trialDays > 0 && (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        {p.trialDays} Days Free Trial
                      </span>
                    )}
                  </div>

                  <h3 className="text-xl font-bold text-slate-900">{p.name}</h3>
                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="text-4xl font-black text-slate-900">${p.price}</span>
                    <span className="text-xs text-slate-500">/{p.billingCycle}</span>
                  </div>

                  <div className="mt-2 text-xs font-semibold text-slate-600">
                    Capacity: Up to {p.itemLimit} campus items
                  </div>

                  <ul className="mt-6 space-y-3 text-xs text-slate-600">
                    {p.features.map((feat, i) => (
                      <li key={i} className="flex items-start gap-2.5">
                        <Check className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-8 pt-6 border-t border-slate-200">
                  <button
                    onClick={() => onOpenAuth('register')}
                    className={`w-full py-3 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm ${
                      p.isPopular
                        ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/20'
                        : 'bg-white hover:bg-slate-100 text-slate-800 border border-slate-300'
                    }`}
                  >
                    Get Started with {p.name}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive FAQ Accordion */}
      <section className="py-20 px-6 bg-slate-50 border-t border-slate-200">
        <div className="max-w-4xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
              Answers & Clarifications
            </span>
            <h2 className="text-3xl font-black text-slate-900">
              Frequently Asked Questions
            </h2>
            <p className="text-sm text-slate-600">
              Everything you need to know about campus privacy, QR durability, and map tracking.
            </p>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-4">
              {['ALL', 'Privacy', 'Equipment', 'Campus Security', 'Pricing'].map(cat => (
                <button
                  key={cat}
                  onClick={() => setFaqCategoryFilter(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                    faqCategoryFilter === cat
                      ? 'bg-blue-600 text-white font-bold'
                      : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900'
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
                <div
                  key={faq.id}
                  className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs transition-colors"
                >
                  <button
                    onClick={() => setExpandedFaqId(isOpen ? null : faq.id)}
                    className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/50"
                  >
                    <span className="text-sm font-bold text-slate-900 flex items-center gap-2.5">
                      <HelpCircle className="w-4 h-4 text-blue-600 shrink-0" />
                      <span>{faq.question}</span>
                    </span>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                    )}
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-xs text-slate-600 leading-relaxed border-t border-slate-100">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* NEW PROMINENT SECTION DIRECTLY ABOVE FOOTER: FUTURE USE & BENEFITS */}
      {settings.futureUseSection?.enabled !== false && (
        <section
          id="future-benefits"
          className="py-24 px-6 bg-gradient-to-b from-slate-900 via-blue-950 to-slate-950 text-white border-t border-slate-800 relative overflow-hidden"
        >
          {/* Subtle Ambient Glow */}
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-6xl mx-auto relative z-10">
            <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-400/30 text-blue-300 text-xs font-semibold backdrop-blur-xs">
                <Sparkles className="w-4 h-4 text-blue-400" />
                <span>{settings.futureUseSection?.badge || 'Next-Generation Campus Architecture'}</span>
              </div>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
                {settings.futureUseSection?.headline || 'Future Use & Long-Term Campus Benefits'}
              </h2>

              <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                {settings.futureUseSection?.subheadline ||
                  'How Campus Tag is expanding beyond sticker recovery into an integrated smart IoT and automated campus security network for higher education.'}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(settings.futureUseSection?.items && settings.futureUseSection.items.length > 0
                ? settings.futureUseSection.items
                : [
                    {
                      id: 'fut_1',
                      badge: 'Hardware Innovation',
                      title: 'NFC Dual-Protocol Instant Tap Badges',
                      description: 'Next-generation tags combining tamper-evident micro-QR codes with NTAG-424 DNA cryptographic NFC chips. Finders simply tap with any iPhone or Android without opening camera apps.',
                      highlight: 'Instant tap · Zero app needed · Ruggedized polymer',
                      readinessStatus: 'Campus Pilot' as const
                    },
                    {
                      id: 'fut_2',
                      badge: 'Public Safety Integration',
                      title: 'Campus Police & Dispatch Desk Webhooks',
                      description: 'Direct institutional API dispatch connecting lost reports straight into university public safety software, security guard tablets, and central student union lost & found desks.',
                      highlight: 'Real-time alert relay · Centralized chain of custody',
                      readinessStatus: 'Active Beta' as const
                    },
                    {
                      id: 'fut_3',
                      badge: 'Automated Return',
                      title: 'Smart Locker Drop-Box Integration',
                      description: 'Partnership with automated campus parcel lockers. Finders can deposit found laptops or keys into a 24/7 security locker; the system automatically texts the owner a pickup OTP.',
                      highlight: '24/7 safe drop-off · Contactless secure handover',
                      readinessStatus: 'In Deployment' as const
                    },
                    {
                      id: 'fut_4',
                      badge: 'Computer Vision',
                      title: 'AI Visual Match & Asset OCR Verification',
                      description: 'Automated photo analysis compares finder photos against registered equipment photos, identifying matching scratches, lab asset barcodes, and serial numbers with zero human data exposure.',
                      highlight: 'Instant photo verification · Zero PII disclosure',
                      readinessStatus: 'Phase 2 Architecture' as const
                    },
                    {
                      id: 'fut_5',
                      badge: 'Consortium Network',
                      title: 'Inter-Campus Student Roaming Federation',
                      description: 'Cross-institutional tag verification across participating universities, regional athletic conferences, and cross-enrollment research stations.',
                      highlight: 'Multi-university coverage · Roaming recovery',
                      readinessStatus: 'Campus Pilot' as const
                    },
                    {
                      id: 'fut_6',
                      badge: 'Institutional ESG',
                      title: 'Departmental Asset Lifecycle & E-Waste Reduction',
                      description: 'Comprehensive retention analytics showing departments how many research instruments and loaner laptops were spared from replacement, supporting campus green initiatives.',
                      highlight: 'Quantifiable ROI · Reduced replacement budgets',
                      readinessStatus: 'In Deployment' as const
                    }
                  ]
              ).map((item, idx) => (
                <div
                  key={item.id || idx}
                  className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-7 flex flex-col justify-between hover:border-blue-500/50 hover:bg-slate-900 transition-all hover:-translate-y-1 shadow-xl shadow-black/20 group"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">
                        {item.badge}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                        item.readinessStatus === 'Active Beta'
                          ? 'bg-blue-950 text-blue-300 border-blue-800'
                          : item.readinessStatus === 'In Deployment'
                          ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                          : item.readinessStatus === 'Campus Pilot'
                          ? 'bg-purple-950 text-purple-300 border-purple-800'
                          : 'bg-slate-800 text-slate-300 border-slate-700'
                      }`}>
                        {item.readinessStatus}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/30 text-blue-400 flex items-center justify-center font-bold shrink-0 group-hover:scale-105 transition-transform">
                        {idx === 0 && <Radio className="w-4 h-4" />}
                        {idx === 1 && <Building className="w-4 h-4" />}
                        {idx === 2 && <Lock className="w-4 h-4" />}
                        {idx === 3 && <Cpu className="w-4 h-4" />}
                        {idx === 4 && <Layers className="w-4 h-4" />}
                        {idx === 5 && <Award className="w-4 h-4" />}
                      </div>
                      <h3 className="text-base font-bold text-white leading-snug">
                        {item.title}
                      </h3>
                    </div>

                    <p className="text-xs text-slate-400 leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                    <span className="font-mono text-slate-300">{item.highlight}</span>
                    <Sparkles className="w-3.5 h-3.5 text-blue-400 opacity-60 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-12 p-6 bg-slate-950/70 border border-slate-800 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1 text-center sm:text-left">
                <h4 className="text-sm font-bold text-white">Want to Pilot Campus Tag at Your Institution?</h4>
                <p className="text-xs text-slate-400">
                  We partner with university CIOs, campus security desks, and academic department fleets.
                </p>
              </div>
              <button
                onClick={() => {
                  const el = document.getElementById('contact');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0 shadow-md"
              >
                Inquire for Institutional Pilot
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Support / Contact Form */}
      <section id="contact" className="py-20 px-6 bg-slate-900 text-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center max-w-xl mx-auto mb-12 space-y-3">
            <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">
              Direct Campus Helpdesk
            </span>
            <h2 className="text-3xl font-black text-white">
              Get in Touch with Campus Tag
            </h2>
            <p className="text-xs text-slate-400">
              Have questions about batch lab onboarding or integration with campus security desks?
            </p>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-8 shadow-2xl">
            {contactSubmitted ? (
              <div className="p-8 text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
                <h3 className="text-lg font-bold text-white">Message Dispatched</h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Your ticket has been logged into our support queue. A campus integration engineer will respond to {contactEmail} within 24 hours.
                </p>
              </div>
            ) : (
              <form onSubmit={handleContactSubmit} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-400 font-bold uppercase tracking-wider mb-1">
                      Campus / Institutional Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      placeholder="e.g. jsmith@university.edu"
                      className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 font-bold uppercase tracking-wider mb-1">
                      Inquiry Category
                    </label>
                    <select
                      value={contactSubject}
                      onChange={(e) => setContactSubject(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-blue-500"
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
                  <label className="block text-slate-400 font-bold uppercase tracking-wider mb-1">
                    Message / Equipment Details *
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={contactMessage}
                    onChange={(e) => setContactMessage(e.target.value)}
                    placeholder="Tell us about your campus department or questions..."
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs flex items-center gap-2 cursor-pointer shadow-lg shadow-blue-600/30 transition-colors"
                  >
                    <Send className="w-4 h-4" />
                    <span>Submit Helpdesk Inquiry</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* Policy Modal Overlay if user clicked a policy in footer */}
      {activePolicy && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[85vh] overflow-y-auto border border-slate-200 shadow-2xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-bold text-slate-900">
                  {activePolicy === 'privacy' && 'Campus Tag Privacy Policy'}
                  {activePolicy === 'terms' && 'Campus Tag Terms of Service'}
                  {activePolicy === 'refund' && 'Refund & Cancellation Policy'}
                </h3>
              </div>
              <button
                onClick={onClosePolicy}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="text-xs text-slate-600 space-y-4 leading-relaxed">
              {activePolicy === 'privacy' && (
                <>
                  <p className="font-semibold text-slate-900">
                    1. Fundamental Privacy Guarantee (Zero PII on QR Scans)
                  </p>
                  <p>
                    Campus Tag is architected specifically to shield students, university researchers, and faculty members from doxxing, harassment, and identity exposure. When a stranger scans your physical tag, our system renders only the non-sensitive public item description you chose to provide. Your personal email address, phone number, and physical student dorm address are strictly blocked from public view.
                  </p>
                  <p className="font-semibold text-slate-900">
                    2. Location Data Collection & Disclosure
                  </p>
                  <p>
                    Campus Tag does NOT perform continuous background location tracking or GPS beacon polling. Location coordinates are logged exclusively when an anonymous finder chooses to click "Share Current Location" or drops a pin on the Leaflet map. Location logs are retained solely for the owner's recovery purposes and are never resold or mined.
                  </p>
                  <p className="font-semibold text-slate-900">
                    3. Compliance with FERPA & Institutional Guidelines
                  </p>
                  <p>
                    We maintain tenant isolation at the database layer. No cross-institutional data sharing occurs. Customer databases are logically separated by tenant ID.
                  </p>
                </>
              )}

              {activePolicy === 'terms' && (
                <>
                  <p className="font-semibold text-slate-900">
                    1. Permitted Campus Usage
                  </p>
                  <p>
                    Campus Tag provides digital lost & found indexing for educational, personal, and research equipment. Users must only register equipment they own or have explicit administrative authority to tag on behalf of a university department.
                  </p>
                  <p className="font-semibold text-slate-900">
                    2. Tag Longevity Guarantee
                  </p>
                  <p>
                    Physical QR codes generated via Campus Tag will remain operational and scannable indefinitely. If an account subscription lapses, public scan pages will continue to render the recovery prompt and forward alerts without disruption.
                  </p>
                  <p className="font-semibold text-slate-900">
                    3. Prohibited Conduct
                  </p>
                  <p>
                    You agree not to use Campus Tag to track individuals without consent, affix tags to persons or unauthorized third-party property, or transmit abusive messages through our anonymous finder relay.
                  </p>
                </>
              )}

              {activePolicy === 'refund' && (
                <>
                  <p className="font-semibold text-slate-900">
                    1. 14-Day Academic Refund Window
                  </p>
                  <p>
                    If Campus Tag does not fulfill your student group or lab's requirements, you may request a 100% full refund within 14 calendar days of your initial plan upgrade.
                  </p>
                  <p className="font-semibold text-slate-900">
                    2. Cancellation Terms
                  </p>
                  <p>
                    You can cancel recurring monthly or yearly subscriptions at any time directly through your dashboard with zero penalty or early termination fees. Your account remains active until the end of the paid billing period.
                  </p>
                </>
              )}
            </div>

            <div className="pt-4 border-t border-slate-200 flex justify-end">
              <button
                onClick={onClosePolicy}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs cursor-pointer"
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
