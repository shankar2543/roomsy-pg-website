// Back4App Cloud Code entry point.
// Paste the contents of this file into Back4App → Cloud Code → main.js,
// or sync the cloud/ folder via the Back4App CLI.

Parse.Cloud.define("hello", async (request) => {
  return {
    ok: true,
    message: "Hello from Back4App Cloud Code",
    serverTime: new Date().toISOString(),
    receivedParams: request.params || {},
    callerUserId: request.user ? request.user.id : null,
  };
});

// Resolve a phone number to its associated email so the client can
// call Parse.User.logIn(email, password). Uses master key because
// the _User class is not queryable by anonymous clients by default.
Parse.Cloud.define("findEmailByPhone", async (request) => {
  const phone = request.params && request.params.phone;
  if (!phone) {
    throw new Parse.Error(Parse.Error.INVALID_QUERY, "phone is required");
  }
  const q = new Parse.Query(Parse.User);
  q.equalTo("phone", String(phone));
  const u = await q.first({ useMasterKey: true });
  if (!u) return null;
  return { email: u.get("email") };
});

// One-shot dev helper: creates the seed users (idempotent — skips any that
// already exist by email). Safe to call repeatedly. Remove or restrict
// before going to production.
Parse.Cloud.define("seedUsers", async () => {
  const seeds = [
    { name: "Arjun Sharma",  email: "arjun@test.com",   phone: "9876543210", password: "tenant123", role: "customer"       },
    { name: "Priya Nair",    email: "priya@test.com",   phone: "9123456780", password: "tenant123", role: "customer"       },
    { name: "Ravi Landlord", email: "ravi@test.com",    phone: "9000000001", password: "owner123",  role: "pg_admin"       },
    { name: "Meena Hostess", email: "meena@test.com",   phone: "9000000002", password: "owner123",  role: "pg_admin"       },
    { name: "Roomsy Admin",  email: "admin@roomsy.com", phone: "9000000099", password: "admin123",  role: "platform_admin" },
  ];

  const results = [];
  for (const s of seeds) {
    const q = new Parse.Query(Parse.User);
    q.equalTo("email", s.email);
    const existing = await q.first({ useMasterKey: true });
    if (existing) {
      results.push({ email: s.email, status: "exists" });
      continue;
    }
    const u = new Parse.User();
    u.set("username", s.email);
    u.set("email", s.email);
    u.set("password", s.password);
    u.set("name", s.name);
    u.set("phone", s.phone);
    u.set("role", s.role);
    await u.signUp(null, { useMasterKey: true });
    results.push({ email: s.email, status: "created" });
  }
  return { ok: true, results };
});

