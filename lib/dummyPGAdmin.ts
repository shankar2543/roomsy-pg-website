import { PG, Occupancy } from "@/types/pg";
import { DUMMY_PGS } from "@/lib/dummyPGs";

const OVERRIDES_KEY = "roomsy_pg_overrides";

type PGOverride = Partial<Pick<PG, "sharingPrices" | "dailyPrices" | "occupancy" | "amenities" | "photos" | "availableBeds" | "monthlyPrice" | "isApproved" | "isSuspended">>;

function readOverrides(): Record<string, PGOverride> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(OVERRIDES_KEY) || "{}");
  } catch {
    return {};
  }
}

function writeOverrides(overrides: Record<string, PGOverride>) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(OVERRIDES_KEY, JSON.stringify(overrides));
  } catch {}
}

export function getPGsForOwner(ownerId: string): PG[] {
  const overrides = readOverrides();
  return DUMMY_PGS
    .filter((pg) => pg.owner.objectId === ownerId)
    .map((pg) => applyOverride(pg, overrides[pg.objectId]));
}

export function getPGWithOverrides(pgId: string): PG | null {
  const pg = DUMMY_PGS.find((p) => p.objectId === pgId);
  if (!pg) return null;
  const overrides = readOverrides();
  return applyOverride(pg, overrides[pgId]);
}

function applyOverride(pg: PG, override?: PGOverride): PG {
  if (!override) return pg;
  return { ...pg, ...override };
}

function patchOverride(pgId: string, patch: PGOverride) {
  const overrides = readOverrides();
  overrides[pgId] = { ...(overrides[pgId] || {}), ...patch };
  writeOverrides(overrides);
}

export function updatePGPrices(
  pgId: string,
  sharingPrices: PG["sharingPrices"],
  dailyPrices: PG["dailyPrices"]
) {
  const lowestMonthly = Math.min(
    ...Object.values(sharingPrices).filter((v): v is number => v !== undefined)
  );
  patchOverride(pgId, {
    sharingPrices,
    dailyPrices,
    monthlyPrice: isFinite(lowestMonthly) ? lowestMonthly : undefined,
  });
}

export function updatePGAvailableBeds(pgId: string, availableBeds: number) {
  patchOverride(pgId, { availableBeds });
}

export function decrementAvailableBeds(pgId: string) {
  const pg = getPGWithOverrides(pgId);
  if (!pg) return;
  patchOverride(pgId, { availableBeds: Math.max(0, pg.availableBeds - 1) });
}

export function incrementAvailableBeds(pgId: string) {
  const pg = getPGWithOverrides(pgId);
  if (!pg) return;
  patchOverride(pgId, { availableBeds: pg.availableBeds + 1 });
}

export function updatePGAmenities(pgId: string, amenities: string[]) {
  patchOverride(pgId, { amenities });
}

export function addPGPhoto(pgId: string, photoUrl: string) {
  const pg = getPGWithOverrides(pgId);
  if (!pg) return;
  patchOverride(pgId, { photos: [...pg.photos, photoUrl] });
}

export function removePGPhoto(pgId: string, photoUrl: string) {
  const pg = getPGWithOverrides(pgId);
  if (!pg) return;
  patchOverride(pgId, { photos: pg.photos.filter((p) => p !== photoUrl) });
}

export function getAllPGsWithOverrides(): PG[] {
  const overrides = readOverrides();
  return DUMMY_PGS.map((pg) => applyOverride(pg, overrides[pg.objectId]));
}

export function approvePG(pgId: string) {
  patchOverride(pgId, { isApproved: true, isSuspended: false });
}

export function suspendPG(pgId: string) {
  patchOverride(pgId, { isSuspended: true });
}

export function unsuspendPG(pgId: string) {
  patchOverride(pgId, { isSuspended: false });
}
