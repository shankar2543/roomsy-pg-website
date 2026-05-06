import { DUMMY_PGS } from "@/lib/dummyPGs";
import { decrementAvailableBeds, incrementAvailableBeds } from "@/lib/dummyPGAdmin";

export interface StoredBooking {
  objectId: string;
  userId: string;
  pgId: string;
  pgOwnerId?: string;
  pgName: string;
  pgArea: string;
  pgPhoto: string;
  sharing: "single" | "double" | "triple";
  stayType: "daily" | "monthly";
  fromDate: string;
  toDate?: string;
  months?: number;
  nights?: number;
  total: number;
  status: "pending" | "confirmed" | "rejected" | "cancelled" | "completed" | "renewed";
  tenantName?: string;
  tenantPhone?: string;
  idProofUrl?: string;
  createdAt: string;
  vacatedAt?: string;
}

const STORAGE_KEY = "roomsy_bookings";

const SEED_BOOKINGS: StoredBooking[] = [
  // Ravi Landlord (seed_3) owns: pg_003, pg_005, pg_007, pg_009
  {
    objectId: "bk_seed_2",
    userId: "seed_1",
    pgOwnerId: "seed_3",
    pgId: "pg_007",
    pgName: "Ameerpet Co-Living Hub",
    pgArea: "Ameerpet",
    pgPhoto: "https://images.unsplash.com/photo-1556020685-ae41abfc9365?w=800&q=80",
    sharing: "double",
    stayType: "daily",
    fromDate: "2026-04-10",
    toDate: "2026-04-13",
    nights: 3,
    total: 1380,
    status: "completed",
    tenantName: "Arjun Sharma",
    tenantPhone: "9876543210",
    idProofUrl: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600&q=80",
    createdAt: "2026-04-08T14:00:00.000Z",
  },
  {
    objectId: "bk_seed_3",
    userId: "seed_2",
    pgOwnerId: "seed_3",
    pgId: "pg_005",
    pgName: "Banjara Hills Ladies PG",
    pgArea: "Banjara Hills",
    pgPhoto: "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=800&q=80",
    sharing: "double",
    stayType: "monthly",
    fromDate: "2026-05-01",
    months: 2,
    total: 17000,
    status: "pending",
    tenantName: "Priya Nair",
    tenantPhone: "9123456780",
    idProofUrl: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600&q=80",
    createdAt: "2026-04-28T09:15:00.000Z",
  },
  {
    objectId: "bk_seed_5",
    userId: "seed_1",
    pgOwnerId: "seed_3",
    pgId: "pg_003",
    pgName: "Gachibowli Elite PG",
    pgArea: "Gachibowli",
    pgPhoto: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80",
    sharing: "single",
    stayType: "monthly",
    fromDate: "2026-04-15",
    months: 2,
    total: 26000,
    status: "confirmed",
    tenantName: "Arjun Sharma",
    tenantPhone: "9876543210",
    idProofUrl: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600&q=80",
    createdAt: "2026-04-10T16:30:00.000Z",
  },
  {
    objectId: "bk_seed_6",
    userId: "seed_2",
    pgOwnerId: "seed_3",
    pgId: "pg_009",
    pgName: "Begumpet Premium Stay",
    pgArea: "Begumpet",
    pgPhoto: "https://images.unsplash.com/photo-1587061949409-02df41d5e562?w=800&q=80",
    sharing: "single",
    stayType: "daily",
    fromDate: "2026-05-02",
    toDate: "2026-05-04",
    nights: 2,
    total: 1400,
    status: "pending",
    tenantName: "Priya Nair",
    tenantPhone: "9123456780",
    idProofUrl: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600&q=80",
    createdAt: "2026-04-30T07:45:00.000Z",
  },
  // Meena Hostess (seed_4) owns: pg_002, pg_004, pg_006, pg_008, pg_010
  {
    objectId: "bk_seed_7",
    userId: "seed_1",
    pgOwnerId: "seed_4",
    pgId: "pg_002",
    pgName: "Madhapur Comfort Stay",
    pgArea: "Madhapur",
    pgPhoto: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80",
    sharing: "double",
    stayType: "monthly",
    fromDate: "2026-05-01",
    months: 1,
    total: 7500,
    status: "pending",
    tenantName: "Arjun Sharma",
    tenantPhone: "9876543210",
    idProofUrl: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600&q=80",
    createdAt: "2026-04-29T13:20:00.000Z",
  },
  {
    objectId: "bk_seed_8",
    userId: "seed_2",
    pgOwnerId: "seed_4",
    pgId: "pg_004",
    pgName: "Kondapur Boys Hostel",
    pgArea: "Kondapur",
    pgPhoto: "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=800&q=80",
    sharing: "triple",
    stayType: "monthly",
    fromDate: "2026-04-01",
    months: 3,
    total: 16500,
    status: "confirmed",
    tenantName: "Priya Nair",
    tenantPhone: "9123456780",
    idProofUrl: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600&q=80",
    createdAt: "2026-03-28T10:00:00.000Z",
  },
  {
    objectId: "bk_seed_9",
    userId: "seed_1",
    pgOwnerId: "seed_4",
    pgId: "pg_006",
    pgName: "Kukatpally Nest",
    pgArea: "Kukatpally",
    pgPhoto: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80",
    sharing: "triple",
    stayType: "daily",
    fromDate: "2026-05-03",
    toDate: "2026-05-05",
    nights: 2,
    total: 540,
    status: "pending",
    tenantName: "Arjun Sharma",
    tenantPhone: "9876543210",
    idProofUrl: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600&q=80",
    createdAt: "2026-04-30T06:30:00.000Z",
  },
];

