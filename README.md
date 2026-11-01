# Campus Tag — Production-Ready SaaS

**App Name:** Campus Tag  
**Tagline:** Scan It to Find It  
**Version:** 2.0.0

---

## 1. Project Overview

Campus Tag is a full-stack, multi-tenant SaaS application for university lost-and-found management. Students and staff register their belongings with unique QR codes. When someone finds an item, they scan the QR code to reach a privacy-first public page where they can send a message (with optional location and photo evidence) to the owner — without ever seeing the owner's private contact details.

### Key Capabilities

- **Real Interactive Maps** — Leaflet + OpenStreetMap with location search, "Use Current Location" (GPS), drop pin, smooth zoom/drag/marker
- **First Super Admin Flow** — On first run, system requires Super Admin registration before any other access
- **Dynamic Content** — Super Admin can edit site content (name, footer, settings) from dashboard without code changes
- **Strict Role-Based Access** — Super Admin (full control), Customer (own data only), Finder (no login, public form only)
- **Fully Responsive** — Mobile, tablet, and desktop optimized with professional university-style design
- **Complete CRUD** — Users, Items, Organizations, Plans, Subscriptions, Reports, Site Content
- **Privacy-First Finder Page** — No login required, finder never sees owner private data

---

## 2. Tech Stack

| Layer | Technology | Built-in / External |
|-------|-----------|---------------------|
| Frontend | Next.js 14 (App Router), React 18, Bootstrap 5 | External (npm) |
| Maps | Leaflet + react-leaflet + OpenStreetMap (Nominatim) | External (npm) |
| Backend | Python 3.11+, Django 5.1, Django REST Framework | External (pip) |
| Auth | JWT (SimpleJWT) | External (pip) |
| Database | PostgreSQL | External |
| CORS | django-cors-headers | External (pip) |
| Filtering | django-filter | External (pip) |
| Images | Pillow | External (pip) |
| QR Codes | qrcode + pillow | External (pip) |
| Env | python-dotenv | External (pip) |
| Icons | material-symbols-outlined (Google Fonts) | CDN |

---

## 3. Project Structure

```
campus-tag/
├── backend/
│   ├── .env                      # Backend environment variables
│   ├── manage.py                 # Django CLI entrypoint
│   ├── requirements.txt          # Python dependencies
│   ├── backend/                  # Django project config
│   │   ├── settings.py           # Django settings
│   │   └── urls.py               # Root URL config
│   ├── core/                     # Auth, users, organizations, site content
│   │   ├── models.py             # User, Organization, SiteContent
│   │   ├── serializers.py        # All DRF serializers
│   │   ├── urls.py               # /api/auth/* routes
│   │   ├── views.py              # Auth views, SuperAdmin viewsets, FirstAdminCheck
│   │   └── managers.py           # Custom UserManager
│   ├── customers/                # Customer profiles
│   ├── items/                    # Items, categories, photos (with lat/lng)
│   ├── subscriptions/            # Plans, subscriptions
│   ├── finder/                   # Public finder page + reports (with lat/lng)
│   ├── notifications/            # In-app notifications
│   └── media/                    # User uploads (runtime)
├── frontend/
│   ├── .env.example              # Frontend environment variables template
│   ├── package.json              # Node dependencies
│   ├── next.config.js            # Next.js config
│   ├── tsconfig.json             # TypeScript config
│   ├── middleware.ts             # Next.js middleware for route protection
│   ├── app/                      # Next.js App Router
│   │   ├── layout.tsx            # Root layout (Bootstrap CSS, fonts)
│   │   ├── page.tsx              # Homepage (checks first admin setup)
│   │   ├── (public)/             # Public website routes
│   │   ├── auth/                 # Auth pages (login, register)
│   │   ├── first-admin/          # First Super Admin registration
│   │   ├── (customer)/           # Customer dashboard (role-guarded)
│   │   ├── (admin)/              # Super admin dashboard (role-guarded)
│   │   └── f/[public_id]/        # Public finder page with map
│   ├── components/
│   │   ├── MapComponent.tsx      # Leaflet map (search, current location, pin)
│   │   ├── MapComponentImpl.tsx  # Leaflet implementation (client-only)
│   │   ├── RoleGuard.tsx         # Role-based access control component
│   │   ├── Navbar.tsx            # Top navigation
│   │   ├── Footer.tsx            # Site footer
│   │   ├── PublicLayout.tsx      # Public page layout
│   │   ├── CustomerLayout.tsx    # Customer dashboard layout
│   │   └── AdminLayout.tsx       # Super admin layout (role-guarded)
│   └── lib/
│       └── api.ts                # Axios client + auth helpers
├── README.md                     # This file
└── .gitignore
```

