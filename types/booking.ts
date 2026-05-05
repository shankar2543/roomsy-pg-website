export type BookingType = "daily" | "weekly" | "monthly";

export type BookingStatus =
  | "pending"
  | "confirmed"
  | "rejected"
  | "completed"
  | "cancelled";

export interface Booking {
  objectId: string;
  user: { objectId: string; name: string };
  pg: { objectId: string; name: string };
  room: { objectId: string; type: string };
  bookingType: BookingType;
  persons: number;
  startDate: string;
  endDate: string;
  entryTime?: string;
  exitTime?: string;
  totalPrice: number;
  status: BookingStatus;
  idProofUrl: string;
}
