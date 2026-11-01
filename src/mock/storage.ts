import { 
  User, 
  Tenant, 
  Item, 
  FinderReport, 
  MessageThread, 
  SubscriptionPlan, 
  Subscription, 
  AuditLog, 
  WebsiteSettings 
} from '../types';

const STORAGE_KEYS = {
  USERS: 'campus_tag_users_v3',
  CURRENT_USER: 'campus_tag_current_user_v3',
  TENANTS: 'campus_tag_tenants_v3',
  ITEMS: 'campus_tag_items_v3',
  REPORTS: 'campus_tag_reports_v3',
  THREADS: 'campus_tag_threads_v3',
  PLANS: 'campus_tag_plans_v3',
  SUBSCRIPTIONS: 'campus_tag_subscriptions_v3',
  AUDIT_LOGS: 'campus_tag_audit_logs_v3',
  SETTINGS: 'campus_tag_settings_v3',
  FIRST_RUN: 'campus_tag_first_run_completed_v3',
};

// Default Subscription Plans
const DEFAULT_PLANS: SubscriptionPlan[] = [
  {
    id: 'plan_7day',
    name: '7-Day Campus Pass',
    price: 4.99,
    billingCycle: '7-Day Pass',
    itemLimit: 5,
    trialDays: 0,
    features: [
      'Protect up to 5 campus items',
      'Instant privacy-first QR tag generation',
      'Downloadable PNG & SVG stickers',
      'One-click Lost Mode toggle',
      'Real-time finder notifications',
      'Public finder pages remain active forever'
    ],
    isActive: true,
    badge: 'Short Term'
  },
  {
    id: 'plan_monthly',
    name: 'Campus Scholar Pro',
    price: 9.99,
    billingCycle: 'Monthly',
    itemLimit: 25,
    trialDays: 7,
    features: [
      'Protect up to 25 campus gear items',
      'All 7-Day features included',
      'Interactive Leaflet pin-drop location logs',
      'Photo evidence uploads from finders',
      'Anonymous two-way message relay',
      'Print-ready high-density label sheets',
      'Priority university lost & found routing'
    ],
    isActive: true,
    isPopular: true,
    badge: 'Most Popular'
  },
  {
    id: 'plan_yearly',
    name: 'Department & Lab Fleet',
    price: 89.00,
    billingCycle: 'Yearly',
    itemLimit: 250,
    trialDays: 14,
    features: [
      'Protect up to 250 research & student assets',
      'All Scholar Pro features included',
      'Multi-seat department admin delegation',
      'Batch CSV asset import & export',
      'Custom campus security desk handover instructions',
      'Dedicated campus support engineer & SLA'
    ],
    isActive: true,
    badge: 'Best Value'
  }
];

