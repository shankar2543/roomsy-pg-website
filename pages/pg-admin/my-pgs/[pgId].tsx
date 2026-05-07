import { useState, useEffect } from "react";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useAuthStore } from "@/store/useAuthStore";
import { getPGById } from "@/lib/pgService";
import {
  getBookingsForPG, vacateBooking, deleteBooking, updateBooking,
  confirmBooking as confirmBookingAdmin, rejectBooking as rejectBookingAdmin,
  getBookingEndDate, StoredBooking,
} from "@/lib/bookingService";
import { PG } from "@/types/pg";
import { Sidebar } from "../dashboard";
import {
  HiArrowLeft, HiPhone, HiCalendar, HiCheckCircle, HiXCircle,
  HiEye, HiX, HiLogout, HiClock, HiChat, HiPencil, HiTrash,
} from "react-icons/hi";
import toast from "react-hot-toast";

type Tab = "residents" | "pending" | "history";

const SHARING_LABEL: Record<string, string> = {
  single: "Single Room",
  double: "2 Sharing",
  triple: "3 Sharing",
};

const STATUS_STYLE: Record<string, { label: string; color: string; bg: string; dot: string }> = {
  pending:   { label: "Pending",   color: "#92400E", bg: "#FEF3C7", dot: "#F59E0B" },
  confirmed: { label: "Active",    color: "#065F46", bg: "#D1FAE5", dot: "#10B981" },
  completed: { label: "Vacated",   color: "#1E40AF", bg: "#DBEAFE", dot: "#3B82F6" },
  renewed:   { label: "Renewed",   color: "#5B21B6", bg: "#EDE9FE", dot: "#7C3AED" },
  cancelled: { label: "Cancelled", color: "#78716C", bg: "#F5F3F0", dot: "#A8A29E" },
  rejected:  { label: "Rejected",  color: "#991B1B", bg: "#FEE2E2", dot: "#EF4444" },
};

function formatDate(d: string | undefined) {
  if (!d) return "—";
  const date = new Date(d);
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function daysRemaining(booking: StoredBooking): number {
  const end = getBookingEndDate(booking);
  return Math.ceil((end.getTime() - Date.now()) / 86400000);
}

function IDProofModal({ url, onClose }: { url: string; onClose: () => void }) {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 400, display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }} onClick={onClose}>
      <div style={{ position: "absolute", inset: 0, backgroundColor: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }} />
      <div style={{ position: "relative", backgroundColor: "#fff", borderRadius: "20px", overflow: "hidden", maxWidth: "480px", width: "100%", boxShadow: "0 24px 80px rgba(0,0,0,0.25)" }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: "1px solid #F0EDE8" }}>
          <span style={{ fontFamily: "var(--font-display)", fontSize: "16px", fontWeight: "600", color: "#1C1917" }}>ID Proof</span>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#78716C" }}><HiX size={20} /></button>
        </div>
        <div style={{ position: "relative", width: "100%", height: "300px", backgroundColor: "#F9F7F4" }}>
          <Image src={url} alt="ID Proof" fill style={{ objectFit: "contain", padding: "16px" }} />
        </div>
      </div>
    </div>
  );
}

function DeleteConfirmModal({ name, onCancel, onConfirm }: { name: string; onCancel: () => void; onConfirm: () => void }) {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 500, display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }} onClick={onCancel}>
      <div style={{ position: "absolute", inset: 0, backgroundColor: "rgba(0,0,0,0.45)", backdropFilter: "blur(6px)" }} />
      <div style={{ position: "relative", backgroundColor: "#fff", borderRadius: "20px", padding: "32px 28px", width: "100%", maxWidth: "360px", boxShadow: "0 24px 60px rgba(0,0,0,0.2)", textAlign: "center" }} onClick={(e) => e.stopPropagation()}>
        <div style={{ width: "52px", height: "52px", borderRadius: "50%", backgroundColor: "#FEF2F2", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
          <HiTrash size={22} color="#DC2626" />
        </div>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: "18px", fontWeight: "700", color: "#1C1917", marginBottom: "8px" }}>Delete booking?</h2>
        <p style={{ fontFamily: "var(--font-body)", fontSize: "14px", color: "#78716C", marginBottom: "24px", lineHeight: 1.5 }}>
          This will permanently remove <strong>{name}</strong>&apos;s booking and free up the bed.
        </p>
        <div style={{ display: "flex", gap: "10px" }}>
          <button onClick={onCancel} style={{ flex: 1, padding: "12px", borderRadius: "100px", border: "1.5px solid #E8E4DE", backgroundColor: "#fff", fontFamily: "var(--font-body)", fontSize: "14px", fontWeight: "600", color: "#1C1917", cursor: "pointer" }}>Cancel</button>
          <button onClick={onConfirm} style={{ flex: 1, padding: "12px", borderRadius: "100px", border: "none", backgroundColor: "#DC2626", fontFamily: "var(--font-body)", fontSize: "14px", fontWeight: "700", color: "#fff", cursor: "pointer" }}>Delete</button>
        </div>
      </div>
    </div>
  );
}