---

## 4. System Design Flow

### Authentication Flow
1. **First Run**: If no Super Admin exists, accessing any page redirects to `/first-admin` for Super Admin registration
2. **Customer Registration**: Public `/auth/register` creates customer accounts only (role=customer)
3. **Super Admin Registration**: `/auth/first-super-admin-register/` creates the platform owner (role=super_admin)
4. **Login**: `/auth/login/` returns JWT access + refresh tokens
5. **Session**: Tokens stored in HTTP-only cookies via js-cookie
6. **Logout**: Clears cookies and blacklists refresh token

### Role-Based Access Control
| Role | Can Access | Cannot Access |
|------|-----------|---------------|
| Super Admin | All routes, all orgs, all users, site content CRUD | — |
| Customer | Own dashboard, own items, own reports, own subscription | `/admin/*`, other orgs' data |
| Finder (public) | `/f/{public_item_id}` only | All authenticated routes |

### Map System
- **Library**: Leaflet + OpenStreetMap tiles (no API key required)
- **Location Search**: Nominatim API (type any place name)
- **Current Location**: Browser Geolocation API (GPS)
- **Drop Pin**: Click anywhere on map to set coordinates
- **Integration**: Item creation form and finder report form both include map location picker

### Dynamic Content (SiteContent)
Super Admin can manage website content from `/admin/site-content`:
- Site name, footer text, site URL, maintenance mode
- Changes take effect immediately without code changes
- Content is stored in database and served via API

---

## 5. Prerequisites

- **Python 3.11+** — https://www.python.org/downloads/
- **pip** (comes with Python)
- **Node.js 18+** and **npm** — https://nodejs.org/
- **PostgreSQL 14+** — https://www.postgresql.org/download/
- **Git** — https://git-scm.com/

---

## 6. PostgreSQL Setup

```bash
# Log into PostgreSQL
sudo -u postgres psql

# Create database
CREATE DATABASE campus_tag;

# Create user
CREATE USER campus_tag_user WITH PASSWORD 'change_me_secure';

# Grant privileges
GRANT ALL PRIVILEGES ON DATABASE campus_tag TO campus_tag_user;

\q
```

---

## 7. Backend Setup

### 7.1 Create virtual environment and install dependencies

```bash
cd backend
python -m venv venv
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

pip install -r requirements.txt
```

### 7.2 Configure environment variables

```bash
cp .env.example .env
# Edit .env with your database, JWT secret, and other settings
```

### 7.3 Run migrations

```bash
python manage.py makemigrations
python manage.py migrate
```

### 7.4 Create the first Super Admin

Two options:

**Option A: Via CLI**
```bash
python manage.py createsuperuser \
  --email admin@campustag.local \
  --password CampusTag123!
```

**Option B: Via Web UI**
1. Start the backend: `python manage.py runserver 8000`
2. Visit `http://localhost:8000/` — you'll be redirected to `/first-admin`
3. Complete the Super Admin registration form

### 7.5 Run the backend

```bash
python manage.py runserver 8000
```

API available at `http://localhost:8000/api/`

---

## 8. Frontend Setup

### 8.1 Install dependencies

```bash
cd frontend
npm install
```

### 8.2 Configure environment variables

```bash
cp .env.example .env.local
# Edit .env.local with NEXT_PUBLIC_API_URL pointing to your backend
```

### 8.3 Run the frontend

```bash
npm run dev
```

Frontend available at `http://localhost:3000`

---

## 9. Environment Variables

### Backend (`backend/.env`)

