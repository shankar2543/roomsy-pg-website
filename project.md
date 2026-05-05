# PG Accommodation Platform — Project Document

## What We Are Building
A web platform where users can discover, browse, and book Paying Guest (PG) accommodations by area. Users can view available rooms (2-sharing / 3-sharing), book on daily, weekly, or monthly basis, contact the PG owner directly, and get directions. Three roles exist: Customer, PG Admin, and Platform Admin. The website and mobile app (built later) share the same database.

---

## Tech Stack

### Website (Next.js)

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 — Pages Router |
| Language | TypeScript (strict mode) — `.ts` for logic, `.tsx` for components |
| Styling | Tailwind CSS 4 |
| Backend / Database | Back4App (Parse Server) |
| State Management | Zustand 5 |
| Data Fetching | @tanstack/react-query v5 |
| Forms & Validation | React Hook Form + Zod |
| Maps & Location | Google Maps JS API + Places API |
| Image Storage | Cloudinary |
| Image Gallery | Embla Carousel |
| Date Picker | react-day-picker |
| Notifications | react-hot-toast |
| Icons | react-icons |
| Charts | recharts |
| HTTP | Native fetch |

---

### App (React Native)

| Layer | Technology |
|-------|-----------|
| Framework | React Native + Expo SDK 54 |
| Routing | Expo Router |
| Language | TypeScript (strict mode) — `.ts` for logic, `.tsx` for components |
| Styling | NativeWind (Tailwind for React Native) |
| Backend / Database | Back4App (Parse Server) — same project as website |
| State Management | Zustand 5 |
| Data Fetching | @tanstack/react-query v5 |
| Forms & Validation | React Hook Form + Zod |
| Maps & Location | react-native-maps + expo-location |
| Image Storage | Cloudinary — same as website |
| Image Gallery | react-native-reanimated-carousel |
| Date Picker | react-native-date-picker |
| Notifications | expo-notifications (Expo Push) |
| Icons | @expo/vector-icons |
| HTTP | Native fetch |

---

## Data Models

### `_User`
| Field | Type | Notes |
|-------|------|-------|
| role | String | `customer` / `pg_admin` / `platform_admin` |
| name | String | |
| phone | String | Shown on PG detail page for contact |
| profilePic | String | Cloudinary URL |

### `PG`
| Field | Type | Notes |
|-------|------|-------|
| name | String | |
| description | String | |
| area | String | Area name |
| address | String | Full address |
| location | GeoPoint | For "near me" queries and directions |
| photos | Array\<String\> | Cloudinary URLs |
| amenities | Array\<String\> | WiFi, AC, Food, Laundry, Parking, etc. |
| owner | Pointer\<_User\> | PG Admin |
| isApproved | Boolean | Only approved PGs show in listings |
| isSuspended | Boolean | Platform admin can temporarily hide a PG |
| rating | Number | Computed average from reviews |

### `Room`
| Field | Type | Notes |
|-------|------|-------|
| pg | Pointer\<PG\> | |
| type | String | `2-sharing` / `3-sharing` |
| totalBeds | Number | |
| availableBeds | Number | Decremented on booking confirmation |
| dailyPrice | Number | Per person |
| weeklyPrice | Number | Per person |
| monthlyPrice | Number | Per person |
| photos | Array\<String\> | Cloudinary URLs |

### `Booking`
| Field | Type | Notes |
|-------|------|-------|
| user | Pointer\<_User\> | |
| pg | Pointer\<PG\> | |
| room | Pointer\<Room\> | |
| bookingType | String | `daily` / `weekly` / `monthly` |
| persons | Number | Total price = price × persons |
| startDate | Date | |
| endDate | Date | Auto-computed |
| entryTime | String | Daily only: 10:00am–11:00am |
| exitTime | String | Daily only: within 24 hours |
| totalPrice | Number | |
| status | String | `pending` → `confirmed` / `rejected` → `completed` / `cancelled` |

### `Review`
| Field | Type | Notes |
|-------|------|-------|
| user | Pointer\<_User\> | |
| pg | Pointer\<PG\> | |
| rating | Number | 1–5 |
| comment | String | |

---

## Booking Rules
- **Daily:** Entry 10:00am–11:00am only. Exit within 24 hours. Price = `dailyPrice × persons`.
- **Weekly:** Price = `weeklyPrice × persons`.
- **Monthly:** Price = `monthlyPrice × persons`.
- Availability checked before confirmation — `availableBeds` must be >= `persons`.
- On confirmation → decrement `availableBeds`. On cancellation → re-increment.

---

## Pages & Routes

### Customer
| Route | What it does |
|-------|-------------|
| `/` | Home — area selector, featured PGs |
| `/pgs` | Listings by area or near current location |
| `/pgs/[id]` | PG detail — gallery, owner contact, directions, rooms, reviews |
| `/booking/[pgId]/[roomId]` | Booking flow |
| `/user/dashboard` | My bookings |
| `/user/profile` | Edit profile |
| `/auth/login` | Login |
| `/auth/signup` | Signup |

### PG Admin
| Route | What it does |
|-------|-------------|
| `/pg-admin/dashboard` | Occupancy, pending bookings, earnings |
| `/pg-admin/rooms` | Manage rooms, prices, bed count |
| `/pg-admin/bookings` | Accept / reject bookings |
| `/pg-admin/photos` | Upload photos via Cloudinary |
| `/pg-admin/amenities` | Add/edit amenities |

