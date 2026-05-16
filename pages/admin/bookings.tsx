import { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";
import { useAuthStore } from "@/store/useAuthStore";
import { getAllBookings, getSignedIdProofUrl, getEffectiveBookingStatus, StoredBooking } from "@/lib/bookingService";
import { AdminSidebar } from "./dashboard";
import {
  HiCalendar, HiPhone, HiX, HiEye, HiArrowLeft, HiOfficeBuilding, HiSearch,
} from "react-icons/hi";
import toast from "react-hot-toast";

type StatusFilter = "all" | "pending" | "confirmed" | "completed" | "cancelled" | "rejected";

const STATUS_TABS: { value: StatusFilter; label: string }[] = [
  { value: "all",       label: "All" },
  { value: "pending",   label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
  { value: "rejected",  label: "Rejected" },
];

const STATUS_STYLE: Record<string, { label: string; color: string; bg: string; dot: string }> = {
  pending:   { label: "Pending",   color: "#92400E", bg: "#FEF3C7", dot: "#F59E0B" },
  confirmed: { label: "Confirmed", color: "#065F46", bg: "#D1FAE5", dot: "#10B981" },
  completed: { label: "Completed", color: "#1E40AF", bg: "#DBEAFE", dot: "#3B82F6" },
  cancelled: { label: "Cancelled", color: "#78716C", bg: "#F5F3F0", dot: "#A8A29E" },
  rejected:  { label: "Rejected",  color: "#991B1B", bg: "#FEE2E2", dot: "#EF4444" },
};

const SHARING_LABEL: Record<string, string> = {
  single: "Single Room",
  double: "2 Sharing",
  triple: "3 Sharing",
};

function formatDate(d: string) {
  if (!d) return "—";
  const [y, m, day] = d.split("-").map(Number);
  return new Date(y, m - 1, day).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function endDateForBooking(b: StoredBooking): string {
  if (b.stayType === "monthly" && b.months) {
    const [y, m, d] = b.fromDate.split("-").map(Number);
    const end = new Date(y, m - 1, d);
    end.setMonth(end.getMonth() + b.months);
    const yyyy = end.getFullYear();
    const mm = String(end.getMonth() + 1).padStart(2, "0");
    const dd = String(end.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }
  return b.toDate || "";
}

function IDProofModal({ url, onClose }: { url: string; onClose: () => void }) {
  return (
    <div
      style={{ position: "fixed", inset: 0, zIndex: 400, display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}
      onClick={onClose}
    >
      <div style={{ position: "absolute", inset: 0, backgroundColor: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }} />
      <div
        style={{ position: "relative", backgroundColor: "#fff", borderRadius: "20px", overflow: "hidden", maxWidth: "480px", width: "100%", boxShadow: "0 24px 80px rgba(0,0,0,0.25)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: "1px solid #F0EDE8" }}>
          <span style={{ fontFamily: "var(--font-display)", fontSize: "16px", fontWeight: "600", color: "#1C1917" }}>ID Proof</span>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#78716C" }}><HiX size={20} /></button>
        </div>
        <div style={{ position: "relative", width: "100%", height: "320px", backgroundColor: "#F9F7F4" }}>
          <Image src={url} alt="ID Proof" fill style={{ objectFit: "contain", padding: "16px" }} />
        </div>
      </div>
    </div>
  );
}

function BookingRow({ booking, onViewProof }: {
  booking: StoredBooking;
  onViewProof: (bookingId: string) => void;
}) {
  const st = STATUS_STYLE[getEffectiveBookingStatus(booking)] || STATUS_STYLE.pending;

  return (
    <div
      className="o-booking-row"
      style={{
        backgroundColor: "#fff",
        border: "1px solid #E8E4DE",
        borderRadius: "14px",
        padding: "16px 20px",
      }}
    >
      <div className="o-booking-info" style={{ flex: 1, minWidth: 0 }}>
        {/* Tenant + status */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px", marginBottom: "5px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", minWidth: 0, flexWrap: "wrap" }}>
            <span style={{ fontFamily: "var(--font-display)", fontSize: "15px", fontWeight: "700", color: "#1C1917" }}>
              {booking.tenantName || "Guest"}
            </span>
            {booking.tenantPhone && (
              <a href={`tel:${booking.tenantPhone}`} style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontFamily: "var(--font-body)", fontSize: "12px", color: "#3B82F6", textDecoration: "none" }}>
                <HiPhone size={12} /> {booking.tenantPhone}
              </a>
            )}
          </div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "5px", backgroundColor: st.bg, borderRadius: "100px", padding: "3px 9px", flexShrink: 0 }}>
            <div style={{ width: "5px", height: "5px", borderRadius: "50%", backgroundColor: st.dot }} />
            <span style={{ fontFamily: "var(--font-body)", fontSize: "11px", fontWeight: "600", color: st.color }}>{st.label}</span>
          </div>
        </div>

        {/* PG name (clickable → admin PG detail) */}
        <Link
          href={booking.pgId ? `/admin/pgs/${booking.pgId}` : "#"}
          style={{ fontFamily: "var(--font-body)", fontSize: "14px", fontWeight: "600", color: "#1C1917", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "6px", marginBottom: "3px" }}
        >
          <HiOfficeBuilding size={13} color="#78716C" />
          {booking.pgName} <span style={{ color: "#A8A29E", fontWeight: 500 }}>· {booking.pgArea}</span>
        </Link>

        {/* Sharing */}
        <div style={{ fontFamily: "var(--font-body)", fontSize: "12px", color: "#78716C", marginBottom: "5px" }}>
          {SHARING_LABEL[booking.sharing]}
        </div>

        {/* Dates */}
        <div style={{ display: "flex", alignItems: "center", gap: "6px", fontFamily: "var(--font-body)", fontSize: "12px", color: "#78716C" }}>
          <HiCalendar size={12} />
          {booking.stayType === "monthly"
            ? `Monthly · ${formatDate(booking.fromDate)} → ${formatDate(endDateForBooking(booking))} (${booking.months} mo)`
            : `Daily · ${formatDate(booking.fromDate)} → ${formatDate(booking.toDate || "")} (${booking.nights} night${booking.nights !== 1 ? "s" : ""})`
          }
        </div>
      </div>

      {/* Amount + ID view */}
      <div className="o-booking-right">
        <div className="o-booking-price" style={{ display: "flex", alignItems: "baseline", gap: "4px", whiteSpace: "nowrap", flexShrink: 0 }}>
          <span style={{ fontFamily: "var(--font-display)", fontSize: "18px", fontWeight: "700", color: "#1C1917", letterSpacing: "-0.4px" }}>
            ₹{booking.total.toLocaleString()}
          </span>
          <span style={{ fontFamily: "var(--font-body)", fontSize: "11px", color: "#78716C" }}>
            {booking.stayType === "monthly" ? "/mo" : "total"}
          </span>
        </div>

        <div className="o-booking-actions">
          {booking.idProofUrl && (
            <button onClick={() => onViewProof(booking.objectId)} style={{ display: "flex", alignItems: "center", gap: "5px", fontFamily: "var(--font-body)", fontSize: "12px", fontWeight: "600", color: "#3B82F6", padding: "6px 12px", borderRadius: "100px", border: "1.5px solid #BFDBFE", backgroundColor: "#EFF6FF", cursor: "pointer", whiteSpace: "nowrap" }}>
              <HiEye size={13} /> ID
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AdminBookings() {
  const router = useRouter();
  const { user, hydrated } = useAuthStore();
  const [bookings, setBookings] = useState<StoredBooking[]>([]);
  const [filter, setFilter] = useState<StatusFilter>("all");
  const [search, setSearch] = useState("");
  const [proofUrl, setProofUrl] = useState<string | null>(null);

  async function handleViewProof(bookingId: string) {
    try {
      const url = await getSignedIdProofUrl(bookingId);
      if (url) setProofUrl(url);
      else toast.error("ID proof not available.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not load ID proof");
    }
  }

  useEffect(() => {
    if (!hydrated) return;
    if (!user) { router.replace("/"); return; }
    if (user.role !== "platform_admin") { router.replace("/"); return; }
    let cancelled = false;
    getAllBookings().then((rows) => { if (!cancelled) setBookings(rows); }).catch(() => {});
    return () => { cancelled = true; };
  }, [user, hydrated]);

  useEffect(() => {
    if (!router.isReady) return;
    const tab = router.query.tab as StatusFilter | undefined;
    if (tab && ["all","pending","confirmed","completed","cancelled","rejected"].includes(tab)) {
      setFilter(tab);
    }
  }, [router.isReady, router.query.tab]);

  if (!user || user.role !== "platform_admin") return null;

  const effStatus = (b: StoredBooking) => getEffectiveBookingStatus(b);
  const counts: Record<StatusFilter, number> = {
    all:       bookings.length,
    pending:   bookings.filter((b) => effStatus(b) === "pending").length,
    confirmed: bookings.filter((b) => effStatus(b) === "confirmed").length,
    completed: bookings.filter((b) => effStatus(b) === "completed").length,
    cancelled: bookings.filter((b) => effStatus(b) === "cancelled").length,
    rejected:  bookings.filter((b) => effStatus(b) === "rejected").length,
  };

  const q = search.trim().toLowerCase();
  const filtered = bookings
    .filter((b) => filter === "all" ? true : effStatus(b) === filter)
    .filter((b) => !q
      || (b.tenantName || "").toLowerCase().includes(q)
      || (b.pgName || "").toLowerCase().includes(q)
      || (b.pgArea || "").toLowerCase().includes(q)
      || (b.tenantPhone || "").includes(q));

  return (
    <>
      <Head><title>Bookings — Roomsy Admin</title></Head>
      <div className="pg-layout">
        <AdminSidebar active="/admin/bookings" />

        <main style={{ flex: 1, overflowX: "hidden" }}>
          <div className="dash-hero-bar">
            <div className="dash-hero-text">
              <button onClick={() => router.push("/admin/dashboard")} aria-label="Back to dashboard" className="dash-hero-back">
                <HiArrowLeft size={16} />
              </button>
              <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(20px,3vw,26px)", fontWeight: "700", color: "#fff", letterSpacing: "-0.5px", marginBottom: "4px" }}>
                Bookings
              </h1>
              <p style={{ fontFamily: "var(--font-body)", fontSize: "14px", color: "rgba(255,255,255,0.68)", margin: 0 }}>
                {bookings.length} booking{bookings.length !== 1 ? "s" : ""} across the platform
              </p>
            </div>
          </div>

          <div className="pg-content pg-bookings-page">

            {/* Search */}
            <div style={{ position: "relative", marginBottom: "16px" }}>
              <HiSearch size={16} color="#A8A29E" style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)" }} />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by tenant, PG, area, or phone"
                style={{ width: "100%", padding: "10px 14px 10px 38px", border: "1px solid #E8E4DE", borderRadius: "100px", fontFamily: "var(--font-body)", fontSize: "13px", outline: "none", backgroundColor: "#fff" }}
              />
            </div>

            {/* Filter tabs */}
            <div className="o-filter-tabs">
              {STATUS_TABS.map((tab) => {
                const active = filter === tab.value;
                return (
                  <button
                    key={tab.value}
                    onClick={() => setFilter(tab.value)}
                    className={`o-filter-tab ${active ? "is-active" : ""}`}
                  >
                    <span className="o-filter-tab-label">{tab.label}</span>
                    <span className={`o-filter-tab-count ${active ? "is-active" : ""}`}>{counts[tab.value]}</span>
                  </button>
                );
              })}
            </div>

            {/* List */}
            {filtered.length > 0 ? (
              <div className="o-booking-list">
                {filtered.map((b) => (
                  <BookingRow
                    key={b.objectId}
                    booking={b}
                    onViewProof={handleViewProof}
                  />
                ))}
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: "60px 24px", backgroundColor: "#fff", borderRadius: "20px", border: "1px solid #E8E4DE" }}>
                <p style={{ fontFamily: "var(--font-body)", fontSize: "15px", color: "#78716C" }}>No {filter !== "all" ? filter : ""} bookings found.</p>
              </div>
            )}
          </div>
        </main>
      </div>

      {proofUrl && <IDProofModal url={proofUrl} onClose={() => setProofUrl(null)} />}
    </>
  );
}
