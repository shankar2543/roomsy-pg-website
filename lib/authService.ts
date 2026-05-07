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

export async function loginUser(params: {
  identifier: string;
  password: string;
  role: Role | Role[];
}): Promise<AppUser> {
  const id = params.identifier.trim();
  const isPhone = /^\d+$/.test(id);

  let email = id;
  if (isPhone) {
    const res = (await Parse.Cloud.run("findEmailByPhone", { phone: id })) as
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
