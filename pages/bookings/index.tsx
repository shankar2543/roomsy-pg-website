import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import { BookingRowSkeleton, useInitialLoading } from "@/components/common/Skeleton";
import { useAuthStore } from "@/store/useAuthStore";
import { getBookingsForUser, cancelBooking, StoredBooking } from "@/lib/bookingService";
import {
  HiLocationMarker, HiCalendar, HiArrowLeft, HiChevronDown,
  HiStar, HiOutlineStar, HiX,
} from "react-icons/hi";
import toast from "react-hot-toast";
import { submitReview } from "@/lib/reviewService";

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
  double: "Double Sharing",
  triple: "Triple Sharing",
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

function BookingCard({
  booking,
  onCancel,
  onRate,
}: {
  booking: StoredBooking;
  onCancel: (id: string) => void;
  onRate: (booking: StoredBooking) => void;
}) {
  const st = STATUS_STYLE[booking.status] || STATUS_STYLE.pending;
  const canCancel = booking.status === "pending" || booking.status === "confirmed";
  const canRate = booking.status === "completed";
  const [expanded, setExpanded] = useState(false);

  return (
    <article className={`bk-card ${expanded ? "is-expanded" : ""}`}>
      <div className="bk-card-img">
        {booking.pgPhoto ? (
          <Image src={booking.pgPhoto} alt={booking.pgName} fill style={{ objectFit: "cover" }} sizes="(max-width: 600px) 100vw, 200px" />
        ) : (
          <div className="bk-card-img-fallback">
            <span>R</span>
          </div>
        )}
        <div className="bk-card-status" style={{ backgroundColor: st.bg }}>
          <span className="bk-card-status-dot" style={{ backgroundColor: st.dot }} />
          <span style={{ color: st.color }}>{st.label}</span>
        </div>
      </div>

      <div className="bk-card-body">
        <header className="bk-card-head">
          <div className="bk-card-head-text">
            <h2 className="bk-card-title">{booking.pgName}</h2>
            <p className="bk-card-loc">
              <HiLocationMarker size={12} color="#FF385C" />
              <span>{booking.pgArea}, Hyderabad</span>
            </p>
          </div>
          <button
            className="bk-card-toggle"
            onClick={() => setExpanded((v) => !v)}
            aria-expanded={expanded}
            aria-label={expanded ? "Show less" : "Show more"}
          >
            <HiChevronDown size={18} />
          </button>
        </header>

        <div className="bk-card-meta">
          <span className="bk-card-pill bk-card-pill-soft">{SHARING_LABEL[booking.sharing]}</span>
          <span className="bk-card-pill bk-card-pill-soft">{booking.stayType === "monthly" ? "Monthly" : "Daily"}</span>
          <span className="bk-card-meta-dates">
            <HiCalendar size={12} />
            <span>{formatDate(booking.fromDate)} → {formatDate(endDateForBooking(booking))}</span>
          </span>
        </div>

        {expanded && (
          <>
            <div className="bk-card-divider" />

            <div className="bk-card-stats">
              <div className="bk-card-stat">
                <span className="bk-card-stat-label">Check-in</span>
                <span className="bk-card-stat-value">{formatDate(booking.fromDate)}</span>
              </div>
              <div className="bk-card-stat">
                <span className="bk-card-stat-label">Check-out</span>
                <span className="bk-card-stat-value">
                  {formatDate(endDateForBooking(booking))}
                  {booking.stayType === "monthly" && booking.months ? ` · ${booking.months}mo` : ""}
                </span>
              </div>
              <div className="bk-card-stat bk-card-stat-total">
                <span className="bk-card-stat-label">Total</span>
                <span className="bk-card-stat-value bk-card-stat-amount">₹{booking.total.toLocaleString()}</span>
              </div>
            </div>

            <footer className="bk-card-foot">
              <Link href={`/pgs/${booking.pgId}`} className="bk-btn bk-btn-ghost">View PG</Link>
              {canCancel && (
                <button onClick={() => onCancel(booking.objectId)} className="bk-btn bk-btn-danger">
                  Cancel booking
                </button>
              )}
              {canRate && (
                <button onClick={() => onRate(booking)} className="bk-btn bk-btn-primary">
                  Rate this stay
                </button>
              )}
            </footer>
          </>
        )}
      </div>

      <style jsx>{`
        .bk-card {
          background: #fff;
          border: 1px solid #E8E4DE;
          border-radius: 18px;
          overflow: hidden;
          display: flex;
          box-shadow: 0 1px 2px rgba(28,25,23,0.04);
          transition: box-shadow 0.25s ease, transform 0.25s ease, border-color 0.25s ease;
        }
        .bk-card:hover {
          box-shadow: 0 10px 28px rgba(28,25,23,0.09);
          border-color: #DCD5CC;
          transform: translateY(-1px);
        }

        .bk-card-img {
          position: relative;
          width: 220px;
          flex-shrink: 0;
          background: #F0EDE8;
        }
        .bk-card-img :global(img) {
          transition: transform 0.6s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .bk-card:hover .bk-card-img :global(img) {
          transform: scale(1.04);
        }
        .bk-card-img-fallback {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .bk-card-img-fallback span {
          font-family: var(--font-display);
          font-size: 36px;
          color: #D6D3CE;
        }

        .bk-card-status {
          position: absolute;
          top: 12px;
          left: 12px;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 5px 11px;
          border-radius: 100px;
          font-family: var(--font-body);
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.2px;
          text-transform: uppercase;
          backdrop-filter: blur(6px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.12);
        }
        .bk-card-status-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          box-shadow: 0 0 0 2px rgba(255,255,255,0.5);
        }

        .bk-card-body {
          flex: 1;
          padding: 18px 22px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          min-width: 0;
        }
        .bk-card-head {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          min-width: 0;
        }
        .bk-card-head-text { flex: 1; min-width: 0; }
        .bk-card-toggle {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          border: 1.5px solid #E8E4DE;
          background: #fff;
          color: #1C1917;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          padding: 0;
          flex-shrink: 0;
          transition: background 0.15s, border-color 0.15s, transform 0.2s;
        }
        .bk-card-toggle:hover {
          background: #F9F7F4;
          border-color: #1C1917;
        }
        .bk-card-toggle :global(svg) {
          transition: transform 0.25s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .bk-card.is-expanded .bk-card-toggle :global(svg) {
          transform: rotate(180deg);
        }
        .bk-card-title {
          font-family: var(--font-display);
          font-size: 17px;
          font-weight: 600;
          color: #1C1917;
          letter-spacing: -0.2px;
          margin: 0 0 3px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .bk-card-loc {
          display: flex;
          align-items: center;
          gap: 4px;
          margin: 0;
          font-family: var(--font-body);
          font-size: 12px;
          color: #78716C;
        }

        /* Compact meta row — always visible (collapsed AND expanded) */
        .bk-card-meta {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 6px;
        }
        .bk-card-pill {
          font-family: var(--font-body);
          font-size: 11px;
          font-weight: 600;
          color: #44403C;
          background: #F5F3F0;
          border-radius: 100px;
          padding: 4px 10px;
          border: 1px solid #E8E4DE;
        }
        .bk-card-pill-soft {
          background: #F5F3F0;
          color: #57534E;
          border-color: #E8E4DE;
        }
        .bk-card-meta-dates {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-family: var(--font-body);
          font-size: 12px;
          font-weight: 500;
          color: #57534E;
          margin-left: 2px;
        }
        .bk-card-meta-dates :global(svg) { color: #A8A29E; }

        .bk-card-divider {
          height: 1px;
          background: #F0EDE8;
          margin: 4px 0 2px;
        }

        /* Expanded stat grid */
        .bk-card-stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 14px;
          padding: 4px 0 6px;
        }
        .bk-card-stat {
          display: flex;
          flex-direction: column;
          gap: 3px;
          min-width: 0;
        }
        .bk-card-stat-label {
          font-family: var(--font-body);
          font-size: 10px;
          font-weight: 700;
          color: #A8A29E;
          letter-spacing: 0.6px;
          text-transform: uppercase;
        }
        .bk-card-stat-value {
          font-family: var(--font-body);
          font-size: 13px;
          font-weight: 600;
          color: #1C1917;
          line-height: 1.3;
        }
        .bk-card-stat-total { align-items: flex-end; text-align: right; }
        .bk-card-stat-amount {
          font-family: var(--font-display);
          font-size: 17px;
          font-weight: 700;
          letter-spacing: -0.3px;
          color: #FF385C;
        }

        .bk-card-foot {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 8px;
          padding-top: 4px;
        }
        .bk-btn {
          font-family: var(--font-body);
          font-size: 13px;
          font-weight: 600;
          padding: 10px 18px;
          border-radius: 100px;
          cursor: pointer;
          text-decoration: none;
          text-align: center;
          transition: background 0.15s, color 0.15s, border-color 0.15s, transform 0.12s;
          border: 1.5px solid transparent;
          line-height: 1;
        }
        .bk-btn:active { transform: scale(0.97); }
        .bk-btn-ghost {
          color: #1C1917;
          background: #fff;
          border-color: #E8E4DE;
        }
        .bk-btn-ghost:hover {
          background: #F9F7F4;
          border-color: #1C1917;
        }
        .bk-btn-danger {
          color: #DC2626;
          background: #FEF2F2;
          border-color: #FECACA;
        }
        .bk-btn-danger:hover {
          background: #DC2626;
          color: #fff;
          border-color: #DC2626;
        }

        /* ── Mobile (≤640px) ── */
        @media (max-width: 640px) {
          .bk-card {
            flex-direction: column;
            border-radius: 16px;
          }
          .bk-card-img {
            width: 100%;
            height: 170px;
          }
          .bk-card-status {
            top: 12px;
            left: 12px;
            font-size: 10.5px;
            padding: 4px 10px;
          }
          .bk-card-body {
            padding: 14px 16px 18px;
            gap: 10px;
          }
          .bk-card-title { font-size: 16px; }
          .bk-card-meta-dates { font-size: 11.5px; }
          .bk-card-stats {
            grid-template-columns: 1fr 1fr;
            gap: 12px;
          }
          .bk-card-stat-total {
            grid-column: 1 / -1;
            flex-direction: row;
            align-items: center;
            justify-content: space-between;
            padding: 10px 14px;
            background: #FFF0F3;
            border-radius: 10px;
            margin-top: 2px;
            text-align: left;
          }
          .bk-card-stat-total .bk-card-stat-label { color: #57534E; }
          .bk-card-foot {
            flex-direction: row;
            justify-content: stretch;
            gap: 8px;
          }
          .bk-btn {
            flex: 1;
            padding: 11px 14px;
          }
        }
      `}</style>
    </article>
  );
}

