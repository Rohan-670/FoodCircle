# Surplus Food Donation & NGO Coordination System

A full-stack, production-style web platform connecting **Food Donors**, **NGOs**, **Volunteers**, and **Administrators** to reduce surplus food waste and coordinate safe, transparent, and real-time food redistribution.

---

## 📑 Table of Contents

- [Project Overview](#-project-overview)
- [Key Features](#-key-features)
- [Technology Stack](#-technology-stack)
- [System Architecture](#-system-architecture)
- [Database Schema Explanation](#-database-schema-explanation)
- [Installation Instructions](#-installation-instructions)
- [Environment Variable Documentation](#-environment-variable-documentation)
- [Database Migration & Admin Seed Instructions](#-database-migration--admin-seed-instructions)
- [Running Tests](#-running-tests)
- [API Endpoint Documentation](#-api-endpoint-documentation)
- [Screenshots](#-screenshots)
- [Deployment Instructions](#-deployment-instructions)

---

## 🌟 Project Overview

Restaurants, caterers, and grocery stores frequently have surplus edible food at the end of service, while community kitchens and shelters face daily shortages. This platform coordinates the entire lifecycle:

1. **Food Donors** publish surplus food batches with quantities, deadlines, storage conditions, allergen notices, packaging details, and a mandatory food safety checklist.
2. **NGOs** browse and filter available donations or review transparent suitability recommendations, then submit requests.
3. **Volunteers** accept delivery tasks, share live GPS locations with explicit consent, and verify physical handoffs using single-use QR tokens.
4. **Administrators** verify NGO and Donor accounts, review reported donations, suspend/reactivate accounts, and audit platform activity.

---

## ✨ Key Features

- **Role-Based Authentication & RBAC**: `DONOR`, `NGO`, `VOLUNTEER`, and `ADMIN` roles with `bcrypt` password hashing, HTTP-only JWT cookies + Bearer token support, and deactivated-account enforcement.
- **Donation Management & Expiry**: Full CRUD for eligible donations, `multer` image upload validation (JPEG/PNG/WebP, max 5 MB), transactional request acceptance (preventing multi-NGO race conditions), and a scheduled background job marking overdue donations `EXPIRED`.
- **Transparent Donor–NGO Matching**: Configurable weighted heuristic scoring (Distance 30%, Category 20%, Quantity 20%, Urgency 15%, NGO Capacity 15%) with plain-language explanations, missing-coordinate fallbacks, and accept/ignore feedback.
- **Volunteer Assignment & Live Tracking**: Atomic volunteer task acceptance, Leaflet + OpenStreetMap visualization, OSRM route & ETA with straight-line fallback, Socket.IO real-time location updates, and single-use 256-bit QR confirmation tokens for pickup and delivery.
- **Food Safety & Governance**: Donor-reported safety checklists, automated safety warnings, non-certifying image disclaimers, donation reporting, verification history, and immutable admin audit logs.
- **Notifications, Dashboards & Impact Analytics**: Persistent PostgreSQL + Socket.IO real-time notifications with user preferences, role-specific dashboards, and database-aggregated impact analytics.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Vite 6, JavaScript (ES6+), CSS3 Variables |
| **Backend** | Node.js, Express.js, Zod, Multer |
| **Database & ORM** | PostgreSQL, Prisma ORM (`v6.19.3`) |
| **Authentication** | JWT (`jsonwebtoken`), `bcryptjs`, `cookie-parser` |
| **Real-Time** | Socket.IO (`socket.io` / `socket.io-client`) |
| **Maps & Routing** | Leaflet, OpenStreetMap, OSRM (configurable) |
| **QR Codes** | `qrcode` (frontend rendering) + `crypto.randomBytes` (backend verification) |

---

## 🏗️ System Architecture

```mermaid
flowchart LR
    Client["React + Vite SPA\n(Leaflet, Socket.IO Client, QRCode)"]
    API["Express.js REST API (/api/v1)\n& Socket.IO Server"]
    Jobs["Scheduled Expiry & Alert Job"]
    DB[("PostgreSQL\n(Prisma ORM)")]
    OSRM["OSRM Routing Provider\n(with Straight-Line Fallback)"]
    Storage["Local Disk Uploads\n(/uploads/donations)"]

    Client <-- "HTTPS / HTTP-Only Cookie + JSON" --> API
    Client <-- "WebSockets (Room Auth)" --> API
    API <--> DB
    API --> Storage
    API --> OSRM
    Jobs <--> DB
```

---

## 🗄️ Database Schema Explanation

Defined in [backend/prisma/schema.prisma](file:///d:/Community_Project/backend/prisma/schema.prisma):

- **`User`**: Core account (`email`, `passwordHash`, `fullName`, `phone`, `role`, `isActive`, `notificationPreferences`). Indexed on `email` and `role`.
- **`DonorProfile`**, **`NGOProfile`**, **`VolunteerProfile`**: 1-to-1 role profiles (`onDelete: Cascade` from `User`). `NGOProfile` and `DonorProfile` track `isVerified`, `verificationStatus`, and `verificationNotes`.
- **`Donation`**: Surplus food batch (`donorId`, `title`, `foodCategory`, `quantity`, `unit`, `preparedAt`, `expiresAt`, `pickupAddress`, `latitude`, `longitude`, `imageUrl`, `packagingInfo`, `allergenInfo`, `storageRequirements`, `safetyChecklist`, `safetyWarnings`, `status`). Indexed on `status` and `expiresAt`.
- **`DonationRequest`**: Links `Donation` and `NGOProfile` (`@@unique([donationId, ngoId])` prevents duplicate requests).
- **`Delivery`**: 1-to-1 with `Donation` (`donationId @unique`), tracks `volunteerId` (`onDelete: SetNull`), `status`, single-use `pickupQrToken`/`deliveryQrToken` + `UsedAt` timestamps, and live location coordinates.
- **`Notification`**: Persistent alerts per `User` indexed on `[userId, isRead]`.
- **`RecommendationFeedback`**, **`VerificationRecord`**, **`DonationReport`**, **`AuditLog`**: Persist recommendation actions, verification history, safety reports, and admin audit trails.

---

## 📦 Installation Instructions

### Prerequisites
- **Node.js** `v18+` (tested on `v24.21.0`)
- **npm** `v9+`
- **PostgreSQL** `v14+`

### Install Dependencies
```bash
git clone <your-repository-url>
cd surplus-food-donation-system
npm run install:all
```

---

## ⚙️ Environment Variable Documentation

### Backend (`backend/.env.example` → `backend/.env`)
| Variable | Description | Example |
| :--- | :--- | :--- |
| `PORT` | Backend HTTP port | `5000` |
| `NODE_ENV` | `development`, `test`, or `production` | `development` |
| `CLIENT_URL` | Allowed CORS origin(s), comma-separated | `http://localhost:5173` |
| `ROUTING_API_URL` | OSRM routing endpoint | `https://router.project-osrm.org/route/v1/driving` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://USER:PASS@localhost:5432/surplus_food_db?schema=public` |
| `JWT_SECRET` | Secret key for signing JWTs (min 8 chars; use 32+ random bytes in prod) | `change_me_in_production` |
| `JWT_EXPIRES_IN` | JWT lifetime | `7d` |
| `ADMIN_EMAIL` | Initial admin email (used only by `seed:admin`) | `admin@surplusfood.local` |
| `ADMIN_PASSWORD` | Initial admin password (used only by `seed:admin`) | `ChangeMeStrongPassword123!` |
| `ADMIN_FULL_NAME` | Initial admin display name | `System Administrator` |

### Frontend (`frontend/.env.example` → `frontend/.env`)
| Variable | Description | Example |
| :--- | :--- | :--- |
| `VITE_API_BASE_URL` | Backend v1 API base URL | `http://localhost:5000/api/v1` |
| `VITE_SOCKET_URL` | Socket.IO server origin | `http://localhost:5000` |

---

## 🛠️ Database Migration & Admin Seed Instructions

1. Ensure PostgreSQL is running and `backend/.env` has a valid `DATABASE_URL`.
2. Run initial migrations and generate the Prisma Client:
   ```bash
   cd backend
   npx prisma migrate dev --name init
   npx prisma generate
   ```
3. Create the initial `ADMIN` account securely using environment variables:
   ```bash
   npm run seed:admin
   ```

---

## 🧪 Running Tests

Run the full backend unit and integration test suite from the project root or `backend/`:
```bash
npm test
# or: npm --prefix backend test
```
Build the frontend production bundle to verify client compilation:
```bash
npm run build:frontend
```
> **Note**: The backend test files in `backend/tests/` use Node's built-in `node:test` runner and stub Prisma methods in-memory so they can execute without a live PostgreSQL server. When deploying or testing against a live database, run `npx prisma migrate deploy` and test `/api/v1/health` to verify PostgreSQL connectivity.

---

## 📡 API Endpoint Documentation

Base URL: `/api/v1`

- **Health**: `GET /health`
- **Auth**:
  - `POST /auth/register` (DONOR, NGO, VOLUNTEER — blocks ADMIN)
  - `POST /auth/login`
  - `POST /auth/logout`
  - `GET /auth/me` (Auth required)
  - `PATCH /auth/me` (Auth required)
- **Donations**:
  - `POST /donations` (`DONOR`, `multipart/form-data` with `image`)
  - `GET /donations/my` (`DONOR`)
  - `PATCH /donations/:id` (`DONOR`, eligible statuses only)
  - `PATCH /donations/:id/cancel` (`DONOR`, eligible statuses only)
  - `PATCH /donations/requests/:requestId` (`DONOR`, `{ action: "ACCEPT" | "REJECT" }`)
  - `GET /donations` (`NGO`, `ADMIN`, query filters: `foodCategory`, `minQuantity`, `location`, `urgency`)
  - `POST /donations/:id/requests` (`NGO`)
  - `POST /donations/:id/report` (`DONOR`, `NGO`, `VOLUNTEER`)
- **Matching & Recommendations**:
  - `GET /recommendations/donations/:donationId/ngos` (`DONOR`)
  - `GET /recommendations/ngos/donations` (`NGO`)
  - `POST /recommendations/actions` (`DONOR`, `NGO`, `{ donationId, ngoId, action: "ACCEPT" | "IGNORE" }`)
- **Deliveries & Tracking**:
  - `POST /deliveries/donations/:donationId/request-volunteer` (`NGO`)
  - `GET /deliveries/available` (`VOLUNTEER`)
  - `GET /deliveries/my` (Authenticated)
  - `POST /deliveries/:deliveryId/accept` (`VOLUNTEER`)
  - `GET /deliveries/:deliveryId` & `GET /deliveries/:deliveryId/route` (Authorized stakeholders)
  - `POST /deliveries/:deliveryId/location` & `POST /deliveries/:deliveryId/location/stop` (`VOLUNTEER`)
  - `POST /deliveries/:deliveryId/confirm-pickup` (`VOLUNTEER`, `{ token }`)
  - `POST /deliveries/:deliveryId/start-transit` (`VOLUNTEER`)
  - `POST /deliveries/:deliveryId/confirm-delivery` (`VOLUNTEER`, `{ token }`)
  - `PATCH /deliveries/:deliveryId/cancel` (`NGO`, `ADMIN`)
- **Notifications, Dashboards & Analytics**:
  - `GET /notifications`, `GET /notifications/unread-count`, `PATCH /notifications/:id/read`, `PATCH /notifications/read-all`, `GET /notifications/preferences`, `PATCH /notifications/preferences`
  - `GET /dashboards/donor`, `GET /dashboards/ngo`, `GET /dashboards/volunteer`
  - `GET /analytics/impact` (Public aggregate metrics)
- **Admin (`ADMIN` only)**:
  - `GET /admin/dashboard`
  - `GET /admin/users`, `PATCH /admin/users/:userId/status`
  - `PATCH /admin/ngos/:ngoId/verify`, `PATCH /admin/donors/:donorId/verify`, `GET /admin/verifications/history`
  - `GET /admin/reports`, `PATCH /admin/reports/:reportId`
  - `GET /admin/donations`, `GET /admin/deliveries`, `GET /admin/audit-logs`

---

## 📸 Screenshots

*(Add screenshots of the running application here once connected to a live PostgreSQL instance in your target environment)*:
- `docs/screenshots/welcome-page.png` — Welcome Page & API Health Status
- `docs/screenshots/donor-dashboard.png` — Donor Donation Creation & Safety Checklist
- `docs/screenshots/ngo-recommendations.png` — Transparent Matching Score Breakdown
- `docs/screenshots/live-delivery-map.png` — Leaflet + OpenStreetMap Live Tracking & QR Handoff
- `docs/screenshots/admin-dashboard.png` — Admin Governance, Verification & Audit Logs

---

## 🚀 Deployment Instructions

> **Note**: This repository is prepared for deployment, not yet deployed.

### 1. PostgreSQL Database (e.g., Render PostgreSQL, Neon, Supabase, or RDS)
1. Provision a PostgreSQL instance with SSL enabled.
2. Copy the connection string into your backend host's `DATABASE_URL` environment variable.
3. Run migrations from the backend directory:
   ```bash
   npx prisma migrate deploy
   npm run seed:admin
   ```

### 2. Backend API (e.g., Render Web Service, Railway, Fly.io, or VPS)
1. Set root directory to `backend`.
2. Build command:
   ```bash
   npm install && npx prisma generate
   ```
3. Start command:
   ```bash
   npm start
   ```
4. Configure production environment variables (`NODE_ENV=production`, `PORT`, `DATABASE_URL`, `JWT_SECRET`, `CLIENT_URL=https://your-frontend-domain.com`, `ROUTING_API_URL`).
5. Ensure persistent disk storage is mounted at `backend/uploads` (or migrate image storage to S3/Cloudinary for ephemeral containers).

### 3. Frontend SPA (e.g., Vercel, Netlify, or Cloudflare Pages)
1. Set root directory to `frontend`.
2. Build command:
   ```bash
   npm install && npm run build
   ```
3. Output directory: `dist`
4. Configure environment variables:
   - `VITE_API_BASE_URL=https://your-backend-domain.com/api/v1`
   - `VITE_SOCKET_URL=https://your-backend-domain.com`