// Dev helper: creates the seed PGs on Back4App (idempotent — uses `slug`
// as a stable lookup key so re-runs skip rows that already exist).
// Owners are linked by email to the seed users created by seedUsers.
Parse.Cloud.define("seedPGs", async () => {
  const RAVI = "ravi@test.com";
  const MEENA = "meena@test.com";

  async function findUserByEmail(email) {
    const q = new Parse.Query(Parse.User);
    q.equalTo("email", email);
    const u = await q.first({ useMasterKey: true });
    if (!u) throw new Parse.Error(Parse.Error.OBJECT_NOT_FOUND, `User not found: ${email}. Run seedUsers first.`);
    return u;
  }

  const ravi = await findUserByEmail(RAVI);
  const meena = await findUserByEmail(MEENA);

  const seeds = [
    { slug: "pg_002", ownerEmail: MEENA, name: "Madhapur Comfort Stay", description: "Spacious rooms with homely meals. Walking distance to Mindspace and Cyber Towers.", city: "Hyderabad", area: "Madhapur", address: "Road No. 2, Jubilee Hills Extension, Madhapur, Hyderabad", pgType: "girls", occupancy: ["double", "triple"], food: "breakfast", parking: "none", location: { latitude: 17.4484, longitude: 78.3908 }, photos: ["https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80"], amenities: ["WiFi", "Meals", "Laundry", "CCTV", "24/7 Security"], isApproved: true, isSuspended: false, rating: 4.5, availableBeds: 1, monthlyPrice: 7500, sharingPrices: { double: 7500, triple: 5500 }, dailyPrices: { double: 420, triple: 310 } },
    { slug: "pg_003", ownerEmail: RAVI,  name: "Gachibowli Elite PG", description: "Premium co-living space ideal for IT professionals. Rooftop common area, fully air-conditioned.", city: "Hyderabad", area: "Gachibowli", address: "Survey No. 45, Gachibowli Village, Hyderabad", pgType: "coliving", occupancy: ["single", "double", "triple"], food: "all", parking: "both", location: { latitude: 17.44, longitude: 78.3489 }, photos: ["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80"], amenities: ["WiFi", "AC", "Gym", "Lounge", "Meals", "Housekeeping"], isApproved: true, isSuspended: false, rating: 4.9, availableBeds: 6, monthlyPrice: 13000, sharingPrices: { single: 13000, double: 9500, triple: 7000 }, dailyPrices: { single: 750, double: 550, triple: 400 } },
    { slug: "pg_004", ownerEmail: MEENA, name: "Kondapur Boys Hostel", description: "Budget-friendly PG near JNTU and Kondapur bus stop. Clean rooms with regular housekeeping.", city: "Hyderabad", area: "Kondapur", address: "Lane 7, Sri Nagar Colony, Kondapur, Hyderabad", pgType: "boys", occupancy: ["triple"], food: "none", parking: "bike", location: { latitude: 17.46, longitude: 78.36 }, photos: ["https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=800&q=80"], amenities: ["WiFi", "Meals", "Laundry", "Parking"], isApproved: true, isSuspended: false, rating: 4.1, availableBeds: 1, monthlyPrice: 5500, sharingPrices: { triple: 5500 }, dailyPrices: { triple: 300 } },
    { slug: "pg_005", ownerEmail: RAVI,  name: "Banjara Hills Ladies PG", description: "Safe and secure PG exclusively for women in prime Banjara Hills location. 24/7 security.", city: "Hyderabad", area: "Banjara Hills", address: "Road No. 10, Banjara Hills, Hyderabad", pgType: "girls", occupancy: ["single", "double"], food: "all", parking: "car", location: { latitude: 17.4156, longitude: 78.4347 }, photos: ["https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=800&q=80"], amenities: ["WiFi", "AC", "Meals", "CCTV", "24/7 Security", "Laundry"], isApproved: true, isSuspended: false, rating: 4.8, availableBeds: 3, monthlyPrice: 11000, sharingPrices: { single: 11000, double: 8500 }, dailyPrices: { single: 650, double: 480 } },
    { slug: "pg_006", ownerEmail: MEENA, name: "Kukatpally Nest", description: "Affordable PG near KPHB and Kukatpally bus depot. Ideal for students and freshers.", city: "Hyderabad", area: "Kukatpally", address: "KPHB Phase 3, Kukatpally, Hyderabad", pgType: "boys", occupancy: ["triple"], food: "breakfast", parking: "bike", location: { latitude: 17.4948, longitude: 78.3996 }, photos: ["https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80"], amenities: ["WiFi", "Meals", "Laundry", "TV Room"], isApproved: true, isSuspended: false, rating: 3.9, availableBeds: 5, monthlyPrice: 4800, sharingPrices: { triple: 4800 }, dailyPrices: { triple: 270 } },
    { slug: "pg_007", ownerEmail: RAVI,  name: "Ameerpet Co-Living Hub", description: "Vibrant co-living community near coaching institutes and Ameerpet metro. High-speed internet.", city: "Hyderabad", area: "Ameerpet", address: "Street 5, SR Nagar, Ameerpet, Hyderabad", pgType: "coliving", occupancy: ["single", "double"], food: "dinner", parking: "both", location: { latitude: 17.4375, longitude: 78.4483 }, photos: ["https://images.unsplash.com/photo-1556020685-ae41abfc9365?w=800&q=80"], amenities: ["WiFi", "AC", "Rooftop", "Meals", "Gym", "Study Room"], isApproved: true, isSuspended: false, rating: 4.6, availableBeds: 1, monthlyPrice: 10500, sharingPrices: { single: 10500, double: 8000 }, dailyPrices: { single: 620, double: 460 } },
    { slug: "pg_008", ownerEmail: MEENA, name: "Nallagandla Girls Residence", description: "Peaceful PG for working women near financial district. Homemade meals, no restrictions.", city: "Hyderabad", area: "Nallagandla", address: "Nallagandla Village Road, Near Financial District, Hyderabad", pgType: "girls", occupancy: ["double", "triple"], food: "lunch", parking: "none", location: { latitude: 17.4235, longitude: 78.32 }, photos: ["https://images.unsplash.com/photo-1543269664-76bc3997d9ea?w=800&q=80"], amenities: ["WiFi", "Meals", "Laundry", "Parking", "RO Water"], isApproved: true, isSuspended: false, rating: 4.3, availableBeds: 4, monthlyPrice: 8000, sharingPrices: { double: 8000, triple: 6000 }, dailyPrices: { double: 450, triple: 340 } },
    { slug: "pg_009", ownerEmail: RAVI,  name: "Begumpet Premium Stay", description: "Well-connected PG near Begumpet airport road. Close to Secunderabad railway station.", city: "Hyderabad", area: "Begumpet", address: "SP Road, Begumpet, Hyderabad", pgType: "boys", occupancy: ["single", "double"], food: "all", parking: "car", location: { latitude: 17.4432, longitude: 78.4636 }, photos: ["https://images.unsplash.com/photo-1587061949409-02df41d5e562?w=800&q=80"], amenities: ["WiFi", "AC", "Meals", "Gym", "Laundry"], isApproved: true, isSuspended: false, rating: 4.4, availableBeds: 0, monthlyPrice: 12000, sharingPrices: { single: 12000, double: 9000 }, dailyPrices: { single: 700, double: 520 } },
    { slug: "pg_010", ownerEmail: MEENA, name: "Miyapur Shared Living", description: "Budget co-living near Miyapur metro end-station. Perfect for students attending Hyderabad colleges.", city: "Hyderabad", area: "Miyapur", address: "Miyapur X Roads, Near JNTU Gate, Hyderabad", pgType: "coliving", occupancy: ["double", "triple"], food: "breakfast", parking: "bike", location: { latitude: 17.4964, longitude: 78.3522 }, photos: ["https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80"], amenities: ["WiFi", "Meals", "Study Room", "CCTV", "Laundry"], isApproved: true, isSuspended: false, rating: 4.0, availableBeds: 7, monthlyPrice: 6000, sharingPrices: { double: 6000, triple: 4500 }, dailyPrices: { double: 350, triple: 260 } },
    { slug: "pg_011", ownerEmail: RAVI,  name: "Jubilee Hills Premium PG", description: "Newly opened PG in the heart of Jubilee Hills. Premium amenities, 24/7 security, fully furnished.", city: "Hyderabad", area: "Jubilee Hills", address: "Road No. 36, Jubilee Hills, Hyderabad", pgType: "coliving", occupancy: ["single", "double"], food: "all", parking: "both", location: { latitude: 17.4319, longitude: 78.4075 }, photos: ["https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80"], amenities: ["WiFi", "AC", "Gym", "Meals", "Laundry", "Rooftop"], isApproved: false, isSuspended: false, rating: 0, availableBeds: 8, monthlyPrice: 14000, sharingPrices: { single: 14000, double: 10000 }, dailyPrices: { single: 800, double: 580 } },
    { slug: "pg_012", ownerEmail: MEENA, name: "Dilsukhnagar Budget Stay", description: "Affordable PG near Dilsukhnagar bus depot. Close to coaching centres, clean and well-maintained.", city: "Hyderabad", area: "Dilsukhnagar", address: "Main Road, Dilsukhnagar, Hyderabad", pgType: "boys", occupancy: ["triple"], food: "breakfast", parking: "bike", location: { latitude: 17.3688, longitude: 78.5247 }, photos: ["https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=800&q=80"], amenities: ["WiFi", "Meals", "Laundry", "CCTV"], isApproved: false, isSuspended: false, rating: 0, availableBeds: 5, monthlyPrice: 4500, sharingPrices: { triple: 4500 }, dailyPrices: { triple: 250 } },
  ];

  const PG = Parse.Object.extend("PG");
  const publicAcl = new Parse.ACL();
  publicAcl.setPublicReadAccess(true);
  publicAcl.setPublicWriteAccess(false);

  const results = [];
  for (const s of seeds) {
    const q = new Parse.Query("PG");
    q.equalTo("slug", s.slug);
    const existing = await q.first({ useMasterKey: true });
    if (existing) {
      results.push({ slug: s.slug, status: "exists" });
      continue;
    }
    const owner = s.ownerEmail === RAVI ? ravi : meena;
    const pg = new PG();
    pg.set("slug", s.slug);
    pg.set("name", s.name);
    pg.set("description", s.description);
    pg.set("city", s.city);
    pg.set("area", s.area);
    pg.set("address", s.address);
    pg.set("pgType", s.pgType);
    pg.set("occupancy", s.occupancy);
    pg.set("food", s.food);
    pg.set("parking", s.parking);
    pg.set("location", s.location);
    pg.set("photos", s.photos);
    pg.set("amenities", s.amenities);
    pg.set("isApproved", s.isApproved);
    pg.set("isSuspended", s.isSuspended);
    pg.set("rating", s.rating);
    pg.set("availableBeds", s.availableBeds);
    pg.set("monthlyPrice", s.monthlyPrice);
    pg.set("sharingPrices", s.sharingPrices);
    pg.set("dailyPrices", s.dailyPrices);
    pg.set("owner", owner);
    pg.setACL(publicAcl);
    await pg.save(null, { useMasterKey: true });
    results.push({ slug: s.slug, status: "created", objectId: pg.id });
  }
  return { ok: true, results };
});

