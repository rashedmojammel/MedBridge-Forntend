# MedBridge

**Rural Healthcare Consultation Platform (RHCP)**

MedBridge connects patients in rural, underserved communities with doctors, community health workers (CHWs), and pharmacists through a single platform — enabling remote triage, chat-based consultations, e-prescriptions, and medicine dispensing where in-person care is hard to reach.

🔗 **Live demo:** [medbridgecare.vercel.app](https://medbridgecare.vercel.app/)

---

## Overview

In many rural areas, the nearest doctor can be hours away. MedBridge closes that gap by giving community health workers the tools to triage patients on the ground, and giving doctors a way to review vitals, chat with patients, and issue prescriptions remotely — with pharmacists and admins keeping the rest of the system running.

## Features

**Patient**
- Book and join chat-based consultations with doctors
- View prescriptions, medicines, and treatment history
- Keep a personal health diary
- Manage account and profile

**Doctor**
- Dashboard of upcoming and in-progress consultations
- Set weekly availability and time off
- Live chat consultations with CHW-recorded vitals attached
- Issue prescriptions from reusable templates
- Refer patients to nearby facilities

**Community Health Worker (CHW)**
- Register new patients in the field — including their portal login, generated on the spot
- Record vitals and symptoms, with automatic triage suggestions (critical / non-critical)
- Log field visits and follow-ups
- Escalate referrals to doctors or facilities

**Pharmacist**
- View and dispense prescriptions
- Track medicine inventory with low-stock alerts
- Manage the medicine catalogue and alternatives

**Admin**
- Manage users and roles across the platform
- View system-wide audit logs
- Configure platform settings and triage thresholds
- Monitor stats across districts and time periods

**Platform-wide**
- Full English / Bangla bilingual support (next-intl)
- Real-time chat via Socket.IO
- Role-based access control end to end

## Tech Stack

**Frontend** (this repo)
| | |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Data fetching | TanStack React Query, Axios |
| Forms & validation | React Hook Form, Zod |
| Realtime | Socket.IO client |
| i18n | next-intl (English / Bangla) |
| Animation | Framer Motion |
| Icons | Lucide |

**Backend**
| | |
|---|---|
| Framework | NestJS |
| ORM | TypeORM |
| Database | PostgreSQL |
| Auth | JWT (Passport) |
| Realtime | Socket.IO |
| API docs | Swagger |

**Infrastructure**
- Frontend deployed on **Vercel**
- Backend + PostgreSQL deployed on **Render**

## Getting Started

### Prerequisites
- Node.js 20+
- npm
- A running instance of the [medbridge-backend](#) API

### Installation

```bash
git clone https://github.com/rashedmojammel/MedBridge-Forntend-Demo.git
cd MedBridge-Forntend-Demo
npm install
```

### Environment variables

Copy the example file and point it at your backend:

```bash
cp .env.local.example .env.local
```

```dotenv
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### Run locally

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000).

### Build for production

```bash
npm run build
npm run start
```

## Project Structure

```
src/
├── app/                  # Routes (App Router) - grouped by role
│   ├── (auth)/           # Login, register, password recovery
│   ├── (public)/         # Marketing site, doctor/CHW directories
│   ├── patient/
│   ├── doctor/
│   ├── chw/
│   ├── pharmacist/
│   └── admin/
├── components/
│   ├── ui/               # Base primitives (Button, Card, Modal, ...)
│   ├── layout/            # Navbar, Sidebar, RoleShell
│   ├── shared/            # Domain components (pickers, boards, panels)
│   └── chat/              # Chat sidebar/window
├── hooks/                # Data-fetching hooks, one per domain
├── lib/                  # API client, auth, socket, prescribing helpers
├── types/                # Shared TypeScript types
└── i18n/                 # next-intl configuration
messages/
├── en.json               # English strings
└── bn.json                # Bangla strings
```

## Branching model

- `main` — stable, deployable
- `dev` — integration branch; all feature work merges here first
- `feat/*` — individual feature branches, opened as PRs into `dev`

## Team

| Area | Contributor |
|---|---|
| Patient & Doctor pages | Rashed |
| CHW & Public pages | Patho |
| Admin & Auth pages | Tanvir |
| Pharmacist pages | Rahat |

## License

This project is developed for academic purposes as part of a university course project.