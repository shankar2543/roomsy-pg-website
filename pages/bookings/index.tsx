import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import { BookingRowSkeleton, useInitialLoading } from "@/components/common/Skeleton";
import { useAuthStore } from "@/store/useAuthStore";
import { getBookingsForUser, cancelBooking, StoredBooking } from "@/lib/dummyBookings";
import {
  HiLocationMarker, HiCalendar, HiArrowLeft, HiChevronDown,
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
  double: "Double Sharing",
  triple: "Triple Sharing",
};

function formatDate(d: string) {
  if (!d) return "—";
  const [y, m, day] = d.split("-").map(Number);
  return new Date(y, m - 1, day).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function BookingCard({ booking, onCancel }: { booking: StoredBooking; onCancel: (id: string) => void }) {
  const st = STATUS_STYLE[booking.status] || STATUS_STYLE.pending;
  const canCancel = booking.status === "pending" || booking.status === "confirmed";
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
          <div className="bk-card-head-right">
            <span className="bk-card-total-mini">₹{booking.total.toLocaleString()}</span>
            <button
              className="bk-card-toggle"
              onClick={() => setExpanded((v) => !v)}
              aria-expanded={expanded}
              aria-label={expanded ? "Show less" : "Show more"}
            >
              <HiChevronDown size={18} />
            </button>
          </div>
        </header>

        {expanded && (
          <>
            <div className="bk-card-pills">
              <span className="bk-card-pill">{SHARING_LABEL[booking.sharing]}</span>
              <span className="bk-card-pill">{booking.stayType === "monthly" ? "Monthly" : "Daily"}</span>
            </div>

            <div className="bk-card-dates">
              <HiCalendar size={13} color="#78716C" />
              {booking.stayType === "monthly" ? (
                <span>
                  From <strong>{formatDate(booking.fromDate)}</strong> · {booking.months} month{booking.months !== 1 ? "s" : ""}
                </span>
              ) : (
                <span>
                  <strong>{formatDate(booking.fromDate)}</strong> → <strong>{formatDate(booking.toDate || "")}</strong>
                  {booking.nights ? ` · ${booking.nights} night${booking.nights !== 1 ? "s" : ""}` : ""}
                </span>
              )}
            </div>

            <footer className="bk-card-foot">
              <div className="bk-card-total">
                <span className="bk-card-total-label">Total</span>
                <span className="bk-card-total-value">₹{booking.total.toLocaleString()}</span>
              </div>
              <div className="bk-card-actions">
                <Link href={`/pgs/${booking.pgId}`} className="bk-btn bk-btn-ghost">View PG</Link>
                {canCancel && (
                  <button onClick={() => onCancel(booking.objectId)} className="bk-btn bk-btn-danger">
                    Cancel
                  </button>
                )}
              </div>
            </footer>
          </>
        )}
      </div>

      <style jsx>{`
        .bk-card {
          background: #fff;
          border: 1px solid #E8E4DE;
          border-radius: 16px;
          overflow: hidden;
          display: flex;
          box-shadow: 0 1px 3px rgba(28,25,23,0.05);
          transition: box-shadow 0.25s ease, transform 0.25s ease, border-color 0.25s ease;
        }
        .bk-card:hover {
          box-shadow: 0 8px 24px rgba(28,25,23,0.08);
          border-color: #DCD5CC;
        }

        .bk-card-img {
          position: relative;
          width: 200px;
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
          gap: 5px;
          padding: 4px 10px;
          border-radius: 100px;
          font-family: var(--font-body);
          font-size: 11px;
          font-weight: 600;
          backdrop-filter: blur(4px);
          box-shadow: 0 2px 6px rgba(0,0,0,0.08);
        }
        .bk-card-status-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
        }

        .bk-card-body {
          flex: 1;
          padding: 16px 20px;
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
        .bk-card-head-right {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-shrink: 0;
        }
        .bk-card-total-mini {
          font-family: var(--font-display);
          font-size: 15px;
          font-weight: 700;
          color: #1C1917;
          letter-spacing: -0.2px;
        }
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
        .bk-card.is-expanded .bk-card-total-mini {
          display: none;
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
        .bk-card-pills {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }
        .bk-card-pill {
          font-family: var(--font-body);
          font-size: 11px;
          font-weight: 500;
          color: #44403C;
          background: #F5F3F0;
          border-radius: 100px;
          padding: 3px 10px;
          border: 1px solid #E8E4DE;
        }
        .bk-card-dates {
          display: flex;
          align-items: center;
          gap: 6px;
          font-family: var(--font-body);
          font-size: 13px;
          color: #44403C;
          line-height: 1.4;
        }
        .bk-card-foot {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: auto;
          padding-top: 10px;
          border-top: 1px solid #F0EDE8;
        }
        .bk-card-total { display: flex; flex-direction: column; }
        .bk-card-total-label {
          font-family: var(--font-body);
          font-size: 11px;
          color: #A8A29E;
        }
        .bk-card-total-value {
          font-family: var(--font-display);
          font-size: 18px;
          font-weight: 700;
          color: #1C1917;
          letter-spacing: -0.3px;
        }
        .bk-card-actions {
          display: flex;
          gap: 8px;
        }
        .bk-btn {
          font-family: var(--font-body);
          font-size: 13px;
          font-weight: 600;
          padding: 9px 16px;
          border-radius: 100px;
          cursor: pointer;
          text-decoration: none;
          text-align: center;
          transition: background 0.15s, color 0.15s, border-color 0.15s;
          border: 1.5px solid transparent;
          line-height: 1;
        }
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
            border-radius: 14px;
          }
          .bk-card-img {
            width: 100%;
            height: 160px;
          }
          .bk-card-status {
            top: 10px;
            left: 10px;
            font-size: 10px;
            padding: 3px 8px;
          }
          .bk-card-body {
            padding: 14px 16px 16px;
            gap: 9px;
          }
          .bk-card-title { font-size: 16px; }
          .bk-card-foot {
            flex-direction: column;
            align-items: stretch;
            gap: 12px;
          }
          .bk-card-actions {
            width: 100%;
          }
          .bk-btn {
            flex: 1;
            padding: 11px 14px;
            font-size: 13px;
          }
        }
      `}</style>
    </article>
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
    setBookings(getBookingsForUser(user.objectId));
  }, [user, hydrated]);

  function handleCancel(objectId: string) {
    cancelBooking(objectId);
    setBookings((prev) => prev.map((b) => b.objectId === objectId ? { ...b, status: "cancelled" } : b));
    toast.success("Booking cancelled.");
  }

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
                <BookingCard key={b.objectId} booking={b} onCancel={handleCancel} />
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

      <Footer />

      <style jsx>{`
        .bk-main {
          min-height: 100vh;
          background: #F9F7F4;
          padding-top: 72px;
        }
        .bk-shell {
          max-width: 860px;
          margin: 0 auto;
          padding: 36px 24px 80px;
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
