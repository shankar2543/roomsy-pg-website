import { useState, useEffect, useMemo } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { useAuthStore } from "@/store/useAuthStore";
import { getAllBookings, StoredBooking } from "@/lib/bookingService";
import { getAllPGsWithOverrides } from "@/lib/dummyPGAdmin";
import { PG } from "@/types/pg";
import { AdminSidebar } from "./dashboard";
import {
  HiCurrencyRupee, HiClipboardList, HiOfficeBuilding,
  HiChevronUp, HiChevronDown, HiLocationMarker, HiUser,
} from "react-icons/hi";

type Period  = "daily" | "weekly" | "monthly" | "yearly";
type SortKey = "revenue" | "bookings" | "name";

function getRange(period: Period, ref: Date): [Date, Date] {
  const start = new Date(ref);
  const end   = new Date(ref);
  if (period === "daily") {
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);
  } else if (period === "weekly") {
    const day = ref.getDay();
    start.setDate(ref.getDate() - day);
    start.setHours(0, 0, 0, 0);
    end.setDate(start.getDate() + 6);
    end.setHours(23, 59, 59, 999);
  } else if (period === "monthly") {
    start.setDate(1);
    start.setHours(0, 0, 0, 0);
    end.setMonth(ref.getMonth() + 1, 0);
    end.setHours(23, 59, 59, 999);
  } else {
    start.setMonth(0, 1); start.setHours(0, 0, 0, 0);
    end.setMonth(11, 31); end.setHours(23, 59, 59, 999);
  }
  return [start, end];
}

function inRange(iso: string, s: Date, e: Date) {
  const d = new Date(iso);
  return d >= s && d <= e;
}

function formatRangeLabel(period: Period, ref: Date): string {
  if (period === "daily")   return ref.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
  if (period === "weekly") {
    const [s, e] = getRange("weekly", ref);
    const fmt = (d: Date) => d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
    return `${fmt(s)} – ${fmt(e)}, ${e.getFullYear()}`;
  }
  if (period === "monthly") return ref.toLocaleDateString("en-IN", { month: "long", year: "numeric" });
  return String(ref.getFullYear());
}

function toInputValue(period: Period, ref: Date): string {
  const y = ref.getFullYear();
  const m = String(ref.getMonth() + 1).padStart(2, "0");
  const d = String(ref.getDate()).padStart(2, "0");
  if (period === "monthly") return `${y}-${m}`;
  return `${y}-${m}-${d}`;
}

function parseInputToDate(period: Period, value: string): Date {
  if (period === "yearly")  return new Date(Number(value), 0, 1);
  if (period === "monthly") { const [y, m] = value.split("-").map(Number); return new Date(y, m - 1, 1); }
  return new Date(value + "T00:00:00");
}