// Owner submits a new PG for admin approval.
// Requires the caller to be authenticated with role pg_admin.
Parse.Cloud.define("createPG", async (request) => {
  if (!request.user) throw new Parse.Error(Parse.Error.INVALID_SESSION_TOKEN, "Login required");
  if (request.user.get("role") !== "pg_admin") {
    throw new Parse.Error(Parse.Error.OPERATION_FORBIDDEN, "Only PG owners can create listings");
  }
  const d = request.params || {};
  const required = ["name", "area", "address", "pgType", "occupancy", "location", "photos", "sharingPrices"];
  for (const k of required) {
    if (d[k] === undefined || d[k] === null) {
      throw new Parse.Error(Parse.Error.INVALID_QUERY, `${k} is required`);
    }
  }

  const sharingValues = Object.values(d.sharingPrices || {}).filter((v) => typeof v === "number" && v > 0);
  const lowestMonthly = sharingValues.length > 0 ? Math.min(...sharingValues) : 0;

  const PG = Parse.Object.extend("PG");
  const pg = new PG();
  const publicAcl = new Parse.ACL();
  publicAcl.setPublicReadAccess(true);
  publicAcl.setPublicWriteAccess(false);
  pg.setACL(publicAcl);

  pg.set("name", String(d.name).trim());
  pg.set("description", String(d.description || "").trim());
  pg.set("city", String(d.city || "Hyderabad").trim());
  pg.set("area", String(d.area).trim());
  pg.set("address", String(d.address).trim());
  if (d.pincode) pg.set("pincode", String(d.pincode).trim());
  pg.set("pgType", d.pgType);
  pg.set("occupancy", d.occupancy);
  pg.set("food", d.food || "none");
  pg.set("parking", d.parking || "none");
  pg.set("location", d.location);
  pg.set("photos", d.photos);
  pg.set("amenities", d.amenities || []);
  pg.set("availableBeds", typeof d.availableBeds === "number" ? d.availableBeds : 0);
  pg.set("sharingPrices", d.sharingPrices);
  pg.set("dailyPrices", d.dailyPrices || {});
  pg.set("monthlyPrice", lowestMonthly);
  pg.set("rating", 0);
  pg.set("isApproved", false);
  pg.set("isSuspended", false);
  pg.set("owner", request.user);

  await pg.save(null, { useMasterKey: true });
  await notifyAllPlatformAdmins({
    type: "pg_submitted",
    title: "New PG submitted for review",
    body: `${pg.get("name")} (${pg.get("area")}) by ${request.user.get("name") || "an owner"} is awaiting approval.`,
    link: `/admin/pgs/${pg.id}`,
  });
  return { objectId: pg.id };
});

