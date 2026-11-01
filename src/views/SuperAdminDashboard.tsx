import React, { useState, useEffect } from 'react';
import { User, Tenant, Item, FinderReport, SubscriptionPlan, Subscription, AuditLog, WebsiteSettings, HowItWorksStep, FeatureItem } from '../types';
import { db } from '../mock/storage';
import { apiFetch } from '../services/api';
import {
  ShieldAlert,
  Users,
  Tag,
  DollarSign,
  TrendingUp,
  Settings,
  FileText,
  Sliders,
  Download,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Search,
  Plus,
  Edit2,
  Trash2,
  Lock,
  Globe,
  RefreshCw,
  Eye,
  Megaphone,
  Layers,
  Sparkles,
  Phone,
  Mail,
  MapPin,
  Check,
  X
} from 'lucide-react';

interface SuperAdminDashboardProps {
  currentUser: User;
  onSimulateFinderScan: (publicId: string) => void;
}

type AdminTab = 
  | 'stats' 
  | 'users' 
  | 'items' 
  | 'plans' 
  | 'settings' 
  | 'audit' 
  | 'analytics';

export const SuperAdminDashboard: React.FC<SuperAdminDashboardProps> = ({
  currentUser,
  onSimulateFinderScan
}) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('stats');
  const [users, setUsers] = useState<User[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [reports, setReports] = useState<FinderReport[]>([]);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [settings, setSettings] = useState<WebsiteSettings>(db.getSettings());

  // Search queries
  const [userSearch, setUserSearch] = useState('');
  const [itemSearch, setItemSearch] = useState('');
  const [auditFilter, setAuditFilter] = useState('ALL');

  // Plan editing modal
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);

  // User CRUD modal
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);

  // Item CRUD modal
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [isNewItem, setIsNewItem] = useState(false);

  // Settings feedback
  const [settingsSuccess, setSettingsSuccess] = useState(false);

  const loadAllData = async () => {
    try {
      const res = await apiFetch('/api/v1/auth/admin/users/');
      if (res.ok) {
        const data = await res.json();
        const list = Array.isArray(data) ? data : (data.results || []);
        setUsers(list.map((u: any) => ({
          id: String(u.id),
          email: u.email,
          fullName: `${u.first_name || ''} ${u.last_name || ''}`.trim() || u.username,
          role: u.role,
          status: u.status,
          tenantId: u.tenant?.id,
          createdAt: u.created_at,
        } as User)));
      }
    } catch (e) {
      console.error('Failed to load users', e);
      setUsers(db.getUsers());
    }
    try {
      const res = await apiFetch('/api/v1/items/');
      if (res.ok) {
        const data = await res.json();
        const list = Array.isArray(data) ? data : (data.results || []);
        setItems(list.map((i: any) => ({
          id: String(i.id),
          tenantId: String(i.tenant),
          publicId: i.public_id,
          name: i.name,
          category: i.category,
          description: i.description || '',
          serialNumber: i.serial_number || '',
          rewardOffered: i.reward_offered || '',
          isLost: i.is_lost,
          lostDate: i.lost_date,
          lostNote: i.lost_note || '',
          isRecovered: i.is_recovered,
          recoveredDate: i.recovered_date,
          createdAt: i.created_at,
          updatedAt: i.updated_at,
          scanCount: i.scan_count || 0,
          lastScannedAt: i.last_scanned_at,
          lastLocation: i.last_latitude ? { lat: i.last_latitude, lng: i.last_longitude, address: i.last_address || '', timestamp: i.last_scanned_at || i.updated_at, source: 'finder' } : undefined,
        } as Item)));
      }
    } catch (e) {
      console.error('Failed to load items', e);
      setItems(db.getItems());
    }
    try {
      const res = await apiFetch('/api/v1/auth/tenants/');
      if (res.ok) {
        const data = await res.json();
        const list = Array.isArray(data) ? data : (data.results || []);
        setTenants(list.map((t: any) => ({
          id: String(t.id),
          name: t.name,
          campusName: t.campus_name,
          slug: t.slug,
          itemLimit: t.item_limit,
          contactEmail: t.contact_email,
          phone: t.phone || '',
          createdAt: t.created_at,
          isVerified: t.is_verified,
        } as Tenant)));
      }
    } catch (e) {
      console.error('Failed to load tenants', e);
      setTenants(db.getTenants());
    }
    try {
      const res = await apiFetch('/api/v1/f/reports/');
      if (res.ok) {
        const data = await res.json();
        const list = Array.isArray(data) ? data : (data.results || []);
        setReports(list.map((r: any) => ({
          id: String(r.id),
          itemId: String(r.item),
          publicId: r.item_public_id || '',
          itemName: r.item_name || '',
          tenantId: '',
          timestamp: r.created_at,
          message: r.message,
          status: r.status || 'unread',
          location: r.latitude ? { lat: r.latitude, lng: r.longitude, address: r.address || '' } : undefined,
        } as FinderReport)));
      }
    } catch (e) {
      console.error('Failed to load reports', e);
      setReports(db.getReports());
    }
    try {
      const res = await apiFetch('/api/v1/subscriptions/plans/');
      if (res.ok) {
        const data = await res.json();
        const list = Array.isArray(data) ? data : (data.results || []);
        setPlans(list.map((p: any) => ({
          id: p.id,
          name: p.name,
          price: Number(p.price),
          billingCycle: p.billing_cycle,
          itemLimit: p.item_limit,
          trialDays: p.trial_days,
          features: p.features || [],
          isActive: p.is_active,
          isPopular: p.is_popular,
          badge: p.badge || '',
        } as SubscriptionPlan)));
      }
    } catch (e) {
      console.error('Failed to load plans', e);
      setPlans(db.getPlans());
    }
    setSubscriptions(db.getSubscriptions());
    try {
      const res = await apiFetch('/api/v1/audit/');
      if (res.ok) {
        const data = await res.json();
        const list = Array.isArray(data) ? data : (data.results || []);
        setAuditLogs(list.map((l: any) => ({
          id: String(l.id),
          actorEmail: l.actor_email,
          action: l.action,
          targetType: l.target_type,
          targetId: l.target_id,
          details: l.details,
          timestamp: l.created_at,
          ipAddress: l.ip_address || '',
        } as AuditLog)));
      }
    } catch (e) {
      console.error('Failed to load audit logs', e);
      setAuditLogs(db.getAuditLogs());
    }
    try {
      const res = await apiFetch('/api/v1/auth/settings/');
      if (res.ok) {
        const data = await res.json();
        const list = Array.isArray(data) ? data : (data.results || []);
        if (list.length) setSettings(list[0].data);
      }
    } catch (e) {
      console.error('Failed to load settings', e);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // Compute Platform Metrics
  const totalRevenue = subscriptions.reduce((acc, sub) => {
    const plan = plans.find(p => p.id === sub.planId);
    return acc + (plan?.price || 0);
  }, 0);

  const activeLostItems = items.filter(i => i.isLost).length;
  const recoveredItems = items.filter(i => i.isRecovered).length;
  const totalScans = items.reduce((acc, i) => acc + (i.scanCount || 0), 0);

  const handleToggleUserStatus = async (user: User) => {
    const nextStatus: User['status'] = user.status === 'active' ? 'suspended' : 'active';
    try {
      await apiFetch(`/api/v1/auth/admin/users/${user.id}/`, {
        method: 'PATCH',
        body: JSON.stringify({ status: nextStatus }),
      });
      loadAllData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteUser = async (userId: string, email: string) => {
    if (confirm(`Are you sure you want to delete user ${email}? This action is irreversible.`)) {
      try {
        await apiFetch(`/api/v1/auth/admin/users/${userId}/`, { method: 'DELETE' });
        loadAllData();
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    const nameParts = (editingUser.fullName || '').split(' ');
    const payload = {
      username: editingUser.email,
      email: editingUser.email,
      first_name: nameParts[0] || '',
      last_name: nameParts.slice(1).join(' ') || '',
      role: editingUser.role,
      status: editingUser.status,
    };
    try {
      if (isNewUser) {
        await apiFetch('/api/v1/auth/admin/users/', {
          method: 'POST',
          body: JSON.stringify({ ...payload, password: 'CampusTag2026!SecureAdmin' }),
        });
      } else {
        await apiFetch(`/api/v1/auth/admin/users/${editingUser.id}/`, {
          method: 'PATCH',
          body: JSON.stringify(payload),
        });
      }
      setIsUserModalOpen(false);
      setEditingUser(null);
      loadAllData();
    } catch (e) {
      console.error(e);
    }
  };

  // Item Actions
  const handleToggleItemLost = async (item: Item) => {
    const nextLost = !item.isLost;
    try {
      if (nextLost) {
        await apiFetch(`/api/v1/items/${item.id}/toggle_lost/`, { method: 'POST', body: JSON.stringify({}) });
      } else {
        await apiFetch(`/api/v1/items/${item.id}/`, { method: 'PATCH', body: JSON.stringify({ is_lost: false }) });
      }
      loadAllData();
    } catch (e) { console.error(e); }
  };

  const handleToggleItemRecovered = async (item: Item) => {
    try {
      await apiFetch(`/api/v1/items/${item.id}/mark_recovered/`, { method: 'POST', body: JSON.stringify({}) });
      loadAllData();
    } catch (e) { console.error(e); }
  };

  const handleDeleteItem = async (itemId: string, name: string) => {
    if (confirm(`Are you sure you want to delete item "${name}"? The public QR tag will become permanently unlinked.`)) {
      try {
        await apiFetch(`/api/v1/items/${itemId}/`, { method: 'DELETE' });
        loadAllData();
      } catch (e) { console.error(e); }
    }
  };

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    const payload = {
      name: editingItem.name,
      category: editingItem.category,
      description: editingItem.description,
      serial_number: editingItem.serialNumber,
      reward_offered: editingItem.rewardOffered,
      tenant: editingItem.tenantId,
    };
    try {
      if (isNewItem) {
        await apiFetch('/api/v1/items/', { method: 'POST', body: JSON.stringify(payload) });
      } else {
        await apiFetch(`/api/v1/items/${editingItem.id}/`, { method: 'PATCH', body: JSON.stringify(payload) });
      }
      setIsItemModalOpen(false);
      setEditingItem(null);
      loadAllData();
    } catch (e) { console.error(e); }
  };

  // Plan Actions
  const handleSavePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlan) return;
    const payload = {
      name: editingPlan.name,
      price: editingPlan.price,
      billing_cycle: editingPlan.billingCycle,
      item_limit: editingPlan.itemLimit,
      trial_days: editingPlan.trialDays,
      features: editingPlan.features,
      is_active: editingPlan.isActive,
      is_popular: editingPlan.isPopular,
      badge: editingPlan.badge,
    };
    try {
      if (db.getPlans().some(p => p.id === editingPlan.id)) {
        await apiFetch(`/api/v1/subscriptions/plans/${editingPlan.id}/`, { method: 'PATCH', body: JSON.stringify(payload) });
      } else {
        await apiFetch('/api/v1/subscriptions/plans/', { method: 'POST', body: JSON.stringify({ ...payload, id: editingPlan.id }) });
      }
      setIsPlanModalOpen(false);
      setEditingPlan(null);
      loadAllData();
    } catch (e) { console.error(e); }
  };

  const handleDeletePlan = async (planId: string, name: string) => {
    if (confirm(`Are you sure you want to delete subscription plan "${name}"?`)) {
      try {
        await apiFetch(`/api/v1/subscriptions/plans/${planId}/`, { method: 'DELETE' });
        loadAllData();
      } catch (e) { console.error(e); }
    }
  };

  // Settings Save
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await apiFetch('/api/v1/auth/settings/');
      const data = res.ok ? await res.json() : null;
      const list = data ? (Array.isArray(data) ? data : (data.results || [])) : [];
      if (list.length) {
        await apiFetch(`/api/v1/auth/settings/${list[0].id}/`, { method: 'PATCH', body: JSON.stringify({ data: settings }) });
      } else {
        await apiFetch('/api/v1/auth/settings/', { method: 'POST', body: JSON.stringify({ data: settings }) });
      }
      setSettingsSuccess(true);
      setTimeout(() => setSettingsSuccess(false), 3000);
      loadAllData();
    } catch (e) { console.error(e); }
  };

  // CSV Exporters
  const exportItemsCSV = () => {
    const headers = ['ID', 'Public_ID', 'Tenant_ID', 'Name', 'Category', 'Is_Lost', 'Is_Recovered', 'Scans', 'Created_At'];
    const rows = items.map(i => [
      i.id,
      i.publicId,
      i.tenantId,
      `"${i.name.replace(/"/g, '""')}"`,
      `"${i.category}"`,
      i.isLost ? 'YES' : 'NO',
      i.isRecovered ? 'YES' : 'NO',
      i.scanCount || 0,
      i.createdAt
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `campus_tag_items_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportReportsCSV = () => {
    const headers = ['Report_ID', 'Item_ID', 'Public_ID', 'Item_Name', 'Timestamp', 'Message', 'Status', 'Has_Location'];
    const rows = reports.map(r => [
      r.id,
      r.itemId,
      r.publicId,
      `"${r.itemName.replace(/"/g, '""')}"`,
      r.timestamp,
      `"${r.message.replace(/"/g, '""')}"`,
      r.status,
      r.location ? 'YES' : 'NO'
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `campus_tag_reports_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredUsers = users.filter(u => 
    u.fullName.toLowerCase().includes(userSearch.toLowerCase()) || 
    u.email.toLowerCase().includes(userSearch.toLowerCase())
  );

  const filteredItems = items.filter(i => 
    i.name.toLowerCase().includes(itemSearch.toLowerCase()) || 
    i.publicId.toLowerCase().includes(itemSearch.toLowerCase())
  );

  const filteredAudit = auditLogs.filter(l => 
    auditFilter === 'ALL' || l.targetType === auditFilter
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row">
      {/* Super Admin Dark Sidebar */}
      <aside className="w-full md:w-64 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0">
        <div className="p-5 border-b border-slate-800 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-red-600 text-white flex items-center justify-center font-black text-sm shadow-md shadow-red-600/30">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-black tracking-wider text-white uppercase">SUPER ADMIN</div>
            <div className="text-[10px] text-red-400 font-semibold">{settings.appName}</div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1 text-xs font-medium">
          <button
            onClick={() => setActiveTab('stats')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-colors cursor-pointer ${
              activeTab === 'stats' ? 'bg-red-600 text-white font-bold shadow-md shadow-red-600/20' : 'hover:bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Executive Metrics</span>
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-colors cursor-pointer ${
              activeTab === 'users' ? 'bg-red-600 text-white font-bold shadow-md shadow-red-600/20' : 'hover:bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <span className="flex items-center gap-3">
              <Users className="w-4 h-4" />
              <span>User Management</span>
            </span>
            <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded-full text-slate-300">
              {users.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('items')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-colors cursor-pointer ${
              activeTab === 'items' ? 'bg-red-600 text-white font-bold shadow-md shadow-red-600/20' : 'hover:bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <span className="flex items-center gap-3">
              <Tag className="w-4 h-4" />
              <span>Campus Items CRUD</span>
            </span>
            <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded-full text-slate-300">
              {items.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('plans')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-colors cursor-pointer ${
              activeTab === 'plans' ? 'bg-red-600 text-white font-bold shadow-md shadow-red-600/20' : 'hover:bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Subscription Plans</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-colors cursor-pointer ${
              activeTab === 'settings' ? 'bg-red-600 text-white font-bold shadow-md shadow-red-600/20' : 'hover:bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Website & Dynamic Content</span>
          </button>

          <button
            onClick={() => setActiveTab('audit')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-colors cursor-pointer ${
              activeTab === 'audit' ? 'bg-red-600 text-white font-bold shadow-md shadow-red-600/20' : 'hover:bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Security Audit Ledger</span>
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-colors cursor-pointer ${
              activeTab === 'analytics' ? 'bg-red-600 text-white font-bold shadow-md shadow-red-600/20' : 'hover:bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <Download className="w-4 h-4" />
            <span>Data Exporters (CSV)</span>
          </button>
        </nav>

        {/* Operator Profile in Sidebar */}
        <div className="p-4 border-t border-slate-800 text-xs flex items-center justify-between">
          <div>
            <div className="font-bold text-white">{currentUser.fullName}</div>
            <div className="text-[11px] text-slate-400">{currentUser.email}</div>
          </div>
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm" title="Root Session Active" />
        </div>
      </aside>

      {/* Main Admin Content Canvas */}
      <main className="flex-1 p-6 md:p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto space-y-6">
          
          {/* TAB 1: EXECUTIVE METRICS */}
          {activeTab === 'stats' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-black text-white">Platform Overview & Operations</h2>
                <p className="text-xs text-slate-400 mt-1">Real-time statistics synchronized directly from the PostgreSQL / JSON storage layers.</p>
              </div>

              {/* KPI Cards Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-2">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Active Gear</div>
                  <div className="text-2xl font-black text-white">{items.length}</div>
                  <div className="text-[10px] text-blue-400">Across {tenants.length} campus departments</div>
                </div>

                <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-2">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Active Lost Mode</div>
                  <div className="text-2xl font-black text-amber-400">{activeLostItems}</div>
                  <div className="text-[10px] text-amber-300">Public recovery banners live</div>
                </div>

                <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-2">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Gear Recovered</div>
                  <div className="text-2xl font-black text-emerald-400">{recoveredItems}</div>
                  <div className="text-[10px] text-emerald-300">Successfully returned items</div>
                </div>

                <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-2">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">MRR Revenue</div>
                  <div className="text-2xl font-black text-white">${totalRevenue.toFixed(2)}</div>
                  <div className="text-[10px] text-slate-400">{subscriptions.length} active subscriptions</div>
                </div>
              </div>

              {/* Quick Action Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl space-y-2">
                  <div className="text-xs font-bold text-white flex items-center gap-2">
                    <Globe className="w-4 h-4 text-blue-400" />
                    <span>Dynamic Website Content</span>
                  </div>
                  <p className="text-xs text-slate-400">Customize the hero text, 4-step workflow, and features list live from dashboard.</p>
                  <button
                    onClick={() => setActiveTab('settings')}
                    className="text-xs text-blue-400 hover:text-blue-300 underline font-semibold cursor-pointer"
                  >
                    Edit Content →
                  </button>
                </div>

                <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl space-y-2">
                  <div className="text-xs font-bold text-white flex items-center gap-2">
                    <Tag className="w-4 h-4 text-emerald-400" />
                    <span>Master Item Inventory</span>
                  </div>
                  <p className="text-xs text-slate-400">Add, edit, delete, or toggle lost/recovered states across all campus tenants.</p>
                  <button
                    onClick={() => setActiveTab('items')}
                    className="text-xs text-emerald-400 hover:text-emerald-300 underline font-semibold cursor-pointer"
                  >
                    Manage Gear Items →
                  </button>
                </div>

                <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl space-y-2">
                  <div className="text-xs font-bold text-white flex items-center gap-2">
                    <Users className="w-4 h-4 text-purple-400" />
                    <span>User & Role Governance</span>
                  </div>
                  <p className="text-xs text-slate-400">Provision accounts, assign tenant bindings, or suspend fraudulent access.</p>
                  <button
                    onClick={() => setActiveTab('users')}
                    className="text-xs text-purple-400 hover:text-purple-300 underline font-semibold cursor-pointer"
                  >
                    Manage Users →
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: USER & TENANT MANAGEMENT (FULL CRUD) */}
          {activeTab === 'users' && (
            <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
              <div className="p-5 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    placeholder="Search users by name, email, or tenant..."
                    className="w-full pl-9 pr-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-red-500"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      setEditingUser({
                        id: `usr_${Date.now()}`,
                        fullName: '',
                        email: '',
                        role: 'customer',
                        status: 'active',
                        tenantId: 'tenant_01',
                        createdAt: new Date().toISOString()
                      });
                      setIsNewUser(true);
                      setIsUserModalOpen(true);
                    }}
                    className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Create User</span>
                  </button>
                  <div className="text-xs text-slate-400">Total Users: {users.length}</div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-slate-950/60">
                      <th className="py-3.5 px-5">User</th>
                      <th className="py-3.5 px-4">Role</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4">Tenant Binding</th>
                      <th className="py-3.5 px-5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {filteredUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3.5 px-5">
                          <div className="font-bold text-white text-xs">{u.fullName}</div>
                          <div className="font-mono text-[11px] text-slate-400">{u.email}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold inline-flex items-center gap-1.5 ${
                            u.role === 'super_admin' ? 'bg-red-950/80 text-red-300 border border-red-800/60' : 'bg-blue-950/80 text-blue-300 border border-blue-800/60'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${u.role === 'super_admin' ? 'bg-red-400 animate-pulse' : 'bg-blue-400'}`} />
                            <span>{u.role.toUpperCase()}</span>
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold inline-flex items-center gap-1.5 ${
                            u.status === 'active' ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/60' : 'bg-amber-950/80 text-amber-300 border border-amber-800/60'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${u.status === 'active' ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                            <span>{u.status.toUpperCase()}</span>
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-slate-400">
                          {u.tenantId || 'Platform Global'}
                        </td>
                        <td className="py-3.5 px-5 text-right space-x-2">
                          <button
                            onClick={() => {
                              setEditingUser(u);
                              setIsNewUser(false);
                              setIsUserModalOpen(true);
                            }}
                            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg cursor-pointer interactive-btn transition-colors"
                            title="Edit User"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          
                          {u.role !== 'super_admin' && (
                            <>
                              <button
                                onClick={() => handleToggleUserStatus(u)}
                                className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer interactive-btn transition-colors ${
                                  u.status === 'active'
                                    ? 'bg-amber-950 hover:bg-amber-900 text-amber-300 border border-amber-700'
                                    : 'bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-700'
                                }`}
                              >
                                {u.status === 'active' ? 'Suspend' : 'Reactivate'}
                              </button>
                              <button
                                onClick={() => handleDeleteUser(u.id, u.email)}
                                className="p-1.5 bg-red-950 hover:bg-red-900 text-red-400 rounded-lg cursor-pointer border border-red-800 interactive-btn transition-colors"
                                title="Delete User"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: GLOBAL ITEMS REGISTRY (FULL CRUD) */}
          {activeTab === 'items' && (
            <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
              <div className="p-5 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={itemSearch}
                    onChange={(e) => setItemSearch(e.target.value)}
                    placeholder="Search all campus items across tenants..."
                    className="w-full pl-9 pr-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-red-500"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      const randomCode = Math.random().toString(36).substring(2, 6) + '-' + Math.random().toString(36).substring(2, 6);
                      setEditingItem({
                        id: `item_${Date.now()}`,
                        tenantId: 'tenant_01',
                        publicId: `cpt-${randomCode}`,
                        name: '',
                        category: 'Electronics & Laptops',
                        description: '',
                        rewardOffered: '',
                        photoUrl: '',
                        isLost: false,
                        isRecovered: false,
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                        scanCount: 0
                      });
                      setIsNewItem(true);
                      setIsItemModalOpen(true);
                    }}
                    className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm interactive-btn"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Register Campus Item</span>
                  </button>
                  <div className="text-xs text-slate-400">Total Items: {items.length}</div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-slate-950/60">
                      <th className="py-3.5 px-5">Item & Public Tag</th>
                      <th className="py-3.5 px-4">Tenant Workspace</th>
                      <th className="py-3.5 px-4">Category</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4">Scans</th>
                      <th className="py-3.5 px-5 text-right">Master Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {filteredItems.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3.5 px-5">
                          <div className="font-bold text-white text-xs">{item.name}</div>
                          <div className="font-mono text-[11px] text-blue-400">{item.publicId}</div>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-slate-400">{item.tenantId}</td>
                        <td className="py-3.5 px-4 text-slate-300">{item.category}</td>
                        <td className="py-3.5 px-4">
                          {item.isLost ? (
                            <span className="text-[10px] font-bold text-amber-300 bg-amber-950/70 px-2.5 py-0.5 rounded-full border border-amber-700/60 inline-flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                              <span>LOST ACTIVE</span>
                            </span>
                          ) : item.isRecovered ? (
                            <span className="text-[10px] font-bold text-emerald-300 bg-emerald-950/70 px-2.5 py-0.5 rounded-full border border-emerald-700/60 inline-flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                              <span>RECOVERED</span>
                            </span>
                          ) : (
                            <span className="text-[10px] font-semibold text-slate-400 bg-slate-800/80 px-2.5 py-0.5 rounded-full border border-slate-700/50 inline-flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                              <span>PROTECTED</span>
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-slate-200">{item.scanCount || 0}</td>
                        <td className="py-3.5 px-5 text-right space-x-1.5">
                          <button
                            onClick={() => handleToggleItemLost(item)}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold cursor-pointer interactive-btn transition-colors ${
                              item.isLost ? 'bg-amber-900/60 text-amber-300 border border-amber-700' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                            }`}
                          >
                            {item.isLost ? 'Cancel Lost' : 'Mark Lost'}
                          </button>
                          
                          <button
                            onClick={() => {
                              setEditingItem(item);
                              setIsNewItem(false);
                              setIsItemModalOpen(true);
                            }}
                            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg cursor-pointer interactive-btn transition-colors"
                            title="Edit Item"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => onSimulateFinderScan(item.publicId)}
                            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-blue-400 rounded-lg cursor-pointer interactive-btn transition-colors"
                            title="View Public Finder Page"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleDeleteItem(item.id, item.name)}
                            className="p-1.5 bg-red-950 hover:bg-red-900 text-red-400 rounded-lg cursor-pointer border border-red-800 interactive-btn transition-colors"
                            title="Delete Item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: SUBSCRIPTION PLAN STUDIO */}
          {activeTab === 'plans' && (
            <div className="space-y-6">
              <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white">Subscription Plan Studio</h3>
                  <p className="text-xs text-slate-400 mt-1">Configure pricing tiers, tag capacity limits, trial days, and features.</p>
                </div>
                <button
                  onClick={() => {
                    setEditingPlan({
                      id: `plan_${Date.now()}`,
                      name: 'Campus Department Enterprise',
                      price: 29.99,
                      billingCycle: 'Monthly',
                      itemLimit: 500,
                      trialDays: 14,
                      features: ['Unlimited QR Generation', 'Full Map Logs', 'Custom Security Dispatch', 'Dedicated Audit Logs'],
                      isActive: true,
                      badge: 'New Tier'
                    });
                    setIsPlanModalOpen(true);
                  }}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer shadow-md"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Subscription Plan</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {plans.map((p) => (
                  <div key={p.id} className="bg-slate-900 rounded-2xl border border-slate-800 p-6 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                          p.isActive ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-slate-800 text-slate-500'
                        }`}>
                          {p.isActive ? 'ACTIVE PLAN' : 'DISABLED'}
                        </span>
                        {p.badge && (
                          <span className="text-[10px] text-blue-400 font-bold uppercase">{p.badge}</span>
                        )}
                      </div>
                      <h4 className="text-lg font-black text-white">{p.name}</h4>
                      <div className="text-2xl font-black text-slate-100 mt-2">
                        ${p.price.toFixed(2)}
                        <span className="text-xs font-normal text-slate-400 ml-1">/ {p.billingCycle}</span>
                      </div>
                      <div className="text-xs text-blue-400 font-semibold mt-1">
                        Limit: {p.itemLimit} items · {p.trialDays} days trial
                      </div>

                      <ul className="mt-4 space-y-1.5 text-xs text-slate-300">
                        {p.features.map((f, i) => (
                          <li key={i} className="flex items-center gap-2">
                            <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            <span>{f}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="pt-6 border-t border-slate-800 flex items-center gap-2">
                      <button
                        onClick={() => {
                          setEditingPlan(p);
                          setIsPlanModalOpen(true);
                        }}
                        className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors"
                      >
                        Edit Plan Details
                      </button>
                      <button
                        onClick={() => {
                          apiFetch(`/api/v1/subscriptions/plans/${p.id}/`, { method: 'PATCH', body: JSON.stringify({ is_active: !p.isActive }) }).then(() => loadAllData());
                        }}
                        className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold cursor-pointer"
                      >
                        {p.isActive ? 'Disable' : 'Enable'}
                      </button>
                      <button
                        onClick={() => handleDeletePlan(p.id, p.name)}
                        className="p-2 bg-red-950 hover:bg-red-900 text-red-400 border border-red-800 rounded-xl text-xs cursor-pointer"
                        title="Delete Plan"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: WEBSITE SETTINGS & DYNAMIC CONTENT */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <Globe className="w-5 h-5 text-red-500" />
                      <span>Live Website Content & Branding Editor</span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Everything edited here is dynamically reflected in the public website, landing page, and footer without code deployment.
                    </p>
                  </div>
                  {settingsSuccess && (
                    <div className="p-2.5 bg-emerald-950 border border-emerald-800 rounded-xl text-emerald-400 text-xs font-medium flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      <span>Changes Saved Live!</span>
                    </div>
                  )}
                </div>
              </div>

              <form onSubmit={handleSaveSettings} className="space-y-6 text-xs">
                {/* 1. HERO SECTION CONTENT */}
                <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 space-y-4">
                  <h4 className="text-xs font-bold text-red-400 uppercase tracking-wider flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    <span>Hero Section & Tagline</span>
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-400 font-bold uppercase mb-1">
                        Hero Headline
                      </label>
                      <input
                        type="text"
                        value={settings.heroHeadline || ''}
                        onChange={(e) => setSettings({ ...settings, heroHeadline: e.target.value })}
                        placeholder="Protect Your Campus Gear."
                        className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-red-500"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-400 font-bold uppercase mb-1">
                        Tagline / Gradient Highlight
                      </label>
                      <input
                        type="text"
                        value={settings.tagline}
                        onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
                        placeholder="Scan It to Find It"
                        className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-red-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-400 font-bold uppercase mb-1">
                      Hero Description Paragraph
                    </label>
                    <textarea
                      rows={2}
                      value={settings.heroDescription || ''}
                      onChange={(e) => setSettings({ ...settings, heroDescription: e.target.value })}
                      placeholder="The privacy-first QR tagging platform for students, researchers, and campus faculty..."
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-red-500"
                    />
                  </div>
                </div>

                {/* 2. ANNOUNCEMENT BANNER */}
                <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 space-y-4">
                  <h4 className="text-xs font-bold text-red-400 uppercase tracking-wider flex items-center gap-2">
                    <Megaphone className="w-4 h-4" />
                    <span>Campus Announcement Bar</span>
                  </h4>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="bannerEnabled"
                      checked={settings.announcementBanner?.enabled ?? false}
                      onChange={(e) => setSettings({
                        ...settings,
                        announcementBanner: {
                          text: settings.announcementBanner?.text || 'Campus Tag V3 is now live for all research departments.',
                          linkUrl: settings.announcementBanner?.linkUrl || '',
                          enabled: e.target.checked
                        }
                      })}
                      className="rounded text-red-600 focus:ring-red-500 w-4 h-4 bg-slate-950 border-slate-700"
                    />
                    <label htmlFor="bannerEnabled" className="text-slate-300 font-bold cursor-pointer">
                      Display announcement banner at the very top of all public pages
                    </label>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-400 font-bold uppercase mb-1">Banner Text</label>
                      <input
                        type="text"
                        value={settings.announcementBanner?.text || ''}
                        onChange={(e) => setSettings({
                          ...settings,
                          announcementBanner: {
                            ...settings.announcementBanner,
                            text: e.target.value,
                            enabled: settings.announcementBanner?.enabled ?? true
                          }
                        })}
                        placeholder="Official Announcement Text..."
                        className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 font-bold uppercase mb-1">Target URL (Optional)</label>
                      <input
                        type="text"
                        value={settings.announcementBanner?.linkUrl || ''}
                        onChange={(e) => setSettings({
                          ...settings,
                          announcementBanner: {
                            ...settings.announcementBanner,
                            linkUrl: e.target.value,
                            text: settings.announcementBanner?.text || '',
                            enabled: settings.announcementBanner?.enabled ?? true
                          }
                        })}
                        placeholder="#pricing"
                        className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white"
                      />
                    </div>
                  </div>
                </div>

                {/* 3. HOW IT WORKS 4-STEP RECOVERY WORKFLOW */}
                <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 space-y-4">
                  <h4 className="text-xs font-bold text-red-400 uppercase tracking-wider flex items-center gap-2">
                    <Layers className="w-4 h-4" />
                    <span>How It Works Steps (Editable)</span>
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {(settings.howItWorksSteps || []).map((step, idx) => (
                      <div key={idx} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-red-400 uppercase text-[10px]">
                            Step 0{step.stepNumber}
                          </span>
                        </div>
                        <input
                          type="text"
                          value={step.title}
                          onChange={(e) => {
                            const newSteps = [...(settings.howItWorksSteps || [])];
                            newSteps[idx] = { ...newSteps[idx], title: e.target.value };
                            setSettings({ ...settings, howItWorksSteps: newSteps });
                          }}
                          className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white font-bold"
                        />
                        <textarea
                          rows={2}
                          value={step.description}
                          onChange={(e) => {
                            const newSteps = [...(settings.howItWorksSteps || [])];
                            newSteps[idx] = { ...newSteps[idx], description: e.target.value };
                            setSettings({ ...settings, howItWorksSteps: newSteps });
                          }}
                          className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-300 text-xs"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* 3.5. FUTURE USE & BENEFITS SECTION (DIRECTLY ABOVE FOOTER) */}
                <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-red-400 uppercase tracking-wider flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-red-400" />
                      <span>Future Use & Long-Term Benefits Section (Above Footer)</span>
                    </h4>
                    <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                      <input
                        type="checkbox"
                        checked={settings.futureUseSection?.enabled !== false}
                        onChange={(e) => setSettings({
                          ...settings,
                          futureUseSection: {
                            badge: settings.futureUseSection?.badge || 'Next-Generation Campus Architecture',
                            headline: settings.futureUseSection?.headline || 'Future Use & Long-Term Campus Benefits',
                            subheadline: settings.futureUseSection?.subheadline || 'How Campus Tag is expanding into an integrated smart IoT and automated campus security network.',
                            items: settings.futureUseSection?.items || [],
                            enabled: e.target.checked
                          }
                        })}
                        className="rounded text-red-600 focus:ring-red-500 w-4 h-4 bg-slate-950 border-slate-700"
                      />
                      <span>Section Visible on Homepage</span>
                    </label>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-400 font-bold uppercase mb-1">Section Badge</label>
                      <input
                        type="text"
                        value={settings.futureUseSection?.badge || ''}
                        onChange={(e) => setSettings({
                          ...settings,
                          futureUseSection: {
                            ...settings.futureUseSection,
                            enabled: settings.futureUseSection?.enabled ?? true,
                            headline: settings.futureUseSection?.headline || '',
                            subheadline: settings.futureUseSection?.subheadline || '',
                            items: settings.futureUseSection?.items || [],
                            badge: e.target.value
                          }
                        })}
                        className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 font-bold uppercase mb-1">Section Headline</label>
                      <input
                        type="text"
                        value={settings.futureUseSection?.headline || ''}
                        onChange={(e) => setSettings({
                          ...settings,
                          futureUseSection: {
                            ...settings.futureUseSection,
                            enabled: settings.futureUseSection?.enabled ?? true,
                            badge: settings.futureUseSection?.badge || '',
                            subheadline: settings.futureUseSection?.subheadline || '',
                            items: settings.futureUseSection?.items || [],
                            headline: e.target.value
                          }
                        })}
                        className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-400 font-bold uppercase mb-1">Section Subheadline</label>
                    <textarea
                      rows={2}
                      value={settings.futureUseSection?.subheadline || ''}
                      onChange={(e) => setSettings({
                        ...settings,
                        futureUseSection: {
                          ...settings.futureUseSection,
                          enabled: settings.futureUseSection?.enabled ?? true,
                          badge: settings.futureUseSection?.badge || '',
                          headline: settings.futureUseSection?.headline || '',
                          items: settings.futureUseSection?.items || [],
                          subheadline: e.target.value
                        }
                      })}
                      className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs"
                    />
                  </div>

                  <div className="space-y-3 pt-2">
                    <label className="block text-slate-400 font-bold uppercase text-[11px]">
                      Future Pillars & Ecosystem Capabilities ({settings.futureUseSection?.items?.length || 0})
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {(settings.futureUseSection?.items || []).map((item, idx) => (
                        <div key={item.id || idx} className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <input
                              type="text"
                              value={item.badge}
                              onChange={(e) => {
                                const newItems = [...(settings.futureUseSection?.items || [])];
                                newItems[idx] = { ...newItems[idx], badge: e.target.value };
                                setSettings({
                                  ...settings,
                                  futureUseSection: { ...settings.futureUseSection!, items: newItems }
                                });
                              }}
                              className="px-2 py-1 bg-slate-900 border border-slate-700 rounded text-[11px] text-blue-400 font-bold w-1/2"
                            />
                            <select
                              value={item.readinessStatus}
                              onChange={(e) => {
                                const newItems = [...(settings.futureUseSection?.items || [])];
                                newItems[idx] = { ...newItems[idx], readinessStatus: e.target.value as any };
                                setSettings({
                                  ...settings,
                                  futureUseSection: { ...settings.futureUseSection!, items: newItems }
                                });
                              }}
                              className="px-2 py-1 bg-slate-900 border border-slate-700 rounded text-[10px] text-white"
                            >
                              <option value="Active Beta">Active Beta</option>
                              <option value="Campus Pilot">Campus Pilot</option>
                              <option value="In Deployment">In Deployment</option>
                              <option value="Phase 2 Architecture">Phase 2 Architecture</option>
                            </select>
                          </div>
                          <input
                            type="text"
                            value={item.title}
                            onChange={(e) => {
                              const newItems = [...(settings.futureUseSection?.items || [])];
                              newItems[idx] = { ...newItems[idx], title: e.target.value };
                              setSettings({
                                ...settings,
                                futureUseSection: { ...settings.futureUseSection!, items: newItems }
                              });
                            }}
                            className="w-full px-2 py-1 bg-slate-900 border border-slate-700 rounded text-xs text-white font-bold"
                          />
                          <textarea
                            rows={2}
                            value={item.description}
                            onChange={(e) => {
                              const newItems = [...(settings.futureUseSection?.items || [])];
                              newItems[idx] = { ...newItems[idx], description: e.target.value };
                              setSettings({
                                ...settings,
                                futureUseSection: { ...settings.futureUseSection!, items: newItems }
                              });
                            }}
                            className="w-full px-2 py-1 bg-slate-900 border border-slate-700 rounded text-[11px] text-slate-300"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 4. FOOTER & CONTACT INFO */}
                <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 space-y-4">
                  <h4 className="text-xs font-bold text-red-400 uppercase tracking-wider flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    <span>Contact Info & Footer Settings</span>
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-slate-400 font-bold uppercase mb-1">Contact Email</label>
                      <input
                        type="email"
                        value={settings.contactEmail}
                        onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
                        className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 font-bold uppercase mb-1">Support Phone</label>
                      <input
                        type="text"
                        value={settings.supportPhone}
                        onChange={(e) => setSettings({ ...settings, supportPhone: e.target.value })}
                        className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 font-bold uppercase mb-1">Campus Office Address</label>
                      <input
                        type="text"
                        value={settings.campusOfficeAddress || ''}
                        onChange={(e) => setSettings({ ...settings, campusOfficeAddress: e.target.value })}
                        className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-400 font-bold uppercase mb-1">
                      Footer Description
                    </label>
                    <textarea
                      rows={2}
                      value={settings.footerDescription}
                      onChange={(e) => setSettings({ ...settings, footerDescription: e.target.value })}
                      className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-400 font-bold uppercase mb-1">Twitter / X URL</label>
                      <input
                        type="text"
                        value={settings.socialLinks.twitter || ''}
                        onChange={(e) => setSettings({
                          ...settings,
                          socialLinks: { ...settings.socialLinks, twitter: e.target.value }
                        })}
                        className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 font-bold uppercase mb-1">GitHub URL</label>
                      <input
                        type="text"
                        value={settings.socialLinks.github || ''}
                        onChange={(e) => setSettings({
                          ...settings,
                          socialLinks: { ...settings.socialLinks, github: e.target.value }
                        })}
                        className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white"
                      />
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between border-t border-slate-800">
                    <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                      <input
                        type="checkbox"
                        checked={settings.maintenanceMode}
                        onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })}
                        className="rounded text-red-600 focus:ring-red-500 w-4 h-4 bg-slate-950 border-slate-700"
                      />
                      <span>Maintenance Mode (Temporarily freeze new registrations)</span>
                    </label>

                    <button
                      type="submit"
                      className="px-6 py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl cursor-pointer shadow-lg shadow-red-600/30"
                    >
                      Save All Website Settings Live
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}

          {/* TAB 6: SECURITY AUDIT LEDGER */}
          {activeTab === 'audit' && (
            <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
              <div className="p-5 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h3 className="text-base font-bold text-white">Security Audit Ledger</h3>
                  <p className="text-xs text-slate-400 mt-1">Cryptographic tamper-resistant log of platform events.</p>
                </div>
                <div className="flex items-center gap-2">
                  {['ALL', 'Settings', 'User', 'Item', 'Report', 'Tenant', 'Plan'].map(f => (
                    <button
                      key={f}
                      onClick={() => setAuditFilter(f)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                        auditFilter === f ? 'bg-red-600 text-white font-bold' : 'bg-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-[11px] font-bold text-slate-500 uppercase tracking-wider bg-slate-950/40">
                      <th className="py-3 px-4">Timestamp</th>
                      <th className="py-3 px-4">Actor</th>
                      <th className="py-3 px-4">Action</th>
                      <th className="py-3 px-4">Details</th>
                      <th className="py-3 px-4">IP Address</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                    {filteredAudit.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-800/40">
                        <td className="py-3 px-4 text-slate-400">{new Date(log.timestamp).toLocaleString()}</td>
                        <td className="py-3 px-4 text-white font-sans font-bold">{log.actorEmail}</td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded bg-slate-800 text-red-300 font-bold text-[10px]">
                            {log.action}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-300 font-sans max-w-xs truncate">{log.details}</td>
                        <td className="py-3 px-4 text-slate-500">{log.ipAddress}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 7: CSV EXPORT CENTER */}
          {activeTab === 'analytics' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
                <div>
                  <h4 className="text-base font-bold text-white flex items-center gap-2">
                    <Download className="w-4 h-4 text-blue-400" />
                    Global Campus Items CSV
                  </h4>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                    Download complete raw CSV dataset of all registered items, public IDs, tenant allocations, categories, lost states, and scan counts.
                  </p>
                </div>
                <button
                  onClick={exportItemsCSV}
                  className="mt-6 w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Items CSV</span>
                </button>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
                <div>
                  <h4 className="text-base font-bold text-white flex items-center gap-2">
                    <Download className="w-4 h-4 text-blue-400" />
                    Finder Reports & Locations CSV
                  </h4>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                    Download full archive of anonymous finder notifications, timestamps, handover notes, and coordinates for campus security audits.
                  </p>
                </div>
                <button
                  onClick={exportReportsCSV}
                  className="mt-6 w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Reports CSV</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* 1. Plan Edit Modal */}
      {isPlanModalOpen && editingPlan && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 text-slate-100 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white">Configure Subscription Plan</h3>
            <form onSubmit={handleSavePlan} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 font-bold uppercase mb-1">Plan Name</label>
                <input
                  type="text"
                  value={editingPlan.name}
                  onChange={(e) => setEditingPlan({ ...editingPlan, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 font-bold uppercase mb-1">Price (USD)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editingPlan.price}
                    onChange={(e) => setEditingPlan({ ...editingPlan, price: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-bold uppercase mb-1">Item Limit</label>
                  <input
                    type="number"
                    value={editingPlan.itemLimit}
                    onChange={(e) => setEditingPlan({ ...editingPlan, itemLimit: parseInt(e.target.value, 10) || 1 })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-bold uppercase mb-1">Billing Cycle</label>
                <select
                  value={editingPlan.billingCycle}
                  onChange={(e) => setEditingPlan({ ...editingPlan, billingCycle: e.target.value as any })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white"
                >
                  <option value="7-Day Pass">7-Day Pass</option>
                  <option value="Monthly">Monthly</option>
                  <option value="Yearly">Yearly</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsPlanModalOpen(false)}
                  className="px-4 py-2 border border-slate-700 text-slate-300 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg cursor-pointer"
                >
                  Save Plan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. User Create/Edit Modal */}
      {isUserModalOpen && editingUser && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 text-slate-100 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white">
              {isNewUser ? 'Create Platform User' : 'Edit User Profile'}
            </h3>
            <form onSubmit={handleSaveUser} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 font-bold uppercase mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={editingUser.fullName}
                  onChange={(e) => setEditingUser({ ...editingUser, fullName: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold uppercase mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={editingUser.email}
                  onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 font-bold uppercase mb-1">Role</label>
                  <select
                    value={editingUser.role}
                    onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white"
                  >
                    <option value="customer">Customer (Student / Lab)</option>
                    <option value="super_admin">Super Admin (Platform)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-bold uppercase mb-1">Status</label>
                  <select
                    value={editingUser.status}
                    onChange={(e) => setEditingUser({ ...editingUser, status: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white"
                  >
                    <option value="active">Active</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-bold uppercase mb-1">Tenant Workspace Binding</label>
                <select
                  value={editingUser.tenantId || ''}
                  onChange={(e) => setEditingUser({ ...editingUser, tenantId: e.target.value || undefined })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white"
                >
                  <option value="">None (Platform Operator)</option>
                  {tenants.map(t => (
                    <option key={t.id} value={t.id}>{t.name} ({t.campusName})</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsUserModalOpen(false)}
                  className="px-4 py-2 border border-slate-700 text-slate-300 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg cursor-pointer"
                >
                  Save User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Item Create/Edit Modal */}
      {isItemModalOpen && editingItem && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 text-slate-100 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white">
              {isNewItem ? 'Register New Campus Item' : 'Edit Item Properties'}
            </h3>
            <form onSubmit={handleSaveItem} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 font-bold uppercase mb-1">Item Name</label>
                  <input
                    type="text"
                    required
                    value={editingItem.name}
                    onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-bold uppercase mb-1">Public Tag ID</label>
                  <input
                    type="text"
                    required
                    value={editingItem.publicId}
                    onChange={(e) => setEditingItem({ ...editingItem, publicId: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 font-bold uppercase mb-1">Category</label>
                  <select
                    value={editingItem.category}
                    onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white"
                  >
                    <option value="Electronics & Laptops">Electronics & Laptops</option>
                    <option value="Bicycles & Campus Transport">Bicycles & Campus Transport</option>
                    <option value="Laboratory & Research Instruments">Laboratory & Research Instruments</option>
                    <option value="Backpacks & Textbooks">Backpacks & Textbooks</option>
                    <option value="Musical Instruments">Musical Instruments</option>
                    <option value="Other Campus Valuables">Other Campus Valuables</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-bold uppercase mb-1">Tenant Workspace</label>
                  <select
                    value={editingItem.tenantId}
                    onChange={(e) => setEditingItem({ ...editingItem, tenantId: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white"
                  >
                    {tenants.map(t => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 font-bold uppercase mb-1">Serial Number</label>
                  <input
                    type="text"
                    value={editingItem.serialNumber || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, serialNumber: e.target.value })}
                    placeholder="e.g. SN-88219"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-bold uppercase mb-1">Reward (Optional)</label>
                  <input
                    type="text"
                    value={editingItem.rewardOffered || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, rewardOffered: e.target.value })}
                    placeholder="e.g. $50 Campus Gift Card"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-bold uppercase mb-1">Description / Identifier Notes</label>
                <textarea
                  rows={2}
                  value={editingItem.description}
                  onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsItemModalOpen(false)}
                  className="px-4 py-2 border border-slate-700 text-slate-300 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg cursor-pointer"
                >
                  Save Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