function formatShortDate(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function formatDuration(b: StoredBooking): string {
  if (b.stayType === "monthly" && b.months) return `${b.months} month${b.months !== 1 ? "s" : ""}`;
  if (b.stayType === "daily") {
    if (b.nights) return `${b.nights} night${b.nights !== 1 ? "s" : ""}`;
    if (b.toDate) {
      const days = Math.ceil((new Date(b.toDate).getTime() - new Date(b.fromDate).getTime()) / 86400000);
      return `${days} day${days !== 1 ? "s" : ""}`;
    }
    return "1 day";
  }
  return "—";
}

const STATUS_STYLE: Record<string, { label: string; color: string; bg: string }> = {
  pending:   { label: "Pending",   color: "#92400E", bg: "#FFFBEB" },
  confirmed: { label: "Confirmed", color: "#065F46", bg: "#ECFDF5" },
  completed: { label: "Completed", color: "#1D4ED8", bg: "#EFF6FF" },
  rejected:  { label: "Rejected",  color: "#DC2626", bg: "#FEF2F2" },
  cancelled: { label: "Cancelled", color: "#78716C", bg: "#F5F5F4" },
};

function BookingSubRow({ b, isFirst }: { b: StoredBooking; isFirst: boolean }) {
  const [open, setOpen] = useState(false);
  const st = STATUS_STYLE[b.status] ?? STATUS_STYLE.cancelled;

  return (
    <div className={`rev-sub-row ${open ? "is-open" : ""}`} style={{ borderTop: isFirst ? "none" : "1px solid #F0EDE8" }}>
      <div data-label="Tenant">
        <div className="rev-sub-name">{b.tenantName || "Guest"}</div>
        {b.tenantPhone && <div className="rev-sub-phone">{b.tenantPhone}</div>}
      </div>

      <div data-label="Check-in" className="rev-sub-text">
        {formatShortDate(b.fromDate)}
      </div>

      <div data-label="Duration">
        <div className="rev-sub-duration">
          <span className="rev-sub-text">{formatDuration(b)}</span>
          {b.stayType === "monthly" && b.months && (
            <span className="rev-sub-rate">₹{Math.round(b.total / b.months).toLocaleString()}/mo</span>
          )}
        </div>
        <div className="rev-sub-meta">
          {b.stayType === "daily" ? "Short stay" : "Monthly"} · {b.sharing} room
        </div>
      </div>

      <div data-label="Amount" className="rev-sub-amount">
        ₹{b.total.toLocaleString()}
      </div>

      <span data-label="Status" className="rev-sub-status" style={{ color: st.color, backgroundColor: st.bg }}>
        {st.label}
      </span>

      <button
        type="button"
        className="rev-sub-toggle"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label={open ? "Show less" : "Show more"}
      >
        {open ? <HiChevronUp size={14} /> : <HiChevronDown size={14} />}
      </button>
    </div>
  );
}

interface PGStats {
  pg: PG;
  totalBookings: number;
  confirmedBookings: number;
  revenue: number;
  pendingRevenue: number;
  pgBookings: StoredBooking[];
}

export default function AdminRevenue() {
  const router = useRouter();
  const { user, hydrated } = useAuthStore();

  const [period, setPeriod]         = useState<Period>("monthly");
  const [refDate, setRefDate]       = useState<Date>(new Date(2026, 4, 1));
  const [sortKey, setSortKey]       = useState<SortKey>("revenue");
  const [sortAsc, setSortAsc]       = useState(false);
  const [allPGs, setAllPGs]         = useState<PG[]>([]);
  const [bookings, setBookings]     = useState<StoredBooking[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    if (!hydrated) return;
    if (!user) { router.replace("/"); return; }
    if (user.role !== "platform_admin") { router.replace("/"); return; }
    setAllPGs(getAllPGsWithOverrides());
    let cancelled = false;
    getAllBookings().then((rows) => { if (!cancelled) setBookings(rows); }).catch(() => {});
    return () => { cancelled = true; };
  }, [user, hydrated]);

  const [rangeStart, rangeEnd] = useMemo(() => getRange(period, refDate), [period, refDate]);

  const stats: PGStats[] = useMemo(() => {
    const inPeriod = bookings.filter((b) => inRange(b.createdAt, rangeStart, rangeEnd));
    return allPGs.map((pg) => {
      const pgBookings = inPeriod.filter((b) => b.pgId === pg.objectId);
      const confirmed  = pgBookings.filter((b) => b.status === "confirmed" || b.status === "completed");
      const pending    = pgBookings.filter((b) => b.status === "pending");
      return {
        pg,
        totalBookings:     pgBookings.length,
        confirmedBookings: confirmed.length,
        revenue:           confirmed.reduce((s, b) => s + b.total, 0),
        pendingRevenue:    pending.reduce((s, b) => s + b.total, 0),
        pgBookings,
      };
    }).sort((a, b) => {
      let diff = 0;
      if (sortKey === "revenue")  diff = a.revenue - b.revenue;
      if (sortKey === "bookings") diff = a.totalBookings - b.totalBookings;
      if (sortKey === "name")     diff = a.pg.name.localeCompare(b.pg.name);
      return sortAsc ? diff : -diff;
    });
  }, [allPGs, bookings, rangeStart, rangeEnd, sortKey, sortAsc]);

  const totalRevenue  = stats.reduce((s, r) => s + r.revenue, 0);
  const totalBookings = stats.reduce((s, r) => s + r.totalBookings, 0);
  const activePGs     = stats.filter((r) => r.totalBookings > 0).length;
  const maxRevenue    = Math.max(...stats.map((r) => r.revenue), 1);

  if (!user || user.role !== "platform_admin") return null;

  function handlePeriodChange(p: Period) { setPeriod(p); setRefDate(new Date(2026, 4, 1)); setExpandedId(null); }
  function handleDateChange(value: string) { if (!value) return; setRefDate(parseInputToDate(period, value)); setExpandedId(null); }
  function toggleSort(key: SortKey) { if (sortKey === key) setSortAsc((v) => !v); else { setSortKey(key); setSortAsc(false); } }
  function toggleExpand(pgId: string) { setExpandedId((prev) => prev === pgId ? null : pgId); }

  function SortIcon({ k }: { k: SortKey }) {
    if (sortKey !== k) return <span style={{ color: "#D6D3CE" }}><HiChevronDown size={12} /></span>;
    return sortAsc ? <HiChevronUp size={12} color="#FF385C" /> : <HiChevronDown size={12} color="#FF385C" />;
  }

  const PERIODS: { key: Period; label: string }[] = [
    { key: "daily", label: "Daily" }, { key: "weekly", label: "Weekly" },
    { key: "monthly", label: "Monthly" }, { key: "yearly", label: "Yearly" },
  ];

  return (
    <>
      <Head><title>Revenue Analytics — Roomsy Admin</title></Head>
      <div className="pg-layout" style={{ minHeight: "100vh", backgroundColor: "#F9F7F4" }}>
        <AdminSidebar active="/admin/revenue" />

        <main style={{ flex: 1, overflowX: "hidden" }}>
          <div className="dash-hero-bar">
            <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(18px,3vw,24px)", fontWeight: "700", color: "#fff", letterSpacing: "-0.5px", marginBottom: "4px" }}>
              Revenue Analytics
            </h1>
            <p style={{ fontFamily: "var(--font-body)", fontSize: "14px", color: "rgba(255,255,255,0.72)", margin: 0 }}>
              Earnings each PG made through online bookings. Click any row to see individual bookings.
            </p>
          </div>

          <div className="pg-content" style={{ maxWidth: "1100px", margin: "0 auto" }}>

            {/* Period selector + date picker */}
            <div style={{ backgroundColor: "#fff", border: "1px solid #E8E4DE", borderRadius: "16px", padding: "16px 20px", marginBottom: "20px", display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
              <div style={{ display: "flex", gap: "4px" }}>
                {PERIODS.map((p) => (
                  <button key={p.key} onClick={() => handlePeriodChange(p.key)} style={{
                    fontFamily: "var(--font-body)", fontSize: "13px", fontWeight: period === p.key ? "700" : "500",
                    color: period === p.key ? "#fff" : "#78716C",
                    backgroundColor: period === p.key ? "#FF385C" : "transparent",
                    border: period === p.key ? "none" : "1.5px solid #E8E4DE",
                    borderRadius: "100px", padding: "7px 16px", cursor: "pointer", transition: "all 0.15s",
                  }}>
                    {p.label}
                  </button>
                ))}
              </div>
              <div className="rev-date-picker" style={{ display: "flex", alignItems: "center", gap: "10px", marginLeft: "auto" }}>
                <span style={{ fontFamily: "var(--font-body)", fontSize: "13px", color: "#78716C" }}>
                  {formatRangeLabel(period, refDate)}
                </span>
                {period === "yearly" ? (
                  <select value={refDate.getFullYear()} onChange={(e) => { setRefDate(new Date(Number(e.target.value), 0, 1)); setExpandedId(null); }}
                    style={{ fontFamily: "var(--font-body)", fontSize: "14px", color: "#1C1917", border: "1.5px solid #E8E4DE", borderRadius: "10px", padding: "8px 12px", backgroundColor: "#FAFAF9", outline: "none", cursor: "pointer" }}>
                    {[2024, 2025, 2026, 2027].map((y) => <option key={y} value={y}>{y}</option>)}
                  </select>
                ) : (
                  <input type={period === "monthly" ? "month" : "date"} value={toInputValue(period, refDate)}
                    onChange={(e) => handleDateChange(e.target.value)}
                    style={{ fontFamily: "var(--font-body)", fontSize: "14px", color: "#1C1917", border: "1.5px solid #E8E4DE", borderRadius: "10px", padding: "8px 12px", backgroundColor: "#FAFAF9", outline: "none", cursor: "pointer" }} />
                )}
              </div>
            </div>

            {/* Summary KPIs */}
            <div className="adm-summary">
              {[
                { label: "Total PG Earnings", sub: "Combined earnings of all PGs", value: `₹${totalRevenue.toLocaleString()}`, icon: <HiCurrencyRupee size={18} />, color: "#10B981" },
                { label: "Total Bookings",     sub: "All statuses in this period",  value: String(totalBookings),              icon: <HiClipboardList size={18} />,  color: "#6366F1" },
                { label: "Active PGs",         sub: "PGs with at least one booking",value: `${activePGs} / ${allPGs.length}`,  icon: <HiOfficeBuilding size={18} />, color: "#FF385C" },
              ].map((k) => (
                <div key={k.label} className="adm-summary-card">
                  <div className="adm-summary-icon" style={{ backgroundColor: `${k.color}15`, color: k.color }}>
                    {k.icon}
                  </div>
                  <div className="adm-summary-text">
                    <div className="adm-summary-value">{k.value}</div>
                    <div className="adm-summary-label">{k.label}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* PG Revenue Table */}
            <div style={{ backgroundColor: "#fff", border: "1px solid #E8E4DE", borderRadius: "16px", overflow: "hidden" }}>

              {/* Table header */}
              <div className="rev-grid" style={{ display: "grid", gridTemplateColumns: "1fr 90px 90px 140px 170px 32px", alignItems: "center", padding: "12px 16px", borderBottom: "1px solid #F0EDE8", backgroundColor: "#FAFAF9" }}>
                <button onClick={() => toggleSort("name")} style={{ display: "flex", alignItems: "center", gap: "4px", fontFamily: "var(--font-body)", fontSize: "11px", fontWeight: "700", color: "#A8A29E", letterSpacing: "0.8px", textTransform: "uppercase", background: "none", border: "none", cursor: "pointer", padding: 0, textAlign: "left" }}>
                  PG <SortIcon k="name" />
                </button>
                <button onClick={() => toggleSort("bookings")} style={{ display: "flex", alignItems: "center", gap: "4px", fontFamily: "var(--font-body)", fontSize: "11px", fontWeight: "700", color: "#A8A29E", letterSpacing: "0.8px", textTransform: "uppercase", background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                  Bookings <SortIcon k="bookings" />
                </button>
                <span style={{ fontFamily: "var(--font-body)", fontSize: "11px", fontWeight: "700", color: "#A8A29E", letterSpacing: "0.8px", textTransform: "uppercase" }}>Confirmed</span>
                <button onClick={() => toggleSort("revenue")} style={{ display: "flex", alignItems: "center", gap: "4px", fontFamily: "var(--font-body)", fontSize: "11px", fontWeight: "700", color: "#A8A29E", letterSpacing: "0.8px", textTransform: "uppercase", background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                  PG Earnings <SortIcon k="revenue" />
                </button>
                <span style={{ fontFamily: "var(--font-body)", fontSize: "11px", fontWeight: "700", color: "#A8A29E", letterSpacing: "0.8px", textTransform: "uppercase" }}>Share</span>
                <span />
              </div>

              {stats.every((s) => s.totalBookings === 0) ? (
                <div style={{ padding: "56px 24px", textAlign: "center" }}>
                  <HiCurrencyRupee size={36} color="#D6D3CE" style={{ marginBottom: "12px" }} />
                  <p style={{ fontFamily: "var(--font-body)", fontSize: "14px", color: "#78716C" }}>No bookings recorded for this period.</p>
                </div>
              ) : (
                stats.map((s, idx) => {
                  const isExpanded = expandedId === s.pg.objectId;
                  return (
                    <div key={s.pg.objectId} style={{ borderTop: idx === 0 ? "none" : "1px solid #F0EDE8" }}>

                      {/* PG summary row — clickable */}
                      <div
                        className="rev-grid"
                        onClick={() => s.totalBookings > 0 && toggleExpand(s.pg.objectId)}
                        style={{
                          display: "grid", gridTemplateColumns: "1fr 90px 90px 140px 170px 32px",
                          alignItems: "center", padding: "14px 16px",
                          opacity: s.totalBookings === 0 ? 0.45 : 1,
                          cursor: s.totalBookings > 0 ? "pointer" : "default",
                          backgroundColor: isExpanded ? "#FFF8F9" : "transparent",
                          transition: "background 0.15s",
                        }}
                        onMouseEnter={(e) => { if (s.totalBookings > 0 && !isExpanded) (e.currentTarget as HTMLDivElement).style.backgroundColor = "#FAFAF9"; }}
                        onMouseLeave={(e) => { if (!isExpanded) (e.currentTarget as HTMLDivElement).style.backgroundColor = "transparent"; }}
                      >
                        {/* PG info */}
                        <div style={{ display: "flex", alignItems: "center", gap: "12px", minWidth: 0 }}>
                          <div style={{ width: "38px", height: "38px", borderRadius: "9px", overflow: "hidden", flexShrink: 0, backgroundColor: "#F0EDE8" }}>
                            {s.pg.photos[0] && <img src={s.pg.photos[0]} alt={s.pg.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />}
                          </div>
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontFamily: "var(--font-display)", fontSize: "13px", fontWeight: "600", color: "#1C1917", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {s.pg.name}
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                              <HiLocationMarker size={10} color="#A8A29E" />
                              <span style={{ fontFamily: "var(--font-body)", fontSize: "11px", color: "#78716C" }}>{s.pg.area} · {s.pg.owner.name}</span>
                            </div>
                          </div>
                        </div>

                        <div data-label="Bookings" style={{ fontFamily: "var(--font-display)", fontSize: "15px", fontWeight: "700", color: s.totalBookings > 0 ? "#1C1917" : "#D6D3CE" }}>
                          {s.totalBookings}
                        </div>

                        <div data-label="Confirmed" style={{ fontFamily: "var(--font-body)", fontSize: "13px", color: s.confirmedBookings > 0 ? "#065F46" : "#A8A29E", fontWeight: "600" }}>
                          {s.confirmedBookings}
                        </div>

                        <div data-label="PG Earnings">
                          <div style={{ fontFamily: "var(--font-display)", fontSize: "15px", fontWeight: "700", color: s.revenue > 0 ? "#10B981" : "#D6D3CE", letterSpacing: "-0.3px" }}>
                            {s.revenue > 0 ? `₹${s.revenue.toLocaleString()}` : "—"}
                          </div>
                          {s.pendingRevenue > 0 && (
                            <div style={{ fontFamily: "var(--font-body)", fontSize: "11px", color: "#F59E0B" }}>
                              +₹{s.pendingRevenue.toLocaleString()} pending
                            </div>
                          )}
                        </div>

                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <div style={{ flex: 1, height: "6px", backgroundColor: "#F0EDE8", borderRadius: "100px", overflow: "hidden" }}>
                            <div style={{ height: "100%", width: `${Math.round((s.revenue / maxRevenue) * 100)}%`, backgroundColor: s.revenue > 0 ? "#10B981" : "transparent", borderRadius: "100px", transition: "width 0.4s ease" }} />
                          </div>
                          <span style={{ fontFamily: "var(--font-body)", fontSize: "11px", color: "#A8A29E", minWidth: "32px", textAlign: "right" }}>
                            {totalRevenue > 0 ? `${Math.round((s.revenue / totalRevenue) * 100)}%` : "0%"}
                          </span>
                        </div>

                        {/* Expand chevron */}
                        <div className="rev-chev" style={{ visibility: s.totalBookings > 0 ? "visible" : "hidden" }}>
                          {isExpanded ? <HiChevronUp size={16} color="#FF385C" /> : <HiChevronDown size={16} color="#44403C" />}
                        </div>
                      </div>

                      {/* Expanded booking list */}
                      {isExpanded && (
                        <div style={{ backgroundColor: "#F9F7F4", borderTop: "1px solid #F0EDE8", padding: "0 16px 16px" }}>
                          <div style={{ paddingTop: "14px", paddingBottom: "10px", display: "flex", alignItems: "center", gap: "8px" }}>
                            <HiUser size={13} color="#A8A29E" />
                            <span style={{ fontFamily: "var(--font-body)", fontSize: "12px", fontWeight: "700", color: "#78716C", letterSpacing: "0.5px", textTransform: "uppercase" }}>
                              {s.pgBookings.length} booking{s.pgBookings.length !== 1 ? "s" : ""} — {s.pg.name}
                            </span>
                          </div>

                          <div className="rev-sub-card">
                            {/* Sub-table header — desktop only */}
                            <div className="rev-sub-header">
                              {["Tenant", "Check-in", "Duration", "Amount", "Status"].map((h) => (
                                <span key={h}>{h}</span>
                              ))}
                            </div>

                            {s.pgBookings.length === 0 ? (
                              <div style={{ padding: "20px", textAlign: "center" }}>
                                <p style={{ fontFamily: "var(--font-body)", fontSize: "13px", color: "#A8A29E" }}>No bookings in this period.</p>
                              </div>
                            ) : (
                              s.pgBookings.map((b, bi) => (
                                <BookingSubRow key={b.objectId} b={b} isFirst={bi === 0} />
                              ))
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}

              {/* Footer total row */}
              {totalRevenue > 0 && (
                <div className="rev-grid" style={{ display: "grid", gridTemplateColumns: "1fr 90px 90px 140px 170px 32px", alignItems: "center", padding: "12px 16px", borderTop: "2px solid #E8E4DE", backgroundColor: "#FAFAF9" }}>
                  <span style={{ fontFamily: "var(--font-body)", fontSize: "13px", fontWeight: "700", color: "#1C1917" }}>Platform Total</span>
                  <span style={{ fontFamily: "var(--font-display)", fontSize: "15px", fontWeight: "700", color: "#1C1917" }}>{totalBookings}</span>
                  <span style={{ fontFamily: "var(--font-body)", fontSize: "13px", fontWeight: "700", color: "#065F46" }}>{stats.reduce((s, r) => s + r.confirmedBookings, 0)}</span>
                  <span style={{ fontFamily: "var(--font-display)", fontSize: "15px", fontWeight: "700", color: "#10B981", letterSpacing: "-0.3px" }}>₹{totalRevenue.toLocaleString()}</span>
                  <span /><span />
                </div>
              )}
            </div>

          </div>
        </main>
      </div>

      <style>{`
        .dash-hero-bar { background: linear-gradient(130deg, #1C1917 0%, #FF385C 100%); padding: 28px 40px; }

        /* ── Per-booking sub-row inside expanded PG ──────────── */
        .rev-sub-card {
          background: #fff;
          border: 1px solid #E8E4DE;
          border-radius: 12px;
          overflow: hidden;
        }
        .rev-sub-header {
          display: grid;
          grid-template-columns: 1fr 120px 120px 100px 90px;
          align-items: center;
          padding: 9px 14px;
          background: #FAFAF9;
          border-bottom: 1px solid #F0EDE8;
        }
        .rev-sub-header > span {
          font-family: var(--font-body);
          font-size: 10px;
          font-weight: 700;
          color: #A8A29E;
          letter-spacing: 0.8px;
          text-transform: uppercase;
        }
        .rev-sub-row {
          display: grid;
          grid-template-columns: 1fr 120px 120px 100px 90px;
          align-items: center;
          padding: 11px 14px;
        }
        .rev-sub-name {
          font-family: var(--font-body);
          font-size: 13px;
          font-weight: 600;
          color: #1C1917;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .rev-sub-phone {
          font-family: var(--font-body);
          font-size: 11px;
          color: #A8A29E;
        }
        .rev-sub-text {
          font-family: var(--font-body);
          font-size: 12px;
          color: #44403C;
          font-weight: 600;
        }
        .rev-sub-duration { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
        .rev-sub-rate {
          font-family: var(--font-body);
          font-size: 11px;
          font-weight: 500;
          color: #A8A29E;
          background: #F5F3F0;
          border-radius: 6px;
          padding: 1px 6px;
        }
        .rev-sub-meta {
          font-family: var(--font-body);
          font-size: 10px;
          color: #A8A29E;
          text-transform: capitalize;
          margin-top: 2px;
        }
        .rev-sub-amount {
          font-family: var(--font-display);
          font-size: 14px;
          font-weight: 700;
          color: #1C1917;
          letter-spacing: -0.3px;
        }
        .rev-sub-status {
          display: inline-flex;
          align-items: center;
          font-family: var(--font-body);
          font-size: 10px;
          font-weight: 700;
          border-radius: 100px;
          padding: 3px 9px;
          width: fit-content;
        }
        .rev-sub-toggle {
          display: none;
          width: 26px; height: 26px;
          border-radius: 50%;
          border: 1px solid #E8E4DE;
          background: #fff;
          color: #44403C;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          padding: 0;
          flex-shrink: 0;
          transition: background 0.15s, transform 0.18s;
        }
        .rev-sub-toggle:hover { background: #F9F7F4; }

        /* ── Mobile (≤640px): convert sub-row to card with show more/less ── */
        @media (max-width: 640px) {
          .rev-sub-header { display: none; }
          .rev-sub-row {
            display: grid;
            grid-template-columns: 1fr auto auto;
            grid-row-gap: 8px;
            grid-column-gap: 10px;
            padding: 12px 14px;
          }
          .rev-sub-row > *[data-label="Tenant"]   { grid-column: 1; grid-row: 1; min-width: 0; }
          .rev-sub-row > *[data-label="Amount"]   { grid-column: 2; grid-row: 1; align-self: center; }
          .rev-sub-row > .rev-sub-toggle          { display: inline-flex; grid-column: 3; grid-row: 1; align-self: center; }
          .rev-sub-row > *[data-label="Status"]   { grid-column: 1 / -1; grid-row: 2; }

          /* Hidden until expanded */
          .rev-sub-row > *[data-label="Check-in"],
          .rev-sub-row > *[data-label="Duration"] {
            display: none;
          }
          .rev-sub-row.is-open > *[data-label="Check-in"] {
            display: block;
            grid-column: 1 / -1;
            grid-row: 3;
          }
          .rev-sub-row.is-open > *[data-label="Duration"] {
            display: block;
            grid-column: 1 / -1;
            grid-row: 4;
          }
          .rev-sub-row.is-open > *[data-label="Check-in"]::before,
          .rev-sub-row.is-open > *[data-label="Duration"]::before {
            content: attr(data-label);
            display: block;
            font-family: var(--font-body);
            font-size: 9.5px;
            font-weight: 700;
            color: #A8A29E;
            letter-spacing: 0.6px;
            text-transform: uppercase;
            margin-bottom: 2px;
          }
        }

        /* Show-more circular chevron — desktop right column / mobile top-right */
        .rev-chev {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          border: 1.5px solid #E8E4DE;
          background: #fff;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          margin-left: auto;
          flex-shrink: 0;
          transition: background 0.15s, border-color 0.15s, transform 0.18s;
        }
        .rev-grid:hover .rev-chev { background: #F9F7F4; border-color: #1C1917; }
        /* Edge-to-edge cards on every screen */
        .pg-content { padding: 14px 0 80px !important; max-width: none !important; }
        .adm-summary { padding: 0 16px; }
        .pg-content > div:last-child {
          border-left: none !important;
          border-right: none !important;
          border-radius: 0 !important;
        }
        @media (max-width: 768px) { .dash-hero-bar { padding: calc(76px + env(safe-area-inset-top)) 16px 14px; } }

        /* ── PG Revenue table — tablet / mobile reformat ───────── */
        @media (max-width: 900px) {
          /* Hide the desktop header row */
          .pg-content > div:last-child > .rev-grid:first-child { display: none !important; }

          /* Reformat each PG row into a tidy 2-row card */
          .rev-grid {
            display: grid !important;
            grid-template-columns: minmax(0, 1fr) auto !important;
            row-gap: 10px !important;
            column-gap: 12px !important;
            padding: 14px 16px !important;
            border-radius: 0 !important;
          }
          /* Row 1: PG info + chevron */
          .rev-grid > *:nth-child(1) { grid-column: 1; min-width: 0; }
          .rev-grid > *:nth-child(6) {
            grid-column: 2; grid-row: 1;
            display: flex !important;
            align-self: start;
          }
          /* Row 2: 3 stat chips */
          .rev-grid > *:nth-child(2),
          .rev-grid > *:nth-child(3),
          .rev-grid > *:nth-child(4) {
            grid-row: 2;
            display: flex !important;
            flex-direction: column;
            gap: 2px;
            background: #FAFAF9;
            border: 1px solid #F0EDE8;
            border-radius: 10px;
            padding: 8px 10px;
            min-width: 0;
          }
          .rev-grid > *:nth-child(2) { grid-column: 1; }
          .rev-grid > *:nth-child(3) { grid-column: 2; }
          .rev-grid > *:nth-child(4) { grid-column: 1 / -1; }
          .rev-grid > *:nth-child(2)::before,
          .rev-grid > *:nth-child(3)::before,
          .rev-grid > *:nth-child(4)::before {
            content: attr(data-label);
            font-family: var(--font-body);
            font-size: 9.5px;
            font-weight: 700;
            color: #A8A29E;
            letter-spacing: 0.6px;
            text-transform: uppercase;
            order: -1;
          }
          /* Row 3: progress bar full width */
          .rev-grid > *:nth-child(5) {
            grid-column: 1 / -1;
            grid-row: 3;
            display: flex !important;
          }
        }

        @media (max-width: 640px) {
          .pg-content { padding: 0 0 calc(86px + env(safe-area-inset-bottom)) !important; }
          .adm-summary { padding: 12px 12px 0; margin-bottom: 12px; }
          .rev-date-picker {
            margin-left: 0 !important;
            margin-right: auto !important;
            order: -1;
          }
          .rev-grid { padding: 12px 14px !important; row-gap: 8px !important; }
          .rev-grid > *:nth-child(2),
          .rev-grid > *:nth-child(3),
          .rev-grid > *:nth-child(4) { padding: 7px 8px; border-radius: 9px; }
        }
      `}</style>
    </>
  );
}