// Fully customizable website settings editable live by Super Admin
const DEFAULT_SETTINGS: WebsiteSettings = {
  appName: 'Campus Tag',
  tagline: 'Scan It to Find It',
  heroHeadline: 'Protect Your Campus Gear.',
  heroDescription: 'The privacy-first QR tagging and lost gear recovery platform built specifically for university students, researchers, faculty, and campus departments.',
  contactEmail: 'support@campustag.edu',
  supportPhone: '+1 (800) 555-TAGS',
  campusOfficeAddress: 'University Student Union, Suite 304, Campus Drive',
  footerDescription: 'The privacy-first QR tagging and lost gear recovery platform built specifically for university students, researchers, faculty, and campus departments.',
  copyrightText: `© ${new Date().getFullYear()} Campus Tag Technologies Inc. All rights reserved.`,
  socialLinks: {
    twitter: 'https://twitter.com',
    github: 'https://github.com',
    linkedin: 'https://linkedin.com',
    instagram: 'https://instagram.com'
  },
  announcementBanner: {
    enabled: true,
    text: '🎓 Fall Campus Safety Drive: Protect your laptops and lab gear with 7 days free trial!',
    linkUrl: '#pricing'
  },
  howItWorksSteps: [
    {
      stepNumber: '01',
      title: 'Register Gear',
      description: 'Add laptops, calculators, lab instruments, or bikes. Each receives a unique unguessable ID.'
    },
    {
      stepNumber: '02',
      title: 'Affix QR Label',
      description: 'Print ready-to-peel weatherproof stickers or download vector SVGs for laser etching onto equipment.'
    },
    {
      stepNumber: '03',
      title: 'Lost Mode & Scan',
      description: 'If lost, toggle Lost Mode with 1 click. Any good Samaritan who scans the QR gets urgent recovery steps without your private info.'
    },
    {
      stepNumber: '04',
      title: 'Safe Handover',
      description: 'Finder drops a pin or leaves the item at campus lost & found, notifying you instantly through anonymous relay.'
    }
  ],
  featuresList: [
    {
      id: 'feat_1',
      title: 'Complete Privacy Shield',
      description: 'Never put personal phone numbers or emails on stickers. Finders contact you through an anonymous relay.'
    },
    {
      id: 'feat_2',
      title: 'Interactive OpenStreetMap Pin Drop',
      description: 'Finders can search any location, use device GPS, or drop a pin directly on an interactive open map.'
    },
    {
      id: 'feat_3',
      title: 'Multi-Tenant Workspaces',
      description: 'Dedicated isolated workspaces for bio labs, robotics cohorts, athletics departments, and student organizations.'
    },
    {
      id: 'feat_4',
      title: 'Forever Active Public Tags',
      description: 'Even if a subscription lapses, physical QR tags remain permanently operational and scannable.'
    },
    {
      id: 'feat_5',
      title: 'Printable Sticker Sheets',
      description: 'Built-in print layouts matching standard sticker paper sheets. Print 20 tags in 30 seconds straight from your browser.'
    },
    {
      id: 'feat_6',
      title: 'Emergency Lost Broadcast',
      description: 'Broadcast custom reward notices and instructions to campus security desks the moment you realize something is missing.'
    }
  ],
  futureUseSection: {
    enabled: true,
    badge: 'Next-Generation Campus Ecosystem',
    headline: 'Future Use & Long-Term Campus Benefits',
    subheadline: 'How Campus Tag is expanding beyond sticker recovery into an integrated smart IoT and automated campus security network for universities.',
    items: [
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
  },
  faqList: [
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
  ],
  maintenanceMode: false,
  isFirstRunCompleted: true
};

// Completely neutral users (Zero placeholder European/random personal names)
const DEFAULT_USERS: User[] = [
  {
    id: 'usr_superadmin_01',
    email: 'admin@campustag.edu',
    fullName: 'System Administrator',
    role: 'super_admin',
    createdAt: '2026-01-10T08:00:00Z',
    status: 'active'
  },
  {
    id: 'usr_customer_01',
    email: 'lab.lead@university.edu',
    fullName: 'Campus Research Lead',
    role: 'customer',
    tenantId: 'tenant_01',
    createdAt: '2026-02-15T10:30:00Z',
    status: 'active'
  },
  {
    id: 'usr_customer_02',
    email: 'dept.office@university.edu',
    fullName: 'Department Coordinator',
    role: 'customer',
    tenantId: 'tenant_02',
    createdAt: '2026-03-01T14:15:00Z',
    status: 'active'
  }
];

// Neutral tenant workspaces
const DEFAULT_TENANTS: Tenant[] = [
  {
    id: 'tenant_01',
    name: 'Autonomous Systems & Robotics Lab',
    campusName: 'University Central Campus',
    slug: 'robotics-lab',
    ownerId: 'usr_customer_01',
    planId: 'plan_monthly',
    itemLimit: 25,
    contactEmail: 'robotics-lab@university.edu',
    phone: '+1 (555) 723-2300',
    createdAt: '2026-02-15T10:30:00Z',
    isVerified: true
  },
  {
    id: 'tenant_02',
    name: 'Engineering Department Fleet',
    campusName: 'Institute of Technology',
    slug: 'engineering-fleet',
    ownerId: 'usr_customer_02',
    planId: 'plan_yearly',
    itemLimit: 250,
    contactEmail: 'engineering-lostfound@university.edu',
    phone: '+1 (555) 253-1000',
    createdAt: '2026-03-01T14:15:00Z',
    isVerified: true
  }
];

// Neutral items
const DEFAULT_ITEMS: Item[] = [
  {
    id: 'item_01',
    tenantId: 'tenant_01',
    publicId: 'cpt-8f92-a1b4',
    name: 'Apple MacBook Pro 16" (Space Gray)',
    category: 'Electronics & Laptops',
    description: 'Autonomous Systems Lab Machine. Equipped with official asset barcode.',
    photoUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=80',
    serialNumber: 'SN-ENG-882190',
    rewardOffered: '$50 Campus Bookstore Card',
    isLost: true,
    lostDate: '2026-10-28T16:45:00Z',
    lostNote: 'Left at Engineering Building Study Commons. Please turn in to the nearest department front desk!',
    isRecovered: false,
    createdAt: '2026-02-16T11:00:00Z',
    updatedAt: '2026-10-28T16:45:00Z',
    scanCount: 3,
    lastScannedAt: '2026-10-29T19:12:00Z',
    lastLocation: {
      lat: 37.4285,
      lng: -122.1738,
      address: 'Engineering Quad, University Campus',
      timestamp: '2026-10-29T19:12:00Z',
      source: 'finder'
    }
  },
  {
    id: 'item_02',
    tenantId: 'tenant_01',
    publicId: 'cpt-3e41-99c8',
    name: 'Precision Laser Rangefinder',
    category: 'Lab & Research Equipment',
    description: 'Precision field measurement device used for mobile robot navigation testing.',
    photoUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80',
    serialNumber: 'LCA-9924-X',
    rewardOffered: '$25 Cash / Venmo',
    isLost: false,
    isRecovered: false,
    createdAt: '2026-02-20T09:15:00Z',
    updatedAt: '2026-02-20T09:15:00Z',
    scanCount: 1,
    lastScannedAt: '2026-03-05T14:00:00Z',
    lastLocation: {
      lat: 37.4275,
      lng: -122.1697,
      address: 'Central Science & Research Hall',
      timestamp: '2026-03-05T14:00:00Z',
      source: 'owner'
    }
  },
  {
    id: 'item_03',
    tenantId: 'tenant_01',
    publicId: 'cpt-77b2-10f5',
    name: 'Wireless Noise Canceling Headphones',
    category: 'Electronics & Laptops',
    description: 'Midnight blue headphones in matching hard case.',
    photoUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80',
    rewardOffered: '$20 Reward',
    isLost: false,
    isRecovered: true,
    recoveredDate: '2026-10-15T12:00:00Z',
    createdAt: '2026-03-10T15:20:00Z',
    updatedAt: '2026-10-15T12:00:00Z',
    scanCount: 2
  },
  {
    id: 'item_04',
    tenantId: 'tenant_01',
    publicId: 'cpt-12aa-66bb',
    name: 'Commuter Road Bike & U-Lock',
    category: 'Bicycles & Scooters',
    description: 'Navy frame with rear cargo rack and Campus Tag QR badge under saddle tube.',
    photoUrl: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=600&q=80',
    serialNumber: 'WTU-8871239P',
    rewardOffered: '$75 Reward',
    isLost: false,
    isRecovered: false,
    createdAt: '2026-04-05T08:30:00Z',
    updatedAt: '2026-04-05T08:30:00Z',
    scanCount: 0
  }
];

// Neutral finder reports
const DEFAULT_REPORTS: FinderReport[] = [
  {
    id: 'rep_01',
    itemId: 'item_01',
    publicId: 'cpt-8f92-a1b4',
    itemName: 'Apple MacBook Pro 16" (Space Gray)',
    tenantId: 'tenant_01',
    timestamp: '2026-10-29T19:12:00Z',
    message: 'Found on study lounge desk #14. Safely turned in to the campus building reception desk.',
    finderContactNote: 'Left with building reception supervisor',
    evidencePhotoUrl: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?auto=format&fit=crop&w=600&q=80',
    location: {
      lat: 37.4285,
      lng: -122.1738,
      address: 'Engineering Hall, University Campus'
    },
    status: 'read'
  }
];

// Neutral message threads
const DEFAULT_THREADS: MessageThread[] = [
  {
    id: 'thrd_01',
    itemId: 'item_01',
    tenantId: 'tenant_01',
    publicId: 'cpt-8f92-a1b4',
    finderSessionId: 'sess_anon_9821',
    createdAt: '2026-10-29T19:15:00Z',
    lastMessageAt: '2026-10-29T19:40:00Z',
    messages: [
      {
        id: 'msg_01',
        sender: 'finder',
        text: 'Hi, I found your laptop in the lounge! Left it with building reception desk staff.',
        timestamp: '2026-10-29T19:15:00Z'
      },
      {
        id: 'msg_02',
        sender: 'owner',
        text: 'Thank you so much! Heading to the reception desk now to collect it.',
        timestamp: '2026-10-29T19:30:00Z'
      },
      {
        id: 'msg_03',
        sender: 'finder',
        text: 'Glad to help! Have a great semester.',
        timestamp: '2026-10-29T19:40:00Z'
      }
    ]
  }
];

const DEFAULT_SUBSCRIPTIONS: Subscription[] = [
  {
    id: 'sub_01',
    tenantId: 'tenant_01',
    planId: 'plan_monthly',
    status: 'active',
    currentPeriodStart: '2026-10-01T00:00:00Z',
    currentPeriodEnd: '2026-11-01T00:00:00Z',
    cancelAtPeriodEnd: false
  },
  {
    id: 'sub_02',
    tenantId: 'tenant_02',
    planId: 'plan_yearly',
    status: 'active',
    currentPeriodStart: '2026-03-01T00:00:00Z',
    currentPeriodEnd: '2027-03-01T00:00:00Z',
    cancelAtPeriodEnd: false
  }
];

const DEFAULT_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'log_01',
    actorEmail: 'admin@campustag.edu',
    action: 'SYSTEM_BOOTSTRAP',
    targetType: 'Settings',
    targetId: 'site_settings',
    details: 'Initial production environment initialized with simpleJWT & multi-tenant isolation.',
    timestamp: '2026-01-10T08:00:00Z',
    ipAddress: '10.0.4.12'
  },
  {
    id: 'log_02',
    actorEmail: 'research.lead@university.edu',
    action: 'ITEM_LOST_MODE_ENABLED',
    targetType: 'Item',
    targetId: 'item_01',
    details: 'Enabled emergency lost mode for Apple MacBook Pro 16". Public scan page updated.',
    timestamp: '2026-10-28T16:45:00Z',
    ipAddress: '171.67.215.200'
  },
  {
    id: 'log_03',
    actorEmail: 'anonymous_finder',
    action: 'FINDER_REPORT_RECEIVED',
    targetType: 'Report',
    targetId: 'rep_01',
    details: 'Anonymous finder report logged with GPS coordinates and evidence photo.',
    timestamp: '2026-10-29T19:12:00Z',
    ipAddress: '171.67.215.118'
  }
];

