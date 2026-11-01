# Campus Tag — Scan It to Find It

> **Campus Tag** is a production-ready, privacy-first SaaS platform designed specifically for university campuses, research laboratories, and student communities to protect and recover laptops, bicycles, calculators, access badges, and research equipment.

Finders scan durable physical QR tags to open an anonymous mobile recovery relay (`/f/{public_id}`). **Zero personal phone numbers, emails, student IDs, or dorm addresses are ever exposed.**

---

## Table of Contents
1. [Project Overview](#1-project-overview)
2. [Features List](#2-features-list)
3. [Tech Stack](#3-tech-stack)
4. [Project Structure](#4-project-structure)
5. [Prerequisites](#5-prerequisites)
6. [PostgreSQL Setup](#6-postgresql-setup)
7. [Backend Setup (Step-by-Step)](#7-backend-setup-step-by-step)
8. [Frontend Setup (Step-by-Step)](#8-frontend-setup-step-by-step)
9. [Environment Variables](#9-environment-variables)
10. [Database Migrations & Super Admin Creation](#10-database-migrations--super-admin-creation)
11. [How to Run Locally](#11-how-to-run-locally)
12. [Testing Checklist](#12-testing-checklist)
13. [Deployment Guide (Production Ready)](#13-deployment-guide-production-ready)
14. [Security Notes](#14-security-notes)
15. [Troubleshooting](#15-troubleshooting)
16. [Future Improvements](#16-future-improvements)

---

## 1. Project Overview
Every semester, thousands of expensive laptops, graphing calculators, campus keycards, and lab instruments are misplaced in study lounges, lecture halls, and dining commons. Traditional labels with handwritten phone numbers subject students to doxxing, harassment, and scam attempts.

**Campus Tag** solves this with an unguessable UUID-based QR tag system:
- **No Login Required for Finders:** Anyone scanning with an iPhone or Android phone camera is immediately directed to `/f/{public_id}` in under 1 second.
- **Strict Privacy Shield:** Only safe item details (title, category, photo, optional reward) are visible.
- **Anonymous Relay:** Finders can send a safe handover note, drop a pin on an OpenStreetMap Leaflet map, and attach evidence photos without exchanging personal contact details.
- **Multi-Tenant Architecture:** Built from the ground up for university department isolation (bio labs, athletics, computer science cohorts, student councils).
- **Persistent Tags:** Even if a customer's paid subscription lapses, public QR scan pages **remain active forever**.

---

## 2. Features List

### Public Website
- Modern university-themed blue landing page with hero, live scanner interactive simulator, and institutional trust metrics.
- 4-Step interactive recovery workflow breakdown.
- **Real-World Campus Recovery Scenarios:** Interactive case studies detailing laptop retrieval in libraries, TI graphing calculators in lecture auditoriums, commuter bikes at dorms, and lab coolers in research transit.
- **Interactive OpenStreetMap Leaflet Map:** Completely free Google Maps alternative with place search suggestions, real device GPS ("Use Current Location"), draggable pin dropping, and reverse geocoding with coordinates readout.
- Dynamic subscription pricing grid pulled directly from the database.
- **Interactive Campus FAQ Accordion:** Filterable by Privacy, Equipment, Campus Security, and Pricing.
- **Future Use & Long-Term Campus Benefits Section:** Located directly above the footer, detailing next-generation NFC dual-protocol badges, Campus Police API dispatch webhooks, smart parcel locker integration, AI visual match OCR, and inter-campus student federation.
- Campus support & inquiry form with category selection and ticket confirmation.
- Transparent legal modals: Privacy Policy (GDPR/FERPA), Terms of Service, and Refund & Cancellation Policy.
- Super Admin configurable footer, branding, tagline, contact info, social links, and Future Use section.

### Multi-Tenant Customer Portal
- Isolated tenant workspaces with role-based access.
- **Protected Items Inventory:** Full CRUD, photo upload preview, serial number indexing, custom reward notes.
- **Lost Mode Emergency Broadcast:** 1-click toggle that turns public scan pages into urgent high-visibility alert banners.
- **QR Code Asset Center:** Download standalone PNGs and vector SVGs for laser etching; print-ready Avery sticker sheet generator (2"×1.2", 1"×1", and 3"×2" badge sizes).
- **Finder Reports Inbox:** View incoming reports with timestamps, messages, coordinates, and photo evidence.
- **Anonymous Two-Way Chat:** Communicate with finders safely through our real-time masked relay.
- **Recovered Items Archive:** One-click recovery confirmation and item lifecycle tracking.
- **Billing & Quota Management:** Live item quota usage bars, plan switcher, and renewal management.

### Super Admin Platform Console
- Platform-wide executive KPI metrics: total registered accounts, items, total QR scans, active lost items, ARR revenue calculation.
- **User Management:** Search, view tenant bindings, suspend, or reactivate accounts.
- **Global Item Oversight:** Cross-tenant item inspection with direct finder view shortcuts.
- **Subscription Plan Studio:** Create, edit, enable/disable plans, adjust pricing, item limits, and trial days.
- **Platform Settings & Footer Editor:** Real-time updates to site branding, support hotline, and announcement banners.
- **Security Audit Logs:** Chronological event logs with actor emails, action types, target IDs, details, and IP addresses.
- **One-Click CSV Exports:** Direct downloads of Global Items CSV and Finder Reports CSV.

### Privacy-First Public Finder Page (`/f/{public_id}`)
- Mobile-optimized, ultra-fast scanning target.
- Point-in-time Leaflet + OpenStreetMap pin drop and GPS locator.
- Optional evidence photo attachment.
- Automatic dispatch to owner's dashboard.

---

## 3. Tech Stack

| Component | Technology | Rationale |
| :--- | :--- | :--- |
| **Frontend** | React 19 / Next.js 14 App Router, Bootstrap 5 / Tailwind CSS | Fast rendering, responsive mobile-first UI, university blue theme |
| **Backend** | Python 3.11+, Django 5, Django REST Framework | Mature ORM, enterprise security, rapid API development |
| **Database** | PostgreSQL 16 | ACID compliance, UUID support, relational multi-tenant isolation |
| **Auth** | SimpleJWT (JSON Web Tokens) | Stateless, secure access & refresh token rotation |
| **QR Generation** | `qrcode` + `Pillow` (Backend) & `qrcode` (Browser) | Native SVG & PNG generation without external API dependencies |
| **Maps** | Leaflet + OpenStreetMap | Free, privacy-preserving, zero Google Maps API costs |
| **Background Tasks** | Celery + Redis | Asynchronous email notifications and report queuing |
| **Documentation** | drf-spectacular (OpenAPI 3.0 / Swagger) | Auto-generated interactive API docs |

---

## 4. Project Structure

```
campus-tag/
├── backend/                         # Django REST Framework Backend
│   ├── campus_tag/                  # Project configuration root
│   │   ├── __init__.py
│   │   ├── settings.py              # PostgreSQL, JWT, CORS, Celery settings
│   │   ├── urls.py                  # API routes & Swagger documentation
│   │   ├── wsgi.py
│   │   ├── asgi.py
│   │   └── permissions.py           # IsSuperAdminUser & IsTenantMember
│   ├── apps/
│   │   ├── accounts/                # CustomUser & Tenant models, registration
│   │   │   ├── models.py            # User (roles) and Tenant (institutions)
│   │   │   ├── serializers.py
│   │   │   ├── views.py
│   │   │   ├── urls.py
│   │   │   └── management/commands/create_super_admin.py
│   │   ├── items/                   # Items CRUD, QR generator, photo upload
│   │   │   ├── models.py            # Item with automatic QR generation
│   │   │   ├── serializers.py       # ItemSerializer & PublicItemSerializer
│   │   │   ├── views.py             # Tenant query isolation enforcement
│   │   │   └── urls.py
│   │   ├── finder/                  # Public QR scan endpoints & anonymous relay
│   │   │   ├── models.py            # FinderReport & FinderMessage
│   │   │   ├── serializers.py
│   │   │   ├── views.py             # /api/v1/f/{public_id}/ rate-limited views
│   │   │   └── urls.py
│   │   ├── subscriptions/           # Plans, Quotas, Billing
│   │   │   ├── models.py            # Plan & Subscription models
│   │   │   ├── serializers.py
│   │   │   ├── views.py
│   │   │   └── urls.py
│   │   └── audit/                   # Security audit logs
│   │       ├── models.py            # AuditLog model
│   │       ├── views.py
│   │       └── urls.py
│   ├── Dockerfile
│   ├── manage.py
│   └── requirements.txt
│
├── frontend_nextjs/                 # Next.js 14 App Router Standalone Frontend
│   ├── app/
│   │   ├── layout.tsx               # Bootstrap 5 & Leaflet CSS layout
│   │   ├── page.tsx                 # Public Landing Page
│   │   └── f/[public_id]/page.tsx   # Public Mobile Finder Page
│   └── package.json
│
├── src/                             # Live Interactive AI Studio Applet
│   ├── components/
│   │   ├── Navbar.tsx               # View switcher & role badges
│   │   ├── Footer.tsx               # Dynamic configurable footer
│   │   ├── LeafletMap.tsx           # Interactive OpenStreetMap component
│   │   ├── PrintableLabels.tsx      # Sheet print generator
│   │   └── ItemModal.tsx            # Add/edit modal with image upload
│   ├── views/
│   │   ├── PublicWebsite.tsx        # Homepage, pricing, policies, contact
│   │   ├── CustomerDashboard.tsx    # 11-feature customer portal
│   │   ├── SuperAdminDashboard.tsx  # Platform owner console
│   │   ├── PublicFinderPage.tsx     # Mobile anonymous scan page
│   │   └── AuthModal.tsx            # Login, register, role switcher
│   ├── services/qr.ts               # Standalone QR PNG & SVG engine
│   ├── mock/storage.ts              # Persistent store & PostgreSQL simulation
│   ├── types/index.ts               # TypeScript domain interfaces
│   ├── App.tsx                      # Main router & state coordinator
│   └── index.css                    # Tailwind CSS v4 styling & print styles
│
├── docker-compose.yml               # Multi-container orchestration (DB + Redis + API)
├── .env.example                     # Environment configuration reference
├── metadata.json                    # Platform metadata
└── README.md                        # Master documentation
```

---

## 5. Prerequisites
- **Node.js:** v18.0.0 or higher
- **Python:** v3.11 or higher
- **PostgreSQL:** v15 or v16
- **Redis:** v7 (for background task queues)
- **Docker & Docker Compose:** (Recommended for single-command launch)

---

## 6. PostgreSQL Setup

### Option A: Local Native PostgreSQL
1. Start PostgreSQL server:
   ```bash
   sudo systemctl start postgresql
   ```
2. Log into the `psql` console as superuser:
   ```bash
   sudo -u postgres psql
   ```
3. Create the database and dedicated user:
   ```sql
   CREATE DATABASE campustag_db;
   CREATE USER campustag_user WITH ENCRYPTED PASSWORD 'campustag_secure_password';
   GRANT ALL PRIVILEGES ON DATABASE campustag_db TO campustag_user;
   ALTER DATABASE campustag_db OWNER TO campustag_user;
   \q
   ```

### Option B: Dockerized PostgreSQL
Run a standalone container in one step:
```bash
docker run --name campustag_postgres \
  -e POSTGRES_DB=campustag_db \
  -e POSTGRES_USER=campustag_user \
  -e POSTGRES_PASSWORD=campustag_secure_password \
  -p 5432:5432 -d postgres:16-alpine
```

---

## 7. Backend Setup (Step-by-Step)

1. **Navigate to the backend directory:**
   ```bash
   cd backend
   ```

2. **Create and activate a Python virtual environment:**
   ```bash
   python3.11 -m venv venv
   source venv/bin/activate    # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies:**
   ```bash
   pip install --upgrade pip
   pip install -r requirements.txt
   ```

4. **Configure environment:**
   ```bash
   cp ../.env.example .env
   ```

---

## 8. Frontend Setup (Step-by-Step)

1. **Install root dependencies:**
   ```bash
   npm install
   ```

2. **Start the local interactive development server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) to view the running Campus Tag platform.

---

## 9. Environment Variables

Create `.env` using this reference:

```ini
# Django Settings
DJANGO_SECRET_KEY="production-change-this-to-a-secure-50-char-random-string"
DJANGO_DEBUG="True"
DJANGO_ALLOWED_HOSTS="localhost,127.0.0.1,0.0.0.0"

# PostgreSQL Database
DB_NAME="campustag_db"
DB_USER="campustag_user"
DB_PASSWORD="campustag_secure_password"
DB_HOST="localhost"
DB_PORT="5432"

# JWT Expiry
JWT_ACCESS_MINUTES=60
JWT_REFRESH_DAYS=7

# Redis & Celery
CELERY_BROKER_URL="redis://localhost:6379/0"
CELERY_RESULT_BACKEND="redis://localhost:6379/0"

# CORS
CORS_ALLOWED_ORIGINS="http://localhost:3000,http://127.0.0.1:3000"

# Initial Super Admin Creation
SUPERADMIN_EMAIL="admin@campustag.edu"
SUPERADMIN_USERNAME="superadmin"
SUPERADMIN_PASSWORD="CampusTag2026!SecureAdmin"
```

---

## 10. Database Migrations & Super Admin Creation

1. **Generate migrations:**
   ```bash
   python manage.py makemigrations accounts items finder subscriptions audit
   ```

2. **Apply migrations to PostgreSQL:**
   ```bash
   python manage.py migrate
   ```

3. **Create the Initial Super Admin:**
   Run our secure dedicated management command (no public registration can create an admin):
   ```bash
   python manage.py create_super_admin \
     --email="admin@campustag.edu" \
     --username="superadmin" \
     --password="CampusTag2026!SecureAdmin" \
     --name="System Administrator"
   ```

---

## 11. How to Run Locally

### All-in-One Docker Compose (Recommended)
```bash
docker-compose up --build
```
This automatically boots PostgreSQL, Redis, and Django on port `8000`.

### Manual Services Launch
1. **Terminal 1: Redis**
   ```bash
   redis-server
   ```
2. **Terminal 2: Django Backend**
   ```bash
   cd backend && source venv/bin/activate
   python manage.py runserver 0.0.0.0:8000
   ```
3. **Terminal 3: Frontend App**
   ```bash
   npm run dev
   ```

---

## 12. Testing Checklist

- [x] **Public Landing Page:** Loads with hero, tagline "Scan It to Find It", and university theme.
- [x] **Finder Scan Route:** Navigating to `?mode=finder&public_id=cpt-8f92-a1b4` or `/f/cpt-8f92-a1b4` renders zero owner PII.
- [x] **Lost Mode Banner:** Toggling Lost Mode displays urgent warning and recovery reward.
- [x] **Leaflet Map Drop Pin:** Clicking on the map in finder view drops a pin and populates coordinates.
- [x] **Print-Ready Stickers:** Print preview formats Avery stickers with QR codes and campus headers.
- [x] **Multi-Tenant Isolation:** Stanford items are never visible inside MIT workspaces.
- [x] **Super Admin Dashboard:** Executive metrics, user suspension, and plan editing function live.
- [x] **CSV Exports:** Items and finder reports export as clean CSV files.
- [x] **Audit Logging:** Admin actions and lost mode toggles are logged to the audit ledger.

---

## 13. Deployment Guide (Production Ready)

### Production Docker Container
```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
RUN python manage.py collectstatic --noinput
CMD ["gunicorn", "campus_tag.wsgi:application", "--bind", "0.0.0.0:8000", "--workers", "3"]
```

### NGINX Reverse Proxy Configuration
```nginx
server {
    listen 80;
    server_name campustag.edu api.campustag.edu;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.campustag.edu;

    ssl_certificate /etc/letsencrypt/live/campustag.edu/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/campustag.edu/privkey.pem;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /static/ {
        alias /var/www/campus_tag/staticfiles/;
    }

    location /media/ {
        alias /var/www/campus_tag/media/;
    }
}
```

---

## 14. Security Notes
1. **Zero PII Exposure Guarantee:** Public endpoints only deserialize `PublicItemSerializer`, which filters out email, phone, and user names.
2. **Unguessable IDs:** `public_id` uses cryptographically random hex segments (e.g. `cpt-8f92-a1b4`), preventing sequential scraping attacks.
3. **Database-Level Tenant Query Isolation:** All queries filter on `request.user.tenant`.
4. **Rate Limiting:** Finder endpoints enforce 10 requests per minute per IP to mitigate spam.
5. **No Secrets in Client:** All credentials, database passwords, and JWT secret keys are stored in backend environment variables.

---

## 15. Troubleshooting

- **Leaflet map gray / partially loaded tiles:** Call `map.invalidateSize()` after modal transitions or container resizing.
- **PostgreSQL Connection Refused:** Ensure PostgreSQL is active on port 5432 and `pg_hba.conf` allows local md5/scram connections.
- **CORS blocked on API requests:** Verify `CORS_ALLOWED_ORIGINS` in `.env` includes your client's exact origin with protocol.
- **Images fail to upload:** Ensure `media/` directory has write permissions (`chmod -R 755 media`).

---

## 16. Future Improvements
- Native NFC tap integration alongside QR codes for campus ID badges.
- Webhook dispatch into university campus police dispatch software.
- Multi-language support (Spanish, Mandarin, Arabic) for international student cohorts.
- Apple Wallet and Google Wallet digital Campus Tag cards.

---

*Campus Tag Technologies Inc. · Built for safe, modern campus life.*

---

## Windows (PowerShell 5.1) Quick Notes

For local development on Windows, use the following equivalents:

| Unix/macOS | Windows PowerShell/cmd | Notes |
| :--- | :--- | :--- |
| source venv/bin/activate | .\venv\Scripts\Activate.ps1 (PowerShell) or env\Scripts\activate (cmd) | If script execution is blocked: Set-ExecutionPolicy -Scope CurrentUser RemoteSigned |
| cp .env.example .env | Copy-Item .env.example .env (PowerShell) or copy .env.example .env (cmd) | Same as Unix |
| m -rf dist | Remove-Item -Recurse -Force dist -ErrorAction SilentlyContinue | Or use 
pm run clean (now cross-platform) |
| export VAR=value | $env:VAR="value" | Session-only in PowerShell |
| cat file.txt | Get-Content file.txt | Also 	ype file.txt in cmd |
| grep "text" file.txt | Select-String -Path file.txt -Pattern "text" | Or indstr "text" file.txt in cmd |
| 	ail -n 20 file.txt | Get-Content file.txt -Tail 20 | PowerShell has built-in -Tail |
| head -n 20 file.txt | Get-Content file.txt -Head 20 | PowerShell 3+ has -Head/-Tail |
| chmod +x script.sh | Not applicable on NTFS | Use file permissions via Properties/Security if needed |
| sudo <cmd> | Run PowerShell as Administrator | Windows uses UAC elevation |
| systemctl start service | Use services.msc or Start-Service | Manage via Windows Services |

**PostgreSQL/Redis on Windows:**
- PostgreSQL: Install via official installer or use Windows Services. No need for sudo systemctl.
- Redis: Use [Memurai](https://www.memurai.com/) or run Redis in WSL (wsl redis-server).
- Media uploads: chmod is usually not required on NTFS; ensure the media/ directory is writable.
