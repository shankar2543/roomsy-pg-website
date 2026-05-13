import Parse from "@/lib/parseConfig";
import { AppUser, UserRole } from "@/types/user";

type Role = UserRole;

const ROLE_LABELS: Record<Role, string> = {
  customer: "Tenant",
  pg_admin: "PG Owner",
  platform_admin: "Platform Admin",
};

function toAppUser(pu: Parse.User): AppUser {
  return {
    objectId: pu.id!,
    name: pu.get("name") || "",
    email: pu.getEmail() || pu.get("email") || "",
    phone: pu.get("phone") || "",
    role: (pu.get("role") as UserRole) || "customer",
    profilePic: pu.get("profilePic") || undefined,
    idProofUrl: pu.get("idProofUrl") || undefined,
    idProofType: pu.get("idProofType") || undefined,
    bio: pu.get("bio") || undefined,
    city: pu.get("city") || undefined,
  };
}

export async function signupUser(params: {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: "customer" | "pg_admin";
}): Promise<AppUser> {
  const u = new Parse.User();
  u.set("username", params.email);
  u.set("email", params.email);
  u.set("password", params.password);
  u.set("name", params.name);
  u.set("phone", params.phone);
  u.set("role", params.role);
  await u.signUp();
  return toAppUser(u);
}

/**
 * If `id` looks like a phone number (no @, mostly digits with optional +, spaces,
 * dashes, or parens), strip it down to the canonical 10-digit local form used
 * by stored User.phone values. Returns null when the input doesn't look like a
 * phone number, so callers fall through to treating it as an email.
 *
 * Handles:
 *   "9876543210"        → "9876543210"
 *   "+91 9876543210"    → "9876543210"
 *   "+91-98765-43210"   → "9876543210"
 *   "(987) 654-3210"    → "9876543210"
 *   "09876543210"       → "9876543210"  (leading 0 dropped, common in India)
 */
function normalisePhone(id: string): string | null {
  if (id.includes("@")) return null;
  const digits = id.replace(/\D/g, "");
  if (digits.length === 0) return null;
  // Drop +91 country code (12 digits starting with 91) or leading 0 (11 digits).
  if (digits.length === 12 && digits.startsWith("91")) return digits.slice(2);
  if (digits.length === 11 && digits.startsWith("0"))  return digits.slice(1);
  // Anything else that's pure digits is treated as a phone number.
  return digits;
}

export async function loginUser(params: {
  identifier: string;
  password: string;
  role: Role | Role[];
}): Promise<AppUser> {
  const id = params.identifier.trim();
  const phone = normalisePhone(id);

  let email = id;
  if (phone) {
    const res = (await Parse.Cloud.run("findEmailByPhone", { phone })) as
      | { email: string }
      | null;
    if (!res || !res.email) throw new Error("No account found with those details.");
    email = res.email;
  }

  let u: Parse.User;
  try {
    u = await Parse.User.logIn(email, params.password);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "";
    if (/Invalid username\/password|Invalid login|Invalid credentials/i.test(msg)) {
      throw new Error("Incorrect email or password.");
    }
    throw e;
  }

  const role = (u.get("role") as Role) || "customer";
  const allowed = Array.isArray(params.role) ? params.role : [params.role];
  if (!allowed.includes(role)) {
    await Parse.User.logOut();
    const expected = allowed.map((r) => ROLE_LABELS[r] ?? r).join(" or ");
    throw new Error(`This account is not registered as a ${expected}.`);
  }

  return toAppUser(u);
}

export async function logoutUser(): Promise<void> {
  await Parse.User.logOut();
}

export function getCurrentAppUser(): AppUser | null {
  const u = Parse.User.current();
  return u ? toAppUser(u) : null;
}

export async function listAllUsers(): Promise<AppUser[]> {
  const rows = (await Parse.Cloud.run("listAllUsers")) as Array<{
    objectId: string;
    name: string;
    email: string;
    phone: string;
    role: UserRole;
    profilePic: string | null;
    city: string | null;
  }>;
  return rows.map((r) => ({
    objectId: r.objectId,
    name: r.name,
    email: r.email,
    phone: r.phone,
    role: r.role,
    profilePic: r.profilePic ?? undefined,
    city: r.city ?? undefined,
  }));
}

export async function updateCurrentUser(patch: Partial<AppUser>): Promise<AppUser> {
  const u = Parse.User.current();
  if (!u) throw new Error("Not logged in.");

  const editable: (keyof AppUser)[] = [
    "name",
    "phone",
    "profilePic",
    "idProofUrl",
    "idProofType",
    "bio",
    "city",
  ];
  for (const k of editable) {
    const value = patch[k];
    if (value !== undefined) u.set(k as string, value);
  }
  await u.save();
  return toAppUser(u);
}