```ini
# Django
SECRET_KEY=change-me-in-production-with-a-long-random-string
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Database (PostgreSQL)
DB_NAME=campus_tag
DB_USER=campus_tag_user
DB_PASSWORD=change_me_secure
DB_HOST=localhost
DB_PORT=5432

# JWT
JWT_SECRET_KEY=change-me-jwt-secret
JWT_ACCESS_TOKEN_LIFETIME_MINUTES=60
JWT_REFRESH_TOKEN_LIFETIME_DAYS=7

# CORS
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000

# Redis / Celery (optional)
REDIS_URL=redis://localhost:6379/0

# Email
EMAIL_BACKEND=django.core.mail.backends.console.EmailBackend
DEFAULT_FROM_EMAIL=noreply@campustag.local

# Site
SITE_NAME=Campus Tag
SITE_URL=http://localhost:3000
```

### Frontend (`frontend/.env.local`)

```ini
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_SITE_NAME=Campus Tag
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

---

## 10. How to Run Locally

### Terminal 1 — Backend
```bash
cd backend
venv\Scripts\activate        # Windows
# source venv/bin/activate   # macOS/Linux
python manage.py runserver 8000
```

### Terminal 2 — Frontend
```bash
cd frontend
npm run dev
```

### Access URLs

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8000/api/ |
| Django Admin | http://localhost:8000/admin/ |

### First-Time Flow

1. Backend and frontend both running
2. Visit `http://localhost:3000/` — redirected to `/first-admin` (no super admin yet)
3. Register Super Admin account
4. Redirect to `/admin` — Super Admin dashboard
5. Create organizations, plans, users from admin panel
6. Customers register at `/auth/register`
7. Customers add items with map location at `/dashboard/items/add`
8. Finders scan QR at `/f/{public_item_id}` — no login required

---

## 11. Page-by-Page Logic

| Page | Path | Purpose |
|------|------|---------|
| Home | `/` | Landing page, redirects to `/first-admin` if no super admin |
| First Admin Setup | `/first-admin` | One-time Super Admin registration |
| Login | `/auth/login` | Customer/Super Admin login |
| Register | `/auth/register` | Customer registration (no super admin) |
| Customer Dashboard | `/dashboard` | Item stats, quick actions |
| My Items | `/dashboard/items` | List all items with status |
| Add Item | `/dashboard/items/add` | Create item with map location |
| Item Detail | `/dashboard/items/[id]` | View item, toggle lost mode, mark recovered |
| QR Codes | `/dashboard/qr-codes` | View/print QR codes for items |
| Finder Reports | `/dashboard/reports` | View messages from finders |
| Subscription | `/dashboard/subscription` | View current plan and available plans |
| Settings | `/dashboard/settings` | Organization settings |
| Profile | `/dashboard/profile` | User profile |
| Admin Overview | `/admin` | Super Admin stats and quick actions |
| Users | `/admin/users` | Manage users (suspend/reactivate/delete) |
| Organizations | `/admin/organizations` | Manage organizations |
| Website Content | `/admin/site-content` | Edit dynamic site content |
| Subscriptions | `/admin/subscriptions` | Manage subscription plans |
| Reports | `/admin/reports` | View all finder reports |
| Audit Logs | `/admin/audit` | Audit trail |
| Settings | `/admin/settings` | Website settings |
| Finder Page | `/f/[public_id]` | Public finder page with map (no login) |

---

## 12. Authentication & Roles

### Roles
- **super_admin**: Platform owner. Full CRUD on all entities across all organizations. Can manage users, organizations, plans, site content.
- **customer**: Belongs to one organization. Can only CRUD their own items, view their reports, manage subscription.
- **finder (public)**: No authentication. Can only submit reports on public finder pages.

### Route Protection
- **Next.js Middleware** (`middleware.ts`): Redirects unauthenticated users to `/auth/login` for protected routes
- **RoleGuard Component**: Client-side role checking via `/auth/me/` API
- **AdminLayout**: Wrapped with `SuperAdminGuard` — only `super_admin` role
- **DashboardLayout**: Wrapped with `CustomerGuard` — `customer` or `super_admin` role
- **First Admin**: Redirects to `/admin` if super admin already exists