async function requirePlatformAdmin(request) {
  if (!request.user) throw new Parse.Error(Parse.Error.INVALID_SESSION_TOKEN, "Login required");
  if (request.user.get("role") !== "platform_admin") {
    throw new Parse.Error(Parse.Error.OPERATION_FORBIDDEN, "Only platform admins can perform this action");
  }
}

async function fetchPGOrThrow(pgId) {
  const q = new Parse.Query("PG");
  const pg = await q.get(pgId, { useMasterKey: true });
  if (!pg) throw new Parse.Error(Parse.Error.OBJECT_NOT_FOUND, "PG not found");
  return pg;
}

Parse.Cloud.define("approvePG", async (request) => {
  await requirePlatformAdmin(request);
  const pgId = request.params && request.params.pgId;
  if (!pgId) throw new Parse.Error(Parse.Error.INVALID_QUERY, "pgId is required");
  const pg = await fetchPGOrThrow(pgId);
  pg.set("isApproved", true);
  pg.set("isSuspended", false);
  await pg.save(null, { useMasterKey: true });
  await notifyUser(pg.get("owner"), {
    type: "pg_approved",
    title: "PG approved",
    body: `${pg.get("name")} is now live for tenants to book.`,
    link: `/pg-admin/my-pgs/${pg.id}`,
  });
  return { ok: true };
});

Parse.Cloud.define("suspendPG", async (request) => {
  await requirePlatformAdmin(request);
  const pgId = request.params && request.params.pgId;
  if (!pgId) throw new Parse.Error(Parse.Error.INVALID_QUERY, "pgId is required");
  const pg = await fetchPGOrThrow(pgId);
  pg.set("isSuspended", true);
  await pg.save(null, { useMasterKey: true });
  await notifyUser(pg.get("owner"), {
    type: "pg_suspended",
    title: "PG suspended",
    body: `${pg.get("name")} has been suspended by the admin team.`,
    link: `/pg-admin/my-pgs/${pg.id}`,
  });
  return { ok: true };
});

Parse.Cloud.define("unsuspendPG", async (request) => {
  await requirePlatformAdmin(request);
  const pgId = request.params && request.params.pgId;
  if (!pgId) throw new Parse.Error(Parse.Error.INVALID_QUERY, "pgId is required");
  const pg = await fetchPGOrThrow(pgId);
  pg.set("isSuspended", false);
  await pg.save(null, { useMasterKey: true });
  await notifyUser(pg.get("owner"), {
    type: "pg_reinstated",
    title: "PG reinstated",
    body: `${pg.get("name")} is live again.`,
    link: `/pg-admin/my-pgs/${pg.id}`,
  });
  return { ok: true };
});

// Platform admin: read every user (sanitized — no password, no session token).
Parse.Cloud.define("listAllUsers", async (request) => {
  await requirePlatformAdmin(request);
  const q = new Parse.Query(Parse.User);
  q.limit(1000);
  q.descending("createdAt");
  const rows = await q.find({ useMasterKey: true });
  return rows.map((u) => ({
    objectId: u.id,
    name: u.get("name") || "",
    email: u.get("email") || "",
    phone: u.get("phone") || "",
    role: u.get("role") || "customer",
    profilePic: u.get("profilePic") || null,
    city: u.get("city") || null,
    createdAt: u.get("createdAt"),
  }));
});

// ─── Owner edits to existing PG ──────────────────────────────────────────────

async function requirePGOwner(request, pgId) {
  if (!request.user) throw new Parse.Error(Parse.Error.INVALID_SESSION_TOKEN, "Login required");
  if (!pgId) throw new Parse.Error(Parse.Error.INVALID_QUERY, "pgId is required");
  const pg = await fetchPGOrThrow(pgId);
  const owner = pg.get("owner");
  if (!owner || owner.id !== request.user.id) {
    throw new Parse.Error(Parse.Error.OPERATION_FORBIDDEN, "Only the PG owner can edit this listing");
  }
  return pg;
}

Parse.Cloud.define("updatePGPhotos", async (request) => {
  const { pgId, photos } = request.params || {};
  if (!Array.isArray(photos)) throw new Parse.Error(Parse.Error.INVALID_QUERY, "photos must be an array");
  if (photos.length === 0) throw new Parse.Error(Parse.Error.INVALID_QUERY, "At least one photo is required");
  const pg = await requirePGOwner(request, pgId);
  pg.set("photos", photos.map(String));
  await pg.save(null, { useMasterKey: true });
  return { ok: true };
});

