import { useState, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { useAuthStore } from "@/store/useAuthStore";
import { getBookingsForOwner, StoredBooking } from "@/lib/bookingService";
import { getPGsForOwner } from "@/lib/pgService";
import { PG } from "@/types/pg";
import { Sidebar } from "./dashboard";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from "recharts";
import { HiChevronLeft, HiChevronRight, HiCalendar, HiTrendingUp, HiOfficeBuilding, HiArrowLeft } from "react-icons/hi";

const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

const SHARING_LABEL: Record<string, string> = {
  single: "Single Room",
  double: "2 Sharing",
  triple: "3 Sharing",
};

const PG_COLORS = ["#FF385C","#6366F1","#10B981","#F59E0B","#8B5CF6","#EC4899"];

function formatRs(n: number) {
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
  if (n >= 1000) return `₹${(n / 1000).toFixed(1)}k`;
  return `₹${n}`;
}

type DayData = {
  day: number;
  label: string;
  total: number;
  bookings: StoredBooking[];
};

function buildDailyData(bookings: StoredBooking[], year: number, month: number): DayData[] {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days: DayData[] = Array.from({ length: daysInMonth }, (_, i) => ({
    day: i + 1,
    label: String(i + 1),
    total: 0,
    bookings: [],
  }));

  bookings
    .filter((b) => b.status === "confirmed" || b.status === "completed")
    .forEach((b) => {
      const d = new Date(b.fromDate);
      if (d.getFullYear() === year && d.getMonth() === month) {
        const idx = d.getDate() - 1;
        days[idx].total += b.total;
        days[idx].bookings.push(b);
      }
    });

  return days;
}

type PerPGSummary = { pg: PG; total: number; count: number };

function buildPerPGSummary(bookings: StoredBooking[], pgs: PG[], year: number, month: number): PerPGSummary[] {
  return pgs.map((pg) => {
    const pgBookings = bookings.filter(
      (b) =>
        b.pgId === pg.objectId &&
        (b.status === "confirmed" || b.status === "completed") &&
        (() => { const d = new Date(b.fromDate); return d.getFullYear() === year && d.getMonth() === month; })()
    );
    return { pg, total: pgBookings.reduce((s, b) => s + b.total, 0), count: pgBookings.length };
  }).sort((a, b) => b.total - a.total);
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const d: DayData = payload[0]?.payload;
  if (!d || d.total === 0) return null;
  return (
    <div style={{ backgroundColor: "#fff", border: "1px solid #E8E4DE", borderRadius: "12px", padding: "12px 16px", boxShadow: "0 4px 20px rgba(0,0,0,0.12)", minWidth: "160px" }}>
      <p style={{ fontFamily: "var(--font-body)", fontSize: "11px", fontWeight: "700", color: "#78716C", marginBottom: "6px" }}>
        Day {label}
      </p>
      <p style={{ fontFamily: "var(--font-display)", fontSize: "20px", fontWeight: "700", color: "#FF385C", letterSpacing: "-0.4px", marginBottom: "6px" }}>
        ₹{d.total.toLocaleString()}
      </p>
      <p style={{ fontFamily: "var(--font-body)", fontSize: "12px", color: "#78716C" }}>
        {d.bookings.length} booking{d.bookings.length !== 1 ? "s" : ""}
      </p>
    </div>
  );
}

export default function PGAdminEarnings() {
  const router = useRouter();
  const { user, hydrated } = useAuthStore();

  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selectedPgId, setSelectedPgId] = useState<string>("all");
  const [selectedDay, setSelectedDay] = useState<DayData | null>(null);

  const [allBookings, setAllBookings] = useState<StoredBooking[]>([]);
  const [pgs, setPGs] = useState<PG[]>([]);

  useEffect(() => {
    if (!hydrated) return;
    if (!user) { router.replace("/"); return; }
    if (user.role !== "pg_admin") { router.replace("/"); return; }
    let cancelled = false;
    getBookingsForOwner(user.objectId).then((rows) => { if (!cancelled) setAllBookings(rows); }).catch(() => {});
    getPGsForOwner(user.objectId).then((rows) => { if (!cancelled) setPGs(rows); }).catch(() => {});
    return () => { cancelled = true; };
  }, [user, hydrated]);

  if (!user || user.role !== "pg_admin") return null;

  function prevMonth() {
    setSelectedDay(null);
    if (month === 0) { setMonth(11); setYear((y) => y - 1); }
    else setMonth((m) => m - 1);
  }

  function nextMonth() {
    setSelectedDay(null);
    if (month === 11) { setMonth(0); setYear((y) => y + 1); }
    else setMonth((m) => m + 1);
  }

  const filteredBookings = selectedPgId === "all"
    ? allBookings
    : allBookings.filter((b) => b.pgId === selectedPgId);

  const dailyData = buildDailyData(filteredBookings, year, month);
  const perPGSummary = buildPerPGSummary(allBookings, pgs, year, month);

  const monthTotal   = dailyData.reduce((s, d) => s + d.total, 0);
  const activeDays   = dailyData.filter((d) => d.total > 0).length;
  const avgPerDay    = activeDays > 0 ? Math.round(monthTotal / activeDays) : 0;
  const bestDay      = dailyData.reduce((best, d) => d.total > best.total ? d : best, dailyData[0]);
  const bookingCount = dailyData.reduce((s, d) => s + d.bookings.length, 0);

  const maxBar = Math.max(...dailyData.map((d) => d.total), 1);

  return (
    <>
      <Head><title>Earnings — Roomsy Owner</title></Head>
      <div className="pg-layout">
        <Sidebar active="/pg-admin/earnings" />

        <main className="pg-main">
          <div className="dash-hero-bar">
            <div className="dash-hero-text">
              <button onClick={() => router.push("/pg-admin/dashboard")} aria-label="Back to dashboard" className="dash-hero-back">
                <HiArrowLeft size={16} />
              </button>
              <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(20px,3vw,26px)", fontWeight: "700", color: "#fff", letterSpacing: "-0.5px", marginBottom: "4px" }}>
                Earnings
              </h1>
              <p style={{ fontFamily: "var(--font-body)", fontSize: "14px", color: "rgba(255,255,255,0.68)", margin: 0 }}>
                Day-by-day confirmed revenue
              </p>
            </div>
          </div>

          <div className="pg-content">

            {/* Month navigator */}
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px", flexWrap: "wrap" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "4px", backgroundColor: "#fff", border: "1px solid #E8E4DE", borderRadius: "100px", padding: "4px" }}>
                <button
                  onClick={prevMonth}
                  style={{ width: "32px", height: "32px", borderRadius: "50%", border: "none", backgroundColor: "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#44403C", transition: "background 0.15s" }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#F0EDE8")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                >
                  <HiChevronLeft size={16} />
                </button>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", padding: "0 8px" }}>
                  <HiCalendar size={14} color="#FF385C" />
                  <span style={{ fontFamily: "var(--font-display)", fontSize: "15px", fontWeight: "600", color: "#1C1917", minWidth: "130px", textAlign: "center" }}>
                    {MONTHS[month]} {year}
                  </span>
                </div>
                <button
                  onClick={nextMonth}
                  style={{ width: "32px", height: "32px", borderRadius: "50%", border: "none", backgroundColor: "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#44403C", transition: "background 0.15s" }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#F0EDE8")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                >
                  <HiChevronRight size={16} />
                </button>
              </div>

              {/* PG filter tabs */}
              {pgs.length > 1 && (
                <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                  {[{ objectId: "all", name: "All PGs" }, ...pgs].map((pg, idx) => {
                    const active = selectedPgId === pg.objectId;
                    const color = pg.objectId === "all" ? "#FF385C" : PG_COLORS[(idx - 1) % PG_COLORS.length];
                    return (
                      <button
                        key={pg.objectId}
                        onClick={() => { setSelectedPgId(pg.objectId); setSelectedDay(null); }}
                        style={{
                          padding: "6px 14px", borderRadius: "100px", cursor: "pointer",
                          border: `1.5px solid ${active ? color : "#E8E4DE"}`,
                          backgroundColor: active ? `${color}15` : "#fff",
                          fontFamily: "var(--font-body)", fontSize: "13px",
                          fontWeight: active ? "600" : "500",
                          color: active ? color : "#44403C",
                          transition: "all 0.15s",
                        }}
                      >
                        {pg.name}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Summary cards */}
            <div className="o-earn-grid">
              {[
                { label: "Total Earned",  value: `₹${monthTotal.toLocaleString()}`, sub: `${bookingCount} booking${bookingCount !== 1 ? "s" : ""}`, color: "#FF385C" },
                { label: "Earning Days",  value: String(activeDays),                sub: `of ${new Date(year, month + 1, 0).getDate()} days`, color: "#6366F1" },
                { label: "Avg on Active", value: avgPerDay > 0 ? `₹${avgPerDay.toLocaleString()}` : "—", sub: "per earning day", color: "#10B981" },
                { label: "Best Day",      value: bestDay?.total > 0 ? `Day ${bestDay.day}` : "—", sub: bestDay?.total > 0 ? `₹${bestDay.total.toLocaleString()}` : "no earnings", color: "#F59E0B" },
              ].map((card) => (
                <div key={card.label} className="o-earn-card">
                  <div className="o-earn-label">{card.label}</div>
                  <div className="o-earn-value" style={{ color: card.color }}>{card.value}</div>
                  <div className="o-earn-sub">{card.sub}</div>
                </div>
              ))}
            </div>

            {/* Bar chart */}
            <div style={{ backgroundColor: "#fff", border: "1px solid #E8E4DE", borderRadius: "16px", padding: "24px 20px 16px", marginBottom: "20px" }}>
              <p style={{ fontFamily: "var(--font-display)", fontSize: "15px", fontWeight: "600", color: "#1C1917", marginBottom: "20px", paddingLeft: "4px" }}>
                Daily Earnings — {MONTHS[month]} {year}
                {selectedPgId !== "all" && (
                  <span style={{ fontFamily: "var(--font-body)", fontSize: "12px", fontWeight: "500", color: "#78716C", marginLeft: "8px" }}>
                    ({pgs.find((p) => p.objectId === selectedPgId)?.name})
                  </span>
                )}
              </p>

              {monthTotal === 0 ? (
                <div style={{ height: "200px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <div style={{ textAlign: "center" }}>
                    <HiTrendingUp size={32} color="#E8E4DE" style={{ marginBottom: "10px" }} />
                    <p style={{ fontFamily: "var(--font-body)", fontSize: "14px", color: "#A8A29E" }}>No confirmed earnings for this month.</p>
                  </div>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={dailyData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }} onClick={(data) => {
                    if (data?.activePayload?.[0]) {
                      const d = data.activePayload[0].payload as DayData;
                      setSelectedDay(d.total > 0 ? d : null);
                    }
                  }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F0EDE8" vertical={false} />
                    <XAxis
                      dataKey="label"
                      tick={{ fontFamily: "var(--font-body)", fontSize: 11, fill: "#A8A29E" }}
                      axisLine={false} tickLine={false}
                      interval={dailyData.length > 20 ? 4 : 1}
                    />
                    <YAxis
                      tick={{ fontFamily: "var(--font-body)", fontSize: 11, fill: "#A8A29E" }}
                      axisLine={false} tickLine={false}
                      tickFormatter={formatRs}
                      width={48}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: "#F9F7F4" }} />
                    <Bar dataKey="total" radius={[6, 6, 0, 0]} maxBarSize={36} style={{ cursor: "pointer" }}>
                      {dailyData.map((entry, idx) => (
                        <Cell
                          key={idx}
                          fill={
                            selectedDay?.day === entry.day
                              ? "#FF385C"
                              : entry.total > 0
                              ? "#FECDD3"
                              : "#F0EDE8"
                          }
                          stroke={
                            selectedDay?.day === entry.day ? "#E31C5F" : "none"
                          }
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Selected day bookings */}
            {selectedDay && selectedDay.bookings.length > 0 && (
              <div style={{ backgroundColor: "#fff", border: "1px solid #FECDD3", borderRadius: "16px", padding: "20px", marginBottom: "20px", boxShadow: "0 0 0 3px rgba(255,56,92,0.06)" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
                  <p style={{ fontFamily: "var(--font-display)", fontSize: "15px", fontWeight: "600", color: "#1C1917" }}>
                    Day {selectedDay.day} — {MONTHS[month]} {year}
                  </p>
                  <button
                    onClick={() => setSelectedDay(null)}
                    style={{ fontFamily: "var(--font-body)", fontSize: "12px", color: "#78716C", background: "none", border: "none", cursor: "pointer" }}
                  >
                    Close ×
                  </button>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {selectedDay.bookings.map((b) => (
                    <div key={b.objectId} style={{ display: "flex", alignItems: "center", gap: "14px", padding: "12px 16px", backgroundColor: "#FAFAF9", borderRadius: "12px", border: "1px solid #F0EDE8" }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontFamily: "var(--font-display)", fontSize: "14px", fontWeight: "600", color: "#1C1917", marginBottom: "3px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {b.tenantName || "Guest"} · {b.pgName}
                        </p>
                        <p style={{ fontFamily: "var(--font-body)", fontSize: "12px", color: "#78716C" }}>
                          {SHARING_LABEL[b.sharing]} · {b.stayType === "monthly" ? `${b.months} month${b.months !== 1 ? "s" : ""}` : `${b.nights} night${b.nights !== 1 ? "s" : ""}`}
                        </p>
                      </div>
                      <div style={{ textAlign: "right", flexShrink: 0 }}>
                        <p style={{ fontFamily: "var(--font-display)", fontSize: "18px", fontWeight: "700", color: "#FF385C", letterSpacing: "-0.4px" }}>
                          ₹{b.total.toLocaleString()}
                        </p>
                        <p style={{ fontFamily: "var(--font-body)", fontSize: "11px", color: "#A8A29E", textTransform: "capitalize" }}>{b.status}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: "14px", paddingTop: "14px", borderTop: "1px solid #F0EDE8", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontFamily: "var(--font-body)", fontSize: "13px", color: "#78716C" }}>Day total</span>
                  <span style={{ fontFamily: "var(--font-display)", fontSize: "22px", fontWeight: "700", color: "#1C1917", letterSpacing: "-0.4px" }}>
                    ₹{selectedDay.total.toLocaleString()}
                  </span>
                </div>
              </div>
            )}

            {/* Per-PG breakdown (only when "All" is selected and there are multiple PGs) */}
            {selectedPgId === "all" && pgs.length > 1 && (
              <div style={{ backgroundColor: "#fff", border: "1px solid #E8E4DE", borderRadius: "16px", overflow: "hidden" }}>
                <div style={{ padding: "18px 20px", borderBottom: "1px solid #F0EDE8" }}>
                  <p style={{ fontFamily: "var(--font-display)", fontSize: "15px", fontWeight: "600", color: "#1C1917" }}>
                    Per-PG Breakdown — {MONTHS[month]} {year}
                  </p>
                </div>
                <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: "12px" }}>
                  {perPGSummary.map((item, idx) => {
                    const color = PG_COLORS[idx % PG_COLORS.length];
                    const pct = monthTotal > 0 ? (item.total / monthTotal) * 100 : 0;
                    return (
                      <div key={item.pg.objectId}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <div style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: color, flexShrink: 0 }} />
                            <span style={{ fontFamily: "var(--font-body)", fontSize: "13px", fontWeight: "500", color: "#1C1917" }}>
                              {item.pg.name}
                            </span>
                            <span style={{ fontFamily: "var(--font-body)", fontSize: "11px", color: "#A8A29E" }}>
                              {item.count} booking{item.count !== 1 ? "s" : ""}
                            </span>
                          </div>
                          <span style={{ fontFamily: "var(--font-display)", fontSize: "15px", fontWeight: "700", color: "#1C1917" }}>
                            {item.total > 0 ? `₹${item.total.toLocaleString()}` : "—"}
                          </span>
                        </div>
                        <div style={{ height: "6px", backgroundColor: "#F0EDE8", borderRadius: "100px", overflow: "hidden" }}>
                          <div style={{ height: "100%", width: `${pct}%`, backgroundColor: color, borderRadius: "100px", transition: "width 0.5s ease" }} />
                        </div>
                      </div>
                    );
                  })}

                  {monthTotal === 0 && (
                    <p style={{ fontFamily: "var(--font-body)", fontSize: "14px", color: "#A8A29E", textAlign: "center", padding: "16px 0" }}>
                      No confirmed earnings for this month across any PG.
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </>
  );
}
