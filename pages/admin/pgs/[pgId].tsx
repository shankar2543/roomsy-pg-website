import { useState, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { useAuthStore } from "@/store/useAuthStore";
import { getPGWithOverrides, approvePG, suspendPG, unsuspendPG } from "@/lib/dummyPGAdmin";
import { PG } from "@/types/pg";
import { AdminSidebar } from "../dashboard";
import {
  HiArrowLeft, HiBadgeCheck, HiLocationMarker, HiPhone,
  HiPhotograph, HiOfficeBuilding, HiCheckCircle,
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

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ backgroundColor: "#fff", border: "1px solid #E8E4DE", borderRadius: "16px", overflow: "hidden", marginBottom: "16px" }}>
      <div style={{ padding: "14px 20px", borderBottom: "1px solid #F0EDE8", backgroundColor: "#FAFAF9" }}>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: "15px", fontWeight: "600", color: "#1C1917" }}>{title}</h2>
      </div>
      <div style={{ padding: "20px" }}>{children}</div>
    </div>
  );
}

export default function AdminPGDetail() {
  const router  = useRouter();
  const { user, hydrated } = useAuthStore();
  const { pgId } = router.query as { pgId: string };

  const [pg, setPG]               = useState<PG | null>(null);
  const [activePhoto, setActivePhoto] = useState(0);

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

        <main style={{ flex: 1, overflowX: "hidden" }}>
          <div className="pg-content" style={{ maxWidth: "1000px", margin: "0 auto" }}>

            {/* Top bar */}
            <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "24px", flexWrap: "wrap" }}>
              <button
                onClick={() => router.back()}
                aria-label="Back"
                style={{ display: "flex", alignItems: "center", gap: "6px", fontFamily: "var(--font-body)", fontSize: "13px", fontWeight: "600", color: "#78716C", background: "none", border: "none", cursor: "pointer", padding: 0 }}
              >
                <HiArrowLeft size={16} /> <span className="back-label">Back</span>
              </button>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                  <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(18px,2.5vw,24px)", fontWeight: "600", color: "#1C1917", letterSpacing: "-0.4px" }}>{pg.name}</h1>
                  <StatusBadge pg={pg} />
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "5px", marginTop: "3px" }}>
                  <HiLocationMarker size={12} color="#A8A29E" />
                  <span style={{ fontFamily: "var(--font-body)", fontSize: "13px", color: "#78716C" }}>{pg.address}</span>
                </div>
              </div>

              {/* Action buttons */}
              <div style={{ display: "flex", gap: "8px", flexShrink: 0 }}>
                {!pg.isApproved && !pg.isSuspended && (
                  <>
                    <button onClick={handleReject} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "9px 18px", borderRadius: "100px", border: "1.5px solid #FECACA", backgroundColor: "#FEF2F2", color: "#DC2626", fontFamily: "var(--font-body)", fontSize: "13px", fontWeight: "700", cursor: "pointer" }}>
                      <MdBlock size={15} /> Reject
                    </button>
                    <button onClick={handleApprove} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "9px 20px", borderRadius: "100px", border: "none", backgroundColor: "#10B981", color: "#fff", fontFamily: "var(--font-body)", fontSize: "13px", fontWeight: "700", cursor: "pointer" }}>
                      <HiBadgeCheck size={15} /> Approve
                    </button>
                  </>
                )}
                {pg.isApproved && !pg.isSuspended && (
                  <button onClick={handleSuspend} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "9px 18px", borderRadius: "100px", border: "1.5px solid #FECACA", backgroundColor: "#FEF2F2", color: "#DC2626", fontFamily: "var(--font-body)", fontSize: "13px", fontWeight: "700", cursor: "pointer" }}>
                    <MdBlock size={15} /> Suspend
                  </button>
                )}
                {pg.isSuspended && (
                  <button onClick={handleUnsuspend} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "9px 20px", borderRadius: "100px", border: "none", backgroundColor: "#10B981", color: "#fff", fontFamily: "var(--font-body)", fontSize: "13px", fontWeight: "700", cursor: "pointer" }}>
                    <HiCheckCircle size={15} /> Reinstate
                  </button>
                )}
              </div>
            </div>

            {/* Photo gallery */}
            {pg.photos.length > 0 ? (
              <div style={{ marginBottom: "16px" }}>
                <div style={{ borderRadius: "16px", overflow: "hidden", marginBottom: "8px", backgroundColor: "#1C1917", aspectRatio: "16/7", position: "relative" }}>
                  <img src={pg.photos[activePhoto]} alt={pg.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  <div style={{ position: "absolute", bottom: "12px", right: "12px", backgroundColor: "rgba(0,0,0,0.55)", borderRadius: "8px", padding: "4px 10px" }}>
                    <span style={{ fontFamily: "var(--font-body)", fontSize: "12px", color: "#fff" }}>{activePhoto + 1} / {pg.photos.length}</span>
                  </div>
                </div>
                {pg.photos.length > 1 && (
                  <div style={{ display: "flex", gap: "8px", overflowX: "auto", paddingBottom: "4px" }}>
                    {pg.photos.map((src, i) => (
                      <button key={i} onClick={() => setActivePhoto(i)} style={{ flexShrink: 0, width: "72px", height: "52px", borderRadius: "8px", overflow: "hidden", border: `2px solid ${activePhoto === i ? "#FF385C" : "transparent"}`, padding: 0, cursor: "pointer" }}>
                        <img src={src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div style={{ backgroundColor: "#F0EDE8", borderRadius: "16px", marginBottom: "16px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "8px", padding: "48px 24px" }}>
                <HiPhotograph size={36} color="#C8C4BE" />
                <p style={{ fontFamily: "var(--font-body)", fontSize: "14px", color: "#A8A29E" }}>No photos uploaded</p>
              </div>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: "16px", alignItems: "start" }}>

              {/* Left column */}
              <div>
                {/* Description */}
                <Section title="About this PG">
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
              <div style={{ position: "sticky", bottom: "16px", backgroundColor: "#fff", border: "1px solid #E8E4DE", borderRadius: "16px", padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "0 8px 32px rgba(0,0,0,0.12)", gap: "12px", flexWrap: "wrap" }}>
                <div>
                  <p style={{ fontFamily: "var(--font-display)", fontSize: "15px", fontWeight: "600", color: "#1C1917", marginBottom: "2px" }}>Ready to review?</p>
                  <p style={{ fontFamily: "var(--font-body)", fontSize: "13px", color: "#78716C" }}>Approving will make this PG visible in the public listing.</p>
                </div>
                <div style={{ display: "flex", gap: "10px" }}>
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
        @media (max-width: 768px) {
          div[style*="gridTemplateColumns: \"1fr 280px\""] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </>
  );
}
