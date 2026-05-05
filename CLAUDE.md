# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # start dev server at localhost:3000
npm run build    # production build
npm run lint     # run ESLint
```

## Architecture

This is a **Next.js (Pages Router) + TypeScript** website for a PG (Paying Guest) accommodation booking platform. The backend is **Back4App (Parse Server)** — a hosted Parse backend accessed entirely via the Parse JS SDK. There is no custom API server; all data operations go through Parse directly from the client, except operations requiring the Master Key which must go through Back4App Cloud Functions.

### Entry Points

- `pages/_app.tsx` — initialises Parse (`lib/parseConfig.ts`), wraps the app in `QueryClientProvider`, and mounts the `react-hot-toast` `<Toaster>`
- `lib/parseConfig.ts` — must be called once before any Parse operation; guarded by an `initialized` flag. Always import Parse from here, not directly from the `parse` package.

### Three User Roles

Role is stored on the Parse `_User` object as a string field (`customer`, `pg_admin`, `platform_admin`). After login, the role drives client-side redirects and conditional UI rendering. There is no middleware-based route protection yet — guard pages by checking `useAuthStore` on mount.

### State Management

Two Zustand stores:
- `store/useAuthStore.ts` — holds the logged-in `AppUser` and a `setUser` setter. Populated after login, cleared on logout.
- `store/useBookingStore.ts` — holds in-progress booking state across multi-step booking flow (pgId, roomId, bookingType, persons, startDate, idProofUrl). Call `reset()` after booking is confirmed or cancelled.

### Data Fetching Pattern

Use **TanStack React Query** (`useQuery` / `useMutation`) for all Back4App data fetching. Service functions that call Parse go in `lib/` (e.g. `pgService.ts`, `bookingService.ts`). Hooks in `hooks/` wrap those service functions with `useQuery`/`useMutation`.

### Forms

All forms use **React Hook Form** + **Zod** via `@hookform/resolvers/zod`. Define a Zod schema, pass it to `zodResolver`, and use `useForm`.

### Tailwind CSS 4

Tailwind v4 is configured via PostCSS (`postcss.config.js` uses `@tailwindcss/postcss`). The entry CSS is `styles/globals.css` which contains only `@import "tailwindcss"`. There is no `tailwind.config.js` — v4 uses CSS-first configuration.

### Image Uploads

All images (PG photos, room photos, ID proof documents) are uploaded to **Cloudinary**. Upload logic goes in `lib/cloudinary.ts`. The `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` env var is public; `CLOUDINARY_API_KEY` and `CLOUDINARY_API_SECRET` are server-only and must only be used in Back4App Cloud Functions or Next.js API routes.

### Back4App Cloud Functions

Server-side operations (confirm booking, cancel booking, approve PG, compute rating, etc.) are implemented as **Back4App Cloud Functions** called via `Parse.Cloud.run('functionName', params)`. Never use the Master Key on the client — it belongs only in Cloud Functions.

### Key Constraints

- `availableBeds` on `Room` is decremented on booking confirmation and re-incremented on cancellation — always go through the `confirmBooking` / `cancelBooking` Cloud Functions, never update this field directly.
- Daily bookings have `entryTime` (10:00am–11:00am) and `exitTime` (within 24 hours) fields.
- A `Booking` record requires an `idProofUrl` (Cloudinary URL of Aadhaar / Driving License / PAN Card) before it can be submitted.
- PGs only appear in listings when `isApproved === true` and `isSuspended === false`.
- Payments are fully offline (UPI / QR / phone call) — there is no payment gateway integration.

## Environment Variables

Fill in `.env.local` before running:

```
NEXT_PUBLIC_BACK4APP_APP_ID=
NEXT_PUBLIC_BACK4APP_JS_KEY=
NEXT_PUBLIC_BACK4APP_SERVER_URL=https://parseapi.back4app.com
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=
BACK4APP_MASTER_KEY=
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```