Parse.Cloud.define("updatePGPrices", async (request) => {
  const { pgId, sharingPrices, dailyPrices } = request.params || {};
  if (!sharingPrices || typeof sharingPrices !== "object") {
    throw new Parse.Error(Parse.Error.INVALID_QUERY, "sharingPrices is required");
  }
  const pg = await requirePGOwner(request, pgId);
  pg.set("sharingPrices", sharingPrices);
  pg.set("dailyPrices", dailyPrices || {});
  const sharingValues = Object.values(sharingPrices).filter((v) => typeof v === "number" && v > 0);
  const lowestMonthly = sharingValues.length > 0 ? Math.min(...sharingValues) : 0;
  pg.set("monthlyPrice", lowestMonthly);
  await pg.save(null, { useMasterKey: true });
  return { ok: true };
});

Parse.Cloud.define("updatePGAvailableBeds", async (request) => {
  const { pgId, availableBeds } = request.params || {};
  if (typeof availableBeds !== "number" || availableBeds < 0) {
    throw new Parse.Error(Parse.Error.INVALID_QUERY, "availableBeds must be a non-negative number");
  }
  const pg = await requirePGOwner(request, pgId);
  pg.set("availableBeds", Math.floor(availableBeds));
  await pg.save(null, { useMasterKey: true });
  return { ok: true };
});

Parse.Cloud.define("updatePGAmenities", async (request) => {
  const { pgId, amenities } = request.params || {};
  if (!Array.isArray(amenities)) throw new Parse.Error(Parse.Error.INVALID_QUERY, "amenities must be an array");
  const pg = await requirePGOwner(request, pgId);
  pg.set("amenities", amenities.map(String));
  await pg.save(null, { useMasterKey: true });
  return { ok: true };
});

// ─── Notifications ───────────────────────────────────────────────────────────
// Internal helper used by lifecycle Cloud Functions to drop a row into the
// recipient's inbox. Always called with master key; ACL restricts read/write
// to the recipient (Cloud Functions still bypass via master key).

async function notifyUser(recipient, payload) {
  if (!recipient) return null;
  const Notification = Parse.Object.extend("Notification");
  const n = new Notification();
  n.set("user", recipient);
  n.set("type", String(payload.type || "info"));
  n.set("title", String(payload.title || ""));
  n.set("body", String(payload.body || ""));
  if (payload.link) n.set("link", String(payload.link));
  n.set("isRead", false);
  const acl = new Parse.ACL();
  acl.setPublicReadAccess(false);
  acl.setPublicWriteAccess(false);
  acl.setReadAccess(recipient.id, true);
  acl.setWriteAccess(recipient.id, false);
  n.setACL(acl);
  await n.save(null, { useMasterKey: true });
  return n;
}

async function notifyAllPlatformAdmins(payload) {
  const q = new Parse.Query(Parse.User);
  q.equalTo("role", "platform_admin");
  const admins = await q.find({ useMasterKey: true });
  await Promise.all(admins.map((a) => notifyUser(a, payload)));
}

Parse.Cloud.define("listMyNotifications", async (request) => {
  if (!request.user) throw new Parse.Error(Parse.Error.INVALID_SESSION_TOKEN, "Login required");
  const q = new Parse.Query("Notification");
  q.equalTo("user", request.user);
  q.descending("createdAt");
  q.limit(100);
  const rows = await q.find({ useMasterKey: true });
  return rows.map((n) => ({
    objectId: n.id,
    type: n.get("type") || "info",
    title: n.get("title") || "",
    body: n.get("body") || "",
    link: n.get("link") || null,
    isRead: !!n.get("isRead"),
    createdAt: n.get("createdAt"),
  }));
});

Parse.Cloud.define("markNotificationRead", async (request) => {
  if (!request.user) throw new Parse.Error(Parse.Error.INVALID_SESSION_TOKEN, "Login required");
  const { notificationId } = request.params || {};
  if (!notificationId) throw new Parse.Error(Parse.Error.INVALID_QUERY, "notificationId required");
  const q = new Parse.Query("Notification");
  const n = await q.get(notificationId, { useMasterKey: true });
  if (!n) throw new Parse.Error(Parse.Error.OBJECT_NOT_FOUND, "Notification not found");
  const owner = n.get("user");
  if (!owner || owner.id !== request.user.id) {
    throw new Parse.Error(Parse.Error.OPERATION_FORBIDDEN, "Not your notification");
  }
  n.set("isRead", true);
  await n.save(null, { useMasterKey: true });
  return { ok: true };
});

Parse.Cloud.define("markAllNotificationsRead", async (request) => {
  if (!request.user) throw new Parse.Error(Parse.Error.INVALID_SESSION_TOKEN, "Login required");
  const q = new Parse.Query("Notification");
  q.equalTo("user", request.user);
  q.equalTo("isRead", false);
  q.limit(1000);
  const rows = await q.find({ useMasterKey: true });
  await Promise.all(rows.map((n) => { n.set("isRead", true); return n.save(null, { useMasterKey: true }); }));
  return { ok: true, count: rows.length };
});

Parse.Cloud.define("countUnreadNotifications", async (request) => {
  if (!request.user) return { count: 0 };
  const q = new Parse.Query("Notification");
  q.equalTo("user", request.user);
  q.equalTo("isRead", false);
  const count = await q.count({ useMasterKey: true });
  return { count };
});

// ─── Reviews ─────────────────────────────────────────────────────────────────
// One review per booking. Submitting again updates the existing review.
// pg.rating is recomputed as the average of all reviews for that PG.