### Platform Admin
| Route | What it does |
|-------|-------------|
| `/admin/dashboard` | KPIs, booking trend charts, top PGs, recent bookings |
| `/admin/pgs` | Approve / reject / suspend PGs |
| `/admin/users` | View all users, suspend accounts |
| `/admin/bookings` | All bookings with filters |
| `/admin/reports` | Per-PG revenue reports, CSV export |

---

## Platform Admin Dashboard — Detail
- **KPI Cards:** Total PGs, Total Users, Total Bookings Today, Revenue This Month
- **Line Chart:** Bookings per day across all PGs (last 30 days)
- **Bar Chart:** Top 5 PGs by bookings this month
- **Pie Chart:** Daily vs Weekly vs Monthly split
- **Recent Bookings Feed:** Last 10 bookings
- **PG Actions:** Approve, Reject with reason, Suspend, View all bookings per PG
- **Reports:** Select PG + date range → day-by-day data, CSV export

---

## PG Detail Page Layout
```
[Photo Gallery — Embla Carousel swipeable]
─────────────────────────────────────────
PG Name                        ★ 4.3 (28)
📍 Koramangala, Bangalore

Owner: Ramesh Kumar   📞 +91 98765 43210
[Call Now]  [WhatsApp]  [Get Directions]

Amenities: WiFi · AC · Food · Laundry · Parking
─────────────────────────────────────────
Available Rooms

  2-Sharing Room        3-Sharing Room
  3 beds available      1 bed available
  ₹300 / day            ₹250 / day
  ₹1800 / week          ₹1500 / week
  ₹6000 / month         ₹5000 / month
  [Book Now]            [Book Now]
─────────────────────────────────────────
Reviews
★★★★☆  "Clean and well maintained"  — Ananya
★★★★★  "Great location and food"    — Ravi
```

---

## Cloud Functions (Back4App)
| Function | What it does |
|----------|-------------|
| `confirmBooking` | Checks availability, decrements beds, sets status confirmed |
| `cancelBooking` | Re-increments beds, sets status cancelled |
| `computePGRating` | Recalculates PG average rating after a review |
| `getDailyBookingStats` | Returns booking count + revenue per PG per day |
| `searchPGsByArea` | Finds PGs within a radius using GeoPoint |
| `getPlatformSummary` | Returns KPI totals for platform admin |
| `approvePG` | Sets isApproved = true |
| `suspendPG` | Sets isSuspended = true, hides from listings |

---

## Environment Variables
```
NEXT_PUBLIC_BACK4APP_APP_ID=
NEXT_PUBLIC_BACK4APP_JS_KEY=
NEXT_PUBLIC_BACK4APP_SERVER_URL=
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=
BACK4APP_MASTER_KEY=
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

---

## Project Architecture
```
pg-website/
├── pages/                  → All routes (.tsx)
├── types/
│   ├── pg.ts               → PG, Room interfaces
│   ├── booking.ts          → Booking, BookingType union, BookingStatus union
│   ├── user.ts             → AppUser, UserRole enum
│   └── review.ts
├── components/
│   ├── common/             → Navbar, Footer, PGCard, RoomCard, Toast
│   ├── booking/            → DatePicker, PersonSelector, PriceSummary
│   ├── map/                → AreaMap, NearbySearch, DirectionsButton
│   └── admin/              → BookingTable, OccupancyChart, KPICard, ReportsExport
├── lib/
│   ├── parseConfig.ts      → Back4App SDK init (must load before any Parse call)
│   ├── cloudinary.ts       → Image upload helper
│   ├── pgService.ts        → PG CRUD and geo queries
│   ├── bookingService.ts   → Create, confirm, cancel, availability check
│   ├── roomService.ts      → Room CRUD and bed count management
│   └── reviewService.ts
├── hooks/
│   ├── usePGs.ts
│   ├── useBookings.ts
│   └── useRooms.ts
├── store/
│   ├── useBookingStore.ts  → In-progress booking state across steps
│   └── useAuthStore.ts     → Logged-in user and role
└── styles/
    └── globals.css
```

---

## Build Order
1. Auth — login, signup, role-based redirect
2. PG listing page — area filter, PG cards with photo and name
3. PG detail page — gallery, owner contact, directions, room cards
4. Booking flow — type selection, date picker, person count, confirmation
5. PG Admin — room management, photo upload, accept/reject bookings
6. Platform Admin — dashboard, PG approval, all bookings, reports
7. Reviews and ratings
8. Google Maps "near me" search and directions
9. CSV export for admin reports



### Tech Requirements
- Website built with Next.js 14 (Pages Router) and TypeScript
- Mobile app built with React Native + Expo SDK 54
- Backend: Back4App (Parse Server) — shared by both website and app
- Images: Cloudinary
- Maps: Google Maps JS API + Places API (web), react-native-maps (app)
- State: Zustand 5
- Data fetching: TanStack React Query v5
- Forms & validation: React Hook Form + Zod
- Notifications: react-hot-toast (web), Expo Push Notifications (app)

### Environment Variables Needed
- Back4App App ID, JS Key, Server URL, Master Key
- Google Maps API Key
- Cloudinary Cloud Name, API Key, API Secret