function EditBookingModal({ booking, onClose, onSave }: {
  booking: StoredBooking;
  onClose: () => void;
  onSave: (updates: Partial<Pick<StoredBooking, "fromDate" | "months" | "nights" | "total" | "sharing">>) => void;
}) {
  const [fromDate, setFromDate] = useState(booking.fromDate);
  const [duration, setDuration] = useState(booking.stayType === "monthly" ? (booking.months ?? 1) : (booking.nights ?? 1));
  const [total, setTotal] = useState(booking.total);
  const [sharing, setSharing] = useState(booking.sharing);

  function handleSave() {
    const updates: Partial<Pick<StoredBooking, "fromDate" | "months" | "nights" | "total" | "sharing">> = {
      fromDate, total, sharing,
      ...(booking.stayType === "monthly" ? { months: duration } : { nights: duration }),
    };
    onSave(updates);
  }

  const labelStyle: React.CSSProperties = { fontFamily: "var(--font-body)", fontSize: "13px", fontWeight: "600", color: "#44403C", marginBottom: "6px", display: "block" };
  const inputStyle: React.CSSProperties = { width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1.5px solid #E8E4DE", fontFamily: "var(--font-body)", fontSize: "14px", color: "#1C1917", outline: "none", boxSizing: "border-box", backgroundColor: "#fff" };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 500, display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }} onClick={onClose}>
      <div style={{ position: "absolute", inset: 0, backgroundColor: "rgba(0,0,0,0.45)", backdropFilter: "blur(6px)" }} />
      <div style={{ position: "relative", backgroundColor: "#fff", borderRadius: "20px", width: "100%", maxWidth: "400px", boxShadow: "0 24px 60px rgba(0,0,0,0.2)", overflow: "hidden" }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 22px", borderBottom: "1px solid #F0EDE8" }}>
          <span style={{ fontFamily: "var(--font-display)", fontSize: "17px", fontWeight: "700", color: "#1C1917" }}>Edit Booking</span>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#78716C" }}><HiX size={20} /></button>
        </div>
        <div style={{ padding: "22px", display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            <label style={labelStyle}>Check-in Date</label>
            <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>{booking.stayType === "monthly" ? "Duration (months)" : "Duration (nights)"}</label>
            <input type="number" min={1} value={duration} onChange={(e) => setDuration(Number(e.target.value))} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Room Type</label>
            <select value={sharing} onChange={(e) => setSharing(e.target.value as StoredBooking["sharing"])} style={inputStyle}>
              <option value="single">Single Room</option>
              <option value="double">2 Sharing</option>
              <option value="triple">3 Sharing</option>
            </select>
          </div>
          <div>
            <label style={labelStyle}>Amount (₹)</label>
            <input type="number" min={0} value={total} onChange={(e) => setTotal(Number(e.target.value))} style={inputStyle} />
          </div>
        </div>
        <div style={{ padding: "0 22px 22px", display: "flex", gap: "10px" }}>
          <button onClick={onClose} style={{ flex: 1, padding: "12px", borderRadius: "100px", border: "1.5px solid #E8E4DE", backgroundColor: "#fff", fontFamily: "var(--font-body)", fontSize: "14px", fontWeight: "600", color: "#1C1917", cursor: "pointer" }}>Cancel</button>
          <button onClick={handleSave} style={{ flex: 1, padding: "12px", borderRadius: "100px", border: "none", backgroundColor: "#FF385C", fontFamily: "var(--font-body)", fontSize: "14px", fontWeight: "700", color: "#fff", cursor: "pointer" }}>Save Changes</button>
        </div>
      </div>
    </div>
  );
}

function ResidentCard({ booking, onVacate, onDelete, onEdit, onViewProof }: {
  booking: StoredBooking;
  onVacate: (id: string) => void;
  onDelete: (b: StoredBooking) => void;
  onEdit: (b: StoredBooking) => void;
  onViewProof: (url: string) => void;
}) {
  const days = daysRemaining(booking);
  const endDate = getBookingEndDate(booking);
  const isExpiringSoon = days >= 0 && days <= 7;
  const isOverdue = days < 0;

  return (
    <div style={{
      backgroundColor: "#fff",
      border: `1px solid ${isOverdue ? "#FECACA" : isExpiringSoon ? "#FDE68A" : "#E8E4DE"}`,
      borderRadius: "14px", padding: "16px 20px", overflow: "hidden",
      boxShadow: isOverdue ? "0 0 0 3px rgba(220,38,38,0.06)" : isExpiringSoon ? "0 0 0 3px rgba(245,158,11,0.06)" : "none",
    }}>
      <div className="o-card-inner">
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", marginBottom: "6px" }}>
            <span style={{ fontFamily: "var(--font-display)", fontSize: "15px", fontWeight: "700", color: "#1C1917" }}>
              {booking.tenantName || "Guest"}
            </span>
            {booking.tenantPhone && (
              <>
                <a href={`tel:${booking.tenantPhone}`} style={{ display: "flex", alignItems: "center", gap: "4px", fontFamily: "var(--font-body)", fontSize: "12px", color: "#3B82F6", textDecoration: "none" }}>
                  <HiPhone size={12} /> {booking.tenantPhone}
                </a>
                <a href={`https://wa.me/91${booking.tenantPhone}`} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: "4px", fontFamily: "var(--font-body)", fontSize: "12px", color: "#25D366", textDecoration: "none" }}>
                  <HiChat size={12} /> WhatsApp
                </a>
              </>
            )}
            {isOverdue && (
              <span style={{ fontFamily: "var(--font-body)", fontSize: "11px", fontWeight: "700", color: "#DC2626", backgroundColor: "#FEE2E2", borderRadius: "100px", padding: "2px 8px" }}>
                Overdue — {Math.abs(days)}d ago
              </span>
            )}
            {isExpiringSoon && !isOverdue && (
              <span style={{ fontFamily: "var(--font-body)", fontSize: "11px", fontWeight: "700", color: "#92400E", backgroundColor: "#FEF3C7", borderRadius: "100px", padding: "2px 8px" }}>
                Ends in {days}d
              </span>
            )}
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "8px" }}>
            <span style={{ fontFamily: "var(--font-body)", fontSize: "12px", color: "#44403C", backgroundColor: "#F5F3F0", borderRadius: "100px", padding: "3px 10px", border: "1px solid #E8E4DE" }}>
              {SHARING_LABEL[booking.sharing]}
            </span>
            <span style={{ fontFamily: "var(--font-body)", fontSize: "12px", color: "#44403C", backgroundColor: "#F5F3F0", borderRadius: "100px", padding: "3px 10px", border: "1px solid #E8E4DE" }}>
              {booking.stayType === "monthly" ? `${booking.months} month${booking.months !== 1 ? "s" : ""}` : `${booking.nights} night${booking.nights !== 1 ? "s" : ""}`}
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "6px", fontFamily: "var(--font-body)", fontSize: "12px", color: "#78716C" }}>
            <HiCalendar size={12} />
            Checked in {formatDate(booking.fromDate)} · Ends {formatDate(endDate.toISOString().split("T")[0])}
          </div>
        </div>

        <div className="o-card-right">
          <div style={{ textAlign: "right" }}>
            <span style={{ fontFamily: "var(--font-display)", fontSize: "18px", fontWeight: "700", color: "#1C1917" }}>
              ₹{booking.total.toLocaleString()}
            </span>
            <span style={{ fontFamily: "var(--font-body)", fontSize: "11px", color: "#78716C", display: "block" }}>
              {booking.stayType === "monthly" ? "/ month" : "total"}
            </span>
          </div>
          <div className="o-card-actions">
            {booking.idProofUrl && (
              <button onClick={() => onViewProof(booking.idProofUrl!)} title="View ID" className="o-icon-btn" style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "32px", height: "32px", borderRadius: "50%", border: "1.5px solid #BFDBFE", backgroundColor: "#EFF6FF", cursor: "pointer", flexShrink: 0 }}>
                <HiEye size={15} color="#3B82F6" />
              </button>
            )}
            <button onClick={() => onEdit(booking)} title="Edit" className="o-icon-btn" style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "32px", height: "32px", borderRadius: "50%", border: "1.5px solid #C7D2FE", backgroundColor: "#EEF2FF", cursor: "pointer", flexShrink: 0 }}>
              <HiPencil size={15} color="#6366F1" />
            </button>
            <button onClick={() => onVacate(booking.objectId)} title="Vacate" className="o-icon-btn" style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "32px", height: "32px", borderRadius: "50%", border: "1.5px solid #FDE68A", backgroundColor: "#FFFBEB", cursor: "pointer", flexShrink: 0 }}>
              <HiLogout size={15} color="#F59E0B" />
            </button>
            <button onClick={() => onDelete(booking)} title="Delete" className="o-icon-btn" style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "32px", height: "32px", borderRadius: "50%", border: "1.5px solid #FECACA", backgroundColor: "#FEF2F2", cursor: "pointer", flexShrink: 0 }}>
              <HiTrash size={15} color="#DC2626" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function PendingCard({ booking, onConfirm, onReject, onViewProof }: {
  booking: StoredBooking;
  onConfirm: (id: string) => void;
  onReject: (id: string) => void;
  onViewProof: (url: string) => void;
}) {
  return (
    <div style={{ backgroundColor: "#fff", border: "1px solid #FDE68A", borderRadius: "14px", padding: "16px 20px", overflow: "hidden", boxShadow: "0 0 0 3px rgba(245,158,11,0.07)" }}>
      <div className="o-card-inner">
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px", flexWrap: "wrap" }}>
            <span style={{ fontFamily: "var(--font-display)", fontSize: "15px", fontWeight: "700", color: "#1C1917" }}>{booking.tenantName || "Guest"}</span>
            {booking.tenantPhone && (
              <>
                <a href={`tel:${booking.tenantPhone}`} style={{ display: "flex", alignItems: "center", gap: "4px", fontFamily: "var(--font-body)", fontSize: "12px", color: "#3B82F6", textDecoration: "none" }}>
                  <HiPhone size={12} /> {booking.tenantPhone}
                </a>
                <a href={`https://wa.me/91${booking.tenantPhone}`} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: "4px", fontFamily: "var(--font-body)", fontSize: "12px", color: "#25D366", textDecoration: "none" }}>
                  <HiChat size={12} /> WhatsApp
                </a>
              </>
            )}
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
            <span style={{ fontFamily: "var(--font-body)", fontSize: "12px", color: "#44403C", backgroundColor: "#F5F3F0", borderRadius: "100px", padding: "3px 10px", border: "1px solid #E8E4DE" }}>{SHARING_LABEL[booking.sharing]}</span>
            <span style={{ fontFamily: "var(--font-body)", fontSize: "12px", color: "#44403C", backgroundColor: "#F5F3F0", borderRadius: "100px", padding: "3px 10px", border: "1px solid #E8E4DE" }}>
              {booking.stayType === "monthly" ? `${booking.months} month${booking.months !== 1 ? "s" : ""} from ${formatDate(booking.fromDate)}` : `${booking.nights} nights from ${formatDate(booking.fromDate)}`}
            </span>
          </div>
        </div>
        <div className="o-card-right">
          <div style={{ textAlign: "right" }}>
            <span style={{ fontFamily: "var(--font-display)", fontSize: "18px", fontWeight: "700", color: "#1C1917" }}>₹{booking.total.toLocaleString()}</span>
            <span style={{ fontFamily: "var(--font-body)", fontSize: "11px", color: "#78716C", display: "block" }}>
              {booking.stayType === "monthly" ? "/ month" : "total"}
            </span>
          </div>
          <div className="o-card-actions">
            {booking.idProofUrl && (
              <button onClick={() => onViewProof(booking.idProofUrl!)} style={{ display: "flex", alignItems: "center", gap: "4px", fontFamily: "var(--font-body)", fontSize: "12px", fontWeight: "600", color: "#3B82F6", padding: "6px 11px", borderRadius: "100px", border: "1.5px solid #BFDBFE", backgroundColor: "#EFF6FF", cursor: "pointer", whiteSpace: "nowrap" }}>
                <HiEye size={12} /> ID
              </button>
            )}
            <button onClick={() => onConfirm(booking.objectId)} style={{ display: "flex", alignItems: "center", gap: "4px", fontFamily: "var(--font-body)", fontSize: "12px", fontWeight: "700", color: "#065F46", padding: "6px 12px", borderRadius: "100px", border: "1.5px solid #6EE7B7", backgroundColor: "#D1FAE5", cursor: "pointer", whiteSpace: "nowrap" }}>
              <HiCheckCircle size={13} /> Confirm
            </button>
            <button onClick={() => onReject(booking.objectId)} style={{ display: "flex", alignItems: "center", gap: "4px", fontFamily: "var(--font-body)", fontSize: "12px", fontWeight: "700", color: "#991B1B", padding: "6px 12px", borderRadius: "100px", border: "1.5px solid #FCA5A5", backgroundColor: "#FEE2E2", cursor: "pointer", whiteSpace: "nowrap" }}>
              <HiXCircle size={13} /> Reject
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function HistoryCard({ booking }: { booking: StoredBooking }) {
  const st = STATUS_STYLE[booking.status] ?? STATUS_STYLE.completed;
  const endDate = booking.vacatedAt
    ? new Date(booking.vacatedAt)
    : getBookingEndDate(booking);

  return (
    <div style={{ backgroundColor: "#fff", border: "1px solid #E8E4DE", borderRadius: "14px", padding: "14px 18px", display: "flex", alignItems: "center", gap: "14px", flexWrap: "wrap" }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px", flexWrap: "wrap" }}>
          <span style={{ fontFamily: "var(--font-display)", fontSize: "14px", fontWeight: "600", color: "#1C1917" }}>{booking.tenantName || "Guest"}</span>
          <div style={{ display: "flex", alignItems: "center", gap: "4px", backgroundColor: st.bg, borderRadius: "100px", padding: "2px 8px" }}>
            <div style={{ width: "5px", height: "5px", borderRadius: "50%", backgroundColor: st.dot }} />
            <span style={{ fontFamily: "var(--font-body)", fontSize: "11px", fontWeight: "600", color: st.color }}>{st.label}</span>
          </div>
        </div>
        <div style={{ fontFamily: "var(--font-body)", fontSize: "12px", color: "#78716C", marginBottom: "4px" }}>
          {SHARING_LABEL[booking.sharing]} · {formatDate(booking.fromDate)} → {formatDate(endDate.toISOString().split("T")[0])}
        </div>
        {booking.tenantPhone && (
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <a href={`tel:${booking.tenantPhone}`} style={{ display: "flex", alignItems: "center", gap: "4px", fontFamily: "var(--font-body)", fontSize: "11px", color: "#3B82F6", textDecoration: "none" }}>
              <HiPhone size={11} /> {booking.tenantPhone}
            </a>
            <a href={`https://wa.me/91${booking.tenantPhone}`} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: "4px", fontFamily: "var(--font-body)", fontSize: "11px", color: "#25D366", textDecoration: "none" }}>
              <HiChat size={11} /> WhatsApp
            </a>
          </div>
        )}
      </div>
      <div style={{ textAlign: "right", flexShrink: 0 }}>
        <span style={{ fontFamily: "var(--font-display)", fontSize: "16px", fontWeight: "700", color: "#1C1917" }}>₹{booking.total.toLocaleString()}</span>
        <span style={{ fontFamily: "var(--font-body)", fontSize: "11px", color: "#78716C", display: "block" }}>
          {booking.stayType === "monthly" ? "/ month" : "total"}
        </span>
      </div>
    </div>
  );
}