function RateStayModal({
  booking,
  onClose,
  onSubmitted,
}: {
  booking: StoredBooking;
  onClose: () => void;
  onSubmitted: () => void;
}) {
  const [stars, setStars] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    if (stars < 1) {
      toast.error("Please pick a star rating.");
      return;
    }
    setSubmitting(true);
    try {
      await submitReview({ bookingId: booking.objectId, stars, comment: comment.trim() });
      toast.success("Thanks — your review is in.");
      onSubmitted();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not submit review");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 16, zIndex: 1000,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#fff", borderRadius: 16, width: "100%", maxWidth: 440,
          boxShadow: "0 20px 60px rgba(0,0,0,0.25)", overflow: "hidden",
        }}
      >
        <header style={{ padding: "18px 20px", borderBottom: "1px solid #F0EDE8", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h3 style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 600, color: "#1C1917", margin: 0 }}>Rate your stay</h3>
            <p style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "#78716C", margin: "2px 0 0" }}>{booking.pgName}</p>
          </div>
          <button onClick={onClose} aria-label="Close" style={{ background: "#F5F3F0", border: "none", borderRadius: "50%", width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
            <HiX size={16} />
          </button>
        </header>

        <div style={{ padding: 20 }}>
          <p style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "#1C1917", marginBottom: 10 }}>How was it?</p>
          <div style={{ display: "flex", gap: 4, marginBottom: 18 }}>
            {[1, 2, 3, 4, 5].map((n) => {
              const filled = n <= (hover || stars);
              return (
                <button
                  key={n}
                  type="button"
                  onMouseEnter={() => setHover(n)}
                  onMouseLeave={() => setHover(0)}
                  onClick={() => setStars(n)}
                  aria-label={`${n} star${n > 1 ? "s" : ""}`}
                  style={{ background: "none", border: "none", cursor: "pointer", padding: 4, color: filled ? "#F59E0B" : "#D6D3CE" }}
                >
                  {filled ? <HiStar size={32} /> : <HiOutlineStar size={32} />}
                </button>
              );
            })}
          </div>

          <p style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "#1C1917", marginBottom: 6 }}>Comment <span style={{ color: "#A8A29E", fontWeight: 400 }}>(optional)</span></p>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value.slice(0, 1000))}
            placeholder="Anything future tenants should know?"
            rows={4}
            style={{
              width: "100%", border: "1.5px solid #E8E4DE", borderRadius: 10,
              padding: "10px 12px", fontFamily: "var(--font-body)", fontSize: 14,
              color: "#1C1917", outline: "none", background: "#FAFAF9",
              resize: "vertical", boxSizing: "border-box",
            }}
          />
        </div>

        <footer style={{ padding: "14px 20px", borderTop: "1px solid #F0EDE8", display: "flex", justifyContent: "flex-end", gap: 8 }}>
          <button onClick={onClose} disabled={submitting} style={{ padding: "10px 16px", borderRadius: 100, border: "1.5px solid #E8E4DE", background: "#fff", fontFamily: "var(--font-body)", fontSize: 14, fontWeight: 600, color: "#1C1917", cursor: "pointer" }}>
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={submitting} style={{ padding: "10px 18px", borderRadius: 100, border: "none", background: submitting ? "#FDBA74" : "#FF385C", color: "#fff", fontFamily: "var(--font-body)", fontSize: 14, fontWeight: 600, cursor: submitting ? "not-allowed" : "pointer" }}>
            {submitting ? "Submitting…" : "Submit"}
          </button>
        </footer>
      </div>
    </div>
  );
}

