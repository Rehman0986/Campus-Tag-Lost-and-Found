import { useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider, useQueryClient } from '@tanstack/react-query';
import { ClerkProvider, SignIn, SignUp, Show, useClerk, useUser } from '@clerk/react';
import { publishableKeyFromHost } from '@clerk/react/internal';
import { shadcn } from '@clerk/themes';
import { Route, Switch, Link, Redirect, useLocation, useParams, Router as WouterRouter } from 'wouter';
import { QRCodeSVG } from 'qrcode.react';
import {
  ArrowDownLeft, ArrowLeft, ArrowRight, ArrowUpRight, Bell, BookOpen, Check, CheckCircle2,
  ChevronDown, CircleAlert, Clock3, Compass, ExternalLink, Filter, KeyRound, Laptop, MapPin,
  Menu, MessageCircle, Package, Plus, Printer, QrCode, Search, ShieldCheck, Sparkles,
  Upload, UserRound, X,
} from 'lucide-react';
import {
  getGetDashboardQueryKey, getGetItemQueryKey, getGetPublicItemQueryKey,
  getListItemMessagesQueryKey, getListItemsQueryKey, getListNotificationsQueryKey,
  useCreateItem, useGetDashboard, useGetItem, useGetPublicItem, useListItemMessages,
  useListItems, useListNotifications, useMarkNotificationRead, useRequestUploadUrl,
  useSubmitFinderReport, useUpdateItem, useUpdateItemLocation,
} from '@workspace/api-client-react';
import type { Item, ItemCategory, ItemInput, ItemMessage, ItemStatus, LocationInput } from '@workspace/api-client-react';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import './index.css';

const queryClient = new QueryClient({ defaultOptions: { queries: { staleTime: 20_000, retry: 1 } } });
const clerkPubKey = publishableKeyFromHost(
  window.location.hostname,
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY,
);
const clerkProxyUrl = import.meta.env.VITE_CLERK_PROXY_URL;
const basePath = import.meta.env.BASE_URL.replace(/\/$/, '');
function stripBase(path: string): string {
  return basePath && path.startsWith(basePath) ? path.slice(basePath.length) || '/' : path;
}
if (!clerkPubKey) throw new Error('Missing VITE_CLERK_PUBLISHABLE_KEY in .env file');

const clerkAppearance = {
  theme: shadcn,
  cssLayerName: 'clerk',
  options: {
    logoPlacement: 'inside' as const,
    logoLinkUrl: basePath || '/',
    logoImageUrl: `${window.location.origin}${basePath}/logo.svg`,
  },
  variables: {
    colorPrimary: '#1E88E5',
    colorForeground: '#1F2937',
    colorMutedForeground: '#64748B',
    colorDanger: '#B42318',
    colorBackground: '#FFFFFF',
    colorInput: '#FFFFFF',
    colorInputForeground: '#1F2937',
    colorNeutral: '#D8E0E8',
    fontFamily: 'DM Sans, sans-serif',
    borderRadius: '0.8rem',
  },
  elements: {
    rootBox: 'w-full flex justify-center',
    cardBox: 'bg-white rounded-2xl w-[440px] max-w-full overflow-hidden shadow-[0_24px_70px_-38px_rgba(31,41,55,.20)]',
    card: '!shadow-none !border-0 !bg-transparent !rounded-none',
    footer: '!shadow-none !border-0 !bg-transparent !rounded-none',
    headerTitle: 'text-slate-900 font-semibold tracking-tight',
    headerSubtitle: 'text-slate-500',
    socialButtonsBlockButtonText: 'text-slate-800 font-semibold',
    formFieldLabel: 'text-slate-700 font-semibold',
    footerActionLink: 'text-[#1E88E5] font-semibold',
    footerActionText: 'text-slate-500',
    dividerText: 'text-slate-500',
    identityPreviewEditButton: 'text-[#1E88E5]',
    formFieldSuccessText: 'text-emerald-700',
    alertText: 'text-red-700',
    logoBox: 'rounded-xl',
    logoImage: 'object-contain',
    socialButtonsBlockButton: 'border-slate-200 bg-white hover:bg-slate-50',
    formButtonPrimary: 'bg-[#1E88E5] hover:bg-[#1565C0] shadow-none',
    formFieldInput: 'border-slate-200 bg-white text-slate-900',
    footerAction: 'border-t border-slate-200',
    dividerLine: 'bg-slate-200',
    alert: 'border-red-200 bg-red-50',
    otpCodeFieldInput: 'border-slate-200 bg-white',
    formFieldRow: 'gap-1.5',
    main: 'gap-5',
  },
};

const categories: ItemCategory[] = ['Bottle', 'Bag', 'Keys', 'Wallet', 'Electronics', 'Other'];
const categoryIcon: Record<ItemCategory, typeof Package> = {
  Bottle: Package, Bag: Package, Keys: KeyRound, Wallet: Package, Electronics: Laptop, Other: Package,
};
const fmtDate = (date?: string | null) => date ? new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'Not reported yet';
const fmtTime = (date?: string | null) => date ? new Date(date).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) : '';
const photoUrl = (path?: string | null) => path ? `/api/storage${path}` : '';

function Brand({ light = false }: { light?: boolean }) {
  return <Link href="/" className={`inline-flex items-center gap-2.5 ${light ? 'text-[#f7f3e9]' : 'text-[#214f48]'}`} data-testid="link-brand">
    <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#e9d28e] text-[#214f48]"><QrCode size={20} strokeWidth={2.3} /></span>
    <span className="font-[var(--app-font-serif)] text-lg font-extrabold tracking-[-.06em]">campus tag</span>
  </Link>;
}