function readStorage<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return defaultValue;
    return JSON.parse(raw);
  } catch (err) {
    console.warn(`Error reading ${key} from storage:`, err);
    return defaultValue;
  }
}

function writeStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.warn(`Error writing ${key} to storage:`, err);
  }
}

export const db = {
  // Current logged in user / session
  getCurrentUser(): User {
    const defaultUser = DEFAULT_USERS[1]; // Campus Research Lead
    return readStorage<User>(STORAGE_KEYS.CURRENT_USER, defaultUser);
  },

  setCurrentUser(user: User): void {
    writeStorage(STORAGE_KEYS.CURRENT_USER, user);
  },

  // First Run Setup State
  isFirstRunCompleted(): boolean {
    const settings = this.getSettings();
    return readStorage<boolean>(STORAGE_KEYS.FIRST_RUN, settings.isFirstRunCompleted ?? true);
  },

  completeFirstRunSetup(adminData: {
    fullName: string;
    email: string;
    appName: string;
    tagline: string;
    campusName: string;
  }): User {
    const superAdmin: User = {
      id: `usr_superadmin_${Date.now()}`,
      email: adminData.email.trim(),
      fullName: adminData.fullName.trim() || 'Platform Super Admin',
      role: 'super_admin',
      createdAt: new Date().toISOString(),
      status: 'active'
    };

    // Save as primary superadmin
    const users = this.getUsers().filter(u => u.role !== 'super_admin');
    users.unshift(superAdmin);
    writeStorage(STORAGE_KEYS.USERS, users);
    this.setCurrentUser(superAdmin);

    // Update settings
    const settings = this.getSettings();
    settings.appName = adminData.appName.trim() || settings.appName;
    settings.tagline = adminData.tagline.trim() || settings.tagline;
    settings.campusOfficeAddress = `${adminData.campusName.trim()} Administration Building`;
    settings.isFirstRunCompleted = true;
    this.saveSettings(settings);

    writeStorage(STORAGE_KEYS.FIRST_RUN, true);
    this.logAudit(superAdmin.email, 'FIRST_RUN_ADMIN_INITIALIZED', 'User', superAdmin.id, 'Super Admin master account configured.');
    return superAdmin;
  },

  // Users CRUD
  getUsers(): User[] {
    return readStorage<User[]>(STORAGE_KEYS.USERS, DEFAULT_USERS);
  },

  saveUser(user: User): void {
    const users = this.getUsers();
    const idx = users.findIndex(u => u.id === user.id);
    if (idx >= 0) {
      users[idx] = user;
    } else {
      users.unshift(user);
    }
    writeStorage(STORAGE_KEYS.USERS, users);
    this.logAudit(this.getCurrentUser().email, idx >= 0 ? 'USER_UPDATED' : 'USER_CREATED', 'User', user.id, `User ${user.email} (${user.role}) status: ${user.status}`);
  },

  deleteUser(userId: string): void {
    const users = this.getUsers().filter(u => u.id !== userId);
    writeStorage(STORAGE_KEYS.USERS, users);
    this.logAudit(this.getCurrentUser().email, 'USER_DELETED', 'User', userId, `Deleted user ID ${userId}`);
  },

  // Tenants CRUD
  getTenants(): Tenant[] {
    return readStorage<Tenant[]>(STORAGE_KEYS.TENANTS, DEFAULT_TENANTS);
  },

  getTenantById(tenantId: string): Tenant | undefined {
    return this.getTenants().find(t => t.id === tenantId);
  },

  saveTenant(tenant: Tenant): void {
    const tenants = this.getTenants();
    const idx = tenants.findIndex(t => t.id === tenant.id);
    if (idx >= 0) {
      tenants[idx] = tenant;
    } else {
      tenants.push(tenant);
    }
    writeStorage(STORAGE_KEYS.TENANTS, tenants);
    this.logAudit(this.getCurrentUser().email, idx >= 0 ? 'TENANT_UPDATED' : 'TENANT_CREATED', 'Tenant', tenant.id, `Organization ${tenant.name} (${tenant.campusName}) saved.`);
  },

  deleteTenant(tenantId: string): void {
    const tenants = this.getTenants().filter(t => t.id !== tenantId);
    writeStorage(STORAGE_KEYS.TENANTS, tenants);
    this.logAudit(this.getCurrentUser().email, 'TENANT_DELETED', 'Tenant', tenantId, `Deleted tenant ID ${tenantId}`);
  },

  // Items CRUD
  getItems(tenantId?: string): Item[] {
    const all = readStorage<Item[]>(STORAGE_KEYS.ITEMS, DEFAULT_ITEMS);
    if (tenantId) {
      return all.filter(i => i.tenantId === tenantId);
    }
    return all;
  },

  getItemByPublicId(publicId: string): Item | undefined {
    const all = this.getItems();
    return all.find(i => i.publicId.toLowerCase() === publicId.toLowerCase());
  },

  getItemById(id: string): Item | undefined {
    const all = this.getItems();
    return all.find(i => i.id === id);
  },

  saveItem(item: Item): void {
    const items = this.getItems();
    const idx = items.findIndex(i => i.id === item.id);
    if (idx >= 0) {
      items[idx] = { ...item, updatedAt: new Date().toISOString() };
    } else {
      items.unshift(item);
    }
    writeStorage(STORAGE_KEYS.ITEMS, items);
    this.logAudit(
      this.getCurrentUser().email, 
      idx >= 0 ? 'ITEM_UPDATED' : 'ITEM_REGISTERED', 
      'Item', 
      item.id, 
      `Item: "${item.name}" (Public ID: ${item.publicId}) - Lost: ${item.isLost}`
    );
  },

  deleteItem(id: string): void {
    const items = this.getItems().filter(i => i.id !== id);
    writeStorage(STORAGE_KEYS.ITEMS, items);
    this.logAudit(this.getCurrentUser().email, 'ITEM_DELETED', 'Item', id, `Deleted item ID ${id}`);
  },

  // Finder Reports
  getReports(tenantId?: string): FinderReport[] {
    const all = readStorage<FinderReport[]>(STORAGE_KEYS.REPORTS, DEFAULT_REPORTS);
    if (tenantId) {
      return all.filter(r => r.tenantId === tenantId);
    }
    return all;
  },

  submitFinderReport(report: Omit<FinderReport, 'id' | 'timestamp' | 'status'>): FinderReport {
    const newReport: FinderReport = {
      ...report,
      id: `rep_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString(),
      status: 'unread'
    };

    const reports = this.getReports();
    reports.unshift(newReport);
    writeStorage(STORAGE_KEYS.REPORTS, reports);

    // Update item scan count and location
    const item = this.getItemById(report.itemId);
    if (item) {
      item.scanCount = (item.scanCount || 0) + 1;
      item.lastScannedAt = newReport.timestamp;
      if (report.location) {
        item.lastLocation = {
          lat: report.location.lat,
          lng: report.location.lng,
          address: report.location.address,
          timestamp: newReport.timestamp,
          source: 'finder'
        };
      }
      this.saveItem(item);
    }

    this.logAudit('anonymous_finder', 'FINDER_REPORT_SUBMITTED', 'Report', newReport.id, `Report received for public item ${report.publicId}`);
    return newReport;
  },

  updateReportStatus(reportId: string, status: 'unread' | 'read' | 'resolved'): void {
    const reports = this.getReports();
    const rep = reports.find(r => r.id === reportId);
    if (rep) {
      rep.status = status;
      writeStorage(STORAGE_KEYS.REPORTS, reports);
    }
  },

  // Message Threads
  getThreads(tenantId?: string): MessageThread[] {
    const all = readStorage<MessageThread[]>(STORAGE_KEYS.THREADS, DEFAULT_THREADS);
    if (tenantId) {
      return all.filter(t => t.tenantId === tenantId);
    }
    return all;
  },

  getThreadByPublicId(publicId: string): MessageThread | undefined {
    return this.getThreads().find(t => t.publicId === publicId);
  },

  sendMessage(publicId: string, text: string, sender: 'finder' | 'owner'): void {
    const threads = this.getThreads();
    let thread = threads.find(t => t.publicId === publicId);

    const item = this.getItemByPublicId(publicId);
    const tenantId = item?.tenantId || 'tenant_01';
    const itemId = item?.id || 'item_01';

    if (!thread) {
      thread = {
        id: `thrd_${Date.now()}`,
        itemId,
        tenantId,
        publicId,
        finderSessionId: `sess_${Date.now()}`,
        createdAt: new Date().toISOString(),
        lastMessageAt: new Date().toISOString(),
        messages: []
      };
      threads.unshift(thread);
    }

    thread.messages.push({
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
      sender,
      text,
      timestamp: new Date().toISOString()
    });
    thread.lastMessageAt = new Date().toISOString();

    writeStorage(STORAGE_KEYS.THREADS, threads);
  },

  // Plans & Subscriptions
  getPlans(): SubscriptionPlan[] {
    return readStorage<SubscriptionPlan[]>(STORAGE_KEYS.PLANS, DEFAULT_PLANS);
  },

  savePlan(plan: SubscriptionPlan): void {
    const plans = this.getPlans();
    const idx = plans.findIndex(p => p.id === plan.id);
    if (idx >= 0) {
      plans[idx] = plan;
    } else {
      plans.push(plan);
    }
    writeStorage(STORAGE_KEYS.PLANS, plans);
    this.logAudit(this.getCurrentUser().email, idx >= 0 ? 'PLAN_UPDATED' : 'PLAN_CREATED', 'Plan', plan.id, `Plan ${plan.name} ($${plan.price}) modified.`);
  },

  deletePlan(planId: string): void {
    const plans = this.getPlans().filter(p => p.id !== planId);
    writeStorage(STORAGE_KEYS.PLANS, plans);
    this.logAudit(this.getCurrentUser().email, 'PLAN_DELETED', 'Plan', planId, `Deleted plan ID ${planId}`);
  },

  getSubscriptions(): Subscription[] {
    return readStorage<Subscription[]>(STORAGE_KEYS.SUBSCRIPTIONS, DEFAULT_SUBSCRIPTIONS);
  },

  getSubscriptionForTenant(tenantId: string): Subscription | undefined {
    return this.getSubscriptions().find(s => s.tenantId === tenantId);
  },

  updateTenantSubscription(tenantId: string, planId: string): Subscription {
    const subs = this.getSubscriptions();
    let sub = subs.find(s => s.tenantId === tenantId);
    const plan = this.getPlans().find(p => p.id === planId);

    const now = new Date();
    const nextMonth = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    if (sub) {
      sub.planId = planId;
      sub.status = 'active';
      sub.currentPeriodStart = now.toISOString();
      sub.currentPeriodEnd = nextMonth.toISOString();
    } else {
      sub = {
        id: `sub_${Date.now()}`,
        tenantId,
        planId,
        status: 'active',
        currentPeriodStart: now.toISOString(),
        currentPeriodEnd: nextMonth.toISOString(),
        cancelAtPeriodEnd: false
      };
      subs.push(sub);
    }

    writeStorage(STORAGE_KEYS.SUBSCRIPTIONS, subs);

    // Update tenant item limit
    const tenant = this.getTenantById(tenantId);
    if (tenant && plan) {
      tenant.planId = planId;
      tenant.itemLimit = plan.itemLimit;
      this.saveTenant(tenant);
    }

    this.logAudit(this.getCurrentUser().email, 'SUBSCRIPTION_UPGRADED', 'Tenant', tenantId, `Tenant upgraded to plan ${plan?.name}`);
    return sub;
  },

  // Audit Logs
  getAuditLogs(): AuditLog[] {
    return readStorage<AuditLog[]>(STORAGE_KEYS.AUDIT_LOGS, DEFAULT_AUDIT_LOGS);
  },

  logAudit(
    actorEmail: string, 
    action: string, 
    targetType: AuditLog['targetType'], 
    targetId: string, 
    details: string
  ): void {
    const logs = this.getAuditLogs();
    const newLog: AuditLog = {
      id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      actorEmail,
      action,
      targetType,
      targetId,
      details,
      timestamp: new Date().toISOString(),
      ipAddress: '192.168.1.' + Math.floor(Math.random() * 200 + 10)
    };
    logs.unshift(newLog);
    if (logs.length > 150) logs.pop();
    writeStorage(STORAGE_KEYS.AUDIT_LOGS, logs);
  },

  // Website Settings (Dynamic Content)
  getSettings(): WebsiteSettings {
    return readStorage<WebsiteSettings>(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
  },

  saveSettings(settings: WebsiteSettings): void {
    writeStorage(STORAGE_KEYS.SETTINGS, settings);
    this.logAudit(this.getCurrentUser().email, 'SETTINGS_UPDATED', 'Settings', 'global_settings', 'Platform branding, content, and footer updated.');
  },

  // Reset demo data
  resetToDefaults(): void {
    localStorage.removeItem(STORAGE_KEYS.USERS);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    localStorage.removeItem(STORAGE_KEYS.TENANTS);
    localStorage.removeItem(STORAGE_KEYS.ITEMS);
    localStorage.removeItem(STORAGE_KEYS.REPORTS);
    localStorage.removeItem(STORAGE_KEYS.THREADS);
    localStorage.removeItem(STORAGE_KEYS.PLANS);
    localStorage.removeItem(STORAGE_KEYS.SUBSCRIPTIONS);
    localStorage.removeItem(STORAGE_KEYS.AUDIT_LOGS);
    localStorage.removeItem(STORAGE_KEYS.SETTINGS);
    localStorage.removeItem(STORAGE_KEYS.FIRST_RUN);
  }
};