export default function MyBookingsPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const hydrated = useAuthStore((s) => s.hydrated);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [bookings, setBookings] = useState<StoredBooking[]>([]);
  const isLoading = useInitialLoading(500);

  useEffect(() => {
    if (!hydrated) return;
    if (!user) { router.replace("/"); return; }
    let cancelled = false;
    getBookingsForUser(user.objectId)
      .then((rows) => { if (!cancelled) setBookings(rows); })
      .catch((e) => toast.error(e instanceof Error ? e.message : "Could not load bookings"));
    return () => { cancelled = true; };
  }, [user, hydrated]);

  async function handleCancel(objectId: string) {
    try {
      await cancelBooking(objectId);
      setBookings((prev) => prev.map((b) => b.objectId === objectId ? { ...b, status: "cancelled" } : b));
      toast.success("Booking cancelled.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not cancel");
    }
  }

  const [rateTarget, setRateTarget] = useState<StoredBooking | null>(null);

  const filtered = statusFilter === "all"
    ? bookings
    : bookings.filter((b) => b.status === statusFilter);

  const counts: Record<StatusFilter, number> = {
    all:       bookings.length,
    pending:   bookings.filter((b) => b.status === "pending").length,
    confirmed: bookings.filter((b) => b.status === "confirmed").length,
    completed: bookings.filter((b) => b.status === "completed").length,
    cancelled: bookings.filter((b) => b.status === "cancelled" || b.status === "rejected").length,
    rejected:  bookings.filter((b) => b.status === "rejected").length,
  };

  if (!user) return null;

  return (
    <>
      <Head><title>My Bookings — Roomsy</title></Head>
      <Navbar />

      <main className="bk-main">
        <div className="bk-shell">

          <Link href="/pgs" className="bk-back" aria-label="Back to browse PGs">
            <HiArrowLeft size={18} />
          </Link>
          <h1 className="bk-title">My Bookings</h1>
          <p className="bk-sub">
            {bookings.length === 0
              ? "You haven't made any bookings yet."
              : `${bookings.length} booking${bookings.length !== 1 ? "s" : ""} total`}
          </p>

          {bookings.length > 0 && (
            <div className="bk-tabs">
              {STATUS_TABS.map((tab) => {
                const active = statusFilter === tab.value;
                return (
                  <button
                    key={tab.value}
                    onClick={() => setStatusFilter(tab.value)}
                    className={`bk-tab ${active ? "active" : ""}`}
                  >
                    <span className="bk-tab-label">{tab.label}</span>
                    <span className={`bk-tab-count ${active ? "active" : ""}`}>{counts[tab.value]}</span>
                  </button>
                );
              })}
            </div>
          )}

          {isLoading ? (
            <div className="bk-list">
              {Array.from({ length: 3 }).map((_, i) => <BookingRowSkeleton key={i} />)}
            </div>
          ) : filtered.length > 0 ? (
            <div className="bk-list">
              {filtered.map((b) => (
                <BookingCard key={b.objectId} booking={b} onCancel={handleCancel} onRate={setRateTarget} />
              ))}
            </div>
          ) : bookings.length === 0 ? (
            <div className="bk-empty">
              <div className="bk-empty-icon">🏠</div>
              <h2>No bookings yet</h2>
              <p>Find your perfect PG and make your first booking.</p>
              <Link href="/pgs" className="bk-empty-cta">Browse PGs</Link>
            </div>
          ) : (
            <div className="bk-empty bk-empty-sm">
              <div className="bk-empty-icon">📋</div>
              <h2>No {statusFilter} bookings</h2>
              <button onClick={() => setStatusFilter("all")} className="bk-empty-link">
                View all bookings
              </button>
            </div>
          )}
        </div>
      </main>

      {rateTarget && (
        <RateStayModal
          booking={rateTarget}
          onClose={() => setRateTarget(null)}
          onSubmitted={() => setRateTarget(null)}
        />
      )}

      <Footer />

      <style jsx>{`
        .bk-main {
          min-height: 100vh;
          background: #F9F7F4;
          padding-top: 72px;
        }
        .bk-shell {
          max-width: 1200px;
          margin: 0 auto;
          padding: 36px 32px 80px;
        }
        .bk-list {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
        }
        @media (max-width: 900px) {
          .bk-list { grid-template-columns: 1fr; }
        }
        .bk-back {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-family: var(--font-body);
          font-size: 13px;
          color: #78716C;
          text-decoration: none;
          margin-bottom: 14px;
        }
        .bk-back:hover { color: #1C1917; }
        .bk-title {
          font-family: var(--font-display);
          font-size: clamp(24px, 4vw, 32px);
          font-weight: 600;
          color: #1C1917;
          letter-spacing: -0.5px;
          margin: 0 0 6px;
        }
        .bk-sub {
          font-family: var(--font-body);
          font-size: 14px;
          color: #78716C;
          margin: 0 0 24px;
        }

        .bk-tabs {
          display: grid;
          grid-template-columns: repeat(5, minmax(0, 1fr));
          gap: 8px;
          margin-bottom: 22px;
          max-width: 540px;
        }
        .bk-tab {
          display: inline-flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 4px;
          padding: 10px 6px;
          border-radius: 14px;
          border: 1.5px solid #E8E4DE;
          background: #fff;
          color: #44403C;
          font-family: var(--font-body);
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.15s;
          white-space: nowrap;
          min-width: 0;
        }
        .bk-tab-label {
          font-size: 12px;
          font-weight: 600;
          letter-spacing: -0.1px;
          line-height: 1.1;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 100%;
        }
        .bk-tab:hover { border-color: #1C1917; color: #1C1917; }
        .bk-tab.active {
          border-color: #FF385C;
          background: #FFF0F3;
          color: #FF385C;
          font-weight: 600;
        }
        .bk-tab-count {
          font-family: var(--font-body);
          font-size: 11px;
          font-weight: 600;
          background: #F0EDE8;
          color: #78716C;
          border-radius: 100px;
          padding: 1px 7px;
          min-width: 18px;
          text-align: center;
        }
        .bk-tab-count.active { background: #FF385C; color: #fff; }

        .bk-list {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .bk-empty {
          text-align: center;
          padding: 80px 24px;
          background: #fff;
          border-radius: 20px;
          border: 1px solid #E8E4DE;
        }
        .bk-empty.bk-empty-sm { padding: 60px 24px; }
        .bk-empty-icon {
          font-size: 48px;
          margin-bottom: 14px;
        }
        .bk-empty h2 {
          font-family: var(--font-display);
          font-size: 20px;
          font-weight: 600;
          color: #1C1917;
          margin: 0 0 8px;
        }
        .bk-empty p {
          font-family: var(--font-body);
          font-size: 14px;
          color: #78716C;
          margin: 0 0 22px;
        }
        .bk-empty-cta {
          display: inline-block;
          font-family: var(--font-body);
          font-size: 14px;
          font-weight: 600;
          color: #fff;
          background: #FF385C;
          padding: 12px 28px;
          border-radius: 100px;
          text-decoration: none;
          transition: background 0.15s;
        }
        .bk-empty-cta:hover { background: #E31C5F; }
        .bk-empty-link {
          background: none;
          border: none;
          font-family: var(--font-body);
          font-size: 13px;
          font-weight: 600;
          color: #FF385C;
          cursor: pointer;
          padding: 0;
          margin-top: 4px;
        }

        /* ── Mobile (≤640px) ── */
        @media (max-width: 640px) {
          .bk-main { padding-top: 60px; }
          .bk-shell { padding: 18px 14px 60px; }
          .bk-sub { margin-bottom: 16px; }

          .bk-tabs {
            display: grid;
            grid-template-columns: repeat(5, 1fr);
            gap: 6px;
            margin-bottom: 16px;
            flex-wrap: initial;
          }
          .bk-tab {
            flex-direction: column;
            padding: 8px 2px;
            gap: 2px;
            min-width: 0;
            border-width: 1px;
            border-radius: 12px;
          }
          .bk-tab-label {
            font-size: 11px;
            font-weight: 600;
            line-height: 1.1;
            letter-spacing: -0.1px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            max-width: 100%;
          }
          .bk-tab-count {
            font-size: 10px;
            padding: 0 5px;
            min-width: 16px;
            line-height: 1.4;
          }

          .bk-list { gap: 12px; }

          .bk-empty {
            padding: 56px 18px;
            border-radius: 16px;
          }
          .bk-empty-icon { font-size: 40px; }
          .bk-empty h2 { font-size: 18px; }
          .bk-empty p { font-size: 13px; }
        }
      `}</style>
    </>
  );
}
