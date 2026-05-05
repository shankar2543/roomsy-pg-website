import { AppUser } from "@/types/user";

const STORAGE_KEY = "roomsy_users";
const SESSION_KEY = "roomsy_session";

interface StoredUser extends AppUser {
  password: string;
  phone: string;
}

const SEED_USERS: StoredUser[] = [
  { objectId: "seed_1", name: "Arjun Sharma",   email: "arjun@test.com",  phone: "9876543210", password: "tenant123",   role: "customer"        },
  { objectId: "seed_2", name: "Priya Nair",     email: "priya@test.com",  phone: "9123456780", password: "tenant123",   role: "customer"        },
  { objectId: "seed_3", name: "Ravi Landlord",  email: "ravi@test.com",   phone: "9000000001", password: "owner123",    role: "pg_admin"        },
  { objectId: "seed_4", name: "Meena Hostess",  email: "meena@test.com",  phone: "9000000002", password: "owner123",    role: "pg_admin"        },
  { objectId: "seed_5", name: "Roomsy Admin",   email: "admin@roomsy.com",phone: "9000000099", password: "admin123",    role: "platform_admin"  },
];

function getUsers(): StoredUser[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]") as StoredUser[];
    // Merge seed accounts — don't overwrite if a real signup used the same email
    const merged = [...SEED_USERS];
    for (const u of stored) {
      if (!merged.find((s) => s.objectId === u.objectId)) merged.push(u);
    }
    return merged;
  } catch {
    return SEED_USERS;
  }
}

function saveUsers(users: StoredUser[]) {
  // Only persist non-seed users to localStorage
  const nonSeed = users.filter((u) => !u.objectId.startsWith("seed_"));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(nonSeed));
}

export function signupDummy(params: {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: "customer" | "pg_admin";
}): AppUser {
  const users = getUsers();

  if (users.find((u) => u.email === params.email)) {
    throw new Error("An account with this email already exists.");
  }
  if (users.find((u) => u.phone === params.phone)) {
    throw new Error("An account with this phone number already exists.");
  }

  const newUser: StoredUser = {
    objectId: `user_${Date.now()}`,
    name: params.name,
    email: params.email,
    phone: params.phone,
    role: params.role,
    password: params.password,
  };

  saveUsers([...users, newUser]);
  const { password: _, ...appUser } = newUser;
  localStorage.setItem(SESSION_KEY, JSON.stringify(appUser));
  return appUser;
}

export function getAllUsers(): Omit<StoredUser, "password">[] {
  return getUsers().map(({ password: _, ...u }) => u);
}

type Role = "customer" | "pg_admin" | "platform_admin";

export function loginDummy(params: {
  identifier: string; // email or phone
  password: string;
  role: Role | Role[];
}): AppUser {
  const users = getUsers();
  const id = params.identifier.trim();
  const isPhone = /^\d+$/.test(id);

  const user = users.find((u) =>
    isPhone ? u.phone === id : u.email.toLowerCase() === id.toLowerCase()
  );

  if (!user) throw new Error("No account found with those details.");
  if (user.password !== params.password) throw new Error("Incorrect password.");

  const allowed = Array.isArray(params.role) ? params.role : [params.role];
  if (!allowed.includes(user.role as Role)) {
    const labels: Record<string, string> = { pg_admin: "PG Owner", customer: "Tenant", platform_admin: "Platform Admin" };
    const expected = allowed.map((r) => labels[r] ?? r).join(" or ");
    throw new Error(`This account is not registered as a ${expected}.`);
  }

  const { password: _, ...appUser } = user;
  localStorage.setItem(SESSION_KEY, JSON.stringify(appUser));
  return appUser;
}

export function updateUserDummy(objectId: string, patch: Partial<AppUser>): AppUser {
  if (typeof window === "undefined") throw new Error("Not available on server");
  const users = getUsers();
  const idx = users.findIndex((u) => u.objectId === objectId);
  if (idx === -1) throw new Error("Account not found.");
  const updated: StoredUser = { ...users[idx], ...patch };
  // Persist (non-seed users go to localStorage; seed accounts can be edited in-session via SESSION_KEY)
  if (!objectId.startsWith("seed_")) {
    saveUsers(users.map((u, i) => (i === idx ? updated : u)));
  }
  // Always refresh the current session
  const { password: _pw, ...appUser } = updated;
  localStorage.setItem(SESSION_KEY, JSON.stringify(appUser));
  return appUser;
}

export function logoutDummy() {
  localStorage.removeItem(SESSION_KEY);
}

export function getSessionUser(): AppUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
