<div align="center">

<img src="https://img.shields.io/badge/Status-In%20Progress-yellow?style=for-the-badge" />
<img src="https://img.shields.io/badge/Docker-Containerized-2496ED?style=for-the-badge&logo=docker&logoColor=white" />
<img src="https://img.shields.io/badge/Node.js-20-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" />
<img src="https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black" />
<img src="https://img.shields.io/badge/Appwrite-Cloud-FD366E?style=for-the-badge&logo=appwrite&logoColor=white" />

# 💊 MedTrack
### Medicine Reminder & Dose Tracking Platform

*Simple enough for any age. Built for people who care.*

[Features](#features) • [Getting Started](#getting-started) • [Roadmap](#roadmap)

</div>

---

## Why I Built This

As people get older, managing multiple medicines becomes a daily challenge. Someone with diabetes, hypertension, or any chronic condition may need to take 3, 4, or even 5 different medicines at different times every day — morning, afternoon, evening.

The problem is **people forget**. Especially elderly patients living alone.

And the caretaker — a son, daughter, or family member living far away — has no way to know if their loved one actually took their medicine today.

**MedTrack solves this in two ways:**
- 👴 The **patient** gets automatic reminders at each medicine's scheduled time and can log doses with one tap
- 👩‍⚕️ The **caretaker** can monitor adherence remotely — seeing exactly which doses were taken, skipped, or missed

No complex setup. Simple enough for any age to understand and use.

---

## Features

| Feature | Description |
|---|---|
| 🦠 Disease Tracking | Record health conditions with status updates |
| 📋 Prescriptions | Link doctor prescriptions to each disease |
| 💊 Medicine Scheduling | Add medicines with exact dose times per day |
| ✅ One-tap Dose Logging | Mark doses Taken or Skipped — simple for elderly users |
| 📊 Adherence Dashboard | See weekly adherence %, today's schedule, 14-day history |
| 📧 Email Reminders | Automatic reminders sent at each medicine's dose time |
| 👤 Private Data | Each account sees only their own medical data |
| 🌙 Dark / Light Mode | Comfortable for all ages and lighting |
| 🐳 Docker Deployment | Runs anywhere with one command |

---

## Getting Started

### Prerequisites

- Docker 24+ and Docker Compose V2
- Appwrite Cloud account (free) — [cloud.appwrite.io](https://cloud.appwrite.io)
- Gmail account with 2FA enabled

### 1. Clone

```bash
git clone https://github.com/heykomal/medtrack.git
cd medtrack
```

### 2. Configure

```bash
cp .env.example .env
```

Fill in your `.env` with Appwrite credentials and Gmail details.

### 3. Run

```bash
docker compose up --build -d
```

Open `http://localhost:3000` — that's it.

---

## Roadmap

- [x] Disease / Prescription / Medicine management
- [x] One-tap dose logging
- [x] Email reminders via node-cron
- [x] Per-user private data
- [x] Adherence dashboard with 14-day history
- [x] Docker deployment
- [ ] Caregiver view — monitor family members remotely
- [ ] SMS reminders
- [ ] Mobile app (PWA)
- [ ] Multi-language support for elderly users

---

<div align="center">

**This is a progression version — being built completely.**

Built with ❤️ for patients and the people who care for them.

*Because missing a dose shouldn't be an option.*

⭐ Star this repo if you find it useful

</div>