async function recomputePGRating(pg) {
  const q = new Parse.Query("Review");
  q.equalTo("pg", pg);
  q.limit(10000);
  const all = await q.find({ useMasterKey: true });
  if (all.length === 0) {
    pg.set("rating", 0);
  } else {
    const sum = all.reduce((s, r) => s + (r.get("stars") || 0), 0);
    const avg = Math.round((sum / all.length) * 10) / 10;
    pg.set("rating", avg);
  }
  await pg.save(null, { useMasterKey: true });
}

Parse.Cloud.define("submitReview", async (request) => {
  if (!request.user) throw new Parse.Error(Parse.Error.INVALID_SESSION_TOKEN, "Login required");
  const { bookingId, stars, comment } = request.params || {};
  if (!bookingId) throw new Parse.Error(Parse.Error.INVALID_QUERY, "bookingId required");
  if (typeof stars !== "number" || stars < 1 || stars > 5) {
    throw new Parse.Error(Parse.Error.INVALID_QUERY, "stars must be a number between 1 and 5");
  }

  const booking = await fetchBookingOrThrow(bookingId);
  const customer = booking.get("user");
  if (!customer || customer.id !== request.user.id) {
    throw new Parse.Error(Parse.Error.OPERATION_FORBIDDEN, "You can only review your own bookings");
  }
  if (booking.get("status") !== "completed") {
    throw new Parse.Error(Parse.Error.OPERATION_FORBIDDEN, "You can only review a completed stay");
  }

  const pg = booking.get("pg");
  if (!pg) throw new Parse.Error(Parse.Error.OBJECT_NOT_FOUND, "PG not found for this booking");

  // Find existing review for this booking, or create new
  const eq = new Parse.Query("Review");
  eq.equalTo("booking", booking);
  let review = await eq.first({ useMasterKey: true });

  if (!review) {
    const Review = Parse.Object.extend("Review");
    review = new Review();
    review.set("booking", booking);
    review.set("user", request.user);
    review.set("pg", pg);
    const acl = new Parse.ACL();
    acl.setPublicReadAccess(true);
    acl.setPublicWriteAccess(false);
    review.setACL(acl);
  }
  review.set("stars", Math.round(Number(stars)));
  if (typeof comment === "string") review.set("comment", comment.trim().slice(0, 1000));
  await review.save(null, { useMasterKey: true });

  await recomputePGRating(pg);

  await notifyUser(booking.get("pgOwner"), {
    type: "review_submitted",
    title: "New review",
    body: `${request.user.get("name") || "A guest"} left a ${review.get("stars")}-star review for ${pg.get("name")}.`,
    link: `/pg-admin/my-pgs/${pg.id}`,
  });

  return { ok: true, reviewId: review.id, rating: pg.get("rating") };
});

Parse.Cloud.define("getReviewForBooking", async (request) => {
  if (!request.user) throw new Parse.Error(Parse.Error.INVALID_SESSION_TOKEN, "Login required");
  const { bookingId } = request.params || {};
  if (!bookingId) throw new Parse.Error(Parse.Error.INVALID_QUERY, "bookingId required");
  const booking = await fetchBookingOrThrow(bookingId);
  const customer = booking.get("user");
  if (!customer || customer.id !== request.user.id) {
    throw new Parse.Error(Parse.Error.OPERATION_FORBIDDEN, "Not your booking");
  }
  const q = new Parse.Query("Review");
  q.equalTo("booking", booking);
  const r = await q.first({ useMasterKey: true });
  if (!r) return null;
  return {
    objectId: r.id,
    stars: r.get("stars") || 0,
    comment: r.get("comment") || "",
    createdAt: r.get("createdAt"),
  };
});

// ─── Wishlist ────────────────────────────────────────────────────────────────
// Single Wishlist row per user, stored as { user, pgIds: [] }.

async function getOrCreateWishlist(user) {
  const q = new Parse.Query("Wishlist");
  q.equalTo("user", user);
  let w = await q.first({ useMasterKey: true });
  if (w) return w;
  const Wishlist = Parse.Object.extend("Wishlist");
  w = new Wishlist();
  w.set("user", user);
  w.set("pgIds", []);
  const acl = new Parse.ACL();
  acl.setPublicReadAccess(false);
  acl.setPublicWriteAccess(false);
  acl.setReadAccess(user.id, true);
  acl.setWriteAccess(user.id, false); // writes go through Cloud Functions
  w.setACL(acl);
  await w.save(null, { useMasterKey: true });
  return w;
}

Parse.Cloud.define("getMyWishlist", async (request) => {
  if (!request.user) throw new Parse.Error(Parse.Error.INVALID_SESSION_TOKEN, "Login required");
  const w = await getOrCreateWishlist(request.user);
  return { pgIds: w.get("pgIds") || [] };
});

Parse.Cloud.define("toggleWishlist", async (request) => {
  if (!request.user) throw new Parse.Error(Parse.Error.INVALID_SESSION_TOKEN, "Login required");
  const pgId = request.params && request.params.pgId;
  if (!pgId) throw new Parse.Error(Parse.Error.INVALID_QUERY, "pgId is required");
  const w = await getOrCreateWishlist(request.user);
  const current = w.get("pgIds") || [];
  const exists = current.includes(pgId);
  const next = exists ? current.filter((id) => id !== pgId) : [...current, pgId];
  w.set("pgIds", next);
  await w.save(null, { useMasterKey: true });
  return { pgIds: next, added: !exists };
});

