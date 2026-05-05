export type PGType = "boys" | "girls" | "coliving";
export type RoomType = "1-sharing" | "2-sharing" | "3-sharing";
export type Occupancy = "single" | "double" | "triple";
export type FoodOption = "all" | "breakfast" | "lunch" | "dinner" | "none";
export type Parking = "bike" | "car" | "both" | "none";

export interface PG {
  objectId: string;
  name: string;
  description: string;
  city: string;
  area: string;
  address: string;
  pgType: PGType;
  occupancy: Occupancy[];
  food: FoodOption;
  parking: Parking;
  location: { latitude: number; longitude: number };
  photos: string[];
  amenities: string[];
  owner: { objectId: string; name: string; phone: string };
  isApproved: boolean;
  isSuspended: boolean;
  rating: number;
  availableBeds: number;
  monthlyPrice: number;
  sharingPrices: {
    single?: number;
    double?: number;
    triple?: number;
  };
  dailyPrices: {
    single?: number;
    double?: number;
    triple?: number;
  };
}

export interface Room {
  objectId: string;
  pg: { objectId: string };
  type: "2-sharing" | "3-sharing";
  totalBeds: number;
  availableBeds: number;
  dailyPrice: number;
  weeklyPrice: number;
  monthlyPrice: number;
  photos: string[];
}
