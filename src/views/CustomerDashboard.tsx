import React, { useState, useEffect } from 'react';
import { User, Tenant, Item, FinderReport, MessageThread, SubscriptionPlan, Subscription } from '../types';
import { db } from '../mock/storage';
import { generateQRCodeDataURL, downloadQRCodePNG, downloadQRCodeSVG } from '../services/qr';
import { ItemModal } from '../components/ItemModal';
import { PrintableLabels } from '../components/PrintableLabels';
import { LeafletMap } from '../components/LeafletMap';
import { CheckoutModal } from '../components/CheckoutModal';
import {
  LayoutDashboard,
  Tag,
  QrCode,
  AlertTriangle,
  Inbox,
  MessageSquare,
  CheckCircle,
  CreditCard,
  Building,
  UserCheck,
  HelpCircle,
  Plus,
  Download,
  Printer,
  ExternalLink,
  Edit2,
  Trash2,
  MapPin,
  Clock,
  Shield,
  Search,
  Filter,
  Check,
  ChevronRight,
  Send,
  Zap,
  Receipt
} from 'lucide-react';

interface CustomerDashboardProps {
  currentUser: User;
  onSimulateFinderScan: (publicId: string) => void;
  onShowToast?: (type: 'success' | 'error' | 'warning' | 'info', title: string, message?: string) => void;
}

type TabType = 
  | 'overview' 
  | 'items' 
  | 'qrcodes' 
  | 'reports' 
  | 'messages' 
  | 'lostmode' 
  | 'recovered' 
  | 'billing' 
  | 'orgsettings' 
  | 'profile' 
  | 'help';