// ─── Booking lifecycle ───────────────────────────────────────────────────────

async function fetchBookingOrThrow(bookingId) {
  const q = new Parse.Query("Booking");
  q.include("pg");
  q.include("user");
  q.include("pgOwner");
  const b = await q.get(bookingId, { useMasterKey: true });
  if (!b) throw new Parse.Error(Parse.Error.OBJECT_NOT_FOUND, "Booking not found");
  return b;
}

function bookingAcl(customer, owner) {
  const acl = new Parse.ACL();
  acl.setPublicReadAccess(false);
  acl.setPublicWriteAccess(false);
  if (customer) {
    acl.setReadAccess(customer.id, true);
    acl.setWriteAccess(customer.id, false);
  }
  if (owner) {
    acl.setReadAccess(owner.id, true);
    acl.setWriteAccess(owner.id, false);
  }
  return acl;
}

async function changeAvailableBeds(pg, delta) {
  const current = pg.get("availableBeds") || 0;
  const next = Math.max(0, current + delta);
  pg.set("availableBeds", next);
  await pg.save(null, { useMasterKey: true });
}

Parse.Cloud.define("createBooking", async (request) => {
  if (!request.user) throw new Parse.Error(Parse.Error.INVALID_SESSION_TOKEN, "Login required");
  if (request.user.get("role") !== "customer") {
    throw new Parse.Error(Parse.Error.OPERATION_FORBIDDEN, "Only customers can create bookings");
  }
  const p = request.params || {};
  const required = ["pgId", "sharing", "stayType", "fromDate", "total", "idProofUrl"];
  for (const k of required) {
    if (p[k] === undefined || p[k] === null || p[k] === "") {
      throw new Parse.Error(Parse.Error.INVALID_QUERY, `${k} is required`);
    }
  }

  const pgQ = new Parse.Query("PG");
  pgQ.include("owner");
  const pg = await pgQ.get(p.pgId, { useMasterKey: true });
  if (!pg) throw new Parse.Error(Parse.Error.OBJECT_NOT_FOUND, "PG not found");
  if (!pg.get("isApproved") || pg.get("isSuspended")) {
    throw new Parse.Error(Parse.Error.OPERATION_FORBIDDEN, "PG is not currently bookable");
  }
  const owner = pg.get("owner");

  const Booking = Parse.Object.extend("Booking");
  const b = new Booking();
  b.set("user", request.user);
  b.set("pg", pg);
  if (owner) b.set("pgOwner", owner);
  b.set("pgName", pg.get("name") || "");
  b.set("pgArea", pg.get("area") || "");
  b.set("pgPhoto", (pg.get("photos") || [])[0] || "");
  b.set("sharing", p.sharing);
  b.set("stayType", p.stayType);
  b.set("fromDate", String(p.fromDate));
  if (p.toDate) b.set("toDate", String(p.toDate));
  if (typeof p.months === "number") b.set("months", p.months);
  if (typeof p.nights === "number") b.set("nights", p.nights);
  b.set("total", Number(p.total));
  b.set("idProofUrl", String(p.idProofUrl));
  b.set("status", "pending");
  if (p.tenantName) b.set("tenantName", String(p.tenantName));
  if (p.tenantPhone) b.set("tenantPhone", String(p.tenantPhone));
  b.setACL(bookingAcl(request.user, owner));

  await b.save(null, { useMasterKey: true });
  await notifyUser(owner, {
    type: "booking_requested",
    title: "New booking request",
    body: `${request.user.get("name") || "A tenant"} wants to book ${pg.get("name")}.`,
    link: `/pg-admin/bookings`,
  });
  return { objectId: b.id };
});

async function requireBookingPGOwner(request, booking) {
  if (!request.user) throw new Parse.Error(Parse.Error.INVALID_SESSION_TOKEN, "Login required");
  const owner = booking.get("pgOwner");
  if (!owner || owner.id !== request.user.id) {
    throw new Parse.Error(Parse.Error.OPERATION_FORBIDDEN, "Only the PG owner can perform this action");
  }
}

async function requireBookingCustomerOrOwner(request, booking) {
  if (!request.user) throw new Parse.Error(Parse.Error.INVALID_SESSION_TOKEN, "Login required");
  const customer = booking.get("user");
  const owner = booking.get("pgOwner");
  const isCustomer = customer && customer.id === request.user.id;
  const isOwner = owner && owner.id === request.user.id;
  if (!isCustomer && !isOwner) {
    throw new Parse.Error(Parse.Error.OPERATION_FORBIDDEN, "Not authorised");
  }
  return { isCustomer, isOwner };
}

Parse.Cloud.define("confirmBooking", async (request) => {
  const bookingId = request.params && request.params.bookingId;
  if (!bookingId) throw new Parse.Error(Parse.Error.INVALID_QUERY, "bookingId required");
  const b = await fetchBookingOrThrow(bookingId);
  await requireBookingPGOwner(request, b);
  if (b.get("status") === "confirmed") return { ok: true };
  b.set("status", "confirmed");
  await b.save(null, { useMasterKey: true });
  const pg = b.get("pg");
  if (pg) await changeAvailableBeds(pg, -1);
  await notifyUser(b.get("user"), {
    type: "booking_confirmed",
    title: "Booking confirmed",
    body: `Your stay at ${b.get("pgName")} is confirmed.`,
    link: `/bookings`,
  });
  return { ok: true };
});