---

## 13. How the Map System Works

### Components
- **`MapComponent`**: Leaflet map with tile layer, marker, popup, search box, current location button
- **`MapComponentImpl`**: Client-only implementation (avoids SSR `window` errors)
- **`LocationPicker`**: Wrapper that returns lat/lng + address from map interaction

### Features
1. **Location Search**: Type any place name, uses Nominatim OpenStreetMap API
2. **Use Current Location**: Browser Geolocation API, centers map on GPS coordinates
3. **Drop Pin**: Click anywhere on map to set marker and capture coordinates
4. **Smooth Zoom/Drag**: Standard Leaflet map interactions

### Integration Points
- Item creation form (`/dashboard/items/add`) — set last reported location
- Item detail page (`/dashboard/items/[id]`) — view last reported location on map
- Finder page (`/f/[public_id]`) — finder drops pin where item was found

---

## 14. How the Finder Public Page Works

1. Item owner generates QR code from dashboard
2. QR encodes URL: `https://your-domain.com/f/{public_item_id}`
3. Finder scans QR, opens public page (no login required)
4. Page shows: item name, description, category, photos, lost mode status
5. Finder submits: message, name (optional), contact (optional), location (map pin)
6. Report saved to database, owner notified via dashboard
7. Owner never sees finder's private contact details

---

## 15. Testing Checklist

### First Admin Setup
- [ ] No super admin → accessing `/` redirects to `/first-admin`
- [ ] Super admin registration succeeds
- [ ] After registration → redirects to `/admin`
- [ ] Super admin exists → accessing `/first-admin` redirects to `/admin`

### Authentication
- [ ] Customer registration creates account with `role=customer`
- [ ] Public registration cannot create `super_admin`
- [ ] Customer login returns JWT tokens
- [ ] Super Admin login returns JWT tokens
- [ ] `/auth/me/` returns current user with role
- [ ] Logout clears session

### Role-Based Access
- [ ] Customer cannot access `/admin/*` routes
- [ ] Super Admin can access all routes
- [ ] Customer can only see their own organization's items
- [ ] Finder page works without login

### Maps
- [ ] Map loads on item creation page
- [ ] Location search returns results
- [ ] "My Location" button centers map on GPS
- [ ] Clicking map drops pin and captures coordinates
- [ ] Item detail shows last reported location on map

### Finder Page
- [ ] `/f/{public_item_id}` loads without login
- [ ] Page shows only safe public info (no owner email/phone)
- [ ] Finder can submit message + location + photo
- [ ] Report appears in owner's dashboard

### Dynamic Content
- [ ] Super Admin can edit site name, footer, URL
- [ ] Changes reflect on public pages immediately

---

## 16. Deployment Guide (Production Ready)

### Backend (Django)

1. Set `DEBUG=False` in `.env`
2. Set a strong `SECRET_KEY` and `JWT_SECRET_KEY`
3. Set `ALLOWED_HOSTS` to your production domain(s)
4. Set `CORS_ALLOWED_ORIGINS` to your production frontend URL
5. Configure a real SMTP backend for email
6. Run `python manage.py collectstatic`
7. Use Gunicorn: `gunicorn backend.wsgi:application --bind 0.0.0.0:8000`
8. Set up PostgreSQL with backups
9. Create Super Admin via CLI or web UI

### Frontend (Next.js)

1. Build: `npm run build`
2. Start: `npm run start`
3. Or deploy to Vercel/Netlify with build command `npm run build`

---

## 17. Security Notes

- **Secrets**: All secrets in environment variables, never in code
- **Frontend**: No secrets exposed to browser (`NEXT_PUBLIC_*` only)
- **CORS**: Only allowed origins can make cross-origin requests
- **JWT**: Short-lived access tokens, rotating refresh tokens with blacklisting
- **Tenant Isolation**: Every API query filters by user's organization
- **Public Finder**: No authentication required, returns only sanitized public fields
- **No Placeholder Names**: All example data removed; fields empty until real data entered

---