export default function PGDetailPage() {
  const router = useRouter();
  const { pgId } = router.query as { pgId: string };
  const { user, hydrated } = useAuthStore();
  const [pg, setPG] = useState<PG | null>(null);
  const [bookings, setBookings] = useState<StoredBooking[]>([]);
  const [tab, setTab] = useState<Tab>("residents");
  const [proofUrl, setProofUrl] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<StoredBooking | null>(null);
  const [editTarget, setEditTarget] = useState<StoredBooking | null>(null);

  useEffect(() => {
    if (!hydrated) return;
    if (!user) { router.replace("/"); return; }
    if (user.role !== "pg_admin") { router.replace("/"); return; }
    if (!pgId) return;
    let cancelled = false;
    getPGById(pgId).then((row) => { if (!cancelled) setPG(row); }).catch(() => {});
    getBookingsForPG(pgId).then((rows) => { if (!cancelled) setBookings(rows); }).catch(() => {});
    return () => { cancelled = true; };
  }, [user, hydrated, pgId]);

  if (!user || user.role !== "pg_admin" || !pg) return null;

  const residents = bookings.filter((b) => b.status === "confirmed");
  const pending   = bookings.filter((b) => b.status === "pending");
  const history   = bookings.filter((b) => ["completed", "cancelled", "rejected"].includes(b.status));

  function reload() {
    getPGById(pgId).then((row) => setPG(row)).catch(() => {});
    getBookingsForPG(pgId).then((rows) => setBookings(rows)).catch(() => {});
  }

  async function handleVacate(id: string) {
    try {
      await vacateBooking(id);
      reload();
      toast.success("Tenant marked as vacated. Bed is now available.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not vacate");
    }
  }

  async function handleDelete(booking: StoredBooking) {
    try {
      await deleteBooking(booking.objectId);
      setDeleteTarget(null);
      reload();
      toast.success(`${booking.tenantName || "Booking"} deleted.`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not delete");
    }
  }

  async function handleEdit(updates: Partial<Pick<StoredBooking, "fromDate" | "months" | "nights" | "total" | "sharing">>) {
    if (!editTarget) return;
    try {
      await updateBooking(editTarget.objectId, updates);
      setEditTarget(null);
      reload();
      toast.success("Booking updated.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not update");
    }
  }

  async function handleConfirm(id: string) {
    try {
      await confirmBookingAdmin(id);
      reload();
      toast.success("Booking confirmed!");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not confirm");
    }
  }

  async function handleReject(id: string) {
    try {
      await rejectBookingAdmin(id);
      reload();
      toast.error("Booking rejected.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not reject");
    }
  }

  const TABS: { key: Tab; label: string; count: number }[] = [
    { key: "residents", label: "Current Residents", count: residents.length },
    { key: "pending",   label: "Pending",           count: pending.length },
    { key: "history",   label: "History",           count: history.length },
  ];

  return (
    <>
      <Head><title>{pg.name} — Roomsy Owner</title></Head>
      <div className="pg-layout">
        <Sidebar active="/pg-admin/my-pgs" />

        <main className="pg-main">
          <div className="dash-hero-bar" style={{ display: "flex", alignItems: "flex-start", flexDirection: "column", gap: "4px" }}>
            <Link href="/pg-admin/my-pgs" style={{ display: "inline-flex", alignItems: "center", gap: "5px", fontFamily: "var(--font-body)", fontSize: "12px", color: "rgba(255,255,255,0.55)", textDecoration: "none", marginBottom: "6px" }}>
              <HiArrowLeft size={12} /> All PGs
            </Link>
            <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(18px,3vw,24px)", fontWeight: "700", color: "#fff", letterSpacing: "-0.5px", marginBottom: "2px" }}>
              {pg.name}
            </h1>
            <p style={{ fontFamily: "var(--font-body)", fontSize: "14px", color: "rgba(255,255,255,0.68)", margin: 0 }}>
              {pg.area}, Hyderabad
            </p>
          </div>

          <div className="pg-content">

            {/* Stats bar */}
            <div className="o-pg-stats" style={{ backgroundColor: "#fff", border: "1px solid #E8E4DE", borderRadius: "14px", padding: "16px 24px", marginBottom: "24px" }}>
              {[
                { label: "Free Beds",  value: pg.availableBeds, color: pg.availableBeds === 0 ? "#DC2626" : "#10B981" },
                { label: "Residents",  value: residents.length, color: "#1C1917" },
                { label: "Pending",    value: pending.length,   color: pending.length > 0 ? "#F59E0B" : "#1C1917" },
                { label: "History",    value: history.length,   color: "#6366F1" },
              ].map((s, i) => (
                <div key={s.label} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  {i > 0 && <div className="o-stat-divider" />}
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontFamily: "var(--font-display)", fontSize: "22px", fontWeight: "700", color: s.color, letterSpacing: "-0.5px" }}>{s.value}</div>
                    <div style={{ fontFamily: "var(--font-body)", fontSize: "11px", color: "#78716C" }}>{s.label}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Tabs */}
            <div className="o-tabs-bar">
              {TABS.map((t) => {
                const active = tab === t.key;
                return (
                  <button
                    key={t.key}
                    onClick={() => setTab(t.key)}
                    style={{
                      flex: 1,
                      display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
                      padding: "8px 14px", borderRadius: "9px", cursor: "pointer", border: "none",
                      backgroundColor: active ? "#fff" : "transparent",
                      fontFamily: "var(--font-body)", fontSize: "13px",
                      fontWeight: active ? "600" : "500",
                      color: active ? "#1C1917" : "#78716C",
                      boxShadow: active ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
                      transition: "all 0.15s",
                    }}
                  >
                    {t.label}
                    {t.count > 0 && (
                      <span style={{ fontFamily: "var(--font-body)", fontSize: "11px", fontWeight: "700", backgroundColor: active ? (t.key === "pending" ? "#F59E0B" : "#FF385C") : "#D6D3CE", color: "#fff", borderRadius: "100px", padding: "1px 7px" }}>
                        {t.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Tab content */}
            {tab === "residents" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {residents.length > 0 ? residents.map((b) => (
                  <ResidentCard key={b.objectId} booking={b} onVacate={handleVacate} onDelete={setDeleteTarget} onEdit={setEditTarget} onViewProof={setProofUrl} />
                )) : (
                  <div style={{ textAlign: "center", padding: "48px 24px", backgroundColor: "#fff", borderRadius: "16px", border: "1px solid #E8E4DE" }}>
                    <HiClock size={32} color="#D6D3CE" style={{ marginBottom: "12px" }} />
                    <p style={{ fontFamily: "var(--font-body)", fontSize: "14px", color: "#78716C" }}>No current residents.</p>
                  </div>
                )}
              </div>
            )}

            {tab === "pending" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {pending.length > 0 ? pending.map((b) => (
                  <PendingCard key={b.objectId} booking={b} onConfirm={handleConfirm} onReject={handleReject} onViewProof={setProofUrl} />
                )) : (
                  <div style={{ textAlign: "center", padding: "48px 24px", backgroundColor: "#fff", borderRadius: "16px", border: "1px solid #E8E4DE" }}>
                    <p style={{ fontFamily: "var(--font-body)", fontSize: "14px", color: "#78716C" }}>No pending requests.</p>
                  </div>
                )}
              </div>
            )}

            {tab === "history" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {history.length > 0 ? history.map((b) => (
                  <HistoryCard key={b.objectId} booking={b} />
                )) : (
                  <div style={{ textAlign: "center", padding: "48px 24px", backgroundColor: "#fff", borderRadius: "16px", border: "1px solid #E8E4DE" }}>
                    <p style={{ fontFamily: "var(--font-body)", fontSize: "14px", color: "#78716C" }}>No history yet.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>

      {proofUrl && <IDProofModal url={proofUrl} onClose={() => setProofUrl(null)} />}
      {deleteTarget && (
        <DeleteConfirmModal
          name={deleteTarget.tenantName || "this booking"}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={() => handleDelete(deleteTarget)}
        />
      )}
      {editTarget && (
        <EditBookingModal
          booking={editTarget}
          onClose={() => setEditTarget(null)}
          onSave={handleEdit}
        />
      )}
    </>
  );
}
