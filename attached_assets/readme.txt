# Campus Tag — Complete Production-Ready SaaS From Scratch

**App Name:** Campus Tag  
**Tagline:** Scan It to Find It

## CRITICAL RULES
- Build the **entire project from scratch**.
- Completely destroy and remove any previous code, Firebase, Clerk, or old architecture.
- Do not reuse any old files.
- Create a clean, modern, scalable, secure, and production-ready full-stack SaaS application in one go.
- Everything must be functional, not just UI mockups.
- No hardcoded fake data, fake payments, or fake admin accounts.

## Exact Technology Stack (Do Not Change)

**Frontend:**
- Next.js (App Router)
- React
- Bootstrap 5
- Clean university-friendly blue professional theme
- Fully responsive (mobile-first)

**Backend:**
- Python 3.11+
- Django (latest stable)
- Django REST Framework
- JWT Authentication (SimpleJWT)

**Database:**
- PostgreSQL

**Additional Required Libraries:**
- django-cors-headers
- pillow (for images)
- qrcode + pillow (QR generation)
- leaflet / react-leaflet (maps)
- celery + redis (for background tasks & emails) — optional but recommended structure
- python-dotenv
- django-filter
- drf-spectacular (API documentation)

---

## Complete Feature Set (Must All Be Implemented)

### 1. Public Website
- Modern Homepage
- How It Works
- Features
- Pricing (dynamic from database)
- Contact / Support
- Privacy Policy, Terms of Service, Refund & Cancellation Policy
- Professional responsive Footer (logo, tagline, links, social icons, copyright)
- Super Admin can edit footer content, social links, and contact info from dashboard

### 2. Super Admin Panel (Platform Owner Only)
- Completely separate and secure admin dashboard
- Real statistics from database (users, items, QR codes, reports, active/expired subscriptions, revenue)
- User Management (search, view, suspend, reactivate, disable)
- Customer & Item Management
- Subscription Plan Management (create, edit, enable/disable plans, prices, limits, trial days)
- Website Settings (branding, footer, social links, maintenance mode)
- Reports & Analytics + CSV export
- Full Audit Logs (admin actions)
- Secure first Super Admin creation process (management command or one-time setup)
- No public registration can create admin

### 3. Multi-Tenant Customer Dashboard
- Each customer has completely isolated private workspace
- Dashboard sections: Overview, My Items, Add Item, QR Codes, Finder Reports, Messages, Lost Mode, Recovered Items, Subscription & Billing, Organization Settings, Profile & Security, Help
- Full Item CRUD + photo upload
- Lost Mode toggle + Recovered status
- Unique stable QR code for every item
- Download QR as PNG and SVG
- Print-ready QR labels
- Tenant isolation enforced at database and API level

### 4. Paid Subscription System
- Configurable plans: 7-Day, Monthly, Yearly (admin can create more)
- Prices, features, product limits, trial days fully configurable by Super Admin
- Secure payment architecture ready for real provider (webhook verification structure)
- Subscription activation only after verified payment or admin action
- Proper expiry handling
- Public QR finder pages remain working after subscription expires
- Clear renewal and cancellation flow

### 5. Privacy-First Public Finder Page (Most Important)
- QR scan opens fast mobile-first page: `/f/{public_item_id}`
- Show only safe public info (name, photo, short description, category, Lost status)
- Finder can submit message + optional location + optional photo evidence
- Finder never sees owner name, email, phone, or any private data
- No login required for finder
- Rate limiting and spam protection

### 6. Location System
- Leaflet + OpenStreetMap (no paid Google Maps key required)
- Finder can drop pin or type address (both optional)
- Owner sees Last Reported Location with timestamp and source (Owner / Finder)
- Never claim live tracking

### 7. QR Code System
- Unique, unguessable public_item_id
- Stable QR that never changes when item is edited
- Continues working after subscription expires
- Clear states for recovered / disabled items

### 8. Notifications & Messaging
- In-app notifications
- Email notifications to owner (structure ready)
- Read / Unread status
- Secure message threads

### 9. Security & Production Requirements
- Proper role-based permissions (Super Admin / Customer)
- Tenant isolation in every query
- JWT authentication
- Rate limiting on public finder endpoints
- Input validation and sanitization
- Secure file upload (images)
- CORS properly configured
- Environment variables for all secrets
- `.env.example` with all required variables
- No secrets in frontend code
- Security headers
- Proper error handling and logging

### 10. Clean Architecture Requirements
- Clear separation: frontend / backend
- Proper Django apps structure
- Clean Next.js folder structure (app router)
- Reusable components
- Meaningful comments in important code
- Scalable database design with proper indexes
- Efficient queries (select_related / prefetch_related)
- Pagination on all list endpoints
- Loading, empty, error, and success states everywhere

---

## README.md Must Be Extremely Detailed and Step-by-Step

Include these exact sections:

1. Project Overview
2. Features List
3. Tech Stack
4. Project Structure (explain every important folder)
5. Prerequisites
6. PostgreSQL Setup
7. Backend Setup (step-by-step)
8. Frontend Setup (step-by-step)
9. Environment Variables (complete .env.example)
10. Database Migrations & Super Admin Creation
11. How to Run Locally
12. Testing Checklist
13. Deployment Guide (production ready)
14. Security Notes
15. Troubleshooting
16. Future Improvements

---

## Final Deliverables

- Complete clean source code (Frontend + Backend)
- PostgreSQL models + migrations
- Super Admin + Customer dashboards
- Public website + Privacy-first Finder pages
- QR system + Maps + Subscriptions
- Full security and tenant isolation
- Detailed production-ready README.md
- `.env.example`
- Clean architecture + comments
- Ready to open in VS Code / Cursor and run

Start by creating the complete project structure first.  
Then implement feature by feature in a clean and logical order.  
Make everything production-ready, scalable, secure, and neat.