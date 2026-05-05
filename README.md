# Roomsy — PG Booking Platform

A web platform for browsing, listing and booking **PG (Paying Guest) accommodations** across India. Tenants find verified PGs, owners manage listings and bookings, and platform admins oversee approvals, users and revenue across cities.

Live: _local only_ · Demo accounts in [`lib/dummyAuth.ts`](lib/dummyAuth.ts)

---

## Features

### Tenants (customers)
- Browse PGs by city, area, type (boys / girls / co-living), price, and amenities
- PG detail page with photo gallery, room sharing options, owner contact, map directions
- **Wishlist** — save favourite PGs (per-user, persisted)
- Daily or monthly booking flow with ID-proof upload (Aadhaar / Driving Licence / PAN)
- **My Bookings** with status filters (All · Pending · Confirmed · Completed · Cancelled), cancel from card, expand for full booking detail
- Profile completion tracker (name, email, phone, photo, ID proof)

### PG Owners
- Owner dashboard — KPI cards (My PGs · Pending · Confirmed · Earnings)
- Per-PG **Rooms & Pricing**, **Photos**, **Amenities** management
- **Bookings** queue with confirm / reject / vacate / renew flows
- **Earnings** with daily / monthly breakdown and per-PG filter
- Mobile drawer navigation with full owner panel access from any page
- Tap a booking to view tenant ID proof

### Platform Admins
- State-scoped PG approval (Telangana live; other states gated as "Coming soon")
- **PGs** list with search, status tabs (All · Pending · Live · Suspended), inline approve / suspend / reinstate
- **Users** directory (tenants + owners) with role tabs and search
- **Revenue** dashboard with period selector (daily / weekly / monthly / yearly), per-PG earnings breakdown, expand to view individual bookings
- "Switch state" pill to change focus city without losing context

### Shared
- Mobile-first responsive layout with edge-to-edge cards on phones, sticky bottom nav for admin panel
- Pink → cream gradient navbars across all role panels
- 3D animated splash screen on first load (cube assembled from 6 flying R panels)
- Toast notifications via `react-hot-toast`
- Profile page shared across roles, with admin-specific layout when role is `platform_admin`

---

## Tech Stack

| Layer        | Library                                           |
|--------------|--------------------------------------------------|
| Framework    | Next.js 16 (Pages Router) + TypeScript            |
| Styling      | Tailwind CSS v4 (CSS-first config) + scoped CSS   |
| State        | Zustand (auth, booking)                           |
| Data fetching | TanStack React Query                             |
| Forms        | React Hook Form + Zod                             |
| Backend      | Back4App (Parse Server) via `lib/parseConfig.ts`  |
| Image hosting | Cloudinary (`lib/cloudinary.ts`)                 |
| Animation    | framer-motion                                     |
| Icons        | react-icons (Heroicons / Material Design)         |
| Maps         | Google Maps (directions deep-links)               |

The current build uses **dummy in-memory + localStorage data** in `lib/dummy*.ts` for end-to-end demo. To switch to live Back4App data, swap the `lib/dummy*` calls for Parse queries.

---

## Getting Started

### Prerequisites
- Node.js 18+
- npm

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment
Copy `.env.example` to `.env.local` (or create it) and fill in:

```env
NEXT_PUBLIC_BACK4APP_APP_ID=
NEXT_PUBLIC_BACK4APP_JS_KEY=
NEXT_PUBLIC_BACK4APP_SERVER_URL=https://parseapi.back4app.com
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=
BACK4APP_MASTER_KEY=
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

> The dummy-data flow works without any of these — the app boots straight into the demo mode using `lib/dummy*.ts`.

### 3. Run the dev server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 4. Production build
```bash
npm run build
npm start
```

---

## Demo Accounts

Seeded users in `lib/dummyAuth.ts` — sign in via `/auth/login`:

| Role             | Email              | Password    |
|------------------|--------------------|-------------|
| Tenant           | arjun@test.com     | tenant123   |
| Tenant           | priya@test.com     | tenant123   |
| PG Owner         | ravi@test.com      | owner123    |
| PG Owner         | meena@test.com     | owner123    |
| Platform Admin   | admin@roomsy.com   | admin123    |

Sign-up creates new tenant or owner accounts (admin signup is disabled by design).

---

## Project Structure

```
pg-website/
├── components/
│   └── common/          Shared UI: Navbar, Footer, PGCard, SplashScreen, etc.
├── lib/
│   ├── parseConfig.ts   Back4App / Parse SDK init
│   ├── cloudinary.ts    Image upload helpers
│   ├── dummyAuth.ts     Demo users + login/signup (localStorage)
│   ├── dummyPGs.ts      Seeded PG listings for Hyderabad
│   ├── dummyBookings.ts Demo booking storage
│   ├── dummyWishlist.ts Per-user saved PGs
│   └── dummyPGAdmin.ts  Owner-side data + override layer
├── pages/
│   ├── index.tsx        Landing page
│   ├── pgs/             PG browse + detail (with booking modal)
│   ├── bookings/        Tenant: my bookings + confirm
│   ├── wishlist/        Tenant: saved PGs
│   ├── profile.tsx      Shared profile page (all roles)
│   ├── auth/            Login + Signup
│   ├── pg-admin/        Owner panel (Dashboard, My PGs, Bookings, Earnings, Rooms, Photos, Amenities)
│   ├── admin/           Platform admin panel (State picker, PGs, Users, Revenue)
│   └── api/upload.ts    Server-side Cloudinary upload route
├── store/
│   ├── useAuthStore.ts  Zustand auth (with hydration flag)
│   └── useBookingStore.ts In-progress booking state
├── styles/globals.css   Tailwind v4 + global styles
└── types/               PG, booking, user, review TypeScript models
```

---

## Roles & Routes

| Role             | Default landing       | Sidebar / drawer items                              |
|------------------|-----------------------|-----------------------------------------------------|
| Guest            | `/`                   | Home / PG (auth via login + signup)                 |
| Tenant           | `/`                   | My Profile · Wishlist · My Bookings                 |
| PG Owner         | `/pg-admin/dashboard` | Dashboard · My PGs · Bookings · Earnings · Rooms · Photos · Amenities · My Profile |
| Platform Admin   | `/admin/dashboard`    | Dashboard · PGs · Users · Revenue · My Profile      |

All protected routes redirect unauthenticated visitors to `/` (the landing page) once auth state has hydrated, so deep-linking works for logged-in users.

---

## Key Architectural Notes

- **Pages Router**, not the App Router — every file under `pages/` is a route.
- **Zustand auth store** has a `hydrated` flag set after `localStorage` is read; pages wait on it before redirecting, eliminating reload-flicker.
- **Master Key safety** — Back4App master key (`BACK4APP_MASTER_KEY`) and Cloudinary secrets must only run inside Back4App Cloud Functions or `pages/api/*` server routes — never on the client.
- **Splash screen** mounts only on first-load via `_app.tsx` and shows a 3D rotating cube assembled from 6 flying R faces (3.4 s of animated entrance).

---

## License

Private project — all rights reserved.
