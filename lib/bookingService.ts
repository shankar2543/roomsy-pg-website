import Parse from "@/lib/parseConfig";

export type BookingStatus = "pending" | "confirmed" | "rejected" | "cancelled" | "completed" | "renewed";
export type BookingSharing = "single" | "double" | "triple";
export type BookingStayType = "daily" | "monthly";

// Re-exported under both names for incremental migration.
export type StoredBooking = ServiceBooking;

export interface ServiceBooking {
  objectId: string;
  userId: string;
  pgId: string;
  pgOwnerId?: string;
  pgName: string;
  pgArea: string;
  pgPhoto: string;
  sharing: BookingSharing;
  stayType: BookingStayType;
  fromDate: string;
  toDate?: string;
  months?: number;
  nights?: number;
  total: number;
  status: BookingStatus;
  tenantName?: string;
  tenantPhone?: string;
  idProofUrl?: string;
  createdAt: string;
  vacatedAt?: string;
}

const BOOKING_CLASS = "Booking";

function toServiceBooking(b: Parse.Object): ServiceBooking {
  const user = b.get("user") as Parse.User | undefined;
  const pg = b.get("pg") as Parse.Object | undefined;
  const owner = b.get("pgOwner") as Parse.User | undefined;
  const vacatedAt = b.get("vacatedAt") as Date | undefined;
  return {
    objectId: b.id!,
    userId: user?.id ?? "",
    pgId: pg?.id ?? "",
    pgOwnerId: owner?.id,
    pgName: b.get("pgName") || "",
    pgArea: b.get("pgArea") || "",
    pgPhoto: b.get("pgPhoto") || "",
    sharing: (b.get("sharing") as BookingSharing) || "double",
    stayType: (b.get("stayType") as BookingStayType) || "monthly",
    fromDate: b.get("fromDate") || "",
    toDate: b.get("toDate") || undefined,
    months: b.get("months") ?? undefined,
    nights: b.get("nights") ?? undefined,
    total: b.get("total") || 0,
    status: (b.get("status") as BookingStatus) || "pending",
    tenantName: b.get("tenantName") || undefined,
    tenantPhone: b.get("tenantPhone") || undefined,
    idProofUrl: b.get("idProofUrl") || undefined,
    createdAt: b.get("createdAt")?.toISOString() ?? new Date().toISOString(),
    vacatedAt: vacatedAt ? vacatedAt.toISOString() : undefined,
  };
}

export async function getBookingsForUser(userId: string): Promise<ServiceBooking[]> {
  const u = new Parse.User();
  u.id = userId;
  const q = new Parse.Query(BOOKING_CLASS);
  q.equalTo("user", u);
  q.descending("createdAt");
  q.limit(500);
  const rows = await q.find();
  return rows.map(toServiceBooking);
}

export async function getBookingsForOwner(ownerId: string): Promise<ServiceBooking[]> {
  const u = new Parse.User();
  u.id = ownerId;
  const q = new Parse.Query(BOOKING_CLASS);
  q.equalTo("pgOwner", u);
  q.descending("createdAt");
  q.limit(500);
  const rows = await q.find();
  return rows.map(toServiceBooking);
}

export async function getBookingsForPG(pgId: string): Promise<ServiceBooking[]> {
  const pg = new (Parse.Object.extend("PG"))();
  pg.id = pgId;
  const q = new Parse.Query(BOOKING_CLASS);
  q.equalTo("pg", pg);
  q.descending("createdAt");
  q.limit(500);
  const rows = await q.find();
  return rows.map(toServiceBooking);
}

export async function getAllBookings(): Promise<ServiceBooking[]> {
  // Booking ACLs only allow the customer and the owner to read directly, so a
  // platform admin can't query the class — fan out through a master-key Cloud
  // Function instead.
  const rows = (await Parse.Cloud.run("listAllBookings")) as Array<
    Omit<ServiceBooking, "createdAt" | "vacatedAt"> & {
      createdAt: Date | string;
      vacatedAt?: Date | string;
    }
  >;
  return rows.map((r) => ({
    ...r,
    createdAt:
      typeof r.createdAt === "string" ? r.createdAt : new Date(r.createdAt).toISOString(),
    vacatedAt: r.vacatedAt
      ? typeof r.vacatedAt === "string" ? r.vacatedAt : new Date(r.vacatedAt).toISOString()
      : undefined,
  }));
}

export type BookingCreateInput = {
  pgId: string;
  sharing: BookingSharing;
  stayType: BookingStayType;
  fromDate: string;
  toDate?: string;
  months?: number;
  nights?: number;
  total: number;
  idProofUrl: string;
  tenantName?: string;
  tenantPhone?: string;
};

export async function createBooking(input: BookingCreateInput): Promise<{ objectId: string }> {
  return await Parse.Cloud.run("createBooking", input);
}

export async function confirmBooking(bookingId: string): Promise<void> {
  await Parse.Cloud.run("confirmBooking", { bookingId });
}

export async function rejectBooking(bookingId: string): Promise<void> {
  await Parse.Cloud.run("rejectBooking", { bookingId });
}

export async function cancelBooking(bookingId: string): Promise<void> {
  await Parse.Cloud.run("cancelBooking", { bookingId });
}

export async function vacateBooking(bookingId: string): Promise<void> {
  await Parse.Cloud.run("vacateBooking", { bookingId });
}

export async function deleteBooking(bookingId: string): Promise<void> {
  await Parse.Cloud.run("deleteBooking", { bookingId });
}

export async function updateBooking(
  bookingId: string,
  updates: Partial<Pick<ServiceBooking, "fromDate" | "toDate" | "months" | "nights" | "total" | "sharing">>,
): Promise<void> {
  await Parse.Cloud.run("updateBooking", { bookingId, updates });
}

export async function renewBooking(bookingId: string): Promise<{ objectId: string }> {
  return await Parse.Cloud.run("renewBooking", { bookingId });
}

export async function getSignedIdProofUrl(bookingId: string): Promise<string | null> {
  const res = (await Parse.Cloud.run("getSignedIdProofUrl", { bookingId })) as
    | { url: string | null; signed?: boolean }
    | null;
  return res?.url ?? null;
}

export function getBookingEndDate(booking: ServiceBooking): Date {
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