function Home() {
  return <main className="min-h-[100dvh] overflow-hidden">
    <header className="page-wrap flex h-[76px] items-center justify-between">
      <Brand />
      <nav className="flex items-center gap-3">
        <Link href="/sign-in" className="hidden rounded-lg px-4 py-2 text-sm font-semibold text-[#395750] hover:bg-[#eaece4] sm:inline-flex" data-testid="link-sign-in">Sign in</Link>
        <Link href="/sign-up" className="btn-primary text-sm" data-testid="link-create-account">Get started <ArrowRight size={16} /></Link>
      </nav>
    </header>
    <section className="page-wrap grid min-h-[620px] items-center gap-10 pb-16 pt-8 lg:grid-cols-[1.05fr_.95fr] lg:pb-24 lg:pt-4">
      <div className="fade-up relative z-10 max-w-[600px]">
        <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-[#d7ded4] bg-[#fbfaf4] px-3.5 py-2 text-xs font-semibold text-[#42625a]"><span className="h-2 w-2 rounded-full bg-[#d3a845]" /> Made for campus life</div>
        <h1 className="display-font text-[clamp(3.5rem,8vw,6.6rem)] leading-[.91] text-[#214f48]">Lost something?<br /><span className="text-[#c28c42]">Find your way</span><br />back to it.</h1>
        <p className="mt-7 max-w-[470px] text-lg leading-8 text-[#61756e]">A tiny tag turns a lost item into a quick, private connection. No awkward calls. No contact details on display.</p>
        <div className="mt-9 flex flex-wrap gap-3">
          <Link href="/sign-up" className="btn-primary min-h-12 px-5" data-testid="link-start-protecting">Protect your things <ArrowRight size={17} /></Link>
          <a href="#how-it-works" className="btn-quiet min-h-12 px-5" data-testid="link-how-it-works">See how it works</a>
        </div>
        <div className="mt-10 flex items-center gap-3 text-sm text-[#62766f]"><ShieldCheck size={19} className="text-[#397464]" /> Private by design. Useful in a hurry.</div>
      </div>
      <div className="relative mx-auto w-full max-w-[540px] fade-up [animation-delay:120ms]">
        <div className="absolute -right-8 top-5 h-64 w-64 rounded-full bg-[#e8d699]/35 blur-3xl" />
        <div className="relative rounded-[2rem] border border-[#cbd6cc] bg-[#e9ece3] p-3 shadow-[0_34px_80px_-40px_rgba(26,66,58,.46)]">
          <div className="relative overflow-hidden rounded-[1.45rem] bg-[#d8e0d5]">
            <div className="absolute inset-0 opacity-60" style={{ backgroundImage: 'linear-gradient(115deg, transparent 20%, rgba(255,255,255,.4) 20.2%, transparent 20.6%), linear-gradient(25deg, transparent 49%, rgba(255,255,255,.45) 49.2%, transparent 50%), radial-gradient(ellipse at 60% 40%, #f1e9d1 0%, transparent 37%)' }} />
            <div className="relative flex min-h-[420px] flex-col justify-between p-6 sm:min-h-[488px] sm:p-8">
              <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-[.2em] text-[#52756b]"><span>North Quad · Campus map</span><Compass size={18} /></div>
              <div className="relative mx-auto w-[90%] max-w-[340px] rotate-[-4deg] rounded-[1.5rem] border border-[#cad5c9] bg-[#f8f6ed] p-5 shadow-[0_22px_36px_-17px_rgba(29,61,52,.35)] sm:p-7">
                <div className="flex items-center justify-between"><span className="eyebrow">Personal item tag</span><span className="rounded-full bg-[#e4efd9] px-2.5 py-1 text-[10px] font-bold text-[#3d6a51]">READY</span></div>
                <div className="mt-5 flex items-center gap-4">
                  <div className="grid h-16 w-16 place-items-center rounded-2xl bg-[#d8e4d9] text-[#4e776a]"><BookOpen size={27} /></div>
                  <div><p className="font-[var(--app-font-serif)] text-2xl font-extrabold tracking-tight text-[#264e46]">Field notes</p><p className="mt-1 text-xs text-[#72847b]">Belongs to a student</p></div>
                </div>
                <div className="mt-6 flex items-center gap-4 border-t border-dashed border-[#d5d9cc] pt-5">
                  <div className="grid h-[74px] w-[74px] place-items-center rounded-lg bg-white p-1.5"><QRCodeSVG value={`${window.location.origin}${basePath}/sign-up`} size={60} fgColor="#1E88E5" /></div>
                  <div className="max-w-[150px]"><p className="font-semibold text-[#294c45]">Want your own tag?</p><p className="mt-1 text-xs leading-5 text-[#6e7d75]">Scan to create one for your campus essentials.</p></div>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs font-semibold text-[#54746a]"><span className="inline-flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-[#c28c42]" /> A little peace of mind</span><span>01 / 03</span></div>
            </div>
          </div>
        </div>
        <div className="absolute -bottom-5 -left-5 flex items-center gap-3 rounded-2xl border border-[#d6ded5] bg-[#fffdf7] px-4 py-3 shadow-lg sm:-left-10"><span className="grid h-9 w-9 place-items-center rounded-xl bg-[#e2eee4] text-[#36735e]"><MessageCircle size={18} /></span><span><strong className="block text-sm text-[#31554d]">A finder sent a note</strong><span className="text-xs text-[#718078]">Your number stays private</span></span></div>
      </div>
    </section>
    <section className="border-y border-[#dfe4d9] bg-[#f6f4eb] py-8">
      <div className="page-wrap flex flex-wrap items-center justify-center gap-x-10 gap-y-4 text-sm font-semibold text-[#557168] sm:justify-between"><span className="eyebrow">Built for the places you go</span><span>Lecture halls</span><span>Library tables</span><span>Campus cafés</span><span>Everywhere between</span></div>
    </section>
    <section id="how-it-works" className="page-wrap py-20 sm:py-28">
      <div className="grid items-end gap-6 md:grid-cols-[.9fr_1.1fr]"><div><p className="eyebrow">Small tag, calmer day</p><h2 className="display-font mt-4 max-w-[520px] text-4xl leading-tight text-[#214f48] sm:text-5xl">Three steps between lost and found.</h2></div><p className="max-w-[430px] pb-1 text-base leading-7 text-[#667871]">A useful system should be easy for both sides. Campus Tag keeps the path short, and the personal details private.</p></div>
      <div className="mt-12 grid gap-4 md:grid-cols-3">
        {[{ n: '01', icon: Plus, title: 'Register what matters', copy: 'Add your everyday essentials in a minute. Print a QR tag for each one.' }, { n: '02', icon: QrCode, title: 'A finder scans', copy: 'The tag opens a simple page with just enough detail to identify the item.' }, { n: '03', icon: ShieldCheck, title: 'Reconnect privately', copy: 'A finder sends you a note through Campus Tag. Your email and phone stay hidden.' }].map(({ n, icon: Icon, title, copy }) => <article key={n} className="surface soft-shadow p-6 sm:p-7"><span className="eyebrow">{n} / HOW IT WORKS</span><div className="mt-7 grid h-12 w-12 place-items-center rounded-2xl bg-[#e8eee4] text-[#37665a]"><Icon size={22} /></div><h3 className="mt-5 font-[var(--app-font-serif)] text-xl font-bold tracking-tight text-[#284d45]">{title}</h3><p className="mt-2 text-sm leading-6 text-[#718078]">{copy}</p></article>)}
      </div>
    </section>
    <section className="page-wrap pb-20">
      <div className="relative overflow-hidden rounded-[2rem] bg-[#214f48] px-6 py-12 text-[#f7f3e9] sm:px-12 sm:py-16">
        <div className="absolute -right-20 -top-32 h-80 w-80 rounded-full border border-white/10" /><div className="absolute -right-5 -top-16 h-56 w-56 rounded-full border border-white/10" />
        <div className="relative max-w-[620px]"><p className="eyebrow !text-[#e0cb89]">More thoughtful than a lost-and-found box</p><h2 className="display-font mt-4 text-4xl leading-tight sm:text-5xl">Your name stays yours.<br />Your stuff gets home.</h2><p className="mt-5 max-w-lg leading-7 text-[#d2e0d8]">No contact information printed on tags. No public profile. Just one secure line from a good samaritan to you.</p><Link href="/sign-up" className="mt-8 inline-flex min-h-12 items-center gap-2 rounded-xl bg-[#e9d28e] px-5 font-bold text-[#214f48] hover:bg-[#f0dfa7]" data-testid="link-create-free-account">Make your first tag <ArrowRight size={17} /></Link></div>
      </div>
    </section>
    <footer className="page-wrap flex flex-col gap-4 border-t border-[#dfe4d9] py-7 text-xs text-[#73817a] sm:flex-row sm:items-center sm:justify-between"><Brand /><span>For the things that make campus yours.</span></footer>
  </main>;
}

function LoadingBlock({ label = 'Getting your campus essentials ready…' }: { label?: string }) {
  return <div className="space-y-4" role="status" data-testid="loading-state"><div className="h-8 w-48 animate-pulse rounded-lg bg-[#e4e8de]" /><div className="grid gap-4 sm:grid-cols-3"><div className="h-28 animate-pulse rounded-2xl bg-[#e4e8de]" /><div className="h-28 animate-pulse rounded-2xl bg-[#e4e8de]" /><div className="h-28 animate-pulse rounded-2xl bg-[#e4e8de]" /></div><p className="text-sm text-muted-foreground">{label}</p></div>;
}
function QueryError({ onRetry }: { onRetry: () => void }) {
  return <div className="surface flex flex-col items-start gap-3 p-6" role="alert" data-testid="error-load-data"><span className="grid h-10 w-10 place-items-center rounded-xl bg-[#f7e7e1] text-[#a84e44]"><CircleAlert size={19} /></span><div><h3 className="font-bold text-[#284d45]">We couldn’t load that just now</h3><p className="mt-1 text-sm text-muted-foreground">Your information is safe. Try again in a moment.</p></div><button className="btn-quiet" onClick={onRetry} data-testid="button-retry">Try again</button></div>;
}
function StatusPill({ status }: { status: ItemStatus }) {
  const styles = status === 'lost' ? 'bg-[#f7e8df] text-[#9b573d]' : status === 'recovered' ? 'bg-[#e3eee1] text-[#437153]' : 'bg-[#e9eee7] text-[#4a6d5d]';
  const label = status === 'lost' ? 'Lost mode' : status === 'recovered' ? 'Recovered' : 'Protected';
  return <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${styles}`} data-testid={`status-item-${status}`}><span className="h-1.5 w-1.5 rounded-full bg-current" />{label}</span>;
}
function ItemPhoto({ path, name }: { path?: string | null; name: string }) {
  return path ? <img src={photoUrl(path)} alt={name} className="h-full w-full object-cover" data-testid="img-item-photo" /> : <div className="grid h-full w-full place-items-center bg-[#e8eee5] text-[#55796c]" data-testid="img-item-placeholder"><Package size={30} strokeWidth={1.5} /></div>;
}

function OwnerGate({ children }: { children: ReactNode }) {
  return <><Show when="signed-in">{children}</Show><Show when="signed-out"><Redirect to="/" /></Show></>;
}

function AppShell({ children, title, subtitle }: { children: ReactNode; title: string; subtitle?: string }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { signOut } = useClerk();
  const { user } = useUser();
  const [location] = useLocation();
  const nav = [{ href: '/dashboard', label: 'Overview', icon: Compass }, { href: '/items', label: 'My items', icon: Package }];
  return <div className="min-h-[100dvh] bg-background">
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-[246px] flex-col bg-[#214f48] px-4 py-5 text-[#f7f3e9] lg:flex">
      <div className="px-2"><Brand light /></div>
      <div className="mt-12 px-3"><span className="eyebrow !text-[#a9c0b5]">YOUR CAMPUS</span><p className="mt-2 text-sm text-[#d6e3db]">Your little lost & found</p></div>
      <nav className="mt-5 space-y-1">{nav.map(({ href, label, icon: Icon }) => <Link key={href} href={href} className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition-colors ${location === href || (href === '/items' && location.startsWith('/items')) ? 'bg-[#f1e7c5] text-[#214f48]' : 'text-[#d7e4dd] hover:bg-white/10'}`} data-testid={`link-nav-${label.toLowerCase().replaceAll(' ', '-')}`}><Icon size={18} />{label}</Link>)}</nav>
      <div className="mt-auto rounded-2xl border border-white/10 bg-white/5 p-4"><div className="grid h-9 w-9 place-items-center rounded-xl bg-[#e9d28e] text-[#214f48]"><ShieldCheck size={18} /></div><p className="mt-3 text-sm font-semibold">Privacy comes first</p><p className="mt-1 text-xs leading-5 text-[#c0d3c9]">A finder can reach you without seeing your personal details.</p></div>
      <div className="mt-5 flex items-center justify-between border-t border-white/15 pt-4"><div className="flex min-w-0 items-center gap-2.5"><span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#d5e1d5] text-xs font-bold text-[#214f48]">{user?.firstName?.slice(0, 1) || <UserRound size={15} />}</span><span className="truncate text-xs font-medium">{user?.firstName || 'Student'}</span></div><button aria-label="Sign out" onClick={() => signOut({ redirectUrl: basePath || '/' })} className="rounded-lg p-2 text-[#d7e4dd] hover:bg-white/10" data-testid="button-sign-out"><ArrowUpRight size={16} /></button></div>
    </aside>
    <div className="lg:pl-[246px]">
      <header className="sticky top-0 z-20 border-b border-[#dfe4d9] bg-[#f8f7f1]/90 backdrop-blur-md">
        <div className="page-wrap flex h-[70px] items-center justify-between gap-4 lg:max-w-none lg:px-8">
          <div className="flex items-center gap-3"><button className="rounded-lg p-2 text-[#31554d] lg:hidden" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle navigation" data-testid="button-toggle-navigation">{menuOpen ? <X size={21} /> : <Menu size={21} />}</button><div className="lg:hidden"><Brand /></div><div className="hidden lg:block"><h1 className="font-[var(--app-font-serif)] text-lg font-bold text-[#294f47]">{title}</h1><p className="text-xs text-[#718078]">{subtitle}</p></div></div>
          <div className="flex items-center gap-2"><Link href="/items/new" className="btn-primary min-h-10 px-3.5 text-sm" data-testid="button-register-item"><Plus size={16} /><span className="hidden sm:inline">Add item</span><span className="sm:hidden">Add</span></Link><Link href="/dashboard" aria-label="Dashboard" className="grid h-10 w-10 place-items-center rounded-xl border border-[#dbe2d9] bg-[#fffdf7] text-[#45685d] lg:hidden" data-testid="link-dashboard-mobile"><Compass size={18} /></Link></div>
        </div>
        {menuOpen && <nav className="page-wrap space-y-1 pb-4 lg:hidden">{nav.map(({ href, label, icon: Icon }) => <Link key={href} onClick={() => setMenuOpen(false)} href={href} className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-[#31554d] hover:bg-[#e9ece3]" data-testid={`link-mobile-nav-${label.toLowerCase().replaceAll(' ', '-')}`}><Icon size={18} />{label}</Link>)}</nav>}
      </header>
      <main className="page-wrap max-w-[1160px] py-7 sm:py-9 lg:px-8">
        <div className="mb-7 lg:hidden"><p className="eyebrow">Campus Tag / {title}</p><h1 className="display-font mt-2 text-3xl text-[#294f47]">{title}</h1>{subtitle && <p className="mt-1 text-sm text-[#718078]">{subtitle}</p>}</div>
        {children}
      </main>
    </div>
  </div>;
}

function DashboardPage() {
  const summaryQuery = useGetDashboard();
  const itemsQuery = useListItems();
  const noticesQuery = useListNotifications();
  const markRead = useMarkNotificationRead();
  const client = useQueryClient();
  const [tab, setTab] = useState<'reports' | 'notifications'>('reports');
  const recent = summaryQuery.data?.recentReports ?? [];
  const items = itemsQuery.data ?? [];
  const notifications = noticesQuery.data ?? [];
  const itemMap = useMemo(() => new Map(items.map(item => [item.id, item])), [items]);
  const retry = () => { void summaryQuery.refetch(); void itemsQuery.refetch(); void noticesQuery.refetch(); };
  return <AppShell title="Overview" subtitle="A clear view of the things you’ve tagged.">
    {(summaryQuery.isLoading || itemsQuery.isLoading) && <LoadingBlock />}
    {(summaryQuery.isError || itemsQuery.isError) && <QueryError onRetry={retry} />}
    {summaryQuery.data && itemsQuery.data && <>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[{ label: 'Items registered', value: summaryQuery.data.totalItems, note: 'Your tagged essentials', icon: Package, tone: 'bg-[#e3ece2] text-[#3c6c5c]' }, { label: 'Protected', value: summaryQuery.data.activeItems, note: 'Ready to be found', icon: ShieldCheck, tone: 'bg-[#e9eddf] text-[#667746]' }, { label: 'In lost mode', value: summaryQuery.data.lostItems, note: 'Tags are alerting finders', icon: MapPin, tone: 'bg-[#f4e8d8] text-[#a66c3d]' }, { label: 'Recovered', value: summaryQuery.data.recoveredItems, note: 'Back where they belong', icon: CheckCircle2, tone: 'bg-[#e2eee8] text-[#39725b]' }].map(({ label, value, note, icon: Icon, tone }) => <div className="surface p-4 sm:p-5" key={label} data-testid={`summary-${label.toLowerCase().replaceAll(' ', '-')}`}><div className="flex items-start justify-between"><span className={`grid h-10 w-10 place-items-center rounded-xl ${tone}`}><Icon size={18} /></span><span className="eyebrow">TOTAL</span></div><p className="mt-4 font-[var(--app-font-serif)] text-3xl font-extrabold tracking-tight text-[#284d45]">{value}</p><p className="mt-1 text-sm font-semibold text-[#3e5e55]">{label}</p><p className="mt-1 text-xs text-[#839089]">{note}</p></div>)}
      </div>
      <div className="mt-7 grid gap-5 xl:grid-cols-[1.35fr_.65fr]">
        <section className="surface overflow-hidden">
          <div className="flex items-center justify-between border-b border-[#e7e9e1] px-5 py-4 sm:px-6"><div><p className="eyebrow">A little update</p><h2 className="mt-1 font-[var(--app-font-serif)] text-xl font-bold text-[#294f47]">Recent activity</h2></div><div className="flex rounded-xl bg-[#eff0e8] p-1"><button onClick={() => setTab('reports')} className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${tab === 'reports' ? 'bg-white text-[#31574d] shadow-sm' : 'text-[#77847d]'}`} data-testid="button-tab-reports">Reports</button><button onClick={() => setTab('notifications')} className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${tab === 'notifications' ? 'bg-white text-[#31574d] shadow-sm' : 'text-[#77847d]'}`} data-testid="button-tab-notifications">Inbox {summaryQuery.data.unreadNotifications > 0 && <span className="ml-1 rounded-full bg-[#e5d08d] px-1.5 text-[#35564c]">{summaryQuery.data.unreadNotifications}</span>}</button></div></div>
          {tab === 'reports' ? recent.length ? <div className="divide-y divide-[#e8e9e1]">{recent.slice(0, 6).map((report: ItemMessage) => <div key={report.id} className="flex gap-3 px-5 py-4 sm:px-6" data-testid={`report-row-${report.id}`}><span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#e6eee5] text-[#4b7163]"><MessageCircle size={17} /></span><div className="min-w-0 flex-1"><div className="flex flex-wrap items-baseline justify-between gap-2"><p className="text-sm font-semibold text-[#36584f]">{report.senderName || 'A campus finder'} <span className="font-normal text-[#75837b]">on {itemMap.get(report.itemId)?.name || 'your item'}</span></p><time className="text-xs text-[#8b958e]">{fmtTime(report.createdAt)}</time></div><p className="mt-1 line-clamp-2 text-sm leading-6 text-[#66776f]">{report.body}</p><Link href={`/items/${report.itemId}`} className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-[#397260]" data-testid={`link-open-report-${report.id}`}>View item <ArrowRight size={13} /></Link></div></div>)}</div> : <EmptyState icon={MessageCircle} title="No finder notes yet" description="When someone scans one of your tags, their message will show up here." /> :
            noticesQuery.isLoading ? <div className="p-5"><LoadingBlock label="Checking your inbox…" /></div> : noticesQuery.isError ? <div className="p-5"><QueryError onRetry={() => void noticesQuery.refetch()} /></div> : notifications.length ? <div className="divide-y divide-[#e8e9e1]">{notifications.slice(0, 7).map(n => <button key={n.id} onClick={() => { if (!n.isRead) markRead.mutate({ id: n.id }, { onSuccess: () => { void client.invalidateQueries({ queryKey: getListNotificationsQueryKey() }); void client.invalidateQueries({ queryKey: getGetDashboardQueryKey() }); } }); }} className="flex w-full gap-3 px-5 py-4 text-left hover:bg-[#faf9f3] sm:px-6" data-testid={`notification-${n.id}`}><span className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${n.isRead ? 'bg-[#d6ded5]' : 'bg-[#c49549]'}`} /><span className="min-w-0 flex-1"><span className="flex justify-between gap-3"><strong className="truncate text-sm text-[#36584f]">{n.itemName}</strong><time className="shrink-0 text-xs text-[#8b958e]">{fmtTime(n.createdAt)}</time></span><span className="mt-1 block text-sm text-[#738078]">{n.message}</span></span></button>)}</div> : <EmptyState icon={Bell} title="Inbox is quiet" description="Important activity for your tags will collect here." />}
        </section>
        <section className="surface p-5 sm:p-6"><div className="flex items-start justify-between"><div><p className="eyebrow">Your collection</p><h2 className="mt-1 font-[var(--app-font-serif)] text-xl font-bold text-[#294f47]">Recently tagged</h2></div><Link href="/items" className="grid h-9 w-9 place-items-center rounded-lg text-[#477166] hover:bg-[#edf1e9]" aria-label="View all items" data-testid="link-all-items"><ArrowUpRight size={17} /></Link></div>
          {items.length ? <div className="mt-5 space-y-3">{[...items].sort((a,b) => b.createdAt.localeCompare(a.createdAt)).slice(0,4).map(item => <Link key={item.id} href={`/items/${item.id}`} className="flex items-center gap-3 rounded-xl border border-[#e7e9e0] p-2.5 transition hover:bg-[#f7f7ef]" data-testid={`card-recent-item-${item.id}`}><div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg"><ItemPhoto path={item.photoPath} name={item.name} /></div><span className="min-w-0 flex-1"><strong className="block truncate text-sm text-[#36584f]">{item.name}</strong><span className="mt-1 block text-xs text-[#839089]">{item.category} · Added {fmtDate(item.createdAt)}</span></span><StatusPill status={item.status} /></Link>)}</div> : <EmptyState icon={Package} title="Start with one item" description="Your backpack, keys, or favorite bottle — add the things you carry." action={<Link href="/items/new" className="btn-primary mt-1" data-testid="link-first-item"><Plus size={16} /> Register an item</Link>} />}
        </section>
      </div>
      <div className="mt-6 flex flex-col justify-between gap-4 rounded-2xl border border-[#dfe5dc] bg-[#f1f3eb] p-5 sm:flex-row sm:items-center sm:px-6"><span className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-[#fffdf7] text-[#52776a]"><Sparkles size={18} /></span><span><strong className="block text-sm text-[#35574e]">A tag takes about a minute</strong><span className="mt-1 block text-xs text-[#78867e]">Register, print the QR, and stick it somewhere easy to scan.</span></span></span><Link href="/items/new" className="btn-quiet bg-transparent" data-testid="link-add-another">Add an item <ArrowRight size={15} /></Link></div>
    </>}
  </AppShell>;
}

function EmptyState({ icon: Icon, title, description, action }: { icon: typeof Package; title: string; description: string; action?: ReactNode }) {
  return <div className="flex flex-col items-center px-6 py-10 text-center" data-testid="empty-state"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#e9efe7] text-[#52776a]"><Icon size={21} /></span><h3 className="mt-4 font-[var(--app-font-serif)] text-lg font-bold text-[#35574e]">{title}</h3><p className="mt-1 max-w-[300px] text-sm leading-6 text-[#7a8981]">{description}</p>{action && <div className="mt-4">{action}</div>}</div>;
}

function ItemsPage() {
  const query = useListItems();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | ItemStatus>('all');
  const items = query.data ?? [];
  const visible = items.filter(item => (filter === 'all' || item.status === filter) && `${item.name} ${item.category} ${item.description}`.toLowerCase().includes(search.toLowerCase()));
  return <AppShell title="My items" subtitle="Keep track of what you’ve tagged.">
    <div className="mb-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="eyebrow">Your collection / {items.length} {items.length === 1 ? 'item' : 'items'}</p><h2 className="display-font mt-2 text-3xl text-[#294f47]">Things worth finding.</h2></div><Link href="/items/new" className="btn-primary" data-testid="button-new-item"><Plus size={17} /> Register item</Link></div>
    <div className="mb-5 flex flex-col gap-3 sm:flex-row"><label className="relative flex-1"><Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#819087]" /><input className="field pl-10" placeholder="Search your items" value={search} onChange={e => setSearch(e.target.value)} aria-label="Search items" data-testid="input-search-items" /></label><label className="relative sm:w-48"><Filter size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#819087]" /><select className="field appearance-none pl-10 pr-9" value={filter} onChange={e => setFilter(e.target.value as typeof filter)} aria-label="Filter by status" data-testid="select-item-status"><option value="all">All statuses</option><option value="active">Protected</option><option value="lost">Lost mode</option><option value="recovered">Recovered</option></select><ChevronDown size={15} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#819087]" /></label></div>
    {query.isLoading ? <LoadingBlock label="Loading your items…" /> : query.isError ? <QueryError onRetry={() => void query.refetch()} /> : !items.length ? <div className="surface"><EmptyState icon={Package} title="Your collection starts here" description="Add an item and give it a private QR tag. Finders can send you a message without seeing your contact details." action={<Link href="/items/new" className="btn-primary" data-testid="link-add-first-item"><Plus size={16} /> Register your first item</Link>} /></div> : !visible.length ? <div className="surface"><EmptyState icon={Search} title="No matches this time" description="Try a different search or clear the status filter." action={<button className="btn-quiet" onClick={() => { setSearch(''); setFilter('all'); }} data-testid="button-clear-filters">Clear filters</button>} /></div> : <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{visible.map((item, index) => { const Icon = categoryIcon[item.category]; return <Link key={item.id} href={`/items/${item.id}`} className="surface group overflow-hidden transition duration-200 hover:-translate-y-1 hover:shadow-[0_20px_40px_-30px_rgba(33,79,72,.4)]" style={{ animationDelay: `${index * 50}ms` }} data-testid={`card-item-${item.id}`}><div className="relative h-44 overflow-hidden"><ItemPhoto path={item.photoPath} name={item.name} /><span className="absolute left-3 top-3 rounded-full border border-white/70 bg-[#fbfaf4]/90 px-2.5 py-1 text-[11px] font-semibold text-[#557168]">{item.category}</span><span className="absolute right-3 top-3"><StatusPill status={item.status} /></span></div><div className="p-4"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><h3 className="truncate font-[var(--app-font-serif)] text-lg font-bold text-[#31564d]">{item.name}</h3><p className="mt-1 line-clamp-2 min-h-10 text-sm leading-5 text-[#78867e]">{item.description || 'No description added'}</p></div><span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#edf1e8] text-[#57756a]"><Icon size={17} /></span></div><div className="mt-4 flex items-center justify-between border-t border-[#e9ebe3] pt-3 text-xs text-[#87928b]"><span className="inline-flex items-center gap-1.5"><Clock3 size={13} /> Added {fmtDate(item.createdAt)}</span><span className="inline-flex items-center gap-1 font-semibold text-[#477467] group-hover:gap-2">Details <ArrowRight size={13} /></span></div></div></Link>; })}</div>}
  </AppShell>;
}

function ItemCreatePage() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ItemCategory>('Other');
  const [photoPath, setPhotoPath] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [formError, setFormError] = useState('');
  const uploadRequest = useRequestUploadUrl();
  const createItem = useCreateItem();
  const client = useQueryClient();
  const [, setLocation] = useLocation();
  const fileRef = useRef<HTMLInputElement>(null);
  const uploadPhoto = async (file: File) => {
    setUploadError('');
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 10 * 1024 * 1024) {
      setUploadError('Choose a JPG, PNG, or WebP image under 10 MB.');
      return;
    }
    setUploading(true);
    try {
      const upload = await uploadRequest.mutateAsync({ data: { name: file.name, size: file.size, contentType: file.type as 'image/jpeg' | 'image/png' | 'image/webp' } });
      const response = await fetch(upload.uploadURL, { method: 'PUT', headers: { 'Content-Type': file.type }, body: file });
      if (!response.ok) throw new Error('Upload failed');
      setPhotoPath(upload.objectPath);
    } catch {
      setUploadError('That photo could not be uploaded. Please try again.');
    } finally { setUploading(false); }
  };
  const submit = (event: FormEvent) => {
    event.preventDefault();
    setFormError('');
    const data: ItemInput = { name: name.trim(), description: description.trim(), category, photoPath };
    if (!data.name) { setFormError('Give your item a name to continue.'); return; }
    createItem.mutate({ data }, { onSuccess: async item => {
      await Promise.all([
        client.invalidateQueries({ queryKey: getListItemsQueryKey() }),
        client.invalidateQueries({ queryKey: getGetDashboardQueryKey() }),
      ]);
      setLocation(`/items/${item.id}`);
    }, onError: () => setFormError('We couldn’t register that item. Your details are still here—please try again.') });
  };
  return <AppShell title="Register an item" subtitle="A few details make it easier to recognize.">
    <Link href="/items" className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-[#56766b]" data-testid="link-back-to-items"><ArrowLeft size={16} /> Back to items</Link>
    <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
      <form onSubmit={submit} className="surface p-5 sm:p-7" data-testid="form-create-item">
        <div><p className="eyebrow">Add a keepsake, essential, or everyday thing</p><h2 className="display-font mt-2 text-3xl text-[#294f47]">What are we looking out for?</h2></div>
        <div className="mt-7 space-y-5">
          <label className="block"><span className="mb-1.5 block text-sm font-semibold text-[#405e55]">Item name <span className="text-[#bd7751]">*</span></span><input className="field" maxLength={120} required value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Green enamel water bottle" data-testid="input-item-name" /><span className="mt-1.5 block text-xs text-[#859189]">A color, brand, or detail can help a finder be sure.</span></label>
          <label className="block"><span className="mb-1.5 block text-sm font-semibold text-[#405e55]">Category</span><select className="field" value={category} onChange={e => setCategory(e.target.value as ItemCategory)} data-testid="select-item-category">{categories.map(c => <option key={c} value={c}>{c}</option>)}</select></label>
          <label className="block"><span className="mb-1.5 block text-sm font-semibold text-[#405e55]">Helpful details <span className="font-normal text-[#86918a]">(optional)</span></span><textarea className="field min-h-28 resize-y" maxLength={2000} value={description} onChange={e => setDescription(e.target.value)} placeholder="Anything that could help confirm it’s yours." data-testid="input-item-description" /></label>
          <div><span className="mb-1.5 block text-sm font-semibold text-[#405e55]">Photo <span className="font-normal text-[#86918a]">(optional)</span></span><input ref={fileRef} className="hidden" type="file" accept="image/jpeg,image/png,image/webp" onChange={e => e.target.files?.[0] && void uploadPhoto(e.target.files[0])} data-testid="input-item-photo" />{photoPath ? <div className="flex items-center gap-3 rounded-xl border border-[#dce4da] bg-[#f7f7ef] p-3"><img src={photoUrl(photoPath)} alt="Selected item" className="h-14 w-14 rounded-lg object-cover" /><span className="flex-1 text-sm font-semibold text-[#49685d]">Photo added</span><button type="button" className="btn-quiet min-h-9 px-3 text-xs" onClick={() => setPhotoPath(null)} data-testid="button-remove-photo">Remove</button></div> : <button type="button" disabled={uploading} onClick={() => fileRef.current?.click()} className="flex w-full items-center gap-3 rounded-xl border border-dashed border-[#cbd8ce] bg-[#fafaf5] p-4 text-left hover:bg-[#f2f4ec] disabled:opacity-60" data-testid="button-upload-photo"><span className="grid h-10 w-10 place-items-center rounded-xl bg-[#e8eee5] text-[#55796c]">{uploading ? <span className="h-4 w-4 animate-pulse rounded-full bg-[#7d9b87]" /> : <Upload size={18} />}</span><span><strong className="block text-sm text-[#47655a]">{uploading ? 'Uploading photo…' : 'Choose a photo'}</strong><span className="mt-1 block text-xs text-[#88948c]">JPG, PNG, or WebP · up to 10 MB</span></span></button>}{uploadError && <p className="mt-2 text-sm text-[#a84e44]" role="alert" data-testid="text-upload-error">{uploadError}</p>}</div>
        </div>
        {formError && <p className="mt-5 rounded-xl bg-[#fbefea] px-4 py-3 text-sm text-[#a84e44]" role="alert" data-testid="text-create-error">{formError}</p>}
        <div className="mt-7 flex flex-col-reverse gap-3 border-t border-[#e8eae2] pt-5 sm:flex-row sm:justify-end"><Link href="/items" className="btn-quiet" data-testid="button-cancel-create">Cancel</Link><button className="btn-primary" type="submit" disabled={createItem.isPending || uploading} data-testid="button-submit-item">{createItem.isPending ? 'Registering…' : <><Plus size={16} /> Register item</>}</button></div>
      </form>
      <aside className="surface h-fit bg-[#eef1e8] p-5"><span className="grid h-10 w-10 place-items-center rounded-xl bg-[#fffdf7] text-[#55766a]"><ShieldCheck size={19} /></span><h3 className="mt-4 font-[var(--app-font-serif)] text-lg font-bold text-[#35574e]">Your details stay yours</h3><p className="mt-2 text-sm leading-6 text-[#6e7e75]">A finder sees your item name, description, category, and photo. Your profile and contact details are never shown on the public tag page.</p><div className="mt-5 flex gap-3 border-t border-[#dce3d8] pt-4 text-xs leading-5 text-[#73847a]"><QrCode size={17} className="mt-0.5 shrink-0 text-[#55766a]" /><span>After registration, print a QR code and attach it somewhere visible.</span></div></aside>
    </div>
  </AppShell>;
}

function ItemDetailPage() {
  const { id = '' } = useParams<{ id: string }>();
  const itemQuery = useGetItem(id, { query: { enabled: !!id, queryKey: getGetItemQueryKey(id) } });
  const messagesQuery = useListItemMessages(id, { query: { enabled: !!id, queryKey: getListItemMessagesQueryKey(id) } });
  const updateItem = useUpdateItem();
  const updateLocation = useUpdateItemLocation();
  const client = useQueryClient();
  const [locationLabel, setLocationLabel] = useState('');
  const [showLocation, setShowLocation] = useState(false);
  const [messageFilter, setMessageFilter] = useState('');
  const item = itemQuery.data;
  const publicUrl = item ? `${window.location.origin}${basePath}/find/${item.publicId}` : '';
  const invalidateItem = async () => Promise.all([
    client.invalidateQueries({ queryKey: getGetItemQueryKey(id) }),
    client.invalidateQueries({ queryKey: getListItemsQueryKey() }),
    client.invalidateQueries({ queryKey: getGetDashboardQueryKey() }),
  ]);
  const saveLocation = (event: FormEvent) => {
    event.preventDefault();
    if (!item || !locationLabel.trim()) return;
    const data: LocationInput = { locationLabel: locationLabel.trim(), latitude: null, longitude: null };
    updateLocation.mutate({ id, data }, { onSuccess: () => { setLocationLabel(''); setShowLocation(false); void invalidateItem(); } });
  };
  const updateStatus = (status: ItemStatus) => updateItem.mutate({ id, data: { status, lostMode: status === 'lost' } }, { onSuccess: () => void invalidateItem() });
  const downloadQr = () => {
    const svg = document.querySelector('.qr-print svg') as SVGSVGElement | null;
    if (!svg) return;
    const clone = svg.cloneNode(true) as SVGSVGElement;
    clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    const blob = new Blob([new XMLSerializer().serializeToString(clone)], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url; anchor.download = `${item?.name || 'campus-tag'}-qr.svg`; anchor.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  if (itemQuery.isLoading) return <AppShell title="Item details"><LoadingBlock label="Loading your item…" /></AppShell>;
  if (itemQuery.isError || !item) return <AppShell title="Item details"><QueryError onRetry={() => void itemQuery.refetch()} /></AppShell>;
  const messages = messagesQuery.data ?? [];
  const latitude = item.latitude;
  const longitude = item.longitude;
  const hasCoordinates =
    typeof latitude === 'number' &&
    Number.isFinite(latitude) &&
    latitude >= -90 &&
    latitude <= 90 &&
    typeof longitude === 'number' &&
    Number.isFinite(longitude) &&
    longitude >= -180 &&
    longitude <= 180;
  const mapPadding = 0.004;
  const locationMapUrl = hasCoordinates
    ? `https://www.openstreetmap.org/export/embed.html?bbox=${longitude - mapPadding},${latitude - mapPadding},${longitude + mapPadding},${latitude + mapPadding}&layer=mapnik&marker=${latitude},${longitude}`
    : null;
  const locationSearchUrl = item.locationLabel
    ? `https://www.openstreetmap.org/search?query=${encodeURIComponent(item.locationLabel)}`
    : null;
  return <AppShell title={item.name} subtitle={`${item.category} · Added ${fmtDate(item.createdAt)}`}>
    <Link href="/items" className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-[#56766b]" data-testid="link-back-items"><ArrowLeft size={16} /> All items</Link>
    <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
      <div className="space-y-5">
        <section className="surface overflow-hidden">
          <div className="grid md:grid-cols-[.8fr_1.2fr]"><div className="relative min-h-[235px] overflow-hidden bg-[#e8eee5] md:min-h-[320px]"><ItemPhoto path={item.photoPath} name={item.name} /><span className="absolute left-4 top-4"><StatusPill status={item.status} /></span></div>
            <div className="p-5 sm:p-7"><div className="flex flex-wrap items-start justify-between gap-4"><div><p className="eyebrow">{item.category} / Your item</p><h2 className="display-font mt-2 text-3xl text-[#294f47] sm:text-4xl" data-testid="text-item-name">{item.name}</h2></div><span className="grid h-10 w-10 place-items-center rounded-xl bg-[#edf1e8] text-[#55756a]"><Package size={20} /></span></div><p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-[#66776f]" data-testid="text-item-description">{item.description || 'No description added yet.'}</p>
              <div className="mt-6 grid gap-3 border-t border-[#e8ebe2] pt-5 sm:grid-cols-2"><div><span className="eyebrow">Last reported at</span><p className="mt-1.5 flex items-center gap-2 text-sm font-semibold text-[#46645a]" data-testid="text-last-location"><MapPin size={15} />{item.locationLabel || 'No location reported'}</p>{item.locationReportedAt && <p className="mt-1 text-xs text-[#8a958e]">{fmtTime(item.locationReportedAt)}{item.locationSource ? ` · ${item.locationSource === 'finder' ? 'Finder' : 'You'}` : ''}</p>}</div><div><span className="eyebrow">Tag status</span><p className="mt-1.5"><StatusPill status={item.status} /></p></div></div>
              <section className="mt-6 border-t border-[#e8ebe2] pt-5" aria-label="Last reported location map">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <span className="eyebrow">Last reported location</span>
                    <p className="mt-1 text-sm font-semibold text-[#46645a]">{item.locationLabel || 'No location shared yet'}</p>
                  </div>
                  {locationMapUrl && <a className="text-xs font-semibold text-[#1E88E5] underline-offset-4 hover:underline" href={`https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=17/${latitude}/${longitude}`} target="_blank" rel="noopener noreferrer">Open larger map</a>}
                </div>
                {locationMapUrl ? (
                  <iframe
                    className="mt-3 h-52 w-full rounded-xl border border-slate-200 bg-slate-100 sm:h-64"
                    src={locationMapUrl}
                    title={`Map showing the last reported location for ${item.name}`}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                ) : (
                  <div className="mt-3 flex min-h-32 items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-blue-100 text-[#1E88E5]"><MapPin size={18} /></span>
                    <div>
                      <p className="text-sm font-semibold text-slate-700">Map pin not shared</p>
                      <p className="mt-1 text-xs leading-5 text-slate-500">A map appears when a finder shares a one-time location. A manually entered place is shown above.</p>
                      {locationSearchUrl && <a className="mt-2 inline-flex text-xs font-semibold text-[#1E88E5] underline-offset-4 hover:underline" href={locationSearchUrl} target="_blank" rel="noopener noreferrer">Search this place on OpenStreetMap</a>}
                    </div>
                  </div>
                )}
              </section>
              <div className="mt-6 flex flex-wrap gap-2 border-t border-[#e8ebe2] pt-5"><button className="btn-quiet" onClick={() => updateStatus(item.status === 'lost' ? 'active' : 'lost')} disabled={updateItem.isPending || item.status === 'recovered'} data-testid="button-toggle-lost-mode">{item.status === 'lost' ? <Check size={16} /> : <MapPin size={16} />}{item.status === 'lost' ? 'Turn off lost mode' : 'Mark as lost'}</button><button className="btn-quiet" onClick={() => updateStatus(item.status === 'recovered' ? 'active' : 'recovered')} disabled={updateItem.isPending} data-testid="button-mark-recovered">{item.status === 'recovered' ? <ArrowDownLeft size={16} /> : <CheckCircle2 size={16} />}{item.status === 'recovered' ? 'Reopen item' : 'Mark recovered'}</button></div>
            </div>
          </div>
        </section>
        <section className="surface overflow-hidden"><div className="flex items-center justify-between border-b border-[#e8ebe2] px-5 py-4 sm:px-6"><div><p className="eyebrow">Private conversations</p><h3 className="mt-1 font-[var(--app-font-serif)] text-xl font-bold text-[#31564d]">Finder messages</h3></div><span className="grid h-9 w-9 place-items-center rounded-xl bg-[#edf1e8] text-[#55766a]"><MessageCircle size={17} /></span></div>
          {messagesQuery.isLoading ? <div className="p-5"><LoadingBlock label="Loading finder messages…" /></div> : messagesQuery.isError ? <div className="p-5"><QueryError onRetry={() => void messagesQuery.refetch()} /></div> : messages.length ? <div className="divide-y divide-[#e8ebe2]">{messages.map(message => <article key={message.id} className="px-5 py-4 sm:px-6" data-testid={`message-${message.id}`}><div className="flex flex-wrap items-center justify-between gap-2"><span className="inline-flex items-center gap-2 text-sm font-semibold text-[#45665b]"><span className={`grid h-7 w-7 place-items-center rounded-full ${message.senderType === 'finder' ? 'bg-[#f0e8d7] text-[#9b713d]' : 'bg-[#e3eee5] text-[#4d7965]'}`}>{message.senderType === 'finder' ? <ArrowDownLeft size={14} /> : <ArrowUpRight size={14} />}</span>{message.senderName || (message.senderType === 'finder' ? 'A campus finder' : 'You')}</span><time className="text-xs text-[#87928b]">{fmtTime(message.createdAt)}</time></div><p className="ml-9 mt-2 whitespace-pre-wrap text-sm leading-6 text-[#66776f]">{message.body}</p></article>)}</div> : <EmptyState icon={MessageCircle} title="No messages yet" description="If someone finds this item, they can send a private note through its QR page." />}
        </section>
      </div>
      <aside className="space-y-5">
        <section className="surface print-area qr-print flex flex-col items-center p-5 text-center sm:p-6"><span className="eyebrow">Your scannable tag</span><h3 className="mt-2 font-[var(--app-font-serif)] text-xl font-bold text-[#31564d]">Print it. Stick it. Done.</h3><p className="mt-1 max-w-[250px] text-sm leading-6 text-[#7b8981]">This QR opens a private finder page for {item.name}.</p><div className="mt-5 rounded-2xl border border-[#e4e9df] bg-white p-4"><QRCodeSVG value={publicUrl} size={184} fgColor="#1E88E5" bgColor="#ffffff" level="H" includeMargin /></div><div className="mt-3 max-w-full truncate font-mono text-[10px] text-[#8a958e]">{publicUrl}</div><div className="no-print mt-5 flex w-full gap-2"><button className="btn-primary flex-1" onClick={() => window.print()} data-testid="button-print-qr"><Printer size={16} /> Print</button><button className="btn-quiet flex-1" onClick={downloadQr} data-testid="button-download-qr"><ArrowDownLeft size={16} /> Download</button></div><Link className="no-print mt-4 inline-flex items-center gap-1 text-xs font-semibold text-[#477467]" href={`/find/${item.publicId}`} data-testid="link-preview-public-tag">Preview finder page <ExternalLink size={12} /></Link></section>
        <section className="surface p-5"><div className="flex items-start gap-3"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#edf1e8] text-[#55766a]"><MapPin size={17} /></span><div><h3 className="font-semibold text-[#3e5d53]">Update last location</h3><p className="mt-1 text-xs leading-5 text-[#819087]">Add a place you last remember seeing it. This isn’t live tracking.</p></div></div>{showLocation ? <form onSubmit={saveLocation} className="mt-4 space-y-2"><input className="field" maxLength={240} value={locationLabel} onChange={e => setLocationLabel(e.target.value)} placeholder="e.g. Science library, first floor" data-testid="input-location-label" /><div className="flex gap-2"><button className="btn-primary flex-1" disabled={updateLocation.isPending || !locationLabel.trim()} data-testid="button-save-location">{updateLocation.isPending ? 'Saving…' : 'Save location'}</button><button className="btn-quiet" type="button" onClick={() => setShowLocation(false)} data-testid="button-cancel-location">Cancel</button></div></form> : <button className="btn-quiet mt-4 w-full" onClick={() => setShowLocation(true)} data-testid="button-edit-location">Add a location</button>}</section>
      </aside>
    </div>
  </AppShell>;
}

function FinderPage() {
  const { publicId = '' } = useParams<{ publicId: string }>();
  const client = useQueryClient();
  const itemQuery = useGetPublicItem(publicId, { query: { enabled: !!publicId, queryKey: getGetPublicItemQueryKey(publicId) } });
  const report = useSubmitFinderReport();
  const [finderName, setFinderName] = useState('');
  const [message, setMessage] = useState('');
  const [shareLocation, setShareLocation] = useState(false);
  const [locationStatus, setLocationStatus] = useState('');
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const item = itemQuery.data;
  const requestLocation = () => {
    if (!navigator.geolocation) { setLocationStatus('Location sharing is not available in this browser.'); return; }
    setLocationStatus('Waiting for permission…');
    navigator.geolocation.getCurrentPosition(position => {
      setCoords({ latitude: position.coords.latitude, longitude: position.coords.longitude });
      setShareLocation(true);
      setLocationStatus('One-time location attached. No tracking.');
    }, () => { setShareLocation(false); setLocationStatus('Location wasn’t shared. You can still send a message.'); }, { enableHighAccuracy: false, timeout: 12_000, maximumAge: 60_000 });
  };
  const submit = (event: FormEvent) => {
    event.preventDefault();
    setError('');
    if (!message.trim()) { setError('Write a quick note so the owner knows what happened.'); return; }
    report.mutate({ publicId, data: { message: message.trim(), finderName: finderName.trim() || null, shareLocation, ...(coords && shareLocation ? coords : {}) } }, {
      onSuccess: () => {
        setSuccess(true);
        void client.invalidateQueries({ queryKey: getGetDashboardQueryKey() });
        void client.invalidateQueries({ queryKey: getListNotificationsQueryKey() });
        void client.invalidateQueries({ queryKey: getListItemsQueryKey() });
        void client.invalidateQueries({ predicate: query => typeof query.queryKey[0] === 'string' && query.queryKey[0].endsWith('/messages') });
      },
      onError: () => setError('Your note didn’t go through. Please try again.'),
    });
  };
  if (itemQuery.isLoading) return <main className="page-wrap min-h-[100dvh] max-w-xl py-8"><Brand /><div className="mt-10"><LoadingBlock label="Opening the tag…" /></div></main>;
  if (itemQuery.isError || !item) return <main className="page-wrap min-h-[100dvh] max-w-xl py-8"><Brand /><div className="mt-10"><QueryError onRetry={() => void itemQuery.refetch()} /></div></main>;
  return <main className="min-h-[100dvh] px-4 py-5 sm:px-6 sm:py-8">
    <div className="mx-auto max-w-[620px]"><header className="flex items-center justify-between"><Brand /><span className="inline-flex items-center gap-1.5 rounded-full border border-[#d9e2d9] bg-[#fbfaf4] px-3 py-1.5 text-xs font-semibold text-[#55766a]"><ShieldCheck size={14} /> Private connection</span></header>
      {item.status === 'recovered' ? <section className="surface mt-8 overflow-hidden"><div className="bg-[#e5eee2] px-6 py-7 text-center"><span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-[#fffdf7] text-[#4e8461]"><CheckCircle2 size={27} /></span><p className="eyebrow mt-4 !text-[#5e7865]">Already home</p><h1 className="display-font mt-2 text-3xl text-[#31584a]">This item has been recovered.</h1><p className="mt-2 text-sm text-[#6f8273]">Thank you for taking a moment to check.</p></div><div className="p-6"><div className="flex gap-4"><div className="h-20 w-20 shrink-0 overflow-hidden rounded-2xl"><ItemPhoto path={item.photoPath} name={item.name} /></div><div><p className="eyebrow">{item.category}</p><h2 className="mt-1 font-[var(--app-font-serif)] text-xl font-bold text-[#31564d]">{item.name}</h2><p className="mt-1 line-clamp-3 text-sm leading-6 text-[#74837b]">{item.description || 'A student’s campus essential.'}</p></div></div><div className="mt-6 flex items-center gap-3 rounded-xl bg-[#f4f5ee] p-4 text-sm leading-6 text-[#6b7b72]"><CheckCircle2 size={18} className="shrink-0 text-[#4e8461]" />The owner has marked this item as found, so there’s nothing else you need to do.</div></div></section> :
      <><section className="surface mt-8 overflow-hidden"><div className="relative h-52 bg-[#e8eee5] sm:h-64"><ItemPhoto path={item.photoPath} name={item.name} /><span className="absolute left-4 top-4 rounded-full border border-white/70 bg-[#fbfaf4]/90 px-3 py-1 text-xs font-semibold text-[#557168]">{item.category}</span></div><div className="p-5 sm:p-7"><p className="eyebrow">Found on campus?</p><h1 className="display-font mt-2 text-3xl text-[#294f47] sm:text-4xl">{item.name}</h1><p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-[#677a71]">{item.description || 'This belongs to someone in your campus community.'}</p></div></section>
         {success ? <section className="surface mt-5 p-6 text-center sm:p-8" data-testid="report-success"><span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-[#e4eee3] text-[#4b7a5d]"><CheckCircle2 size={27} /></span><p className="eyebrow mt-4">Note delivered</p><h2 className="display-font mt-2 text-3xl text-[#31584a]">You’ve made someone’s day.</h2><p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[#75837b]">The owner will see your message in Campus Tag. Their contact details stay private, and you can safely close this page.</p></section> :
        <form onSubmit={submit} className="surface mt-5 p-5 sm:p-7" data-testid="form-finder-report"><div className="flex items-start gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#e7eee5] text-[#4f7768]"><MessageCircle size={18} /></span><div><h2 className="font-[var(--app-font-serif)] text-xl font-bold text-[#31564d]">Send a private note</h2><p className="mt-1 text-sm leading-6 text-[#7b8981]">The owner will receive your message here. Your details won’t be shared with them unless you choose to include them.</p></div></div>
          <div className="mt-5 space-y-4"><label className="block"><span className="mb-1.5 block text-sm font-semibold text-[#405e55]">Your message</span><textarea className="field min-h-28 resize-y" maxLength={2000} required value={message} onChange={e => setMessage(e.target.value)} placeholder="I found this near the west entrance…" data-testid="input-finder-message" /><span className="mt-1 block text-right text-xs text-[#8a958e]">{message.length}/2000</span></label><label className="block"><span className="mb-1.5 block text-sm font-semibold text-[#405e55]">Name <span className="font-normal text-[#86918a]">(optional)</span></span><input className="field" maxLength={120} value={finderName} onChange={e => setFinderName(e.target.value)} placeholder="What should the owner call you?" data-testid="input-finder-name" /></label></div>
          <div className="mt-4 rounded-xl border border-[#e3e8df] bg-[#f7f8f2] p-4"><div className="flex gap-3"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white text-[#58796b]"><MapPin size={17} /></span><div className="flex-1"><p className="text-sm font-semibold text-[#45655a]">Share where you found it</p><p className="mt-1 text-xs leading-5 text-[#839088]">Only with your permission. This is a one-time location, never live tracking.</p>{locationStatus && <p className="mt-2 text-xs font-semibold text-[#55766a]" role="status" data-testid="text-location-status">{locationStatus}</p>}</div></div><button type="button" onClick={() => { if (shareLocation) { setShareLocation(false); setCoords(null); setLocationStatus('Location removed from your note.'); } else requestLocation(); }} className="btn-quiet mt-3 w-full bg-white text-sm" data-testid="button-share-location">{shareLocation ? <><Check size={15} /> Remove shared location</> : <><MapPin size={15} /> Share location once</>}</button></div>
          <div className="mt-4 flex items-start gap-2 rounded-xl bg-[#edf2e9] p-3 text-xs leading-5 text-[#61756b]"><ShieldCheck size={15} className="mt-0.5 shrink-0" />Your message goes through Campus Tag. The owner’s email and phone are never shown.</div>
          {error && <p className="mt-4 rounded-xl bg-[#fbefea] px-4 py-3 text-sm text-[#a84e44]" role="alert" data-testid="text-finder-error">{error}</p>}
          <button className="btn-primary mt-5 w-full" disabled={report.isPending} data-testid="button-send-report">{report.isPending ? 'Sending your note…' : <>Send note privately <ArrowRight size={16} /></>}</button>
        </form>}
      </>}
      <footer className="flex items-center justify-center gap-2 py-6 text-xs text-[#859189]"><ShieldCheck size={14} /> Campus Tag keeps personal contact details private.</footer>
    </div>
  </main>;
}

function SignInPage() {
  return <main className="min-h-[100dvh] bg-[#f2f3eb] px-4 py-8"><div className="mx-auto flex max-w-[1040px] flex-col items-center gap-8 lg:flex-row lg:justify-between lg:gap-16"><section className="max-w-[410px] lg:py-10"><Brand /><p className="eyebrow mt-12">Welcome back to campus</p><h1 className="display-font mt-4 text-4xl leading-tight text-[#214f48] sm:text-5xl">Your tags are ready when life gets a little lost.</h1><p className="mt-5 leading-7 text-[#66776f]">Sign in to check finder notes, update lost mode, and keep the things you carry accounted for.</p><div className="mt-8 flex items-center gap-3 rounded-2xl border border-[#dce4da] bg-[#fbfaf4] p-4 text-sm text-[#5b7168]"><ShieldCheck size={19} className="shrink-0 text-[#477568]" />Your contact details are never printed on your tags.</div></section><SignIn routing="path" path={`${basePath}/sign-in`} signUpUrl={`${basePath}/sign-up`} /></div></main>;
}
function SignUpPage() {
  return <main className="min-h-[100dvh] bg-[#f2f3eb] px-4 py-8"><div className="mx-auto flex max-w-[1040px] flex-col items-center gap-8 lg:flex-row lg:justify-between lg:gap-16"><section className="max-w-[410px] lg:py-10"><Brand /><p className="eyebrow mt-12">A more thoughtful lost & found</p><h1 className="display-font mt-4 text-4xl leading-tight text-[#214f48] sm:text-5xl">Make it easier for good people to find you.</h1><p className="mt-5 leading-7 text-[#66776f]">Create a private home for your campus essentials. Start with one item, and add more whenever you like.</p><div className="mt-8 flex items-center gap-3 rounded-2xl border border-[#dce4da] bg-[#fbfaf4] p-4 text-sm text-[#5b7168]"><QrCode size={19} className="shrink-0 text-[#477568]" />One QR tag. A direct line back. No public contact info.</div></section><SignUp routing="path" path={`${basePath}/sign-up`} signInUrl={`${basePath}/sign-in`} /></div></main>;
}

function HomeRedirect() {
  return <><Show when="signed-in"><Redirect to="/dashboard" /></Show><Show when="signed-out"><Home /></Show></>;
}
function ClerkQueryClientCacheInvalidator() {
  const { addListener } = useClerk();
  const client = useQueryClient();
  const prevUserIdRef = useRef<string | null | undefined>(undefined);
  useEffect(() => {
    const unsubscribe = addListener(({ user }) => {
      const userId = user?.id ?? null;
      if (prevUserIdRef.current !== undefined && prevUserIdRef.current !== userId) client.clear();
      prevUserIdRef.current = userId;
    });
    return unsubscribe;
  }, [addListener, client]);
  return null;
}

function MissingPage() {
  return <main className="page-wrap flex min-h-[100dvh] max-w-2xl flex-col items-start justify-center"><Brand /><p className="eyebrow mt-12">404 / Wrong turn</p><h1 className="display-font mt-3 text-5xl text-[#214f48]">This page wandered off.</h1><p className="mt-4 max-w-lg leading-7 text-[#708078]">That link doesn’t lead anywhere we can find. Let’s get you back to campus.</p><Link href="/" className="btn-primary mt-6" data-testid="link-back-home"><ArrowLeft size={16} /> Back to Campus Tag</Link></main>;
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function ClerkProviderWithRoutes() {
  const [, setLocation] = useLocation();
  return <ClerkProvider publishableKey={clerkPubKey} proxyUrl={clerkProxyUrl} appearance={clerkAppearance} signInUrl={`${basePath}/sign-in`} signUpUrl={`${basePath}/sign-up`}
    localization={{ signIn: { start: { title: 'Welcome back', subtitle: 'Sign in to your Campus Tag account' } }, signUp: { start: { title: 'Make campus a little less lost', subtitle: 'Create your Campus Tag account' } } }}
    routerPush={(to) => setLocation(stripBase(to))}
    routerReplace={(to) => setLocation(stripBase(to), { replace: true })}>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ClerkQueryClientCacheInvalidator />
        <RoutedErrorBoundary>
          <Switch>
            <Route path="/" component={HomeRedirect} />
            <Route path="/sign-in/*?" component={SignInPage} />
            <Route path="/sign-up/*?" component={SignUpPage} />
            <Route path="/dashboard">{() => <OwnerGate><DashboardPage /></OwnerGate>}</Route>
            <Route path="/items/new">{() => <OwnerGate><ItemCreatePage /></OwnerGate>}</Route>
            <Route path="/items/:id">{() => <OwnerGate><ItemDetailPage /></OwnerGate>}</Route>
            <Route path="/items">{() => <OwnerGate><ItemsPage /></OwnerGate>}</Route>
            <Route path="/find/:publicId" component={FinderPage} />
            <Route component={MissingPage} />
          </Switch>
        </RoutedErrorBoundary>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  </ClerkProvider>;
}

function App() {
  return <WouterRouter base={basePath}><ClerkProviderWithRoutes /></WouterRouter>;
}

export default App;
