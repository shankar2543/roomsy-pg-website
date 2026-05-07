import Parse from "@/lib/parseConfig";
import { PG, FoodOption, Occupancy, PGType, Parking } from "@/types/pg";

const PG_CLASS = "PG";

function toPG(pp: Parse.Object): PG {
  const owner = pp.get("owner") as Parse.User | undefined;
  return {
    objectId: pp.id!,
    name: pp.get("name") || "",
    description: pp.get("description") || "",
    city: pp.get("city") || "",
    area: pp.get("area") || "",
    address: pp.get("address") || "",
    pincode: pp.get("pincode") || undefined,
    pgType: (pp.get("pgType") as PGType) || "coliving",
    occupancy: (pp.get("occupancy") as Occupancy[]) || [],
    food: (pp.get("food") as FoodOption) || "none",
    parking: (pp.get("parking") as Parking) || "none",
    location: pp.get("location") || { latitude: 0, longitude: 0 },
    photos: pp.get("photos") || [],
    amenities: pp.get("amenities") || [],
    owner: {
      objectId: owner?.id ?? "",
      // Prefer the denormalised fields on the PG row — Parse's default
      // _User ACL blocks anonymous reads, so the included owner's
      // name/phone are usually empty for non-owner viewers.
      name: pp.get("ownerName") || owner?.get("name") || "",
      phone: pp.get("ownerPhone") || owner?.get("phone") || "",
    },
    isApproved: !!pp.get("isApproved"),
    isSuspended: !!pp.get("isSuspended"),
    rating: pp.get("rating") || 0,
    availableBeds: pp.get("availableBeds") || 0,
    monthlyPrice: pp.get("monthlyPrice") || 0,
    sharingPrices: pp.get("sharingPrices") || {},
    dailyPrices: pp.get("dailyPrices") || {},
  };
}

export async function listApprovedPGs(): Promise<PG[]> {
  const q = new Parse.Query(PG_CLASS);
  q.equalTo("isApproved", true);
  q.notEqualTo("isSuspended", true);
  q.include("owner");
  q.limit(500);
  const rows = await q.find();
  return rows.map(toPG);
}

export async function listAllPGs(): Promise<PG[]> {
  const q = new Parse.Query(PG_CLASS);
  q.include("owner");
  q.limit(500);
  const rows = await q.find();
  return rows.map(toPG);
}

export async function getPGById(objectId: string): Promise<PG | null> {
  const q = new Parse.Query(PG_CLASS);
  q.include("owner");
  try {
    const row = await q.get(objectId);
    return toPG(row);
  } catch (e) {
    if (e instanceof Parse.Error && e.code === Parse.Error.OBJECT_NOT_FOUND) return null;
    throw e;
  }
}

export async function getPGsForOwner(ownerId: string): Promise<PG[]> {
  const ownerPointer = new Parse.User();
  ownerPointer.id = ownerId;
  const q = new Parse.Query(PG_CLASS);
  q.equalTo("owner", ownerPointer);
  q.include("owner");
  q.limit(500);
  const rows = await q.find();
  return rows.map(toPG);
}

export type PGCreateInput = {
  name: string;
  description?: string;
  city?: string;
  area: string;
  address: string;
  pincode?: string;
  pgType: PGType;
  occupancy: Occupancy[];
  food?: FoodOption;
  parking?: Parking;
  location: { latitude: number; longitude: number };
  photos: string[];
  amenities?: string[];
  availableBeds?: number;
  sharingPrices: { single?: number; double?: number; triple?: number };
  dailyPrices?: { single?: number; double?: number; triple?: number };
};

export async function createPG(input: PGCreateInput): Promise<{ objectId: string }> {
  return await Parse.Cloud.run("createPG", input);
}

export async function approvePG(pgId: string): Promise<void> {
  await Parse.Cloud.run("approvePG", { pgId });
}

export async function suspendPG(pgId: string): Promise<void> {
  await Parse.Cloud.run("suspendPG", { pgId });
}

export async function unsuspendPG(pgId: string): Promise<void> {
  await Parse.Cloud.run("unsuspendPG", { pgId });
}

export async function updatePGPhotos(pgId: string, photos: string[]): Promise<void> {
  await Parse.Cloud.run("updatePGPhotos", { pgId, photos });
}

export async function updatePGPrices(
  pgId: string,
  sharingPrices: { single?: number; double?: number; triple?: number },
  dailyPrices: { single?: number; double?: number; triple?: number },
): Promise<void> {
  await Parse.Cloud.run("updatePGPrices", { pgId, sharingPrices, dailyPrices });
}

export async function updatePGAvailableBeds(pgId: string, availableBeds: number): Promise<void> {
  await Parse.Cloud.run("updatePGAvailableBeds", { pgId, availableBeds });
}

export async function updatePGAmenities(pgId: string, amenities: string[]): Promise<void> {
  await Parse.Cloud.run("updatePGAmenities", { pgId, amenities });
}
