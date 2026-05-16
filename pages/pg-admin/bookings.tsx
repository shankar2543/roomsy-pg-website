import { useState, useEffect } from "react";
import Head from "next/head";
import Image from "next/image";
import { useRouter } from "next/router";
import { useAuthStore } from "@/store/useAuthStore";
import { getBookingsForOwner, confirmBooking as confirmBookingAdmin, rejectBooking as rejectBookingAdmin, getSignedIdProofUrl, getEffectiveBookingStatus, StoredBooking } from "@/lib/bookingService";
import { Sidebar } from "./dashboard";
import {
  HiCalendar, HiPhone, HiX, HiCheckCircle, HiXCircle, HiEye,
  HiExclamationCircle, HiArrowLeft,
} from "react-icons/hi";
import toast from "react-hot-toast";

type StatusFilter = "all" | "pending" | "confirmed" | "completed" | "cancelled" | "rejected";

const STATUS_TABS: { value: StatusFilter; label: string }[] = [
  { value: "all",       label: "All" },
  { value: "pending",   label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
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
        <div style={{ padding: "14px 20px", backgroundColor: "#FFFBEB", borderTop: "1px solid #FDE68A" }}>
          <p style={{ fontFamily: "var(--font-body)", fontSize: "12px", color: "#92400E" }}>Verify this document before confirming the booking.</p>
        </div>
      </div>
    </div>
  );
}

