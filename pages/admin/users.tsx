import { useState, useEffect, useMemo } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { useAuthStore } from "@/store/useAuthStore";
import { getAllUsers } from "@/lib/dummyAuth";
import { getAllBookings } from "@/lib/dummyBookings";
import { getAllPGsWithOverrides } from "@/lib/dummyPGAdmin";
import { AdminSidebar } from "./dashboard";
import { HiUsers, HiSearch, HiOfficeBuilding, HiUser, HiShieldCheck, HiHome } from "react-icons/hi";
import { AppUser } from "@/types/user";
import { PG } from "@/types/pg";

type Tab = "all" | "customer" | "pg_admin";

const ROLE_CONFIG: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  customer:       { label: "Tenant",   color: "#3B82F6", bg: "#EFF6FF", icon: <HiUser size={13} /> },
  pg_admin:       { label: "PG Owner", color: "#8B5CF6", bg: "#F5F3FF", icon: <HiOfficeBuilding size={13} /> },
  platform_admin: { label: "Admin",    color: "#FF385C", bg: "#FFF0F3", icon: <HiShieldCheck size={13} /> },
};

function RoleBadge({ role }: { role: string }) {
  const cfg = ROLE_CONFIG[role] ?? { label: role, color: "#78716C", bg: "#F9F7F4", icon: null };
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontFamily: "var(--font-body)", fontSize: "11px", fontWeight: "700", color: cfg.color, backgroundColor: cfg.bg, borderRadius: "100px", padding: "3px 10px" }}>
      {cfg.icon}
      {cfg.label}
    </span>
  );
}

