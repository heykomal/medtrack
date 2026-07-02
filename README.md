# 💊 MedTrack — Medicine Reminder & Dose Tracking Platform

A full-stack healthcare web application that helps patients and caregivers track diseases, prescriptions, medicines, and daily dose adherence — with a built-in admin panel for platform management.

---

## Table of Contents

1. [Overview](#1-overview)
2. [Tech Stack](#2-tech-stack)
3. [Features](#3-features)
4. [Architecture](#4-architecture)
5. [Folder Structure](#5-folder-structure)
6. [API Reference](#6-api-reference)
7. [Admin Panel](#7-admin-panel)
8. [Environment Variables](#8-environment-variables)
9. [Getting Started](#9-getting-started)
10. [Auth System](#10-auth-system)
11. [Database Schema](#11-database-schema)
12. [Troubleshooting](#12-troubleshooting)

---

## 1. Overview

MedTrack follows a structured care workflow:

```
Disease → Prescription → Medicine → Daily Dose Log
```

Users add a disease, create a prescription for it, schedule medicines under that prescription, and log each dose as taken, skipped, or pending. The dashboard shows today's schedule and real-time adherence stats.

**Who is it for?** Patients managing chronic conditions (diabetes, hypertension, etc.) and their caretakers.

---

## 2. Tech Stack

| Layer    | Technology                                 |
|----------|--------------------------------------------|
| Frontend | React 18, Vite, React Router v6, Recharts  |
| Backend  | Node.js, Express                           |
| Database | Appwrite Cloud (NoSQL collections)         |
| Auth     | Email + Password (bcrypt, JSON file store) |
| Styling  | Custom CSS design system (CSS variables)   |

---

## 3. Features

### User-Facing
- **Disease Manager** — add, edit, delete diseases with status tracking
- **Prescription Manager** — link prescriptions to diseases with doctor notes
- **Medicine Manager** — schedule medicines with dosage, times, and units
- **Dose Logger** — log each dose as taken / skipped / pending per day
- **Dashboard** — today's schedule, dose stats, quick-action cards
- **Onboarding** — guided tutorial for new users
- **Dark / Light mode** — system-wide theme toggle
- **Responsive design** — mobile sidebar, adaptive layouts

### Admin Panel (`/admin`)
- Password-protected, not linked from anywhere in the main app
- Overview stats: users, diseases, prescriptions, medicines, dose logs
- User management with search and sort
- Full data browser across all collections with search and filters
- Analytics — adherence rate, dose status breakdown, top diseases, top medicines, weekly registrations
- Activity logs — filterable real-time feed of all platform events
- Settings — environment info, service status, Appwrite config

---

## 4. Architecture

```
Browser
  └── React SPA (Vite, port 3000)
        ├── /              Main app (email+password auth)
        └── /admin         Admin panel (password-gated, separate layout)

Express API (port 5000)
  ├── /api/auth/*          Register / Login (bcrypt)
  ├── /api/admin/*         Admin endpoints (x-admin-token header)
  ├── /api/diseases/*
  ├── /api/prescriptions/*
  ├── /api/medicines/*
  └── /api/dose-logs/*

Appwrite Cloud
  └── Database: medtrack-db
        ├── collection-diseases
        ├── collection-prescriptions
        ├── collection-medicines
        └── collection-dose-logs

Local files
  └── backend/data/users.json   bcrypt-hashed credentials (gitignored)
```

---

## 5. Folder Structure

```
medtrack/
├── .env                          Environment variables (gitignored)
├── .env.example                  Template for env setup
│
├── backend/
│   ├── server.js                 Express entry point
│   ├── package.json
│   ├── data/
│   │   └── users.json            User credentials (gitignored)
│   └── src/
│       ├── config/
│       │   └── appwrite.js
│       ├── middleware/
│       │   └── adminAuth.js      Admin token guard
│       ├── controllers/
│       │   ├── auth.controller.js
│       │   ├── admin.controller.js
│       │   ├── disease.controller.js
│       │   ├── prescription.controller.js
│       │   ├── medicine.controller.js
│       │   └── dose-log.controller.js
│       └── routes/
│           ├── auth.routes.js
│           ├── admin.routes.js
│           ├── disease.routes.js
│           ├── prescription.routes.js
│           ├── medicine.routes.js
│           └── dose-log.routes.js
│
└── frontend/
    ├── vite.config.js
    ├── package.json
    └── src/
        ├── main.jsx              App entry + providers
        ├── App.jsx               Router (intercepts /admin)
        ├── index.css             Design system + admin styles
        ├── components/
        │   ├── AuthProvider.jsx
        │   ├── ThemeProvider.jsx
        │   ├── Toast.jsx
        │   ├── Modal.jsx
        │   ├── Logo.jsx
        │   ├── Icons.jsx
        │   └── OnboardingTutorial.jsx
        ├── pages/
        │   ├── Landing.jsx
        │   ├── Login.jsx
        │   ├── Signup.jsx
        │   ├── ProfileSetup.jsx
        │   ├── Dashboard.jsx
        │   ├── DiseaseManager.jsx
        │   ├── PrescriptionManager.jsx
        │   ├── MedicineManager.jsx
        │   └── DoseLogger.jsx
        ├── admin/
        │   ├── AdminApp.jsx
        │   ├── AdminLogin.jsx
        │   ├── AdminLayout.jsx
        │   ├── services/
        │   │   └── adminApi.js
        │   └── pages/
        │       ├── Overview.jsx
        │       ├── Users.jsx
        │       ├── UserDetail.jsx
        │       ├── Data.jsx
        │       ├── Analytics.jsx
        │       ├── Logs.jsx
        │       └── Settings.jsx
        └── services/
            └── api.js            Axios API client
```

---

## 6. API Reference

All endpoints return JSON. Errors return `{ "error": "message" }`.

### Auth

| Method | Endpoint             | Body                  | Description    |
|--------|----------------------|-----------------------|----------------|
| POST   | `/api/auth/register` | `{ email, password }` | Create account |
| POST   | `/api/auth/login`    | `{ email, password }` | Sign in        |

### Diseases

| Method | Endpoint            | Description |
|--------|---------------------|-------------|
| GET    | `/api/diseases`     | List all    |
| POST   | `/api/diseases`     | Create      |
| PUT    | `/api/diseases/:id` | Update      |
| DELETE | `/api/diseases/:id` | Delete      |

### Prescriptions

| Method | Endpoint                 | Description |
|--------|--------------------------|-------------|
| GET    | `/api/prescriptions`     | List all    |
| POST   | `/api/prescriptions`     | Create      |
| PUT    | `/api/prescriptions/:id` | Update      |
| DELETE | `/api/prescriptions/:id` | Delete      |

### Medicines

| Method | Endpoint            | Description                               |
|--------|---------------------|-------------------------------------------|
| GET    | `/api/medicines`    | List (optional `?prescriptionid=` filter) |
| POST   | `/api/medicines`    | Create                                    |
| PUT    | `/api/medicines/:id`| Update                                    |
| DELETE | `/api/medicines/:id`| Delete                                    |

### Dose Logs

| Method | Endpoint              | Description                                       |
|--------|-----------------------|---------------------------------------------------|
| GET    | `/api/dose-logs`      | List (optional `?date=` and `?medicineid=` filter)|
| POST   | `/api/dose-logs`      | Create log entry                                  |
| PUT    | `/api/dose-logs/:id`  | Update status (taken / skipped / pending)         |
| DELETE | `/api/dose-logs/:id`  | Delete                                            |

### Admin

All admin endpoints (except `/login`) require: `x-admin-token: <ADMIN_PASSWORD>`

| Method | Endpoint                   | Description                 |
|--------|----------------------------|-----------------------------|
| POST   | `/api/admin/login`         | Verify password (no token)  |
| GET    | `/api/admin/stats`         | Platform-wide counts        |
| GET    | `/api/admin/users`         | All users (search, sort)    |
| GET    | `/api/admin/users/:email`  | Single user detail          |
| GET    | `/api/admin/diseases`      | All diseases                |
| GET    | `/api/admin/prescriptions` | All prescriptions           |
| GET    | `/api/admin/medicines`     | All medicines               |
| GET    | `/api/admin/dose-logs`     | All dose logs               |
| GET    | `/api/admin/analytics`     | Aggregated analytics        |
| GET    | `/api/admin/logs`          | Recent activity feed        |
| GET    | `/api/admin/system`        | Server and environment info |

---

## 7. Admin Panel

Not linked from anywhere in the main app. Only accessible by URL.

**URL:** `http://localhost:3000/admin`
**Password:** value of `ADMIN_PASSWORD` in `.env` (default: `medtrack-admin-2024`)

| Page      | What it shows                                                          |
|-----------|------------------------------------------------------------------------|
| Overview  | 6 stat cards + recent activity feed                                    |
| Users     | Searchable, sortable user table; click any user for account detail     |
| Data      | Tabbed view: Diseases / Prescriptions / Medicines / Dose Logs + search |
| Analytics | Adherence gauge, dose pie chart, top diseases/medicines, weekly regs   |
| Logs      | Filterable activity feed with time-ago timestamps                      |
| Settings  | Node version, uptime, Appwrite connection status, config reference     |

**How admin auth works:**
1. Browser posts password to `POST /api/admin/login`
2. If correct, password is saved to `sessionStorage` (clears on tab close)
3. Every admin API call includes `x-admin-token: <password>` header
4. `adminAuth.js` middleware validates it against `ADMIN_PASSWORD` in `.env`

---

## 8. Environment Variables

Copy `.env.example` to `.env` and fill in your values:

```env
# Appwrite (required)
APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
APPWRITE_PROJECT_ID=your-project-id
APPWRITE_API_KEY=your-server-api-key
APPWRITE_DATABASE_ID=database-medtrack-db
APPWRITE_USERS_COLLECTION_ID=collection-users
APPWRITE_DISEASES_COLLECTION_ID=collection-diseases
APPWRITE_PRESCRIPTIONS_COLLECTION_ID=collection-prescriptions
APPWRITE_MEDICINES_COLLECTION_ID=collection-medicines
APPWRITE_DOSE_LOGS_COLLECTION_ID=collection-dose-logs

# Server
NODE_ENV=development
PORT=5000
TZ=Asia/Kolkata

# Admin panel
ADMIN_PASSWORD=medtrack-admin-2024

# Gmail SMTP (optional — for future email features)
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-16-char-app-password
```

> `backend/data/` is gitignored. Never commit `users.json` — it contains bcrypt-hashed passwords.

---

## 9. Getting Started

### Prerequisites

- Node.js 18+
- An [Appwrite Cloud](https://cloud.appwrite.io) project with 5 collections created

### Install

```bash
git clone <repo-url>
cd medtrack

cd backend   && npm install
cd ../frontend && npm install
```

### Configure

```bash
cp .env.example .env
# Edit .env with your Appwrite credentials and ADMIN_PASSWORD
```

### Run

```bash
# Terminal 1 — backend
cd backend && npm start
# Runs on http://localhost:5000

# Terminal 2 — frontend
cd frontend && npm run dev
# Runs on http://localhost:3000
```

### URLs

| URL                           | Description          |
|-------------------------------|----------------------|
| `http://localhost:3000`       | Landing page         |
| `http://localhost:3000/login` | User login           |
| `http://localhost:3000/admin` | Admin panel          |
| `http://localhost:5000/health`| Backend health check |

---

## 10. Auth System

### User auth

```
POST /api/auth/register  →  bcrypt.hash(password, 12)  →  write to backend/data/users.json
POST /api/auth/login     →  bcrypt.compare(password, hash)  →  { success: true, email }
```

The frontend stores `{ email }` in `localStorage`. On logout it is cleared.

### Admin auth

`ADMIN_PASSWORD` from `.env` is checked by `adminAuth.js` middleware against the `x-admin-token` request header. The password is kept in `sessionStorage` on the client — auto-cleared when the browser tab closes.

> This model is suitable for development/MVP. For production: replace with JWT + refresh tokens and use HTTPS.

---

## 11. Database Schema

All collections live in Appwrite Cloud under `database-medtrack-db`.

### Diseases

| Field        | Type   | Notes                 |
|--------------|--------|-----------------------|
| patientname  | String |                       |
| diseasename  | String |                       |
| description  | String |                       |
| status       | String | `Active` / `Inactive` |
| diagnoseDate | String |                       |

### Prescriptions

| Field       | Type    | Notes                    |
|-------------|---------|--------------------------|
| diseaseid   | String  | References disease `$id` |
| patientname | String  |                          |
| doctornote  | String  |                          |
| active      | Boolean |                          |
| startdate   | String  | ISO datetime             |
| enddate     | String  | ISO datetime             |

### Medicines

| Field          | Type     | Notes                         |
|----------------|----------|-------------------------------|
| prescriptionid | String   | References prescription `$id` |
| patientname    | String   |                               |
| name           | String   |                               |
| dosage         | String   |                               |
| unit           | String   | `mg`, `ml`, `tablet`, etc.    |
| times          | String[] | e.g. `["08:00", "20:00"]`     |
| instructions   | String   |                               |
| active         | Boolean  |                               |

### Dose Logs

| Field         | Type   | Notes                           |
|---------------|--------|---------------------------------|
| medicineid    | String | References medicine `$id`       |
| medicinename  | String |                                 |
| patientname   | String |                                 |
| date          | String | `YYYY-MM-DD`                    |
| scheduledtime | String | `HH:MM`                         |
| status        | String | `taken` / `skipped` / `pending` |
| note          | String |                                 |

---

## 12. Troubleshooting

**`EADDRINUSE: address already in use :::5000`**
```bash
kill $(lsof -ti:5000)
# then: npm start
```

**Admin panel shows "Unauthorized"**
- Check `ADMIN_PASSWORD` is set in `.env`
- Restart the backend after editing `.env`
- Make sure you're entering the exact same value

**Login says "Invalid email or password"**
- Register at `/signup` first — accounts live in `backend/data/users.json`
- If `users.json` is deleted, all accounts are gone and must be re-registered

**Appwrite 404 / permission denied**
- Verify the API key has read + write permissions on all 5 collections
- Collection IDs in `.env` must exactly match Appwrite Cloud

**Admin panel shows a blank white page**
- Hard refresh: **Ctrl + Shift + R**
- Confirm backend is up: `curl http://localhost:5000/health`
- Check browser DevTools → Console for JS errors
