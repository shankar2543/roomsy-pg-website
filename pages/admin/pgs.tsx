import { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useAuthStore } from "@/store/useAuthStore";
import { getAllPGsWithOverrides, suspendPG, unsuspendPG } from "@/lib/dummyPGAdmin";
import { PG } from "@/types/pg";
import { AdminSidebar, STATES } from "./dashboard";
import {
  HiOfficeBuilding, HiLocationMarker,
  HiCheckCircle, HiSearch, HiEye, HiChevronDown, HiSwitchHorizontal,
} from "react-icons/hi";
import { MdBlock } from "react-icons/md";
import toast from "react-hot-toast";

const TYPE_COLOR: Record<string, string> = { boys: "#3B82F6", girls: "#EC4899", coliving: "#8B5CF6" };
const TYPE_LABEL: Record<string, string> = { boys: "Boys", girls: "Girls", coliving: "Co-living" };

type Tab = "all" | "pending" | "live" | "suspended";

function StatusBadge({ pg }: { pg: PG }) {
  if (pg.isSuspended) return <span style={{ fontFamily: "var(--font-body)", fontSize: "11px", fontWeight: "700", color: "#DC2626", backgroundColor: "#FEF2F2", borderRadius: "100px", padding: "3px 10px" }}>Suspended</span>;
  if (!pg.isApproved) return <span style={{ fontFamily: "var(--font-body)", fontSize: "11px", fontWeight: "700", color: "#92400E", backgroundColor: "#FFFBEB", borderRadius: "100px", padding: "3px 10px" }}>Pending</span>;
  return <span style={{ fontFamily: "var(--font-body)", fontSize: "11px", fontWeight: "700", color: "#065F46", backgroundColor: "#ECFDF5", borderRadius: "100px", padding: "3px 10px" }}>Live</span>;
}

function PGRow({ pg, idx, onSuspend, onUnsuspend }: { pg: PG; idx: number; onSuspend: (pg: PG) => void; onUnsuspend: (pg: PG) => void }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={`adm-pg-row ${expanded ? "is-expanded" : ""}`} style={{ borderTop: idx === 0 ? "none" : "1px solid #F0EDE8" }}>
      <div className="adm-pg-row-head">
        <div className="adm-pg-thumb">
          {pg.photos[0] && <img src={pg.photos[0]} alt={pg.name} />}
        </div>

        <div className="adm-pg-title">
          <div className="adm-pg-name">{pg.name}</div>
          <div className="adm-pg-meta">
            <HiLocationMarker size={11} color="#A8A29E" />
            <span>{pg.area}, {pg.city}</span>
            <span className="adm-pg-type" style={{ color: TYPE_COLOR[pg.pgType], backgroundColor: `${TYPE_COLOR[pg.pgType]}18` }}>{TYPE_LABEL[pg.pgType]}</span>
            <span className="adm-pg-owner">· {pg.owner.name}</span>
          </div>
        </div>

        <div className="adm-pg-price">
          <div className="adm-pg-price-value">₹{pg.monthlyPrice.toLocaleString()}/mo</div>
          <div className="adm-pg-beds">{pg.availableBeds} beds free</div>
        </div>

        <StatusBadge pg={pg} />

        <div className="adm-pg-actions">
          {!pg.isApproved && !pg.isSuspended && (
            <Link href={`/admin/pgs/${pg.objectId}`} className="adm-btn adm-btn-primary">
              <HiEye size={14} /> <span className="adm-btn-text">Review</span>
            </Link>
          )}
          {pg.isApproved && !pg.isSuspended && (
            <>
              <Link href={`/admin/pgs/${pg.objectId}`} className="adm-btn adm-btn-ghost">
                <HiEye size={14} /> <span className="adm-btn-text">View</span>
              </Link>
              <button onClick={() => onSuspend(pg)} className="adm-btn adm-btn-danger">
                <MdBlock size={14} /> <span className="adm-btn-text">Suspend</span>
              </button>
            </>
          )}
          {pg.isSuspended && (
            <>
              <Link href={`/admin/pgs/${pg.objectId}`} className="adm-btn adm-btn-ghost">
                <HiEye size={14} /> <span className="adm-btn-text">View</span>
              </Link>
              <button onClick={() => onUnsuspend(pg)} className="adm-btn adm-btn-success">
                <HiCheckCircle size={14} /> <span className="adm-btn-text">Reinstate</span>
              </button>
            </>
          )}
        </div>

        <button
          className="adm-pg-toggle"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          aria-label={expanded ? "Show less" : "Show more"}
        >
          <HiChevronDown size={16} />
        </button>
      </div>
    </div>
  );
}

// ─── PG list for a state ─────────────────────────────────────────────────────