function Avatar({ name }: { name: string }) {
  const initials = name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  const colors = ["#FF385C", "#3B82F6", "#8B5CF6", "#10B981", "#F59E0B", "#EC4899"];
  const color = colors[name.charCodeAt(0) % colors.length];
  return (
    <div style={{ width: "38px", height: "38px", borderRadius: "50%", backgroundColor: `${color}20`, border: `1.5px solid ${color}30`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      <span style={{ fontFamily: "var(--font-display)", fontSize: "13px", fontWeight: "700", color }}>{initials}</span>
    </div>
  );
}

export default function AdminUsers() {
  const router = useRouter();
  const { user, hydrated } = useAuthStore();
  const [users, setUsers] = useState<Omit<AppUser, never>[]>([]);
  const [allPGs, setAllPGs] = useState<PG[]>([]);
  const [tab, setTab] = useState<Tab>("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!hydrated) return;
    if (!user) { router.replace("/"); return; }
    if (user.role !== "platform_admin") { router.replace("/"); return; }
    setUsers(getAllUsers().filter((u) => u.role !== "platform_admin"));
    setAllPGs(getAllPGsWithOverrides());
  }, [user, hydrated]);

  // Map: tenantId → active PG names (confirmed/active bookings)
  const tenantPGMap = useMemo(() => {
    const bookings = getAllBookings();
    const map: Record<string, string[]> = {};
    bookings
      .filter((b) => b.status === "confirmed" || b.status === "pending")
      .forEach((b) => {
        if (!map[b.userId]) map[b.userId] = [];
        if (!map[b.userId].includes(b.pgName)) map[b.userId].push(b.pgName);
      });
    return map;
  }, []);

  // Map: ownerId → PG names they own
  const ownerPGMap = useMemo(() => {
    const map: Record<string, string[]> = {};
    allPGs.forEach((pg) => {
      if (!map[pg.owner.objectId]) map[pg.owner.objectId] = [];
      map[pg.owner.objectId].push(pg.name);
    });
    return map;
  }, [allPGs]);

  if (!user || user.role !== "platform_admin") return null;

  const filtered = users
    .filter((u) => tab === "all" || u.role === tab)
    .filter((u) => search === "" ||
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
    );

  const counts = {
    all:      users.length,
    customer: users.filter((u) => u.role === "customer").length,
    pg_admin: users.filter((u) => u.role === "pg_admin").length,
  };

  const TABS: { key: Tab; label: string }[] = [
    { key: "all",      label: `All (${counts.all})` },
    { key: "customer", label: `Tenants (${counts.customer})` },
    { key: "pg_admin", label: `PG Owners (${counts.pg_admin})` },
  ];

  return (
    <>
      <Head><title>User Management — Roomsy Admin</title></Head>
      <div className="pg-layout" style={{ minHeight: "100vh", backgroundColor: "#F9F7F4" }}>
        <AdminSidebar active="/admin/users" />

        <main style={{ flex: 1, overflowX: "hidden" }}>
          <div className="dash-hero-bar">
            <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(18px,3vw,24px)", fontWeight: "700", color: "#fff", letterSpacing: "-0.5px", marginBottom: "4px" }}>
              User Management
            </h1>
            <p style={{ fontFamily: "var(--font-body)", fontSize: "14px", color: "rgba(255,255,255,0.72)", margin: 0 }}>
              View all tenants and PG owners on the platform.
            </p>
          </div>

          <div className="pg-content" style={{ maxWidth: "1100px", margin: "0 auto" }}>

            {/* Summary cards */}
            <div className="adm-summary">
              {[
                { label: "Total Users",  value: counts.all,      color: "#FF385C", icon: <HiUsers size={16} /> },
                { label: "Tenants",      value: counts.customer,  color: "#3B82F6", icon: <HiUser size={16} /> },
                { label: "PG Owners",    value: counts.pg_admin,  color: "#8B5CF6", icon: <HiOfficeBuilding size={16} /> },
              ].map((s) => (
                <div key={s.label} className="adm-summary-card">
                  <div className="adm-summary-icon" style={{ backgroundColor: `${s.color}15`, color: s.color }}>
                    {s.icon}
                  </div>
                  <div className="adm-summary-text">
                    <div className="adm-summary-value">{s.value}</div>
                    <div className="adm-summary-label">{s.label}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* User list */}
            <div style={{ backgroundColor: "#fff", border: "1px solid #E8E4DE", borderRadius: "16px", overflow: "hidden" }}>
              <div style={{ padding: "14px 16px", borderBottom: "1px solid #F0EDE8" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", backgroundColor: "#F9F7F4", border: "1.5px solid #E8E4DE", borderRadius: "10px", padding: "9px 14px" }}>
                  <HiSearch size={16} color="#A8A29E" />
                  <input
                    type="text"
                    placeholder="Search by name or email…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={{ border: "none", background: "none", outline: "none", fontFamily: "var(--font-body)", fontSize: "14px", color: "#1C1917", flex: 1, minWidth: 0 }}
                  />
                </div>
              </div>

              <div style={{ display: "flex", gap: "4px", padding: "10px 14px", borderBottom: "1px solid #F0EDE8", overflowX: "auto" }}>
                {TABS.map((t) => (
                  <button key={t.key} onClick={() => setTab(t.key)} style={{
                    fontFamily: "var(--font-body)", fontSize: "13px", fontWeight: tab === t.key ? "700" : "500",
                    color: tab === t.key ? "#FF385C" : "#78716C",
                    backgroundColor: tab === t.key ? "#FFF0F3" : "transparent",
                    border: tab === t.key ? "1.5px solid #FFCCD5" : "1.5px solid transparent",
                    borderRadius: "100px", padding: "6px 14px", cursor: "pointer", whiteSpace: "nowrap",
                    transition: "all 0.15s",
                  }}>
                    {t.label}
                  </button>
                ))}
              </div>

              <div>
                {filtered.length === 0 ? (
                  <div style={{ padding: "48px 24px", textAlign: "center" }}>
                    <HiUsers size={36} color="#D6D3CE" style={{ marginBottom: "12px" }} />
                    <p style={{ fontFamily: "var(--font-body)", fontSize: "14px", color: "#78716C" }}>No users found.</p>
                  </div>
                ) : (
                  filtered.map((u, idx) => {
                    const pgNames = u.role === "customer"
                      ? (tenantPGMap[u.objectId] ?? [])
                      : (ownerPGMap[u.objectId] ?? []);

                    const pgLabel = u.role === "customer"
                      ? (pgNames.length === 0 ? null : pgNames.length === 1 ? `Staying at ${pgNames[0]}` : `Staying at ${pgNames[0]} +${pgNames.length - 1} more`)
                      : (pgNames.length === 0 ? null : pgNames.length <= 2 ? pgNames.join(", ") : `${pgNames.slice(0, 2).join(", ")} +${pgNames.length - 2} more`);

                    return (
                      <div key={u.objectId} style={{
                        display: "flex", alignItems: "center", gap: "14px",
                        padding: "13px 16px",
                        borderTop: idx === 0 ? "none" : "1px solid #F0EDE8",
                      }}>
                        <Avatar name={u.name} />

                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontFamily: "var(--font-display)", fontSize: "14px", fontWeight: "600", color: "#1C1917", marginBottom: "2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {u.name}
                          </div>
                          <div style={{ fontFamily: "var(--font-body)", fontSize: "12px", color: "#78716C", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {u.email}
                          </div>
                          {pgLabel && (
                            <div style={{ display: "flex", alignItems: "center", gap: "4px", marginTop: "3px" }}>
                              {u.role === "customer"
                                ? <HiHome size={11} color="#10B981" />
                                : <HiOfficeBuilding size={11} color="#8B5CF6" />
                              }
                              <span style={{
                                fontFamily: "var(--font-body)", fontSize: "11px", fontWeight: "600",
                                color: u.role === "customer" ? "#065F46" : "#5B21B6",
                                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                              }}>
                                {pgLabel}
                              </span>
                            </div>
                          )}
                        </div>

                        <div style={{ fontFamily: "var(--font-body)", fontSize: "12px", color: "#A8A29E", flexShrink: 0 }}>
                          {u.phone}
                        </div>

                        <RoleBadge role={u.role} />
                      </div>
                    );
                  })
                )}
              </div>
            </div>

          </div>
        </main>
      </div>

      <style>{`
        .dash-hero-bar { background: linear-gradient(130deg, #1C1917 0%, #FF385C 100%); padding: 28px 40px; }
        /* Edge-to-edge cards on every screen */
        .pg-content { padding: 14px 0 80px !important; max-width: none !important; }
        .adm-summary { padding: 0 16px; }
        .pg-content > div:last-child {
          border-left: none !important;
          border-right: none !important;
          border-radius: 0 !important;
        }
        @media (max-width: 768px) {
          .dash-hero-bar { padding: calc(76px + env(safe-area-inset-top)) 16px 14px; }
        }
        @media (max-width: 640px) {
          .pg-content { padding: 0 0 calc(86px + env(safe-area-inset-bottom)) !important; }
          .adm-summary { padding: 12px 12px 0; margin-bottom: 12px; }
        }
      `}</style>
    </>
  );
}