function readLocalStorage(): StoredBooking[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]") as StoredBooking[];
  } catch {
    return [];
  }
}

function writeLocalStorage(bookings: StoredBooking[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(bookings));
  } catch {}
}

export function getAllBookings(): StoredBooking[] {
  const local = readLocalStorage();
  const localIds = new Set(local.map((b) => b.objectId));
  return [
    ...SEED_BOOKINGS.filter((s) => !localIds.has(s.objectId)),
    ...local,
  ];
}

export function getBookingsForUser(userId: string): StoredBooking[] {
  return getAllBookings()
    .filter((b) => b.userId === userId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function getBookingsForOwner(ownerId: string): StoredBooking[] {
  // Match on pgOwnerId (set at booking creation), with a fallback that also resolves
  // bookings whose pgId belongs to one of the owner's PGs — covers any legacy
  // booking row where pgOwnerId might be missing.
  const ownerPgIds = new Set(
    [...DUMMY_PGS, ...(typeof window !== "undefined"
      ? (JSON.parse(localStorage.getItem("roomsy_created_pgs") || "[]") as { objectId: string; owner: { objectId: string } }[])
      : []
    )]
      .filter((pg) => pg.owner.objectId === ownerId)
      .map((pg) => pg.objectId)
  );
  return getAllBookings()
    .filter((b) => b.pgOwnerId === ownerId || ownerPgIds.has(b.pgId))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function saveBooking(booking: StoredBooking): void {
  const local = readLocalStorage();
  writeLocalStorage([...local, booking]);
}

export function deleteBooking(objectId: string): void {
  const booking = getAllBookings().find((b) => b.objectId === objectId);
  const local = readLocalStorage();
  const existsInLocal = local.find((b) => b.objectId === objectId);
  if (existsInLocal) {
    writeLocalStorage(local.filter((b) => b.objectId !== objectId));
  } else {
    // Seed booking — write a tombstone so it doesn't reappear
    const seed = SEED_BOOKINGS.find((b) => b.objectId === objectId);
    if (seed) writeLocalStorage([...local, { ...seed, status: "cancelled" }]);
  }
  if (booking?.status === "confirmed") incrementAvailableBeds(booking.pgId);
}

export function updateBooking(objectId: string, updates: Partial<Pick<StoredBooking, "fromDate" | "months" | "nights" | "total" | "sharing">>): void {
  const local = readLocalStorage();
  const existsInLocal = local.find((b) => b.objectId === objectId);
  if (existsInLocal) {
    writeLocalStorage(local.map((b) => b.objectId === objectId ? { ...b, ...updates } : b));
  } else {
    const seed = SEED_BOOKINGS.find((b) => b.objectId === objectId);
    if (seed) writeLocalStorage([...local, { ...seed, ...updates }]);
  }
}

export function cancelBooking(objectId: string): void {
  const local = readLocalStorage();
  const existsInLocal = local.find((b) => b.objectId === objectId);
  if (existsInLocal) {
    writeLocalStorage(local.map((b) => b.objectId === objectId ? { ...b, status: "cancelled" } : b));
  } else {
    const seed = SEED_BOOKINGS.find((b) => b.objectId === objectId);
    if (seed) writeLocalStorage([...local, { ...seed, status: "cancelled" }]);
  }
}

export function getBookingsForPG(pgId: string): StoredBooking[] {
  return getAllBookings()
    .filter((b) => b.pgId === pgId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function getBookingEndDate(booking: StoredBooking): Date {
  const start = new Date(booking.fromDate);
  if (booking.stayType === "monthly" && booking.months) {
    const end = new Date(start);
    end.setMonth(end.getMonth() + booking.months);
    return end;
  }
  if (booking.toDate) return new Date(booking.toDate);
  const end = new Date(start);
  end.setDate(end.getDate() + (booking.nights ?? 1));
  return end;
}

export function confirmBookingAdmin(objectId: string): void {
  const booking = getAllBookings().find((b) => b.objectId === objectId);
  const local = readLocalStorage();
  const existsInLocal = local.find((b) => b.objectId === objectId);
  if (existsInLocal) {
    writeLocalStorage(local.map((b) => b.objectId === objectId ? { ...b, status: "confirmed" } : b));
  } else {
    const seed = SEED_BOOKINGS.find((b) => b.objectId === objectId);
    if (seed) writeLocalStorage([...local, { ...seed, status: "confirmed" }]);
  }
  if (booking) decrementAvailableBeds(booking.pgId);
}

export function rejectBookingAdmin(objectId: string): void {
  const local = readLocalStorage();
  const existsInLocal = local.find((b) => b.objectId === objectId);
  if (existsInLocal) {
    writeLocalStorage(local.map((b) => b.objectId === objectId ? { ...b, status: "rejected" } : b));
  } else {
    const seed = SEED_BOOKINGS.find((b) => b.objectId === objectId);
    if (seed) writeLocalStorage([...local, { ...seed, status: "rejected" }]);
  }
}

export function vacateBooking(objectId: string): void {
  const booking = getAllBookings().find((b) => b.objectId === objectId);
  const local = readLocalStorage();
  const existsInLocal = local.find((b) => b.objectId === objectId);
  const vacatedAt = new Date().toISOString();
  if (existsInLocal) {
    writeLocalStorage(local.map((b) => b.objectId === objectId ? { ...b, status: "completed", vacatedAt } : b));
  } else {
    const seed = SEED_BOOKINGS.find((b) => b.objectId === objectId);
    if (seed) writeLocalStorage([...local, { ...seed, status: "completed", vacatedAt }]);
  }
  if (booking) incrementAvailableBeds(booking.pgId);
}

export function renewBooking(booking: StoredBooking): StoredBooking {
  const newFromDate = new Date().toISOString().split("T")[0];

  const renewed: StoredBooking = {
    ...booking,
    objectId: `bk_renew_${Date.now()}`,
    fromDate: newFromDate,
    months: booking.stayType === "monthly" ? 1 : undefined,
    nights: booking.stayType === "daily" ? 1 : undefined,
    toDate: undefined,
    status: "confirmed",
    createdAt: new Date().toISOString(),
    vacatedAt: undefined,
  };

  // Mark old booking completed without touching availableBeds —
  // the same resident is continuing, so bed count stays unchanged.
  const local = readLocalStorage();
  const oldExists = local.find((b) => b.objectId === booking.objectId);
  const withOldClosed = oldExists
    ? local.map((b) => b.objectId === booking.objectId ? { ...b, status: "renewed" as const, vacatedAt: new Date().toISOString() } : b)
    : [...local, { ...booking, status: "renewed" as const, vacatedAt: new Date().toISOString() }];

  writeLocalStorage([...withOldClosed, renewed]);
  return renewed;
}