function StatePGList({ stateSlug, allPGs, onRefresh }: { stateSlug: string; allPGs: PG[]; onRefresh: () => void }) {
  const state = STATES.find((s) => s.slug === stateSlug);
  const [tab, setTab]       = useState<Tab>("all");
  const [search, setSearch] = useState("");

  const statePGs = allPGs.filter((pg) => state?.cities.includes(pg.city.toLowerCase()));

  const filtered = statePGs
    .filter((pg) => {
      if (tab === "pending")   return !pg.isApproved && !pg.isSuspended;
      if (tab === "live")      return pg.isApproved && !pg.isSuspended;
      if (tab === "suspended") return pg.isSuspended;
      return true;
    })
    .filter((pg) => search === "" || pg.name.toLowerCase().includes(search.toLowerCase()) || pg.area.toLowerCase().includes(search.toLowerCase()));

  const counts = {
    all:       statePGs.length,
    pending:   statePGs.filter((p) => !p.isApproved && !p.isSuspended).length,
    live:      statePGs.filter((p) => p.isApproved && !p.isSuspended).length,
    suspended: statePGs.filter((p) => p.isSuspended).length,
  };

  function handleSuspend(pg: PG) { suspendPG(pg.objectId); toast.success(`${pg.name} suspended.`); onRefresh(); }
  function handleUnsuspend(pg: PG) { unsuspendPG(pg.objectId); toast.success(`${pg.name} reinstated.`); onRefresh(); }

  const TABS: { key: Tab; label: string; count: number }[] = [
    { key: "all",       label: "All",       count: counts.all },
    { key: "pending",   label: "Pending",   count: counts.pending },
    { key: "live",      label: "Live",      count: counts.live },
    { key: "suspended", label: "Suspended", count: counts.suspended },
  ];

  return (
    <div className="adm-pg-list-card">
      {/* Search */}
      <div style={{ padding: "14px 16px", borderBottom: "1px solid #F0EDE8" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", backgroundColor: "#F9F7F4", border: "1.5px solid #E8E4DE", borderRadius: "10px", padding: "9px 14px" }}>
          <HiSearch size={16} color="#A8A29E" />
          <input
            type="text"
            placeholder="Search PGs by name or area…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ border: "none", background: "none", outline: "none", fontFamily: "var(--font-body)", fontSize: "14px", color: "#1C1917", flex: 1, minWidth: 0 }}
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="adm-pg-tabs">
        {TABS.map((t) => {
          const active = tab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`adm-pg-tab ${active ? "is-active" : ""}`}
            >
              <span className="adm-pg-tab-label">{t.label}</span>
              <span className={`adm-pg-tab-count ${active ? "is-active" : ""}`}>{t.count}</span>
            </button>
          );
        })}
      </div>

      {/* Rows */}
      <div>
        {filtered.length === 0 ? (
          <div style={{ padding: "48px 24px", textAlign: "center" }}>
            <HiOfficeBuilding size={36} color="#D6D3CE" style={{ marginBottom: "12px" }} />
            <p style={{ fontFamily: "var(--font-body)", fontSize: "14px", color: "#78716C" }}>No PGs found.</p>
          </div>
        ) : (
          filtered.map((pg, idx) => (
            <PGRow key={pg.objectId} pg={pg} idx={idx} onSuspend={handleSuspend} onUnsuspend={handleUnsuspend} />
          ))
        )}
      </div>
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function AdminPGs() {
  const router = useRouter();
  const { user, hydrated } = useAuthStore();
  const [allPGs, setAllPGs]   = useState<PG[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);

  const stateSlug = typeof router.query.state === "string" ? router.query.state : null;

  useEffect(() => {
    if (!hydrated) return;
    if (!user) { router.replace("/"); return; }
    if (user.role !== "platform_admin") { router.replace("/"); return; }
    setAllPGs(getAllPGsWithOverrides());
  }, [user, hydrated, refreshKey]);

  useEffect(() => {
    if (router.isReady && !stateSlug) {
      router.replace("/admin/dashboard");
    }
  }, [router.isReady, stateSlug]);

  // Remember the chosen state for the rest of this session
  useEffect(() => {
    if (stateSlug && typeof window !== "undefined") {
      sessionStorage.setItem("roomsy_admin_state", stateSlug);
    }
  }, [stateSlug]);

  if (!user || user.role !== "platform_admin") return null;
  if (!router.isReady || !stateSlug) return null;

  const state    = STATES.find((s) => s.slug === stateSlug);
  const pgCount  = allPGs.filter((p) => state?.cities.includes(p.city.toLowerCase())).length;

  return (
    <>
      <Head><title>{state?.name ?? stateSlug} PGs — Roomsy Admin</title></Head>
      <div className="pg-layout" style={{ minHeight: "100vh", backgroundColor: "#F9F7F4" }}>
        <AdminSidebar active="/admin/pgs" />

        <main style={{ flex: 1, overflowX: "hidden" }}>
          <div className="dash-hero-bar">
            <div className="dash-hero-text">
              <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(18px,3vw,24px)", fontWeight: "700", color: "#fff", letterSpacing: "-0.5px", marginBottom: "4px" }}>
                {state?.name ?? stateSlug} PGs
              </h1>
              <p style={{ fontFamily: "var(--font-body)", fontSize: "14px", color: "rgba(255,255,255,0.72)", margin: 0 }}>
                {pgCount} listing{pgCount !== 1 ? "s" : ""}
              </p>
            </div>
            <button
              onClick={() => {
                sessionStorage.removeItem("roomsy_admin_state");
                router.push("/admin/dashboard");
              }}
              className="adm-switch-state"
            >
              <HiSwitchHorizontal size={14} /> <span>Switch state</span>
            </button>
          </div>

          <div className="pg-content" style={{ maxWidth: "1100px", margin: "0 auto" }}>
            <StatePGList stateSlug={stateSlug} allPGs={allPGs} onRefresh={() => setRefreshKey((k) => k + 1)} />
          </div>
        </main>
      </div>

      <style>{`
        .dash-hero-bar {
          background: linear-gradient(130deg, #1C1917 0%, #FF385C 100%);
          padding: 28px 40px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
        }
        .adm-switch-state {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(255,255,255,0.14);
          border: 1px solid rgba(255,255,255,0.22);
          color: #fff;
          font-family: var(--font-body);
          font-size: 12px;
          font-weight: 600;
          padding: 7px 14px;
          border-radius: 100px;
          cursor: pointer;
          backdrop-filter: blur(6px);
          -webkit-backdrop-filter: blur(6px);
          flex-shrink: 0;
          transition: background 0.15s, border-color 0.15s, transform 0.1s;
        }
        .adm-switch-state:hover {
          background: rgba(255,255,255,0.22);
          border-color: rgba(255,255,255,0.36);
        }
        .adm-switch-state:active { transform: scale(0.96); }
        /* Edge-to-edge list card on every screen */
        .pg-content { padding: 14px 0 80px !important; max-width: none !important; }
        .adm-pg-list-card { border-left: none; border-right: none; border-radius: 0; }
        @media (max-width: 768px) { .dash-hero-bar { padding: calc(76px + env(safe-area-inset-top)) 16px 14px; } }
        @media (max-width: 480px) {
          .adm-switch-state span { display: none; }
          .adm-switch-state { padding: 7px; width: 32px; height: 32px; justify-content: center; }
        }

        /* List card */
        .adm-pg-list-card {
          background: #fff;
          border: 1px solid #E8E4DE;
          border-radius: 16px;
          overflow: hidden;
        }

        /* Status filter tabs — fit 4 in one row */
        .adm-pg-tabs {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 6px;
          padding: 10px 14px;
          border-bottom: 1px solid #F0EDE8;
        }
        .adm-pg-tab {
          display: inline-flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 3px;
          padding: 8px 6px;
          border-radius: 12px;
          border: 1.5px solid #E8E4DE;
          background: #fff;
          color: #44403C;
          font-family: var(--font-body);
          cursor: pointer;
          transition: all 0.15s;
          min-width: 0;
        }
        .adm-pg-tab:hover { border-color: #1C1917; color: #1C1917; }
        .adm-pg-tab.is-active {
          border-color: #FF385C;
          background: #FFF0F3;
          color: #FF385C;
        }
        .adm-pg-tab-label {
          font-size: 12px;
          font-weight: 600;
          letter-spacing: -0.1px;
          line-height: 1.1;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 100%;
        }
        .adm-pg-tab.is-active .adm-pg-tab-label { font-weight: 700; }
        .adm-pg-tab-count {
          font-family: var(--font-body);
          font-size: 10px;
          font-weight: 700;
          background: #F0EDE8;
          color: #78716C;
          border-radius: 100px;
          padding: 1px 7px;
          min-width: 18px;
          text-align: center;
        }
        .adm-pg-tab-count.is-active { background: #FF385C; color: #fff; }

        /* Admin PG row */
        .adm-pg-row-head {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 14px 16px;
          min-width: 0;
        }
        .adm-pg-thumb {
          width: 44px; height: 44px;
          border-radius: 10px;
          overflow: hidden;
          flex-shrink: 0;
          background: #F0EDE8;
        }
        .adm-pg-thumb img { width: 100%; height: 100%; object-fit: cover; }
        .adm-pg-title { flex: 1; min-width: 0; }
        .adm-pg-name {
          font-family: var(--font-display);
          font-size: 14px;
          font-weight: 600;
          color: #1C1917;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          margin-bottom: 3px;
        }
        .adm-pg-meta {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-wrap: wrap;
          font-family: var(--font-body);
          font-size: 12px;
          color: #78716C;
        }
        .adm-pg-type {
          font-size: 10px;
          font-weight: 700;
          border-radius: 100px;
          padding: 1px 7px;
        }
        .adm-pg-owner { color: #A8A29E; }
        .adm-pg-price {
          flex-shrink: 0;
          text-align: right;
          min-width: 80px;
        }
        .adm-pg-price-value {
          font-family: var(--font-display);
          font-size: 13px;
          font-weight: 700;
          color: #1C1917;
          margin-bottom: 2px;
          white-space: nowrap;
        }
        .adm-pg-beds {
          font-family: var(--font-body);
          font-size: 11px;
          color: #78716C;
          white-space: nowrap;
        }
        .adm-pg-actions { display: flex; gap: 8px; flex-shrink: 0; }
        .adm-btn {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 7px 14px;
          border-radius: 100px;
          font-family: var(--font-body);
          font-size: 12px;
          font-weight: 700;
          text-decoration: none;
          cursor: pointer;
          white-space: nowrap;
          border: 1.5px solid transparent;
          transition: all 0.15s;
        }
        .adm-btn-primary { background: #FF385C; color: #fff; }
        .adm-btn-primary:hover { background: #E31C5F; }
        .adm-btn-ghost { background: #F9F7F4; color: #78716C; border-color: #E8E4DE; font-weight: 600; }
        .adm-btn-ghost:hover { background: #F0EDE8; }
        .adm-btn-danger { background: #FEF2F2; color: #DC2626; border-color: #FECACA; }
        .adm-btn-danger:hover { background: #FEE2E2; }
        .adm-btn-success { background: #F0FDF4; color: #065F46; border-color: #BBF7D0; }
        .adm-btn-success:hover { background: #DCFCE7; }

        .adm-pg-toggle {
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
        .adm-pg-toggle:hover { background: #F9F7F4; }
        .adm-pg-row.is-expanded .adm-pg-toggle :global(svg) { transform: rotate(180deg); }
        .adm-pg-toggle :global(svg) { transition: transform 0.2s; }

        /* ── Mobile (≤640px): collapse the row to header-only ── */
        @media (max-width: 640px) {
          /* Card edge-to-edge — kill side padding from .pg-content */
          .pg-content { padding: 0 0 calc(86px + env(safe-area-inset-bottom)) !important; }
          .adm-pg-list-card {
            border-left: none;
            border-right: none;
            border-radius: 0;
          }

          /* Tabs tighter so all 4 fit */
          .adm-pg-tabs { gap: 4px; padding: 8px 10px; }
          .adm-pg-tab { padding: 6px 4px; border-width: 1px; border-radius: 10px; gap: 2px; }
          .adm-pg-tab-label { font-size: 11px; }
          .adm-pg-tab-count { font-size: 9.5px; padding: 0 5px; min-width: 16px; }

          .adm-pg-row-head {
            flex-wrap: wrap;
            gap: 10px;
            padding: 12px 14px;
          }
          .adm-pg-thumb { width: 38px; height: 38px; border-radius: 9px; }
          .adm-pg-name { font-size: 13px; margin-bottom: 0; }
          .adm-pg-toggle { display: inline-flex; }

          /* Move price + status badge + actions onto a wrapped second row that's hidden until expanded */
          .adm-pg-price,
          .adm-pg-row-head > span[style*="border-radius"],
          .adm-pg-actions {
            order: 99;
            display: none;
          }
          .adm-pg-meta { font-size: 11px; gap: 4px; }
          .adm-pg-meta > span:nth-child(2) { /* area · city */
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            max-width: 100%;
          }
          .adm-pg-owner { display: none; }

          .adm-pg-row.is-expanded .adm-pg-price,
          .adm-pg-row.is-expanded .adm-pg-row-head > span[style*="border-radius"],
          .adm-pg-row.is-expanded .adm-pg-actions {
            display: flex;
          }
          .adm-pg-row.is-expanded .adm-pg-row-head > span[style*="border-radius"] {
            display: inline-flex;
          }
          .adm-pg-row.is-expanded .adm-pg-price {
            flex-basis: 100%;
            text-align: left;
            min-width: 0;
          }
          .adm-pg-row.is-expanded .adm-pg-price-value { font-size: 14px; }
          .adm-pg-row.is-expanded .adm-pg-actions {
            flex-basis: 100%;
            flex-wrap: wrap;
          }
          .adm-pg-row.is-expanded .adm-pg-actions .adm-btn {
            flex: 1;
            justify-content: center;
            padding: 8px 10px;
            min-width: 0;
          }
          .adm-pg-row.is-expanded .adm-pg-owner { display: inline; }
        }
      `}</style>
    </>
  );
}
