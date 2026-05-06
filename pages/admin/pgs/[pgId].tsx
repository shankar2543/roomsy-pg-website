import { useState, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { useAuthStore } from "@/store/useAuthStore";
import { getPGWithOverrides, approvePG, suspendPG, unsuspendPG } from "@/lib/dummyPGAdmin";
import { getBookingsForPG, StoredBooking } from "@/lib/dummyBookings";
import { PG } from "@/types/pg";
import { AdminSidebar } from "../dashboard";
import {
  HiArrowLeft, HiBadgeCheck, HiLocationMarker, HiPhone,
  HiPhotograph, HiOfficeBuilding, HiCheckCircle, HiChevronDown,
} from "react-icons/hi";
import {
  MdOutlineFoodBank, MdLocalLaundryService, MdFitnessCenter,
  MdAcUnit, MdLocalParking, MdMeetingRoom, MdPeople, MdWaterDrop,
  MdTv, MdSportsTennis,
} from "react-icons/md";
import { BsBuilding } from "react-icons/bs";
import { HiWifi, HiShieldCheck } from "react-icons/hi";
import { MdBlock } from "react-icons/md";
import toast from "react-hot-toast";

const AMENITY_ICONS: Record<string, React.ReactNode> = {
  "WiFi":          <HiWifi size={15} />,
  "AC":            <MdAcUnit size={15} />,
  "Meals":         <MdOutlineFoodBank size={15} />,
  "Laundry":       <MdLocalLaundryService size={15} />,
  "Gym":           <MdFitnessCenter size={15} />,
  "CCTV":          <HiShieldCheck size={15} />,
  "24/7 Security": <HiShieldCheck size={15} />,
  "Parking":       <MdLocalParking size={15} />,
  "Housekeeping":  <MdPeople size={15} />,
  "Study Room":    <MdMeetingRoom size={15} />,
  "Lounge":        <MdMeetingRoom size={15} />,
  "Rooftop":       <BsBuilding size={15} />,
  "TV Room":       <MdTv size={15} />,
  "RO Water":      <MdWaterDrop size={15} />,
  "Coworking":     <BsBuilding size={15} />,
  "Badminton":     <MdSportsTennis size={15} />,
};

const TYPE_LABEL: Record<string, string>  = { boys: "Boys PG", girls: "Girls PG", coliving: "Co-living" };
const TYPE_COLOR: Record<string, string>  = { boys: "#3B82F6", girls: "#EC4899", coliving: "#8B5CF6" };
const FOOD_LABEL: Record<string, string>  = { all: "All meals", breakfast: "Breakfast only", lunch: "Lunch only", dinner: "Dinner only", none: "No meals" };
const PARK_LABEL: Record<string, string>  = { bike: "Bike parking", car: "Car parking", both: "Bike + Car", none: "No parking" };
const SHARE_LABEL: Record<string, string> = { single: "Single (1 person)", double: "Double (2 sharing)", triple: "Triple (3 sharing)" };

function StatusBadge({ pg }: { pg: PG }) {
  if (pg.isSuspended)  return <span style={badgeStyle("#DC2626", "#FEF2F2")}>Suspended</span>;
  if (!pg.isApproved)  return <span style={badgeStyle("#92400E", "#FFFBEB")}>Pending Approval</span>;
  return <span style={badgeStyle("#065F46", "#ECFDF5")}>Live</span>;
}

function badgeStyle(color: string, bg: string): React.CSSProperties {
  return { fontFamily: "var(--font-body)", fontSize: "12px", fontWeight: "700", color, backgroundColor: bg, borderRadius: "100px", padding: "4px 12px" };
}

function Section({ title, children, defaultOpenMobile = false }: { title: string; children: React.ReactNode; defaultOpenMobile?: boolean }) {
  const [open, setOpen] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const isMobile = window.matchMedia("(max-width: 768px)").matches;
    if (isMobile && !defaultOpenMobile) setOpen(false);
  }, [defaultOpenMobile]);

  return (
    <div className={`adm-section ${open ? "is-open" : ""}`} style={{ backgroundColor: "#fff", border: "1px solid #E8E4DE", borderRadius: "16px", overflow: "hidden", marginBottom: "12px" }}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="adm-section-head"
        style={{
          width: "100%",
          padding: "14px 20px",
          backgroundColor: "#FAFAF9",
          border: "none",
          borderBottom: open ? "1px solid #F0EDE8" : "none",
          display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px",
          cursor: "pointer",
          textAlign: "left",
          transition: "border-color 0.15s",
        }}
      >
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: "15px", fontWeight: "600", color: "#1C1917", margin: 0 }}>{title}</h2>
        <HiChevronDown size={18} color="#78716C" style={{ flexShrink: 0, transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
      </button>
      {open && (
        <div className="adm-section-body" style={{ padding: "20px" }}>
          {children}
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="adm-section-show-less"
            aria-label="Show less"
          >
            Show less
          </button>
        </div>
      )}
    </div>
  );
}

