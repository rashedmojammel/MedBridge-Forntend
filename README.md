# Medbridge Frontend

Next.js 15 App Router frontend for the Medbridge rural healthcare consultation
platform. Talks to the NestJS backend over REST + Socket.IO.

## Stack

TypeScript · Tailwind CSS · TanStack Query v5 · Axios · socket.io-client ·
React Hook Form + Zod · framer-motion · js-cookie · lucide-react

## Quick start

```bash
npm install
cp .env.local.example .env.local     # point NEXT_PUBLIC_API_URL at the backend
npm run dev
```

Runs on http://localhost:3000. The backend must be running on
http://localhost:3001 with `npm run seed` already executed.

## Seeded logins (all password: `password123`)

| Role | Email |
|---|---|
| Admin | admin@medbridge.com |
| Doctor | doctor1@medbridge.com |
| CHW | chw1@medbridge.com |
| Pharmacist | pharmacist1@medbridge.com |

The login page has one-tap demo buttons that prefill these credentials. They
still perform a real `POST /auth/login` — no client-side bypass.

## Architecture

```
src/
├── app/
│   ├── (public)/     public pages — no auth
│   ├── (auth)/       login, register
│   ├── patient/      PATIENT role only
│   ├── chw/          CHW role only
│   ├── doctor/       DOCTOR role only
│   ├── pharmacist/   PHARMACIST role only
│   └── admin/        ADMIN role only
├── components/
│   ├── ui/           Button, Input, Badge, Card, Modal, Toast, Skeleton…
│   ├── layout/       Navbar, Sidebar, BottomNav, RoleShell, Footer
│   ├── shared/       StatCard, NotificationPanel, SearchBar, VitalChip
│   └── chat/         ChatWindow, ChatSidebar
├── hooks/            one file per backend module — all API calls live here
├── lib/              api.ts (axios), auth.ts (cookies), socket.ts, utils.ts
├── types/            TypeScript mirrors of every backend entity
└── middleware.ts     route protection + role redirects
```

### Rules the code follows

- **No component calls axios directly.** Pages call hooks; hooks call `api`.
- **Every response is unwrapped** with `unwrap()` because the backend wraps
  everything in `{ success, data, message }`.
- **Session lives in cookies**, not localStorage — middleware runs server-side
  and cannot read localStorage.
- **`'use client'`** on every page with state, effects, or event handlers.
- **Prescriptions have no edit UI.** The API offers cancel-with-reason only.
- **Chat input locks** when the consultation status is COMPLETED or the socket
  emits `consultationEnded`.

## Verified

`next build` compiles clean with zero TypeScript errors. All 23 routes
generate, middleware active.
