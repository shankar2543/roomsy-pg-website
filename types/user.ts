export type UserRole = "customer" | "pg_admin" | "platform_admin";

export interface AppUser {
  objectId: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  profilePic?: string;
  idProofUrl?: string;
  idProofType?: "aadhaar" | "pan" | "driving_license";
  bio?: string;
  city?: string;
}