export default function AdminPGDetail() {
  const router  = useRouter();
  const { user, hydrated } = useAuthStore();
  const { pgId } = router.query as { pgId: string };

  const [pg, setPG]               = useState<PG | null>(null);
  const [activePhoto, setActivePhoto] = useState(0);
  const [bookings, setBookings] = useState<StoredBooking[]>([]);

  useEffect(() => {
    if (pgId) setBookings(getBookingsForPG(pgId));
  }, [pgId]);

  useEffect(() => {
    if (!hydrated) return;
    if (!user) { router.replace("/"); return; }
    if (user.role !== "platform_admin") { router.replace("/"); return; }
  }, [user, hydrated]);

  useEffect(() => {
    if (pgId) setPG(getPGWithOverrides(pgId));
  }, [pgId]);

  if (!user || user.role !== "platform_admin") return null;
  if (!pg) return null;

  function handleApprove() {
    approvePG(pg!.objectId);
    toast.success(`${pg!.name} approved!`);
    setPG(getPGWithOverrides(pg!.objectId));
  }
  function handleSuspend() {
    suspendPG(pg!.objectId);
    toast.success(`${pg!.name} suspended.`);
    setPG(getPGWithOverrides(pg!.objectId));
  }
  function handleUnsuspend() {
    unsuspendPG(pg!.objectId);
    toast.success(`${pg!.name} reinstated.`);
    setPG(getPGWithOverrides(pg!.objectId));
  }
  function handleReject() {
    suspendPG(pg!.objectId);
    toast.error(`${pg!.name} rejected.`);
    router.push("/admin/pgs");
  }

  const sharingKeys = ["single", "double", "triple"] as const;
  const hasAnySharing = sharingKeys.some(
    (k) => pg.sharingPrices[k] !== undefined || pg.dailyPrices[k] !== undefined
  );

  return (
    <>
      <Head><title>Review PG — {pg.name} — Roomsy Admin</title></Head>
      <div className="pg-layout" style={{ minHeight: "100vh", backgroundColor: "#F9F7F4" }}>
        <AdminSidebar active="/admin/pgs" />

        <main className="adm-pg-detail-main" style={{ flex: 1, overflowX: "hidden" }}>
          <div className="pg-content">

            {/* Top bar */}
            <div className="adm-detail-topbar" style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "20px", flexWrap: "wrap", background: "linear-gradient(130deg, #1C1917 0%, #FF385C 100%)", padding: "20px 24px", borderRadius: "16px" }}>
              <button
                onClick={() => router.back()}
                aria-label="Back"
                className="adm-detail-back"
                style={{ display: "flex", alignItems: "center", gap: "6px", fontFamily: "var(--font-body)", fontSize: "13px", fontWeight: "600", color: "#fff", background: "rgba(255,255,255,0.14)", border: "1px solid rgba(255,255,255,0.18)", borderRadius: "100px", cursor: "pointer", padding: "6px 12px", flexShrink: 0 }}
              >
                <HiArrowLeft size={16} /> <span className="back-label">Back</span>
              </button>

              <div className="adm-detail-title-block" style={{ flex: 1, minWidth: 0 }}>
                <h1 className="adm-detail-name" style={{ fontFamily: "var(--font-display)", fontSize: "clamp(18px,2.5vw,24px)", fontWeight: "700", color: "#fff", letterSpacing: "-0.4px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", marginBottom: "3px" }}>{pg.name}</h1>
                <div className="adm-detail-address" style={{ display: "flex", alignItems: "center", gap: "5px", overflow: "hidden" }}>
                  <HiLocationMarker size={12} color="rgba(255,255,255,0.6)" style={{ flexShrink: 0 }} />
                  <span style={{ fontFamily: "var(--font-body)", fontSize: "13px", color: "rgba(255,255,255,0.78)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{pg.address}</span>
                </div>
              </div>

              {/* Status badge + action buttons */}
              <div className="adm-detail-status-actions" style={{ display: "flex", alignItems: "center", gap: "10px", flexShrink: 0 }}>
                <StatusBadge pg={pg} />
                <div className="adm-detail-actions" style={{ display: "flex", gap: "8px", flexShrink: 0 }}>
                {!pg.isApproved && !pg.isSuspended && (
                  <>
                    <button onClick={handleReject} className="adm-detail-btn" style={{ display: "flex", alignItems: "center", gap: "6px", padding: "9px 18px", borderRadius: "100px", border: "1.5px solid #FECACA", backgroundColor: "#FEF2F2", color: "#DC2626", fontFamily: "var(--font-body)", fontSize: "13px", fontWeight: "700", cursor: "pointer" }}>
                      <MdBlock size={15} /> <span>Reject</span>
                    </button>
                    <button onClick={handleApprove} className="adm-detail-btn" style={{ display: "flex", alignItems: "center", gap: "6px", padding: "9px 20px", borderRadius: "100px", border: "none", backgroundColor: "#10B981", color: "#fff", fontFamily: "var(--font-body)", fontSize: "13px", fontWeight: "700", cursor: "pointer" }}>
                      <HiBadgeCheck size={15} /> <span>Approve</span>
                    </button>
                  </>
                )}
                {pg.isApproved && !pg.isSuspended && (
                  <button onClick={handleSuspend} className="adm-detail-btn" style={{ display: "flex", alignItems: "center", gap: "6px", padding: "9px 18px", borderRadius: "100px", border: "1.5px solid #FECACA", backgroundColor: "#FEF2F2", color: "#DC2626", fontFamily: "var(--font-body)", fontSize: "13px", fontWeight: "700", cursor: "pointer" }}>
                    <MdBlock size={15} /> <span>Suspend</span>
                  </button>
                )}
                {pg.isSuspended && (
                  <button onClick={handleUnsuspend} className="adm-detail-btn" style={{ display: "flex", alignItems: "center", gap: "6px", padding: "9px 20px", borderRadius: "100px", border: "none", backgroundColor: "#10B981", color: "#fff", fontFamily: "var(--font-body)", fontSize: "13px", fontWeight: "700", cursor: "pointer" }}>
                    <HiCheckCircle size={15} /> <span>Reinstate</span>
                  </button>
                )}
                </div>
              </div>
            </div>

            {/* Photo gallery */}
            {pg.photos.length > 0 ? (
              <div className="adm-detail-gallery" style={{ marginBottom: "16px" }}>
                <div className="adm-detail-gallery-main" style={{ borderRadius: "16px", overflow: "hidden", marginBottom: "8px", backgroundColor: "#1C1917", aspectRatio: "16/7", position: "relative" }}>
                  <img src={pg.photos[activePhoto]} alt={pg.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  <div style={{ position: "absolute", bottom: "12px", right: "12px", backgroundColor: "rgba(0,0,0,0.55)", borderRadius: "8px", padding: "4px 10px" }}>
                    <span style={{ fontFamily: "var(--font-body)", fontSize: "12px", color: "#fff" }}>{activePhoto + 1} / {pg.photos.length}</span>
                  </div>
                </div>
                {pg.photos.length > 1 && (
                  <div className="adm-detail-gallery-thumbs" style={{ display: "flex", gap: "8px", overflowX: "auto", paddingBottom: "4px" }}>
                    {pg.photos.map((src, i) => (
                      <button key={i} onClick={() => setActivePhoto(i)} style={{ flexShrink: 0, width: "72px", height: "52px", borderRadius: "8px", overflow: "hidden", border: `2px solid ${activePhoto === i ? "#FF385C" : "transparent"}`, padding: 0, cursor: "pointer" }}>
                        <img src={src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="adm-detail-gallery-empty" style={{ backgroundColor: "#F0EDE8", borderRadius: "16px", marginBottom: "16px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "8px", padding: "48px 24px" }}>
                <HiPhotograph size={36} color="#C8C4BE" />
                <p style={{ fontFamily: "var(--font-body)", fontSize: "14px", color: "#A8A29E" }}>No photos uploaded</p>
              </div>
            )}

            <div className="adm-detail-grid" style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: "16px", alignItems: "start" }}>

              {/* Left column */}
              <div>
                {/* Description */}
                <Section title="About this PG" defaultOpenMobile>
                  <p style={{ fontFamily: "var(--font-body)", fontSize: "14px", color: "#44403C", lineHeight: 1.7 }}>{pg.description || "No description provided."}</p>
                </Section>

                {/* Pricing */}
                {hasAnySharing && (
                  <Section title="Pricing">
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                      <thead>
                        <tr>
                          {["Room Type", "Monthly Rent", "Daily Rate"].map((h) => (
                            <th key={h} style={{ fontFamily: "var(--font-body)", fontSize: "11px", fontWeight: "700", color: "#A8A29E", letterSpacing: "0.8px", textTransform: "uppercase", textAlign: "left", paddingBottom: "10px", borderBottom: "1px solid #F0EDE8" }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {sharingKeys.filter((k) => pg.sharingPrices[k] !== undefined || pg.dailyPrices[k] !== undefined).map((k, i) => (
                          <tr key={k} style={{ borderTop: i === 0 ? "none" : "1px solid #F0EDE8" }}>
                            <td style={{ fontFamily: "var(--font-body)", fontSize: "13px", color: "#44403C", padding: "12px 0" }}>{SHARE_LABEL[k]}</td>
                            <td style={{ fontFamily: "var(--font-display)", fontSize: "15px", fontWeight: "700", color: "#1C1917", padding: "12px 0" }}>
                              {pg.sharingPrices[k] ? `₹${pg.sharingPrices[k]!.toLocaleString()}/mo` : "—"}
                            </td>
                            <td style={{ fontFamily: "var(--font-body)", fontSize: "13px", color: "#78716C", padding: "12px 0" }}>
                              {pg.dailyPrices[k] ? `₹${pg.dailyPrices[k]!.toLocaleString()}/night` : "—"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </Section>
                )}

                {/* Amenities */}
                <Section title={`Amenities (${pg.amenities.length})`}>
                  {pg.amenities.length === 0 ? (
                    <p style={{ fontFamily: "var(--font-body)", fontSize: "14px", color: "#A8A29E" }}>No amenities listed.</p>
                  ) : (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                      {pg.amenities.map((a) => (
                        <span key={a} style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontFamily: "var(--font-body)", fontSize: "12px", fontWeight: "600", color: "#44403C", backgroundColor: "#F5F3F0", borderRadius: "8px", padding: "6px 12px" }}>
                          <span style={{ color: "#78716C" }}>{AMENITY_ICONS[a] ?? null}</span>
                          {a}
                        </span>
                      ))}
                    </div>
                  )}
                </Section>

                {/* Bookings */}
                <Section title={`Bookings (${bookings.length})`}>
                  {bookings.length === 0 ? (
                    <p style={{ fontFamily: "var(--font-body)", fontSize: "14px", color: "#A8A29E" }}>No bookings yet.</p>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                      {bookings.map((b) => {
                        const statusColors: Record<string, { color: string; bg: string }> = {
                          pending:   { color: "#92400E", bg: "#FEF3C7" },
                          confirmed: { color: "#065F46", bg: "#D1FAE5" },
                          completed: { color: "#1E40AF", bg: "#DBEAFE" },
                          cancelled: { color: "#78716C", bg: "#F5F3F0" },
                          rejected:  { color: "#991B1B", bg: "#FEE2E2" },
                        };
                        const sc = statusColors[b.status] ?? statusColors.pending;
                        return (
                          <div key={b.objectId} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", padding: "12px 14px", border: "1px solid #F0EDE8", borderRadius: "12px", backgroundColor: "#FAFAF9" }}>
                            <div style={{ minWidth: 0, flex: 1 }}>
                              <div style={{ fontFamily: "var(--font-body)", fontSize: "13px", fontWeight: "600", color: "#1C1917", marginBottom: "3px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                {b.tenantName || "Guest"}
                              </div>
                              <div style={{ fontFamily: "var(--font-body)", fontSize: "11.5px", color: "#78716C" }}>
                                {(() => {
                                  let end = b.toDate ?? "";
                                  if (b.stayType === "monthly" && b.months) {
                                    const [y, m, d] = b.fromDate.split("-").map(Number);
                                    const dt = new Date(y, m - 1, d);
                                    dt.setMonth(dt.getMonth() + b.months);
                                    end = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
                                  }
                                  return `${b.fromDate} → ${end}`;
                                })()} · ₹{b.total.toLocaleString()}
                              </div>
                            </div>
                            <span style={{ fontFamily: "var(--font-body)", fontSize: "11px", fontWeight: "700", textTransform: "capitalize", color: sc.color, backgroundColor: sc.bg, borderRadius: "100px", padding: "3px 10px", flexShrink: 0 }}>
                              {b.status}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </Section>
              </div>

              {/* Right column */}
              <div>
                {/* Owner */}
                <Section title="Owner">
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div style={{ width: "44px", height: "44px", borderRadius: "50%", backgroundColor: "#FFF0F3", border: "1.5px solid #FFCCD5", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <span style={{ fontFamily: "var(--font-display)", fontSize: "17px", fontWeight: "700", color: "#FF385C" }}>{pg.owner.name.charAt(0)}</span>
                    </div>
                    <div>
                      <div style={{ fontFamily: "var(--font-display)", fontSize: "15px", fontWeight: "600", color: "#1C1917", marginBottom: "3px" }}>{pg.owner.name}</div>
                      <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                        <HiPhone size={12} color="#A8A29E" />
                        <span style={{ fontFamily: "var(--font-body)", fontSize: "13px", color: "#78716C" }}>{pg.owner.phone}</span>
                      </div>
                    </div>
                  </div>
                </Section>

                {/* PG Details */}
                <Section title="Details">
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {[
                      {
                        label: "Type",
                        value: (
                          <span style={{ fontFamily: "var(--font-body)", fontSize: "12px", fontWeight: "700", color: TYPE_COLOR[pg.pgType], backgroundColor: `${TYPE_COLOR[pg.pgType]}18`, borderRadius: "100px", padding: "3px 10px" }}>
                            {TYPE_LABEL[pg.pgType]}
                          </span>
                        ),
                      },
                      { label: "Food",    value: FOOD_LABEL[pg.food]  ?? pg.food },
                      { label: "Parking", value: PARK_LABEL[pg.parking] ?? pg.parking },
                      { label: "Beds free", value: (
                        <span style={{ fontFamily: "var(--font-display)", fontSize: "15px", fontWeight: "700", color: pg.availableBeds === 0 ? "#DC2626" : "#10B981" }}>
                          {pg.availableBeds}
                        </span>
                      )},
                      { label: "Rating", value: pg.rating > 0 ? `★ ${pg.rating}` : "No ratings yet" },
                    ].map(({ label, value }) => (
                      <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "8px" }}>
                        <span style={{ fontFamily: "var(--font-body)", fontSize: "13px", color: "#78716C" }}>{label}</span>
                        {typeof value === "string"
                          ? <span style={{ fontFamily: "var(--font-body)", fontSize: "13px", fontWeight: "600", color: "#1C1917", textAlign: "right" }}>{value}</span>
                          : value}
                      </div>
                    ))}
                  </div>
                </Section>

                {/* Occupancy */}
                <Section title="Room Sharing">
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                    {pg.occupancy.map((o) => (
                      <span key={o} style={{ fontFamily: "var(--font-body)", fontSize: "12px", fontWeight: "600", color: "#44403C", backgroundColor: "#F5F3F0", borderRadius: "8px", padding: "5px 12px" }}>
                        {o === "single" ? "Single" : o === "double" ? "2 Sharing" : "3 Sharing"}
                      </span>
                    ))}
                  </div>
                </Section>

                {/* Location */}
                <Section title="Location">
                  <p style={{ fontFamily: "var(--font-body)", fontSize: "13px", color: "#44403C", lineHeight: 1.6, marginBottom: "10px" }}>{pg.address}</p>
                  <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                    <HiLocationMarker size={13} color="#FF385C" />
                    <span style={{ fontFamily: "var(--font-body)", fontSize: "12px", color: "#78716C" }}>{pg.area}, {pg.city}</span>
                  </div>
                  <div style={{ marginTop: "8px", fontFamily: "var(--font-body)", fontSize: "11px", color: "#A8A29E" }}>
                    {pg.location.latitude.toFixed(4)}° N, {pg.location.longitude.toFixed(4)}° E
                  </div>
                </Section>
              </div>
            </div>

            {/* Bottom action bar for pending PGs */}
            {!pg.isApproved && !pg.isSuspended && (
              <div className="adm-detail-cta" style={{ position: "sticky", bottom: "16px", backgroundColor: "#fff", border: "1px solid #E8E4DE", borderRadius: "16px", padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "0 8px 32px rgba(0,0,0,0.12)", gap: "12px", flexWrap: "wrap" }}>
                <div className="adm-detail-cta-text">
                  <p style={{ fontFamily: "var(--font-display)", fontSize: "15px", fontWeight: "600", color: "#1C1917", marginBottom: "2px" }}>Ready to review?</p>
                  <p style={{ fontFamily: "var(--font-body)", fontSize: "13px", color: "#78716C" }}>Approving will make this PG visible in the public listing.</p>
                </div>
                <div className="adm-detail-cta-actions" style={{ display: "flex", gap: "10px" }}>
                  <button onClick={handleReject} style={{ padding: "11px 22px", borderRadius: "100px", border: "1.5px solid #FECACA", backgroundColor: "#FEF2F2", color: "#DC2626", fontFamily: "var(--font-body)", fontSize: "14px", fontWeight: "700", cursor: "pointer" }}>
                    Reject
                  </button>
                  <button onClick={handleApprove} style={{ padding: "11px 26px", borderRadius: "100px", border: "none", backgroundColor: "#10B981", color: "#fff", fontFamily: "var(--font-body)", fontSize: "14px", fontWeight: "700", cursor: "pointer", boxShadow: "0 4px 16px rgba(16,185,129,0.35)" }}>
                    Approve & Publish
                  </button>
                </div>
              </div>
            )}

          </div>
        </main>
      </div>

      <style>{`
        .adm-section-head:hover { background-color: #F5F3F0 !important; }

        /* Hard guarantee no horizontal overflow on this page */
        .adm-pg-detail-main {
          overflow-x: hidden !important;
          max-width: 100% !important;
        }
        .adm-pg-detail-main .pg-content {
          overflow-x: hidden !important;
          width: 100% !important;
          box-sizing: border-box !important;
        }
        .adm-pg-detail-main .adm-detail-grid,
        .adm-pg-detail-main .adm-detail-gallery,
        .adm-pg-detail-main .adm-detail-gallery-main,
        .adm-pg-detail-main .adm-detail-topbar {
          max-width: 100% !important;
          box-sizing: border-box !important;
        }
        .adm-pg-detail-main img { max-width: 100% !important; }

        /* "Show less" link at the foot of an expanded section */
        .adm-section-show-less {
          display: inline-flex;
          align-items: center;
          margin-top: 16px;
          padding: 6px 0;
          background: none;
          border: none;
          color: #FF385C;
          font-family: var(--font-body);
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
        }
        .adm-section-show-less:hover { text-decoration: underline; }

        /* Desktop: let the page fill the full main width (next to the sidebar) */
        .adm-pg-detail-main .pg-content {
          max-width: none !important;
          margin: 0 !important;
          padding: 0 0 80px !important;
        }

        /* One connected stack: topbar → photo → sections, no gaps anywhere */
        .adm-detail-topbar {
          margin-bottom: 0 !important;
          border-radius: 0 !important;
        }
        .adm-detail-gallery,
        .adm-detail-gallery-empty {
          margin-bottom: 0 !important;
        }
        .adm-detail-gallery-main,
        .adm-detail-gallery-empty {
          border-radius: 0 !important;
        }
        .adm-detail-gallery-thumbs {
          padding-top: 8px !important;
          padding-bottom: 8px !important;
          background: #fff;
        }

        .adm-section {
          margin-bottom: 0 !important;
          border-radius: 0 !important;
        }
        .adm-detail-grid > div > .adm-section + .adm-section {
          border-top-width: 0 !important;
        }
        .adm-detail-grid > div > .adm-section:last-child {
          border-bottom-left-radius: 16px !important;
          border-bottom-right-radius: 16px !important;
        }

        @media (max-width: 768px) {
          /* clear the fixed top + bottom nav bars rendered by AdminSidebar */
          .adm-pg-detail-main {
            padding-top: calc(56px + env(safe-area-inset-top)) !important;
          }
          .adm-pg-detail-main .pg-content {
            padding: 14px 0 calc(80px + env(safe-area-inset-bottom)) !important;
          }
          /* top bar: edge-to-edge gradient with internal padding */
          .adm-detail-topbar {
            padding: 16px 14px !important;
            border-radius: 0 !important;
            margin-bottom: 16px !important;
          }

          /* one-column layout */
          .adm-detail-grid { grid-template-columns: 1fr !important; gap: 0 !important; }

          /* edge-to-edge sections — kill side borders and outer rounded corners too */
          .adm-section {
            border-left: none !important;
            border-right: none !important;
          }
          .adm-detail-grid > div > .adm-section:first-child,
          .adm-detail-grid > div > .adm-section:last-child {
            border-radius: 0 !important;
          }
          .adm-section-head { padding: 12px 16px !important; }
          .adm-section-head h2 { font-size: 14px !important; }

          /* photo gallery: edge-to-edge */
          .adm-detail-gallery-main { border-radius: 0 !important; }
          .adm-detail-gallery-thumbs { padding: 4px 14px !important; }
          .adm-detail-gallery-empty { border-radius: 0 !important; }

          /* tighter top header — name on its own line, badge + actions on a second line */
          .back-label { display: none; }
          .adm-detail-topbar {
            gap: 10px !important;
            align-items: center !important;
          }
          .adm-detail-status-actions {
            flex-basis: 100% !important;
            justify-content: space-between !important;
            width: 100% !important;
            padding-top: 12px !important;
            border-top: 1px solid rgba(255,255,255,0.18) !important;
          }
          .adm-detail-actions .adm-detail-btn {
            padding: 8px 14px !important;
            font-size: 12px !important;
          }
          .adm-detail-actions .adm-detail-btn span { display: inline !important; }
          .adm-detail-name {
            font-size: 17px !important;
          }
          .adm-detail-address span { font-size: 12px !important; }

          /* sticky CTA above the bottom nav */
          .adm-detail-cta {
            position: sticky !important;
            bottom: calc(70px + env(safe-area-inset-bottom)) !important;
            margin: 14px !important;
            padding: 12px 14px !important;
            gap: 8px !important;
            border-radius: 14px !important;
          }
          .adm-detail-cta-text p:first-child { font-size: 14px !important; }
          .adm-detail-cta-text p:last-child { font-size: 12px !important; }
          .adm-detail-cta-actions button {
            padding: 10px 16px !important;
            font-size: 13px !important;
          }
        }
      `}</style>
    </>
  );
}