function BookingRow({ booking, onConfirm, onReject, onViewProof }: {
  booking: StoredBooking;
  onConfirm: (id: string) => void;
  onReject: (id: string) => void;
  onViewProof: (bookingId: string) => void;
}) {
  const effectiveStatus = getEffectiveBookingStatus(booking);
  const st = STATUS_STYLE[effectiveStatus] || STATUS_STYLE.pending;
  const isPending = effectiveStatus === "pending";

  return (
    <div
      className="o-booking-row"
      style={{
        backgroundColor: "#fff",
        border: `1px solid ${isPending ? "#FDE68A" : "#E8E4DE"}`,
        borderRadius: "14px",
        padding: "16px 20px",
        boxShadow: isPending ? "0 0 0 3px rgba(245,158,11,0.08)" : "none",
      }}
    >
      {/* Info */}
      <div className="o-booking-info" style={{ flex: 1, minWidth: 0 }}>
        {/* Row 1: Name + phone */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px", marginBottom: "5px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", minWidth: 0 }}>
            <span style={{ fontFamily: "var(--font-display)", fontSize: "15px", fontWeight: "700", color: "#1C1917", whiteSpace: "nowrap" }}>
              {booking.tenantName || "Guest"}
            </span>
            {booking.tenantPhone && (
              <a href={`tel:${booking.tenantPhone}`} style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontFamily: "var(--font-body)", fontSize: "12px", color: "#3B82F6", textDecoration: "none", whiteSpace: "nowrap" }}>
                <HiPhone size={12} /> {booking.tenantPhone}
              </a>
            )}
          </div>
          <div className="o-status-badge-inline o-status-badge-mobile" style={{ display: "inline-flex", alignItems: "center", gap: "5px", backgroundColor: st.bg, borderRadius: "100px", padding: "3px 9px", flexShrink: 0 }}>
            <div style={{ width: "5px", height: "5px", borderRadius: "50%", backgroundColor: st.dot }} />
            <span style={{ fontFamily: "var(--font-body)", fontSize: "11px", fontWeight: "600", color: st.color }}>{st.label}</span>
          </div>
        </div>

        {/* Row 2: PG name on its own line */}
        <div style={{ fontFamily: "var(--font-body)", fontSize: "14px", fontWeight: "600", color: "#1C1917", marginBottom: "3px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {booking.pgName}
        </div>

        {/* Row 3: Sharing type */}
        <div style={{ fontFamily: "var(--font-body)", fontSize: "12px", color: "#78716C", marginBottom: "5px" }}>
          {SHARING_LABEL[booking.sharing]}
        </div>

        {/* Row 4: Dates */}
        <div style={{ display: "flex", alignItems: "center", gap: "6px", fontFamily: "var(--font-body)", fontSize: "12px", color: "#78716C" }}>
          <HiCalendar size={12} />
          {booking.stayType === "monthly"
            ? `Monthly · ${formatDate(booking.fromDate)} → ${formatDate(endDateForBooking(booking))} (${booking.months} mo)`
            : `Daily · ${formatDate(booking.fromDate)} → ${formatDate(booking.toDate || "")} (${booking.nights} night${booking.nights !== 1 ? "s" : ""})`
          }
        </div>
      </div>

      {/* Amount + actions */}
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
          <div className="o-status-badge-desktop" style={{ display: "inline-flex", alignItems: "center", gap: "6px", backgroundColor: st.bg, borderRadius: "100px", padding: "6px 12px", flexShrink: 0, minWidth: "110px", justifyContent: "center" }}>
            <div style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: st.dot }} />
            <span style={{ fontFamily: "var(--font-body)", fontSize: "12px", fontWeight: 700, color: st.color }}>{st.label}</span>
          </div>
          {booking.idProofUrl && (
            <button onClick={() => onViewProof(booking.objectId)} style={{ display: "flex", alignItems: "center", gap: "5px", fontFamily: "var(--font-body)", fontSize: "12px", fontWeight: "600", color: "#3B82F6", padding: "6px 12px", borderRadius: "100px", border: "1.5px solid #BFDBFE", backgroundColor: "#EFF6FF", cursor: "pointer", whiteSpace: "nowrap" }}>
              <HiEye size={13} /> ID
            </button>
          )}
          {isPending && (
            <>
              <button onClick={() => onConfirm(booking.objectId)} style={{ display: "flex", alignItems: "center", gap: "5px", fontFamily: "var(--font-body)", fontSize: "12px", fontWeight: "700", color: "#065F46", padding: "6px 14px", borderRadius: "100px", border: "1.5px solid #6EE7B7", backgroundColor: "#D1FAE5", cursor: "pointer", whiteSpace: "nowrap" }}>
                <HiCheckCircle size={13} /> Confirm
              </button>
              <button onClick={() => onReject(booking.objectId)} style={{ display: "flex", alignItems: "center", gap: "5px", fontFamily: "var(--font-body)", fontSize: "12px", fontWeight: "700", color: "#991B1B", padding: "6px 14px", borderRadius: "100px", border: "1.5px solid #FCA5A5", backgroundColor: "#FEE2E2", cursor: "pointer", whiteSpace: "nowrap" }}>
                <HiXCircle size={13} /> Reject
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function PGAdminBookings() {
  const router = useRouter();
  const { user, hydrated } = useAuthStore();
  const [bookings, setBookings] = useState<StoredBooking[]>([]);
  const [filter, setFilter] = useState<StatusFilter>("all");
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
    if (user.role !== "pg_admin") { router.replace("/"); return; }
    let cancelled = false;
    getBookingsForOwner(user.objectId).then((rows) => { if (!cancelled) setBookings(rows); }).catch(() => {});
    return () => { cancelled = true; };
  }, [user, hydrated]);

  useEffect(() => {
    if (!router.isReady) return;
    const tab = router.query.tab as StatusFilter | undefined;
    if (tab && ["all","pending","confirmed","completed","cancelled","rejected"].includes(tab)) {
      setFilter(tab);
    }
  }, [router.isReady, router.query.tab]);

  if (!user || user.role !== "pg_admin") return null;

  async function handleConfirm(id: string) {
    try {
      await confirmBookingAdmin(id);
      setBookings((prev) => prev.map((b) => b.objectId === id ? { ...b, status: "confirmed" } : b));
      toast.success("Booking confirmed! Tenant will be notified.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not confirm");
    }
  }

  async function handleReject(id: string) {
    try {
      await rejectBookingAdmin(id);
      setBookings((prev) => prev.map((b) => b.objectId === id ? { ...b, status: "rejected" } : b));
      toast.error("Booking rejected.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not reject");
    }
  }

  const effStatus = (b: StoredBooking) => getEffectiveBookingStatus(b);
  const counts: Record<StatusFilter, number> = {
    all:       bookings.length,
    pending:   bookings.filter((b) => effStatus(b) === "pending").length,
    confirmed: bookings.filter((b) => effStatus(b) === "confirmed").length,
    completed: bookings.filter((b) => effStatus(b) === "completed").length,
    cancelled: bookings.filter((b) => effStatus(b) === "cancelled" || effStatus(b) === "rejected").length,
    rejected:  bookings.filter((b) => effStatus(b) === "rejected").length,
  };

  const filtered = filter === "all"
    ? bookings
    : filter === "cancelled"
    ? bookings.filter((b) => effStatus(b) === "cancelled" || effStatus(b) === "rejected")
    : bookings.filter((b) => effStatus(b) === filter);

  return (
    <>
      <Head><title>Bookings — Roomsy Owner</title></Head>
      <div className="pg-layout">
        <Sidebar active="/pg-admin/bookings" />

        <main className="pg-main">
          <div className="dash-hero-bar">
            <div className="dash-hero-text">
              <button onClick={() => router.push("/pg-admin/dashboard")} aria-label="Back to dashboard" className="dash-hero-back">
                <HiArrowLeft size={16} />
              </button>
              <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(20px,3vw,26px)", fontWeight: "700", color: "#fff", letterSpacing: "-0.5px", marginBottom: "4px" }}>
                Bookings
              </h1>
              <p style={{ fontFamily: "var(--font-body)", fontSize: "14px", color: "rgba(255,255,255,0.68)", margin: 0 }}>
                {bookings.length} booking{bookings.length !== 1 ? "s" : ""} across your PGs
              </p>
            </div>
          </div>

          <div className="pg-content pg-bookings-page">

            {counts.pending > 0 && (
              <div style={{ display: "flex", gap: "10px", alignItems: "center", padding: "12px 16px", backgroundColor: "#FFFBEB", border: "1px solid #FDE68A", borderRadius: "12px", marginBottom: "20px" }}>
                <HiExclamationCircle size={18} color="#F59E0B" />
                <p style={{ fontFamily: "var(--font-body)", fontSize: "13px", color: "#92400E", flex: 1 }}>
                  You have <strong>{counts.pending} pending request{counts.pending !== 1 ? "s" : ""}</strong> waiting for your approval.
                </p>
                <button onClick={() => setFilter("pending")} style={{ fontFamily: "var(--font-body)", fontSize: "12px", fontWeight: "700", color: "#92400E", background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}>
                  Review now
                </button>
              </div>
            )}

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

            {/* Booking list */}
            {filtered.length > 0 ? (
              <div className="o-booking-list">
                {filtered.map((b) => (
                  <BookingRow
                    key={b.objectId}
                    booking={b}
                    onConfirm={handleConfirm}
                    onReject={handleReject}
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
