import { useState, useEffect, useMemo } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useAuthStore } from "@/store/useAuthStore";
import { listAllUsers } from "@/lib/authService";
import { getAllBookings } from "@/lib/bookingService";
import { listAllPGs } from "@/lib/pgService";
import { AdminSidebar } from "./dashboard";
import { HiUsers, HiSearch, HiOfficeBuilding, HiUser, HiShieldCheck, HiHome, HiChevronDown, HiPhone, HiMail, HiChevronRight } from "react-icons/hi";
import { AppUser } from "@/types/user";
import { PG } from "@/types/pg";

type PGRef = { objectId: string; name: string };

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

function UserRow({ u, idx, pgLabel, pgs }: { u: AppUser; idx: number; pgLabel: string | null; pgs: PGRef[] }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={`adm-user-row ${expanded ? "is-expanded" : ""}`} style={{ borderTop: idx === 0 ? "none" : "1px solid #F0EDE8" }}>
      <div className="adm-user-row-head" style={{ display: "flex", alignItems: "center", gap: "14px", padding: "13px 16px" }}>
        <Avatar name={u.name} />

        <div className="adm-user-info" style={{ flex: 1, minWidth: 0 }}>
          <div className="adm-user-name" style={{ fontFamily: "var(--font-display)", fontSize: "14px", fontWeight: "600", color: "#1C1917", marginBottom: "2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {u.name}
          </div>
          <div className="adm-user-email" style={{ fontFamily: "var(--font-body)", fontSize: "12px", color: "#78716C", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {u.email}
          </div>
          {pgLabel && (
            <div className="adm-user-pg" style={{ display: "flex", alignItems: "center", gap: "4px", marginTop: "3px" }}>
              {u.role === "customer"
                ? <HiHome size={11} color="#10B981" style={{ flexShrink: 0 }} />
                : <HiOfficeBuilding size={11} color="#8B5CF6" style={{ flexShrink: 0 }} />
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

        <div className="adm-user-phone" style={{ fontFamily: "var(--font-body)", fontSize: "12px", color: "#A8A29E", flexShrink: 0 }}>
          {u.phone}
        </div>

        <RoleBadge role={u.role} />

        <button
          className="adm-user-toggle"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          aria-label={expanded ? "Show less" : "Show more"}
        >
          <HiChevronDown size={16} />
        </button>
      </div>

      {/* Expanded details — visible on mobile when toggled */}
      <div className="adm-user-expand">
        <div className="adm-user-expand-row">
          <HiMail size={13} color="#A8A29E" />
          <span>{u.email}</span>
        </div>
        <div className="adm-user-expand-row">
          <HiPhone size={13} color="#A8A29E" />
          <span>{u.phone}</span>
        </div>
        {pgs.length > 0 && (
          <div className="adm-user-pgs">
            <div className="adm-user-pgs-label">
              {u.role === "customer"
                ? <HiHome size={13} color="#10B981" />
                : <HiOfficeBuilding size={13} color="#8B5CF6" />
              }
              <span>{u.role === "customer" ? "Staying at" : "Owns"}</span>
            </div>
            <div className="adm-user-pgs-list">
              {pgs.map((pg) => (
                <Link key={pg.objectId} href={`/admin/pgs/${pg.objectId}`} className="adm-user-pg-link">
                  <span className="adm-user-pg-name">{pg.name}</span>
                  <span className="adm-user-pg-cta">View details <HiChevronRight size={12} /></span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
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
    let cancelled = false;
    listAllUsers()
      .then((rows) => { if (!cancelled) setUsers(rows.filter((u) => u.role !== "platform_admin")); })
      .catch(() => {});
    listAllPGs()
      .then((rows) => { if (!cancelled) setAllPGs(rows); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [user, hydrated]);

  const [allBookings, setAllBookings] = useState<import("@/lib/bookingService").StoredBooking[]>([]);
  useEffect(() => {
    let cancelled = false;
    getAllBookings().then((rows) => { if (!cancelled) setAllBookings(rows); }).catch(() => {});
    return () => { cancelled = true; };
  }, []);

  // Map: tenantId → active PGs (confirmed/active bookings)
  const tenantPGMap = useMemo(() => {
    const map: Record<string, PGRef[]> = {};
    allBookings
      .filter((b) => b.status === "confirmed" || b.status === "pending")
      .forEach((b) => {
        if (!map[b.userId]) map[b.userId] = [];
        if (!map[b.userId].some((p) => p.objectId === b.pgId)) {
          map[b.userId].push({ objectId: b.pgId, name: b.pgName });
        }
      });
    return map;
  }, [allBookings]);

  // Map: ownerId → PGs they own
  const ownerPGMap = useMemo(() => {
    const map: Record<string, PGRef[]> = {};
    allPGs.forEach((pg) => {
      if (!map[pg.owner.objectId]) map[pg.owner.objectId] = [];
      map[pg.owner.objectId].push({ objectId: pg.objectId, name: pg.name });
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
                    const pgs = u.role === "customer"
                      ? (tenantPGMap[u.objectId] ?? [])
                      : (ownerPGMap[u.objectId] ?? []);
                    const names = pgs.map((p) => p.name);

                    const pgLabel = u.role === "customer"
                      ? (names.length === 0 ? null : names.length === 1 ? `Staying at ${names[0]}` : `Staying at ${names[0]} +${names.length - 1} more`)
                      : (names.length === 0 ? null : names.length <= 2 ? names.join(", ") : `${names.slice(0, 2).join(", ")} +${names.length - 2} more`);

                    return (
                      <UserRow key={u.objectId} u={u as AppUser} idx={idx} pgLabel={pgLabel} pgs={pgs} />
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

        /* User-row toggle: hidden on desktop, shown on mobile */
        .adm-user-toggle {
          display: none;
          width: 30px; height: 30px;
          border-radius: 50%;
          border: 1px solid #E8E4DE;
          background: #fff;
          color: #44403C;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          padding: 0;
          flex-shrink: 0;
          transition: background 0.15s, transform 0.2s;
        }
        .adm-user-toggle:hover { background: #F9F7F4; }
        .adm-user-row.is-expanded .adm-user-toggle :global(svg) { transform: rotate(180deg); }
        .adm-user-toggle :global(svg) { transition: transform 0.2s; }

        /* Expanded panel: hidden by default; CSS toggles it open per breakpoint */
        .adm-user-expand { display: none; }

        @media (max-width: 768px) {
          .dash-hero-bar { padding: calc(76px + env(safe-area-inset-top)) 16px 14px; }

          /* show the toggle on mobile, hide details that should sit behind it */
          .adm-user-toggle { display: inline-flex; }
          .adm-user-email,
          .adm-user-pg,
          .adm-user-phone {
            display: none !important;
          }
          .adm-user-row.is-expanded .adm-user-expand {
            display: flex;
            flex-direction: column;
            gap: 8px;
            padding: 0 16px 14px;
            margin-top: -4px;
          }
          .adm-user-row.is-expanded .adm-user-expand-row {
            display: flex;
            align-items: center;
            gap: 8px;
            font-family: var(--font-body);
            font-size: 12.5px;
            color: #44403C;
            line-height: 1.45;
            word-break: break-word;
          }
          .adm-user-row.is-expanded .adm-user-expand-row svg { flex-shrink: 0; }

          .adm-user-row.is-expanded .adm-user-pgs {
            display: flex;
            flex-direction: column;
            gap: 6px;
          }
          .adm-user-pgs-label {
            display: flex;
            align-items: center;
            gap: 6px;
            font-family: var(--font-body);
            font-size: 11px;
            font-weight: 700;
            color: #78716C;
            letter-spacing: 0.4px;
            text-transform: uppercase;
          }
          .adm-user-pgs-list {
            display: flex;
            flex-direction: column;
            gap: 6px;
          }
          .adm-user-pg-link {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 10px;
            padding: 10px 12px;
            border: 1px solid #E8E4DE;
            border-radius: 10px;
            background: #FAFAF9;
            text-decoration: none;
            transition: background 0.15s, border-color 0.15s;
          }
          .adm-user-pg-link:active { background: #F0EDE8; }
          .adm-user-pg-name {
            font-family: var(--font-body);
            font-size: 13px;
            font-weight: 600;
            color: #1C1917;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            min-width: 0;
            flex: 1;
          }
          .adm-user-pg-cta {
            display: inline-flex;
            align-items: center;
            gap: 2px;
            font-family: var(--font-body);
            font-size: 12px;
            font-weight: 600;
            color: #FF385C;
            white-space: nowrap;
            flex-shrink: 0;
          }
        }
        /* Desktop: keep PGs hidden in the expand row (they're shown in the inline pgLabel pill). */
        .adm-user-pgs { display: none; }
        @media (max-width: 640px) {
          .pg-content { padding: 0 0 calc(86px + env(safe-area-inset-bottom)) !important; }
          .adm-summary { padding: 12px 12px 0; margin-bottom: 12px; }
        }
      `}</style>
    </>
  );
}