export const CustomerDashboard: React.FC<CustomerDashboardProps> = ({
  currentUser,
  onSimulateFinderScan,
  onShowToast,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [reports, setReports] = useState<FinderReport[]>([]);
  const [threads, setThreads] = useState<MessageThread[]>([]);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  
  // Modals & UI states
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [selectedPlanForCheckout, setSelectedPlanForCheckout] = useState<SubscriptionPlan | null>(null);
  const [qrCodeUrls, setQrCodeUrls] = useState<Record<string, string>>({});
  
  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Selected Chat Thread
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const [replyMessage, setReplyMessage] = useState('');

  // Organization settings form
  const [orgName, setOrgName] = useState('');
  const [campusName, setCampusName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [orgSaveSuccess, setOrgSaveSuccess] = useState(false);

  // Profile form
  const [fullName, setFullName] = useState(currentUser.fullName);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);
  const [profileSuccess, setProfileSuccess] = useState(false);

  // Invoices history
  const [invoices, setInvoices] = useState<any[]>([
    {
      id: 'INV-2026-104921',
      planName: 'Campus Scholar Pro',
      amount: 9.99,
      billingCycle: 'Monthly',
      timestamp: '2026-10-01T00:00:00Z',
      paymentMethod: 'Card ending in 4242',
      webhookVerificationSignature: 'whsec_98f2a1b9',
      status: 'PAID'
    }
  ]);
  const [billingSuccessNotice, setBillingSuccessNotice] = useState('');

  const loadData = () => {
    const userTenantId = currentUser.tenantId || 'tenant_stanford_biomed';
    const currentTenant = db.getTenantById(userTenantId) || db.getTenants()[0];
    setTenant(currentTenant);

    if (currentTenant) {
      setOrgName(currentTenant.name);
      setCampusName(currentTenant.campusName);
      setContactEmail(currentTenant.contactEmail);
      setPhone(currentTenant.phone || '');
    }

    const tenantItems = db.getItems(userTenantId);
    setItems(tenantItems);

    const tenantReports = db.getReports(userTenantId);
    setReports(tenantReports);

    const tenantThreads = db.getThreads(userTenantId);
    setThreads(tenantThreads);
    if (tenantThreads.length > 0 && !selectedThreadId) {
      setSelectedThreadId(tenantThreads[0].id);
    }

    const sub = db.getSubscriptionForTenant(userTenantId);
    setSubscription(sub || null);

    setPlans(db.getPlans());
  };

  useEffect(() => {
    loadData();
  }, [currentUser]);

  // Pre-generate QR data URLs for quick display in QR center
  useEffect(() => {
    async function cacheQRs() {
      const map: Record<string, string> = {};
      const baseUrl = window.location.origin;

      for (const item of items) {
        const url = `${baseUrl}?mode=finder&public_id=${item.publicId}`;
        const dataUrl = await generateQRCodeDataURL(url, { width: 220, margin: 1 });
        map[item.id] = dataUrl;
      }
      setQrCodeUrls(map);
    }
    if (items.length > 0) {
      cacheQRs();
    }
  }, [items]);

  const handleSaveItem = (itemData: Partial<Item>) => {
    if (!tenant) return;
    
    // Check item limit on creation
    if (!editingItem && items.length >= (tenant.itemLimit || 25)) {
      if (onShowToast) {
        onShowToast('warning', 'Plan Limit Reached', `Your plan limit is ${tenant.itemLimit} items. Please upgrade to add more.`);
      } else {
        alert(`Plan limit reached (${tenant.itemLimit} items). Please upgrade your subscription to add more items.`);
      }
      setActiveTab('billing');
      return;
    }

    db.saveItem(itemData as Item);
    setEditingItem(null);
    loadData();
    if (onShowToast) {
      onShowToast('success', editingItem ? 'Item Updated' : 'Item Registered', `"${itemData.name}" is now protected with a QR tag.`);
    }
  };

  const handleDeleteItem = (id: string) => {
    if (confirm('Are you sure you want to unregister this item? Its public QR tag will no longer be linked.')) {
      db.deleteItem(id);
      loadData();
      if (onShowToast) {
        onShowToast('info', 'Item Removed', 'The item was deleted from your workspace inventory.');
      }
    }
  };

  const handleToggleLostMode = (item: Item) => {
    const nextLost = !item.isLost;
    const updated: Item = {
      ...item,
      isLost: nextLost,
      lostDate: nextLost ? new Date().toISOString() : undefined,
      isRecovered: nextLost ? false : item.isRecovered,
    };
    db.saveItem(updated);
    loadData();
    if (onShowToast) {
      if (nextLost) {
        onShowToast('warning', 'Lost Mode Broadcast Activated', `Emergency banner is now live on /f/${item.publicId}`);
      } else {
        onShowToast('info', 'Lost Mode Deactivated', `Normal protection restored for ${item.name}`);
      }
    }
  };

  const handleToggleRecovered = (item: Item) => {
    const nextRecovered = !item.isRecovered;
    const updated: Item = {
      ...item,
      isRecovered: nextRecovered,
      isLost: nextRecovered ? false : item.isLost,
      recoveredDate: nextRecovered ? new Date().toISOString() : undefined,
    };
    db.saveItem(updated);
    loadData();
    if (onShowToast) {
      onShowToast(nextRecovered ? 'success' : 'info', nextRecovered ? 'Item Marked Recovered! 🎉' : 'Item Restored to Active Inventory', item.name);
    }
  };

  const handleSendOwnerReply = (e: React.FormEvent, publicId: string) => {
    e.preventDefault();
    if (!replyMessage.trim()) return;

    db.sendMessage(publicId, replyMessage.trim(), 'owner');
    setReplyMessage('');
    loadData();
    if (onShowToast) {
      onShowToast('success', 'Relay Message Dispatched', 'Finder received your update anonymously.');
    }
  };

  const handleSaveOrgSettings = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenant) return;
    const updated: Tenant = {
      ...tenant,
      name: orgName.trim(),
      campusName: campusName.trim(),
      contactEmail: contactEmail.trim(),
      phone: phone.trim()
    };
    db.saveTenant(updated);
    setTenant(updated);
    setOrgSaveSuccess(true);
    if (onShowToast) {
      onShowToast('success', 'Workspace Settings Saved', 'Your university department profile was updated.');
    }
    setTimeout(() => setOrgSaveSuccess(false), 3000);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: User = {
      ...currentUser,
      fullName: fullName.trim()
    };
    db.saveUser(updated);
    db.setCurrentUser(updated);
    setProfileSuccess(true);
    if (onShowToast) {
      onShowToast('success', 'Profile Updated', 'Your user credentials were saved.');
    }
    setTimeout(() => setProfileSuccess(false), 3000);
  };

  const handleOpenCheckout = (plan: SubscriptionPlan) => {
    setSelectedPlanForCheckout(plan);
  };

  const handlePaymentSuccess = (planId: string, invoice: any) => {
    if (!tenant) return;
    db.updateTenantSubscription(tenant.id, planId);
    setInvoices(prev => [invoice, ...prev]);
    setSelectedPlanForCheckout(null);
    setBillingSuccessNotice(`Payment verified! Subscribed to ${invoice.planName} with limit of ${invoice.amount} USD.`);
    if (onShowToast) {
      onShowToast('success', 'Subscription Payment Verified', `Upgraded to ${invoice.planName}. Invoice #${invoice.id} recorded.`);
    }
    loadData();
  };

  // Filter items
  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.publicId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.serialNumber && item.serialNumber.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCat = categoryFilter === 'all' || item.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  const lostItems = items.filter(i => i.isLost);
  const recoveredItems = items.filter(i => i.isRecovered);
  const currentPlan = plans.find(p => p.id === (subscription?.planId || tenant?.planId)) || plans[1];
  const itemLimit = tenant?.itemLimit || currentPlan?.itemLimit || 25;
  const usagePercent = Math.min(100, Math.round((items.length / itemLimit) * 100));

  const activeThread = threads.find(t => t.id === selectedThreadId) || threads[0];
  const activeThreadItem = activeThread ? items.find(i => i.publicId === activeThread.publicId) : null;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 border-r border-slate-800">
        {/* Workspace Brand / Tenant Identifier */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-sm">
              CT
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-white uppercase tracking-wider truncate">
                {tenant?.name || 'Campus Workspace'}
              </div>
              <div className="text-[11px] text-blue-400 truncate">
                {tenant?.campusName || 'University Lab'}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Nav Links */}
        <nav className="flex-1 p-3 space-y-1 text-xs font-medium overflow-y-auto">
          <button
            onClick={() => setActiveTab('overview')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-colors cursor-pointer ${
              activeTab === 'overview' ? 'bg-blue-600 text-white font-semibold shadow-sm' : 'hover:bg-slate-800 text-slate-300'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Workspace Overview</span>
          </button>

          <button
            onClick={() => setActiveTab('items')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-colors cursor-pointer ${
              activeTab === 'items' ? 'bg-blue-600 text-white font-semibold shadow-sm' : 'hover:bg-slate-800 text-slate-300'
            }`}
          >
            <span className="flex items-center gap-3">
              <Tag className="w-4 h-4" />
              <span>My Protected Items</span>
            </span>
            <span className="text-[11px] bg-slate-800 px-2 py-0.5 rounded-full text-slate-400">
              {items.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('qrcodes')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-colors cursor-pointer ${
              activeTab === 'qrcodes' ? 'bg-blue-600 text-white font-semibold shadow-sm' : 'hover:bg-slate-800 text-slate-300'
            }`}
          >
            <QrCode className="w-4 h-4" />
            <span>QR Codes & Stickers</span>
          </button>

          <button
            onClick={() => setActiveTab('reports')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-colors cursor-pointer ${
              activeTab === 'reports' ? 'bg-blue-600 text-white font-semibold shadow-sm' : 'hover:bg-slate-800 text-slate-300'
            }`}
          >
            <span className="flex items-center gap-3">
              <Inbox className="w-4 h-4" />
              <span>Finder Reports</span>
            </span>
            {reports.filter(r => r.status === 'unread').length > 0 && (
              <span className="text-[11px] bg-amber-500 text-slate-950 font-bold px-2 py-0.5 rounded-full">
                {reports.filter(r => r.status === 'unread').length} new
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('messages')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-colors cursor-pointer ${
              activeTab === 'messages' ? 'bg-blue-600 text-white font-semibold shadow-sm' : 'hover:bg-slate-800 text-slate-300'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Anonymous Relay Chat</span>
          </button>

          <div className="pt-2 pb-1 border-t border-slate-800/80 my-1 text-[10px] uppercase font-bold text-slate-500 px-3 tracking-wider">
            Status Centers
          </div>

          <button
            onClick={() => setActiveTab('lostmode')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-colors cursor-pointer ${
              activeTab === 'lostmode' ? 'bg-amber-600 text-white font-semibold shadow-sm' : 'hover:bg-slate-800 text-slate-300'
            }`}
          >
            <span className="flex items-center gap-3">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>Lost Mode Emergency</span>
            </span>
            {lostItems.length > 0 && (
              <span className="text-[11px] bg-amber-400/20 text-amber-300 font-bold px-2 py-0.5 rounded-full">
                {lostItems.length} active
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('recovered')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-colors cursor-pointer ${
              activeTab === 'recovered' ? 'bg-blue-600 text-white font-semibold shadow-sm' : 'hover:bg-slate-800 text-slate-300'
            }`}
          >
            <span className="flex items-center gap-3">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>Recovered Items</span>
            </span>
            <span className="text-[11px] bg-slate-800 px-2 py-0.5 rounded-full text-slate-400">
              {recoveredItems.length}
            </span>
          </button>

          <div className="pt-2 pb-1 border-t border-slate-800/80 my-1 text-[10px] uppercase font-bold text-slate-500 px-3 tracking-wider">
            Management
          </div>

          <button
            onClick={() => setActiveTab('billing')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-colors cursor-pointer ${
              activeTab === 'billing' ? 'bg-blue-600 text-white font-semibold shadow-sm' : 'hover:bg-slate-800 text-slate-300'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>Subscription & Billing</span>
          </button>

          <button
            onClick={() => setActiveTab('orgsettings')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-colors cursor-pointer ${
              activeTab === 'orgsettings' ? 'bg-blue-600 text-white font-semibold shadow-sm' : 'hover:bg-slate-800 text-slate-300'
            }`}
          >
            <Building className="w-4 h-4" />
            <span>Campus Org Settings</span>
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-colors cursor-pointer ${
              activeTab === 'profile' ? 'bg-blue-600 text-white font-semibold shadow-sm' : 'hover:bg-slate-800 text-slate-300'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>Profile & Security</span>
          </button>

          <button
            onClick={() => setActiveTab('help')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-colors cursor-pointer ${
              activeTab === 'help' ? 'bg-blue-600 text-white font-semibold shadow-sm' : 'hover:bg-slate-800 text-slate-300'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span>Help & Campus Protocols</span>
          </button>
        </nav>

        {/* Capacity Indicator in Sidebar */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 text-xs">
          <div className="flex items-center justify-between text-[11px] mb-1.5">
            <span className="text-slate-400">Tag Capacity</span>
            <span className="font-semibold text-white">{items.length} / {itemLimit}</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                usagePercent >= 90 ? 'bg-amber-500' : 'bg-blue-500'
              }`}
              style={{ width: `${usagePercent}%` }}
            />
          </div>
          <button
            onClick={() => setActiveTab('billing')}
            className="mt-3 w-full py-1.5 bg-slate-800 hover:bg-slate-700 text-blue-400 hover:text-blue-300 rounded-lg text-[11px] font-semibold transition-colors flex items-center justify-center gap-1 cursor-pointer"
          >
            <Zap className="w-3 h-3 text-amber-400" />
            <span>Upgrade Limit</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Bar */}
        <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-bold text-slate-900 capitalize">
              {activeTab === 'overview' && 'Campus Dashboard Overview'}
              {activeTab === 'items' && 'Protected Campus Items'}
              {activeTab === 'qrcodes' && 'QR Sticker & Tag Generation'}
              {activeTab === 'reports' && 'Finder Reports & Locations'}
              {activeTab === 'messages' && 'Anonymous Communication Relay'}
              {activeTab === 'lostmode' && 'Emergency Lost Mode Broadcast'}
              {activeTab === 'recovered' && 'Recovered Items Archive'}
              {activeTab === 'billing' && 'Subscription & Quota Management'}
              {activeTab === 'orgsettings' && 'Campus Organization Settings'}
              {activeTab === 'profile' && 'Owner Profile & Security'}
              {activeTab === 'help' && 'Campus Recovery Protocols & FAQ'}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setEditingItem(null);
                setIsItemModalOpen(true);
              }}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Item</span>
            </button>

            <button
              onClick={() => setIsPrintModalOpen(true)}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-slate-500" />
              <span>Print Stickers</span>
            </button>
          </div>
        </header>

        {/* Dynamic Sub-View Rendering */}
        <div className="p-6 space-y-6">
          {billingSuccessNotice && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-medium flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{billingSuccessNotice}</span>
            </div>
          )}

          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Quick Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Items</span>
                    <Tag className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="mt-2 text-2xl font-black text-slate-900">{items.length}</div>
                  <div className="mt-1 text-[11px] text-slate-500">{items.length} / {itemLimit} tags registered</div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Lost Mode Active</span>
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                  </div>
                  <div className="mt-2 text-2xl font-black text-amber-600">{lostItems.length}</div>
                  <div className="mt-1 text-[11px] text-slate-500">
                    {lostItems.length > 0 ? 'Public urgent alert broadcasting' : 'All items safely accounted for'}
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Finder Reports</span>
                    <Inbox className="w-4 h-4 text-indigo-600" />
                  </div>
                  <div className="mt-2 text-2xl font-black text-slate-900">{reports.length}</div>
                  <div className="mt-1 text-[11px] text-slate-500">{reports.filter(r => r.status === 'unread').length} unread updates</div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Recovered</span>
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="mt-2 text-2xl font-black text-emerald-600">{recoveredItems.length}</div>
                  <div className="mt-1 text-[11px] text-slate-500">100% privacy preserved during recovery</div>
                </div>
              </div>

              {/* Urgent Lost Mode Spotlight if any */}
              {lostItems.length > 0 && (
                <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
                      <AlertTriangle className="w-5 h-5 text-amber-600" />
                      <span>{lostItems.length} Item(s) in Urgent Lost Mode</span>
                    </div>
                    <button
                      onClick={() => setActiveTab('lostmode')}
                      className="text-xs text-amber-800 font-semibold hover:underline"
                    >
                      Manage Lost Mode →
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {lostItems.map(item => (
                      <div key={item.id} className="bg-white p-4 rounded-xl border border-amber-200 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <img src={item.photoUrl} alt="" className="w-12 h-12 rounded-lg object-cover" />
                          <div>
                            <div className="text-xs font-bold text-slate-900">{item.name}</div>
                            <div className="text-[11px] text-slate-500">ID: {item.publicId}</div>
                          </div>
                        </div>
                        <button
                          onClick={() => onSimulateFinderScan(item.publicId)}
                          className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold cursor-pointer shrink-0"
                        >
                          Simulate Finder Scan
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Items & Last Known Location Split */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Items List */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                  <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                    <div>
                      <h2 className="text-sm font-bold text-slate-900">Protected Items</h2>
                      <p className="text-xs text-slate-500">Items currently equipped with Campus Tag QR labels</p>
                    </div>
                    <button
                      onClick={() => setActiveTab('items')}
                      className="text-xs text-blue-600 font-semibold hover:underline"
                    >
                      View All ({items.length})
                    </button>
                  </div>

                  <div className="divide-y divide-slate-100">
                    {items.slice(0, 4).map((item) => (
                      <div key={item.id} className="p-4 flex items-center justify-between gap-4 hover:bg-slate-50/80 transition-colors">
                        <div className="flex items-center gap-3 min-w-0">
                          <img src={item.photoUrl} alt="" className="w-11 h-11 rounded-xl object-cover shrink-0 border border-slate-200" />
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-slate-900 truncate">{item.name}</span>
                              {item.isLost && (
                                <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                                  LOST
                                </span>
                              )}
                              {item.isRecovered && (
                                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                  RECOVERED
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                              <span>{item.category}</span>
                              <span>·</span>
                              <span className="font-mono">{item.publicId}</span>
                              <span>·</span>
                              <span>{item.scanCount} scans</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => onSimulateFinderScan(item.publicId)}
                            title="Simulate Finder Scan"
                            className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setEditingItem(item);
                              setIsItemModalOpen(true);
                            }}
                            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Last Reported Location on Leaflet Map */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-blue-600" />
                        Last Reported Location
                      </h2>
                      <span className="text-[11px] text-slate-400">Point-in-time</span>
                    </div>
                    <p className="text-xs text-slate-500 mb-3">
                      Privacy-preserving snapshot provided when a finder scanned or submitted a report.
                    </p>

                    {items.find(i => i.lastLocation) ? (
                      <div>
                        {(() => {
                          const locatedItem = items.find(i => i.lastLocation)!;
                          const loc = locatedItem.lastLocation!;
                          return (
                            <>
                              <div className="h-44 rounded-xl overflow-hidden border border-slate-200 mb-3">
                                <LeafletMap
                                  height="176px"
                                  center={[loc.lat, loc.lng]}
                                  marker={{
                                    lat: loc.lat,
                                    lng: loc.lng,
                                    title: locatedItem.name,
                                    description: loc.address
                                  }}
                                />
                              </div>
                              <div className="text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-200 space-y-1">
                                <div className="font-semibold text-slate-800">{locatedItem.name}</div>
                                <div className="text-[11px] text-slate-500">{loc.address || `${loc.lat.toFixed(4)}, ${loc.lng.toFixed(4)}`}</div>
                                <div className="text-[10px] text-slate-400">
                                  Reported: {new Date(loc.timestamp).toLocaleDateString()} at {new Date(loc.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                              </div>
                            </>
                          );
                        })()}
                      </div>
                    ) : (
                      <div className="h-48 rounded-xl bg-slate-50 border border-slate-200 flex flex-col items-center justify-center p-4 text-center text-slate-400 text-xs">
                        <MapPin className="w-8 h-8 text-slate-300 mb-2" />
                        No location reports recorded yet. Once a finder drops a pin, it will appear here.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: MY ITEMS (FULL CRUD) */}
          {activeTab === 'items' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              {/* Filter & Search Bar */}
              <div className="p-5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4 bg-slate-50/50">
                <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[260px]">
                  <div className="relative flex-1 max-w-sm">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      placeholder="Search items, public IDs, or serial numbers..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-3.5 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-700 focus:outline-none"
                  >
                    <option value="all">All Categories</option>
                    <option value="Electronics & Laptops">Electronics & Laptops</option>
                    <option value="Lab & Research Equipment">Lab & Research Equipment</option>
                    <option value="Bicycles & Scooters">Bicycles & Scooters</option>
                    <option value="Keys & Access Badges">Keys & Access Badges</option>
                    <option value="Textbooks & Notebooks">Textbooks & Notebooks</option>
                    <option value="Bags & Backpacks">Bags & Backpacks</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsPrintModalOpen(true)}
                    className="px-3 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print All Tags</span>
                  </button>
                  <button
                    onClick={() => {
                      setEditingItem(null);
                      setIsItemModalOpen(true);
                    }}
                    className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add New Item</span>
                  </button>
                </div>
              </div>

              {/* Items Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200/90 bg-slate-50/90 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      <th className="py-3.5 px-5">Item & Public ID</th>
                      <th className="py-3.5 px-4">Category</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4">Scans & Location</th>
                      <th className="py-3.5 px-4">Reward Offered</th>
                      <th className="py-3.5 px-5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {filteredItems.map((item) => (
                      <tr key={item.id} className="hover:bg-blue-50/30 transition-colors">
                        <td className="py-4 px-5">
                          <div className="flex items-center gap-3.5">
                            <img src={item.photoUrl} alt="" className="w-11 h-11 rounded-xl object-cover border border-slate-200 shadow-2xs shrink-0" />
                            <div>
                              <div className="font-bold text-slate-900 text-xs hover:text-blue-600 transition-colors">{item.name}</div>
                              <div className="font-mono text-[11px] text-blue-600 font-semibold">{item.publicId}</div>
                              {item.serialNumber && (
                                <div className="text-[10px] text-slate-400 font-mono">S/N: {item.serialNumber}</div>
                              )}
                            </div>
                          </div>
                        </td>

                        <td className="py-4 px-4 text-slate-600 font-medium">
                          {item.category}
                        </td>

                        <td className="py-4 px-4">
                          <div className="flex flex-col gap-1 items-start">
                            {item.isLost ? (
                              <button
                                onClick={() => handleToggleLostMode(item)}
                                className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 hover:bg-amber-200 cursor-pointer flex items-center gap-1.5 interactive-btn shadow-2xs"
                              >
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse" />
                                <span>LOST ACTIVE</span>
                              </button>
                            ) : (
                              <button
                                onClick={() => handleToggleLostMode(item)}
                                className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600 hover:bg-amber-50 hover:text-amber-800 border border-slate-200/80 cursor-pointer flex items-center gap-1.5 interactive-btn"
                              >
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                <span>Protected</span>
                              </button>
                            )}

                            {item.isRecovered && (
                              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                                <Check className="w-3 h-3 text-emerald-600" />
                                <span>Recovered</span>
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="py-4 px-4 text-slate-600">
                          <div className="font-bold text-slate-800">{item.scanCount} scans</div>
                          {item.lastLocation ? (
                            <div className="text-[11px] text-blue-600 truncate max-w-[180px] flex items-center gap-1" title={item.lastLocation.address}>
                              <span>📍</span>
                              <span className="truncate">{item.lastLocation.address || 'GPS coordinates'}</span>
                            </div>
                          ) : (
                            <div className="text-[10px] text-slate-400">No scans logged</div>
                          )}
                        </td>

                        <td className="py-4 px-4">
                          {item.rewardOffered ? (
                            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 inline-flex items-center gap-1">
                              <span>🎁</span>
                              <span>{item.rewardOffered}</span>
                            </span>
                          ) : (
                            <span className="text-[11px] text-slate-400">—</span>
                          )}
                        </td>

                        <td className="py-4 px-5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => onSimulateFinderScan(item.publicId)}
                              title="Open Public Finder Page"
                              className="px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-xs font-semibold cursor-pointer interactive-btn transition-colors"
                            >
                              Scan Page
                            </button>
                            <button
                              onClick={() => {
                                setEditingItem(item);
                                setIsItemModalOpen(true);
                              }}
                              className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg cursor-pointer interactive-btn transition-colors"
                              title="Edit item"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleToggleRecovered(item)}
                              className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg cursor-pointer interactive-btn transition-colors"
                              title="Toggle Recovered status"
                            >
                              <CheckCircle className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteItem(item.id)}
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg cursor-pointer interactive-btn transition-colors"
                              title="Delete item"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {filteredItems.length === 0 && (
                  <div className="text-center py-14 text-slate-400 space-y-2">
                    <Tag className="w-8 h-8 text-slate-300 mx-auto" />
                    <div className="text-xs font-medium">No items found matching your filters.</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: QR CODES & STICKERS */}
          {activeTab === 'qrcodes' && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="text-base font-bold text-slate-900">QR Code Asset Center</h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Export standalone high-resolution SVG & PNG files for waterproof laser engraving or print ready-to-peel sheets.
                  </p>
                </div>
                <button
                  onClick={() => setIsPrintModalOpen(true)}
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer shadow-sm"
                >
                  <Printer className="w-4 h-4" />
                  <span>Open Printable Sticker Sheet</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {items.map((item) => {
                  const qrUrl = qrCodeUrls[item.id];
                  const fullScanUrl = `${window.location.origin}?mode=finder&public_id=${item.publicId}`;
                  return (
                    <div key={item.id} className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                          <div>
                            <div className="text-xs font-bold text-slate-900 truncate max-w-[180px]">{item.name}</div>
                            <div className="text-[10px] text-slate-500 font-mono">{item.publicId}</div>
                          </div>
                          <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                            {item.category}
                          </span>
                        </div>

                        <div className="py-4 flex flex-col items-center justify-center">
                          <div className="p-3 bg-white border-2 border-slate-900 rounded-xl shadow-xs">
                            {qrUrl ? (
                              <img src={qrUrl} alt={`QR for ${item.name}`} className="w-36 h-36" />
                            ) : (
                              <div className="w-36 h-36 bg-slate-100 animate-pulse rounded-lg" />
                            )}
                          </div>
                          <div className="mt-2 text-[10px] font-mono text-slate-400 break-all text-center max-w-xs">
                            /f/{item.publicId}
                          </div>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
                        <button
                          onClick={() => downloadQRCodePNG(fullScanUrl, `campustag-${item.publicId}`)}
                          className="flex-1 py-1.5 px-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 cursor-pointer transition-colors"
                        >
                          <Download className="w-3 h-3" />
                          <span>PNG</span>
                        </button>
                        <button
                          onClick={() => downloadQRCodeSVG(fullScanUrl, `campustag-${item.publicId}`)}
                          className="flex-1 py-1.5 px-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 cursor-pointer transition-colors"
                        >
                          <Download className="w-3 h-3" />
                          <span>Vector SVG</span>
                        </button>
                        <button
                          onClick={() => onSimulateFinderScan(item.publicId)}
                          title="Preview Finder Scan"
                          className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg cursor-pointer transition-colors"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 4: FINDER REPORTS */}
          {activeTab === 'reports' && (
            <div className="space-y-6">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-slate-900">Incoming Finder Reports</h2>
                  <p className="text-xs text-slate-500">Live notifications submitted anonymously by individuals who scanned your tags.</p>
                </div>
                <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg">
                  {reports.length} Total Reports
                </span>
              </div>

              <div className="space-y-4">
                {reports.map((report) => (
                  <div
                    key={report.id}
                    className={`bg-white rounded-2xl border p-5 shadow-xs transition-all ${
                      report.status === 'unread' ? 'border-blue-400 bg-blue-50/20' : 'border-slate-200'
                    }`}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-slate-900">{report.itemName}</span>
                          <span className="font-mono text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                            {report.publicId}
                          </span>
                          {report.status === 'unread' && (
                            <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                              NEW
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{new Date(report.timestamp).toLocaleString()}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {report.status !== 'resolved' ? (
                          <button
                            onClick={() => {
                              db.updateReportStatus(report.id, 'resolved');
                              loadData();
                            }}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Mark Resolved</span>
                          </button>
                        ) : (
                          <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                            <CheckCircle className="w-4 h-4" />
                            Resolved
                          </span>
                        )}
                        <button
                          onClick={() => {
                            setActiveTab('messages');
                            const targetThread = threads.find(t => t.publicId === report.publicId);
                            if (targetThread) setSelectedThreadId(targetThread.id);
                          }}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>Reply to Finder</span>
                        </button>
                      </div>
                    </div>

                    <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-800 mb-3 leading-relaxed">
                      "{report.message}"
                    </div>

                    {report.finderContactNote && (
                      <div className="text-xs text-slate-600 mb-3">
                        <span className="font-bold">Finder Note: </span>{report.finderContactNote}
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-slate-100">
                      {report.location ? (
                        <div>
                          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                            Reported GPS Location
                          </span>
                          <div className="h-36 rounded-lg overflow-hidden border border-slate-200">
                            <LeafletMap
                              height="144px"
                              center={[report.location.lat, report.location.lng]}
                              marker={{
                                lat: report.location.lat,
                                lng: report.location.lng,
                                title: report.itemName,
                                description: report.location.address
                              }}
                            />
                          </div>
                          <div className="text-[11px] text-slate-500 mt-1 truncate">
                            📍 {report.location.address}
                          </div>
                        </div>
                      ) : (
                        <div className="text-xs text-slate-400 flex items-center">
                          No GPS location attached with this report.
                        </div>
                      )}

                      {report.evidencePhotoUrl && (
                        <div>
                          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                            Evidence Photo Uploaded by Finder
                          </span>
                          <img
                            src={report.evidencePhotoUrl}
                            alt="Finder evidence"
                            className="h-36 w-full object-cover rounded-lg border border-slate-200"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {reports.length === 0 && (
                  <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center text-slate-400">
                    <Inbox className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                    No reports received yet.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 5: MESSAGES (ANONYMOUS RELAY CHAT) */}
          {activeTab === 'messages' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden h-[600px] flex flex-col md:flex-row">
              {/* Thread List */}
              <div className="w-full md:w-80 border-r border-slate-200 flex flex-col shrink-0">
                <div className="p-4 border-b border-slate-100 bg-slate-50">
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Anonymous Chat Threads ({threads.length})
                  </h3>
                </div>
                <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
                  {threads.map((t) => {
                    const item = items.find(i => i.publicId === t.publicId);
                    const isSelected = t.id === selectedThreadId;
                    const lastMsg = t.messages[t.messages.length - 1];

                    return (
                      <button
                        key={t.id}
                        onClick={() => setSelectedThreadId(t.id)}
                        className={`w-full text-left p-3.5 transition-colors cursor-pointer ${
                          isSelected ? 'bg-blue-50/80 border-l-4 border-blue-600' : 'hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-900 truncate">
                            {item?.name || t.publicId}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {new Date(t.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 truncate mt-1">
                          {lastMsg ? `${lastMsg.sender === 'owner' ? 'You: ' : 'Finder: '}${lastMsg.text}` : 'New thread'}
                        </div>
                      </button>
                    );
                  })}

                  {threads.length === 0 && (
                    <div className="p-8 text-center text-slate-400 text-xs">
                      No active conversations. When someone submits a report, a thread will open automatically.
                    </div>
                  )}
                </div>
              </div>

              {/* Chat Viewport */}
              <div className="flex-1 flex flex-col min-w-0 bg-slate-50/40">
                {activeThread ? (
                  <>
                    <div className="p-4 border-b border-slate-200 bg-white flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                          CT
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-900">
                            {activeThreadItem?.name || activeThread.publicId}
                          </div>
                          <div className="text-[10px] text-emerald-600 font-medium flex items-center gap-1">
                            <Shield className="w-3 h-3" />
                            <span>Privacy Relay Active (Zero personal contacts revealed)</span>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => onSimulateFinderScan(activeThread.publicId)}
                        className="text-xs text-blue-600 font-semibold hover:underline"
                      >
                        View Finder Page
                      </button>
                    </div>

                    <div className="flex-1 p-4 overflow-y-auto space-y-3">
                      {activeThread.messages.map((m) => (
                        <div
                          key={m.id}
                          className={`flex flex-col ${m.sender === 'owner' ? 'items-end' : 'items-start'}`}
                        >
                          <div className="text-[10px] text-slate-400 mb-0.5 px-1">
                            {m.sender === 'owner' ? 'You (Owner)' : 'Anonymous Finder'} · {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                          <div
                            className={`max-w-[75%] rounded-2xl px-4 py-2 text-xs leading-relaxed ${
                              m.sender === 'owner'
                                ? 'bg-blue-600 text-white rounded-br-xs shadow-xs'
                                : 'bg-white text-slate-800 rounded-bl-xs border border-slate-200 shadow-xs'
                            }`}
                          >
                            {m.text}
                          </div>
                        </div>
                      ))}
                    </div>

                    <form onSubmit={(e) => handleSendOwnerReply(e, activeThread.publicId)} className="p-3 bg-white border-t border-slate-200 flex gap-2">
                      <input
                        type="text"
                        value={replyMessage}
                        onChange={(e) => setReplyMessage(e.target.value)}
                        placeholder="Reply safely to finder (e.g. 'Thank you! On my way to the desk')..."
                        className="flex-1 px-3.5 py-2 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        type="submit"
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Send</span>
                      </button>
                    </form>
                  </>
                ) : (
                  <div className="h-full flex items-center justify-center text-slate-400 text-xs">
                    Select a thread to view chat
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 6: LOST MODE EMERGENCY */}
          {activeTab === 'lostmode' && (
            <div className="space-y-6">
              <div className="bg-amber-500/10 border-2 border-amber-500/30 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-2">
                  <AlertTriangle className="w-6 h-6 text-amber-600" />
                  <h2 className="text-base font-bold text-amber-950">Emergency Lost Mode Control</h2>
                </div>
                <p className="text-xs text-amber-900/90 leading-relaxed max-w-2xl">
                  Lost Mode immediately replaces the regular protected item page with a high-visibility, urgent warning banner, your direct instructions, and optional reward offer. When scanned, the finder is instructed exactly what steps to take.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className={`bg-white rounded-2xl border p-5 shadow-xs transition-all ${
                      item.isLost ? 'border-amber-400 bg-amber-50/20' : 'border-slate-200'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        <img src={item.photoUrl} alt="" className="w-12 h-12 rounded-xl object-cover border border-slate-200" />
                        <div>
                          <div className="text-xs font-bold text-slate-900">{item.name}</div>
                          <div className="text-[11px] text-slate-500 font-mono">{item.publicId}</div>
                        </div>
                      </div>

                      <button
                        onClick={() => handleToggleLostMode(item)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                          item.isLost
                            ? 'bg-amber-600 hover:bg-amber-700 text-white shadow-sm'
                            : 'bg-slate-100 hover:bg-amber-50 text-slate-700 hover:text-amber-800'
                        }`}
                      >
                        {item.isLost ? 'DEACTIVATE LOST' : 'ENABLE LOST MODE'}
                      </button>
                    </div>

                    {item.isLost && (
                      <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 text-xs text-amber-900 space-y-1 mt-2">
                        <div className="font-semibold">Urgent Finder Message:</div>
                        <div>{item.lostNote || 'Owner is searching. Please return to nearest campus desk.'}</div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 7: RECOVERED ITEMS */}
          {activeTab === 'recovered' && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-slate-900">Recovered Items Archive</h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Items that were safely found and returned through Campus Tag.
                  </p>
                </div>
                <div className="flex items-center gap-1.5 text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg text-xs font-bold border border-emerald-200">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span>{recoveredItems.length} Successfully Recovered</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {recoveredItems.map((item) => (
                  <div key={item.id} className="bg-white rounded-2xl border border-emerald-200 p-5 shadow-xs">
                    <div className="flex items-center gap-3 mb-3">
                      <img src={item.photoUrl} alt="" className="w-12 h-12 rounded-xl object-cover border border-slate-200" />
                      <div>
                        <div className="text-xs font-bold text-slate-900">{item.name}</div>
                        <div className="text-[11px] text-slate-500 font-mono">{item.publicId}</div>
                      </div>
                    </div>
                    <div className="text-[11px] text-slate-600 mb-3">
                      Status: <span className="font-bold text-emerald-700">Safely returned to owner</span>
                    </div>
                    <button
                      onClick={() => handleToggleRecovered(item)}
                      className="w-full py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                    >
                      Move Back to Active Inventory
                    </button>
                  </div>
                ))}

                {recoveredItems.length === 0 && (
                  <div className="col-span-full text-center py-12 text-slate-400 text-xs">
                    No items marked recovered yet.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 8: SUBSCRIPTION & BILLING */}
          {activeTab === 'billing' && (
            <div className="space-y-6">
              {/* Current Tier Summary */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 flex flex-wrap items-center justify-between gap-6">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Current Subscription Plan</span>
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      ACTIVE
                    </span>
                  </div>
                  <h2 className="text-2xl font-black text-slate-900 mt-1">{currentPlan.name}</h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Billed {currentPlan.billingCycle} · Next renewal in 24 days
                  </p>
                </div>

                <div className="text-right">
                  <div className="text-2xl font-black text-slate-900">${currentPlan.price} <span className="text-xs font-normal text-slate-500">/{currentPlan.billingCycle}</span></div>
                  <button
                    onClick={() => handleOpenCheckout(plans.find(p => p.id !== currentPlan.id) || plans[0])}
                    className="mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors shadow-sm cursor-pointer"
                  >
                    Change or Upgrade Plan
                  </button>
                </div>
              </div>

              {/* Usage & Limits Card */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
                <h3 className="text-sm font-bold text-slate-900">Quota Allocation</h3>
                <div>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-medium text-slate-700">QR Tag Registrations</span>
                    <span className="font-bold text-slate-900">{items.length} / {itemLimit} Used ({usagePercent}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${usagePercent >= 90 ? 'bg-amber-500' : 'bg-blue-600'}`}
                      style={{ width: `${usagePercent}%` }}
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between">
                  <span>Need more tags for your lab, club, or department?</span>
                  <button
                    onClick={() => handleOpenCheckout(plans[2] || plans[0])}
                    className="text-blue-600 font-semibold hover:underline cursor-pointer"
                  >
                    View Fleet Pricing →
                  </button>
                </div>
              </div>

              {/* Plan Comparison Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {plans.map((p) => {
                  const isCurrent = p.id === currentPlan.id;
                  return (
                    <div
                      key={p.id}
                      className={`bg-white rounded-2xl border p-6 flex flex-col justify-between transition-all ${
                        isCurrent ? 'border-2 border-blue-600 shadow-md ring-4 ring-blue-500/10' : 'border-slate-200 shadow-xs'
                      }`}
                    >
                      <div>
                        {p.badge && (
                          <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 uppercase tracking-wider inline-block mb-2">
                            {p.badge}
                          </span>
                        )}
                        <h4 className="text-base font-bold text-slate-900">{p.name}</h4>
                        <div className="mt-3 text-2xl font-black text-slate-900">
                          ${p.price} <span className="text-xs font-normal text-slate-500">/{p.billingCycle}</span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">Up to {p.itemLimit} campus items</p>

                        <ul className="mt-5 space-y-2 text-xs text-slate-600">
                          {p.features.map((feat, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <Check className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                              <span>{feat}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="mt-6 pt-4 border-t border-slate-100">
                        {isCurrent ? (
                          <div className="w-full py-2 bg-slate-100 text-slate-500 rounded-xl text-xs font-semibold text-center">
                            Current Active Plan
                          </div>
                        ) : (
                          <button
                            onClick={() => handleOpenCheckout(p)}
                            className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer shadow-sm"
                          >
                            Subscribe to {p.name}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Realistic Invoice History Table */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Receipt className="w-4 h-4 text-blue-600" />
                    <h4 className="text-sm font-bold text-slate-900">Payment & Invoice History</h4>
                  </div>
                  <span className="text-xs text-slate-400">Webhook verified receipts</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                        <th className="py-3 px-4">Invoice ID</th>
                        <th className="py-3 px-4">Plan & Cycle</th>
                        <th className="py-3 px-4">Amount</th>
                        <th className="py-3 px-4">Date</th>
                        <th className="py-3 px-4">Payment Method</th>
                        <th className="py-3 px-4">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {invoices.map((inv) => (
                        <tr key={inv.id} className="hover:bg-slate-50/50">
                          <td className="py-3 px-4 font-mono font-bold text-blue-600">{inv.id}</td>
                          <td className="py-3 px-4 font-semibold text-slate-800">{inv.planName}</td>
                          <td className="py-3 px-4 font-bold text-slate-900">${inv.amount} USD</td>
                          <td className="py-3 px-4 text-slate-500">{new Date(inv.timestamp).toLocaleDateString()}</td>
                          <td className="py-3 px-4 text-slate-600">{inv.paymentMethod}</td>
                          <td className="py-3 px-4">
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                              <CheckCircle className="w-3 h-3 text-emerald-600" />
                              VERIFIED
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 9: CAMPUS ORG SETTINGS */}
          {activeTab === 'orgsettings' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 max-w-2xl">
              <div className="flex items-center gap-3 pb-4 border-b border-slate-100 mb-6">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                  <Building className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">Campus Workspace Settings</h2>
                  <p className="text-xs text-slate-500">Manage your lab, department, or student club profile.</p>
                </div>
              </div>

              {orgSaveSuccess && (
                <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-medium flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span>Workspace settings successfully updated.</span>
                </div>
              )}

              <form onSubmit={handleSaveOrgSettings} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Organization / Lab Name
                  </label>
                  <input
                    type="text"
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    University / Campus
                  </label>
                  <input
                    type="text"
                    value={campusName}
                    onChange={(e) => setCampusName(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Department Contact Email
                  </label>
                  <input
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Lab Office Phone
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="pt-4 border-t border-slate-100 flex justify-end">
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-sm"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 10: PROFILE & SECURITY */}
          {activeTab === 'profile' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 max-w-2xl">
              <div className="flex items-center gap-3 pb-4 border-b border-slate-100 mb-6">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">User Profile & Credentials</h2>
                  <p className="text-xs text-slate-500">Security preferences, two-factor authentication, and JWT sessions.</p>
                </div>
              </div>

              {profileSuccess && (
                <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-medium flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span>Profile updated successfully.</span>
                </div>
              )}

              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Account Email
                  </label>
                  <input
                    type="email"
                    value={currentUser.email}
                    disabled
                    className="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-300 rounded-xl text-xs text-slate-500 cursor-not-allowed"
                  />
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                    <div>
                      <span className="text-xs font-bold text-slate-800 block">Two-Factor Authentication (2FA)</span>
                      <span className="text-[11px] text-slate-500">Protect your campus inventory with TOTP authenticator app</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={twoFactorEnabled}
                        onChange={(e) => setTwoFactorEnabled(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex justify-end">
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-sm"
                  >
                    Update Profile
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 11: HELP & PROTOCOLS */}
          {activeTab === 'help' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6 max-w-3xl">
              <div>
                <h2 className="text-base font-bold text-slate-900">Campus Recovery Protocols & FAQ</h2>
                <p className="text-xs text-slate-500 mt-1">Official guidelines for handling lost items safely on university premises.</p>
              </div>

              <div className="space-y-4 text-xs text-slate-700">
                <div className="p-4 bg-blue-50/60 rounded-xl border border-blue-200 space-y-1.5">
                  <div className="font-bold text-blue-900">How does finder privacy work?</div>
                  <p className="leading-relaxed text-blue-800/90">
                    When someone scans your Campus Tag QR code, they are directed to an anonymous portal (`/f/cpt-...`). They never see your email, phone number, student ID, or personal home address. All communications flow through our secure anonymous relay.
                  </p>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                  <div className="font-bold text-slate-900">What if my subscription expires?</div>
                  <p className="leading-relaxed text-slate-600">
                    Your public QR finder pages <strong>remain active forever</strong>. Even if a subscription lapses, anyone who finds your lost gear can still scan the tag, view the safe item description, and submit a recovery report.
                  </p>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                  <div className="font-bold text-slate-900">Recommended sticker placement tips:</div>
                  <ul className="list-disc pl-5 space-y-1 text-slate-600 text-[11px]">
                    <li><strong>Laptops:</strong> Bottom chassis or interior bezel next to keyboard.</li>
                    <li><strong>Bicycles:</strong> Under the top tube or seat tube near the bottom bracket.</li>
                    <li><strong>Lab Gear:</strong> Smooth flat face away from cooling vents.</li>
                    <li><strong>Keychains:</strong> Affix mini 1" x 1" tag to acrylic or silicone fob.</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Item Modal (Create/Edit) */}
      <ItemModal
        isOpen={isItemModalOpen}
        onClose={() => {
          setIsItemModalOpen(false);
          setEditingItem(null);
        }}
        onSave={handleSaveItem}
        initialItem={editingItem}
        tenantId={tenant?.id || 'tenant_stanford_biomed'}
      />

      {/* Print Labels Modal */}
      {isPrintModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-5xl">
            <PrintableLabels
              items={items}
              onClose={() => setIsPrintModalOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Real Production-Ready Checkout Modal */}
      {selectedPlanForCheckout && tenant && (
        <CheckoutModal
          isOpen={Boolean(selectedPlanForCheckout)}
          plan={selectedPlanForCheckout}
          tenant={tenant}
          onClose={() => setSelectedPlanForCheckout(null)}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
};
