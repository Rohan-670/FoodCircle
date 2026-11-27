# Surplus Food Donation & NGO Coordination System

A production-style web application connecting food businesses, non-governmental organizations (NGOs), volunteers, and platform administrators to prevent food waste and efficiently redistribute surplus edible food to communities in need.

---

## 📑 Table of Contents

- [Project Overview](#project-overview)
- [System Architecture & Stack](#system-architecture--stack)
- [Monorepo Directory Structure](#monorepo-directory-structure)
- [Major Files Explanation](#major-files-explanation)
- [Prerequisites](#prerequisites)
- [Setup & Installation Instructions](#setup--installation-instructions)
- [Environment Configuration](#environment-configuration)
- [Running the Application](#running-the-application)
- [Verifying the Health-Check Endpoint](#verifying-the-health-check-endpoint)
- [Roadmap & Upcoming Phases](#roadmap--upcoming-phases)

---

## 🌟 Project Overview

Food waste and food insecurity coexist in many communities. This platform provides an end-to-end coordination workflow:

1. **Food Donors (Restaurants, Caterers, Supermarkets)**: Post details of surplus food (quantity, safe consumption window, storage requirements, pickup location).
2. **NGOs & Charities**: Browse, reserve, and accept surplus food donations based on their community needs.
3. **Volunteers**: Accept pickup and drop-off coordination tasks, utilizing map-based routing and verification handoffs.
4. **Administrators**: Verify organization credentials, monitor food safety compliance, and view analytics.

---

## 🛠️ System Architecture & Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Vite, JavaScript (ES6+), CSS3 Variables |
| **Backend** | Node.js, Express.js |
| **Database** | PostgreSQL |
| **ORM** | Prisma |
| **Authentication** | JWT (JSON Web Tokens) & bcrypt |
| **Real-Time Communication** | Socket.IO (for real-time claims and delivery alerts) |
| **Maps & Geolocation** | Leaflet & OpenStreetMap (for pickup and delivery coordinates) |
| **Version Control** | Git & GitHub |

---

## 📂 Monorepo Directory Structure

```text
surplus-food-donation-system/
├── .gitignore                     # Git ignore rules for node_modules, build, env, logs, uploads
├── package.json                   # Root orchestrator scripts (run both frontend and backend)
├── README.md                      # Comprehensive project documentation
├── backend/
│   ├── .env.example               # Backend environment variables template
│   ├── package.json               # Backend dependencies and scripts
│   └── src/
│       ├── config/
│       │   └── environment.js     # Centralized environment configuration
│       ├── controllers/
│       │   └── health.controller.js # Handles health check requests
│       ├── middleware/
│       │   ├── errorHandler.js    # Global exception handler
│       │   └── notFound.js        # 404 handler for undefined routes
│       ├── routes/
│       │   ├── health.routes.js   # Health check route definitions
│       │   └── index.js           # Main API router aggregator
│       ├── services/
│       │   └── health.service.js  # Service layer for diagnostics & uptime
│       ├── utils/
│       │   └── response.js        # Standardized API response formatters
│       ├── app.js                 # Express app setup, CORS, body parsers, routes
│       └── server.js              # HTTP server starter & graceful shutdown
└── frontend/
    ├── .env.example               # Frontend environment variables template
    ├── index.html                 # HTML5 entry point for Vite
    ├── package.json               # Frontend dependencies and scripts
    ├── vite.config.js             # Vite configuration with API proxy
    └── src/
        ├── App.jsx                # Root React component
        ├── main.jsx               # React DOM mount point
        ├── components/
        │   ├── Header.jsx         # Navigation bar & branding
        │   ├── Footer.jsx         # Footer with copyright
        │   └── StatusCard.jsx     # Live backend connectivity status widget
        ├── hooks/
        │   └── useHealthCheck.js  # Custom React hook for backend health polling
        ├── layouts/
        │   └── MainLayout.jsx     # Page wrapper layout
        ├── pages/
        │   └── HomePage.jsx       # Welcome page with roles and tech stack
        ├── services/
        │   └── api.js             # HTTP client utility for backend API
        └── styles/
            ├── App.css            # Component-specific styles
            └── index.css          # Global CSS variables, reset, typography
```

---

## 🔍 Major Files Explanation

### Backend
- **`backend/src/server.js`**: The process entry point. Starts the Express HTTP server, listens on the specified port, and configures graceful shutdown on `SIGTERM` and `SIGINT`.
- **`backend/src/app.js`**: Configures the Express application pipeline: initializes CORS, JSON body parsers, attaches the root welcome endpoint, mounts API routes under `/api`, and attaches 404 and global error handlers.
- **`backend/src/config/environment.js`**: Reads and validates environment variables from `process.env` with sensible fallbacks, avoiding scattered `process.env` access throughout the codebase.
- **`backend/src/routes/index.js` & `health.routes.js`**: Provides modular routing. Rather than clustering all endpoints in one file, route definitions are split into isolated, testable modules.
- **`backend/src/controllers/health.controller.js`**: Mediates between the HTTP layer and the service layer, formatting the response via standard helpers.
- **`backend/src/services/health.service.js`**: Encapsulates business logic (diagnostics, uptime calculation, timestamp). Keeps controllers lightweight and decoupled.
- **`backend/src/middleware/notFound.js` & `errorHandler.js`**: Ensure consistent JSON error responses across the entire API, preventing unhandled exceptions from crashing the server or leaking stack traces in production.
- **`backend/src/utils/response.js`**: Standardizes all API responses to a predictable format `{ success: true|false, message, data|errors }`.

### Frontend
- **`frontend/src/main.jsx`**: The client entry point that mounts the React component tree into the `#root` DOM element in `index.html`.
- **`frontend/src/App.jsx`**: Top-level application component that wraps pages inside `MainLayout`.
- **`frontend/src/layouts/MainLayout.jsx`**: Reusable structural layout managing persistent header, main container, and footer.
- **`frontend/src/pages/HomePage.jsx`**: The welcome page displaying project overview, stakeholder roles, tech stack summary, and real-time backend connection status.
- **`frontend/src/components/StatusCard.jsx`**: An interactive UI card checking and displaying live server status, uptime, environment, and manual refresh controls.
- **`frontend/src/hooks/useHealthCheck.js`**: Custom hook encapsulating stateful logic for calling the backend health check and tracking online/offline status.
- **`frontend/src/services/api.js`**: Dedicated API communication module, centralizing base URL management and fetch requests.
- **`frontend/vite.config.js`**: Configures Vite with the React plugin and sets up a development proxy to forward `/api` requests to backend on port 5000.

---

## 📦 Prerequisites

Before running the application, make sure you have:
1. **Node.js**: `v18.0.0` or later (Tested on `v24.21.0`)
2. **npm**: `v9.0.0` or later (Tested on `v11.19.0`)
3. **PostgreSQL**: (Required for subsequent database migration phase)

---

## 🚀 Setup & Installation Instructions

### 1. Clone Repository & Navigate to Workspace
```bash
git clone <your-repository-url>
cd surplus-food-donation-system
```

### 2. Install All Dependencies

You can install all dependencies from the root directory in one command:
```bash
npm run install:all
```

*Or install each directory individually:*

**Backend:**
```bash
cd backend
npm install
cd ..
```

**Frontend:**
```bash
cd frontend
npm install
cd ..
```

---

## ⚙️ Environment Configuration

### Backend
1. In the `backend` folder, duplicate `.env.example` to create `.env`:
   ```bash
   cp backend/.env.example backend/.env
   ```
   *(On Windows Command Prompt / PowerShell: `copy backend\.env.example backend\.env`)*

2. Configure placeholder variables in `backend/.env`:
   ```env
   PORT=5000
   NODE_ENV=development
   CLIENT_URL=http://localhost:5173
   DATABASE_URL=postgresql://DB_USER:DB_PASSWORD@localhost:5432/surplus_food_db?schema=public
   JWT_SECRET=your_jwt_secret_key_here
   JWT_EXPIRES_IN=7d
   ```

### Frontend
1. In the `frontend` folder, duplicate `.env.example` to create `.env`:
   ```bash
   cp frontend/.env.example frontend/.env
   ```
   *(On Windows Command Prompt / PowerShell: `copy frontend\.env.example frontend\.env`)*

2. Configure placeholder variables in `frontend/.env`:
   ```env
   VITE_API_BASE_URL=http://localhost:5000/api
   VITE_SOCKET_URL=http://localhost:5000
   ```

---

## 🏃 Running the Application

### Option A: Run Both Simultaneously (Recommended)
From the project root:
```bash
npm run dev
```
This runs the Express backend and the Vite development server concurrently in a single terminal.

### Option B: Run Services in Separate Terminals

**Terminal 1 — Backend:**
```bash
cd backend
npm run dev
```
Backend will start at: `http://localhost:5000`

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
```
Frontend will start at: `http://localhost:5173`

---

## ✅ Verifying the Health-Check Endpoint

1. Start the backend (`cd backend && npm run dev`).
2. Test via web browser, Postman, or curl:
   ```bash
   curl http://localhost:5000/api/health
   ```
3. Expected JSON response:
   ```json
   {
     "success": true,
     "message": "Server is running and healthy",
     "data": {
       "status": "healthy",
       "service": "Surplus Food Donation & NGO Coordination Backend API",
       "uptime": "12 seconds",
       "environment": "development",
       "timestamp": "2026-11-27T08:00:00.000Z"
     }
   }
   ```
4. Open the frontend in your browser: `http://localhost:5173`
   The **Backend Connectivity Status** widget will display a green **"Connected"** badge along with current uptime and timestamp.

---

## 🗺️ Roadmap & Upcoming Phases

- [x] **Phase 1: Architecture Foundation & Monorepo Setup** (Current)
- [ ] **Phase 2: Database Modeling & Prisma ORM**: Define PostgreSQL schemas for Users (Donor, NGO, Volunteer, Admin), FoodDonations, Claims, and Deliveries.
- [ ] **Phase 3: Authentication & Authorization**: Implement JWT-based auth with bcrypt password hashing and role-based access control (RBAC).
- [ ] **Phase 4: Core Donation & NGO Coordination Workflows**: Endpoints and forms for food posting, status state machine, and claiming logic.
- [ ] **Phase 5: Real-Time Notifications**: Socket.IO integration for instant claim broadcasts and status updates.
- [ ] **Phase 6: Leaflet Maps & Geolocation**: Map-based visualization of nearby donations and delivery navigation routes.