Parse.Cloud.define("rejectBooking", async (request) => {
  const bookingId = request.params && request.params.bookingId;
  if (!bookingId) throw new Parse.Error(Parse.Error.INVALID_QUERY, "bookingId required");
  const b = await fetchBookingOrThrow(bookingId);
  await requireBookingPGOwner(request, b);
  b.set("status", "rejected");
  await b.save(null, { useMasterKey: true });
  await notifyUser(b.get("user"), {
    type: "booking_rejected",
    title: "Booking declined",
    body: `Your request for ${b.get("pgName")} was declined.`,
    link: `/bookings`,
  });
  return { ok: true };
});

Parse.Cloud.define("cancelBooking", async (request) => {
  const bookingId = request.params && request.params.bookingId;
  if (!bookingId) throw new Parse.Error(Parse.Error.INVALID_QUERY, "bookingId required");
  const b = await fetchBookingOrThrow(bookingId);
  const { isCustomer } = await requireBookingCustomerOrOwner(request, b);
  const wasConfirmed = b.get("status") === "confirmed";
  b.set("status", "cancelled");
  await b.save(null, { useMasterKey: true });
  if (wasConfirmed) {
    const pg = b.get("pg");
    if (pg) await changeAvailableBeds(pg, +1);
  }
  // Notify whichever party didn't initiate the cancel.
  const recipient = isCustomer ? b.get("pgOwner") : b.get("user");
  await notifyUser(recipient, {
    type: "booking_cancelled",
    title: "Booking cancelled",
    body: isCustomer
      ? `${request.user.get("name") || "The tenant"} cancelled their booking at ${b.get("pgName")}.`
      : `Your booking at ${b.get("pgName")} was cancelled by the owner.`,
    link: isCustomer ? `/pg-admin/bookings` : `/bookings`,
  });
  return { ok: true };
});

Parse.Cloud.define("vacateBooking", async (request) => {
  const bookingId = request.params && request.params.bookingId;
  if (!bookingId) throw new Parse.Error(Parse.Error.INVALID_QUERY, "bookingId required");
  const b = await fetchBookingOrThrow(bookingId);
  await requireBookingPGOwner(request, b);
  const wasConfirmed = b.get("status") === "confirmed";
  b.set("status", "completed");
  b.set("vacatedAt", new Date());
  await b.save(null, { useMasterKey: true });
  if (wasConfirmed) {
    const pg = b.get("pg");
    if (pg) await changeAvailableBeds(pg, +1);
  }
  await notifyUser(b.get("user"), {
    type: "stay_completed",
    title: "Stay marked complete",
    body: `Your stay at ${b.get("pgName")} is wrapped up — share a quick rating?`,
    link: `/bookings`,
  });
  return { ok: true };
});

Parse.Cloud.define("updateBooking", async (request) => {
  const bookingId = request.params && request.params.bookingId;
  if (!bookingId) throw new Parse.Error(Parse.Error.INVALID_QUERY, "bookingId required");
  const b = await fetchBookingOrThrow(bookingId);
  await requireBookingPGOwner(request, b);
  const updates = request.params.updates || {};
  const allowed = ["fromDate", "toDate", "months", "nights", "total", "sharing"];
  for (const k of allowed) {
    if (updates[k] !== undefined) b.set(k, updates[k]);
  }
  await b.save(null, { useMasterKey: true });
  return { ok: true };
});

Parse.Cloud.define("deleteBooking", async (request) => {
  const bookingId = request.params && request.params.bookingId;
  if (!bookingId) throw new Parse.Error(Parse.Error.INVALID_QUERY, "bookingId required");
  const b = await fetchBookingOrThrow(bookingId);
  await requireBookingCustomerOrOwner(request, b);
  const wasConfirmed = b.get("status") === "confirmed";
  const pg = b.get("pg");
  await b.destroy({ useMasterKey: true });
  if (wasConfirmed && pg) await changeAvailableBeds(pg, +1);
  return { ok: true };
});

Parse.Cloud.define("renewBooking", async (request) => {
  const bookingId = request.params && request.params.bookingId;
  if (!bookingId) throw new Parse.Error(Parse.Error.INVALID_QUERY, "bookingId required");
  const old = await fetchBookingOrThrow(bookingId);
  await requireBookingPGOwner(request, old);
  old.set("status", "renewed");
  old.set("vacatedAt", new Date());
  await old.save(null, { useMasterKey: true });

  const Booking = Parse.Object.extend("Booking");
  const fresh = new Booking();
  const fields = ["user", "pg", "pgOwner", "pgName", "pgArea", "pgPhoto", "sharing", "stayType", "tenantName", "tenantPhone", "idProofUrl", "total"];
  for (const f of fields) {
    const v = old.get(f);
    if (v !== undefined && v !== null) fresh.set(f, v);
  }
  const today = new Date().toISOString().split("T")[0];
  fresh.set("fromDate", today);
  if (old.get("stayType") === "monthly") fresh.set("months", 1);
  else fresh.set("nights", 1);
  fresh.set("status", "confirmed");
  fresh.setACL(bookingAcl(old.get("user"), old.get("pgOwner")));
  await fresh.save(null, { useMasterKey: true });
  return { objectId: fresh.id };
});
