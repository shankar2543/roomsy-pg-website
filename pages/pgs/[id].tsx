import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import { PGDetailSkeleton, useInitialLoading } from "@/components/common/Skeleton";
import { getPGWithOverrides } from "@/lib/dummyPGAdmin";
import { saveBooking } from "@/lib/dummyBookings";
import { isWishlisted, toggleWishlist } from "@/lib/dummyWishlist";
import { useAuthStore } from "@/store/useAuthStore";
import { PG } from "@/types/pg";
import {
  HiLocationMarker, HiStar, HiHeart, HiOutlineHeart,
  HiPhone, HiArrowLeft, HiX, HiWifi, HiShieldCheck, HiChevronLeft, HiChevronRight,
  HiCalendar, HiShare, HiExternalLink, HiUpload,
} from "react-icons/hi";
import { uploadIdProof } from "@/lib/cloudinary";
import {
  MdOutlineFoodBank, MdLocalLaundryService, MdFitnessCenter,
  MdAcUnit, MdLocalParking, MdPeople, MdMeetingRoom,
} from "react-icons/md";
import toast from "react-hot-toast";

// ── Amenity icon map ─────────────────────────────────────────────────────────
const AMENITY_ICONS: Record<string, React.ReactNode> = {
  "WiFi":           <HiWifi size={20} />,
  "AC":             <MdAcUnit size={20} />,
  "Meals":          <MdOutlineFoodBank size={20} />,
  "Laundry":        <MdLocalLaundryService size={20} />,
  "Gym":            <MdFitnessCenter size={20} />,
  "CCTV":           <HiShieldCheck size={20} />,
  "24/7 Security":  <HiShieldCheck size={20} />,
  "Parking":        <MdLocalParking size={20} />,
  "Housekeeping":   <MdPeople size={20} />,
  "Study Room":     <MdMeetingRoom size={20} />,
  "Lounge":         <MdMeetingRoom size={20} />,
  "Rooftop":        <MdMeetingRoom size={20} />,
  "TV Room":        <MdMeetingRoom size={20} />,
  "RO Water":       <HiShieldCheck size={20} />,
};

const FOOD_LABELS: Record<string, string> = {
  all: "All Meals Included", breakfast: "Breakfast Only",
  lunch: "Lunch Only", dinner: "Dinner Only", none: "No Food",
};

const PARKING_LABELS: Record<string, string> = {
  bike: "Bike Parking", car: "Car Parking", both: "Bike & Car Parking", none: "No Parking",
};

function PGTypeLabel({ type }: { type: string }) {
  const map: Record<string, { label: string; color: string; bg: string }> = {
    boys:     { label: "Boys",      color: "#1D4ED8", bg: "#EFF6FF" },
    girls:    { label: "Girls",     color: "#BE185D", bg: "#FDF2F8" },
    coliving: { label: "Co-Living", color: "#7C3AED", bg: "#F5F3FF" },
  };
  const s = map[type] || { label: type, color: "#78716C", bg: "#F9F7F4" };
  return (
    <span style={{ fontFamily: "var(--font-body)", fontSize: "12px", fontWeight: "600", color: s.color, backgroundColor: s.bg, borderRadius: "100px", padding: "4px 12px" }}>
      {s.label}
    </span>
  );
}

// ── Photo gallery lightbox ───────────────────────────────────────────────────
function Gallery({ photos, name }: { photos: string[]; name: string }) {
  const [active, setActive] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  function prev() { setActive((a) => (a - 1 + photos.length) % photos.length); }
  function next() { setActive((a) => (a + 1) % photos.length); }

  return (
    <>
      <div style={{ borderRadius: "16px", overflow: "hidden", position: "relative" }}>
        {/* Main photo */}
        <div
          style={{ position: "relative", height: "420px", backgroundColor: "#F0EDE8", cursor: "zoom-in" }}
          onClick={() => setLightbox(true)}
        >
          {photos[active] && (
            <Image src={photos[active]} alt={name} fill style={{ objectFit: "cover" }} priority />
          )}
          {/* Nav arrows */}
          {photos.length > 1 && (
            <>
              <button onClick={(e) => { e.stopPropagation(); prev(); }}
                style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", backgroundColor: "rgba(255,255,255,0.9)", border: "none", borderRadius: "50%", width: "36px", height: "36px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "0 2px 8px rgba(0,0,0,0.15)" }}>
                <HiChevronLeft size={18} color="#1C1917" />
              </button>
              <button onClick={(e) => { e.stopPropagation(); next(); }}
                style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", backgroundColor: "rgba(255,255,255,0.9)", border: "none", borderRadius: "50%", width: "36px", height: "36px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "0 2px 8px rgba(0,0,0,0.15)" }}>
                <HiChevronRight size={18} color="#1C1917" />
              </button>
            </>
          )}
          <div style={{ position: "absolute", bottom: "12px", right: "12px", backgroundColor: "rgba(0,0,0,0.5)", borderRadius: "100px", padding: "4px 10px" }}>
            <span style={{ fontFamily: "var(--font-body)", fontSize: "12px", color: "#fff" }}>{active + 1} / {photos.length}</span>
          </div>
        </div>
        {/* Thumbnails — show max 4, then +N */}
        {photos.length > 1 && (
          <div style={{ display: "flex", gap: "8px", padding: "10px", backgroundColor: "#F9F7F4" }}>
            {photos.slice(0, 4).map((p, i) => (
              <button key={i} onClick={() => setActive(i)}
                style={{ position: "relative", width: "72px", height: "52px", flexShrink: 0, borderRadius: "8px", overflow: "hidden", border: `2px solid ${active === i ? "#FF385C" : "transparent"}`, cursor: "pointer", padding: 0, backgroundColor: "#F0EDE8" }}>
                <Image src={p} alt="" fill style={{ objectFit: "cover" }} />
              </button>
            ))}
            {photos.length > 4 && (
              <button onClick={() => setLightbox(true)}
                style={{ width: "72px", height: "52px", flexShrink: 0, borderRadius: "8px", overflow: "hidden", border: "2px solid transparent", cursor: "pointer", padding: 0, backgroundColor: "#1C1917", position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Image src={photos[4]} alt="" fill style={{ objectFit: "cover", opacity: 0.35 }} />
                <span style={{ position: "relative", zIndex: 1, fontFamily: "var(--font-body)", fontSize: "14px", fontWeight: "700", color: "#fff" }}>
                  +{photos.length - 4}
                </span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.92)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center" }}
          onClick={() => setLightbox(false)}>
          <button onClick={() => setLightbox(false)}
            style={{ position: "absolute", top: "20px", right: "20px", backgroundColor: "rgba(255,255,255,0.15)", border: "none", borderRadius: "50%", width: "40px", height: "40px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
            <HiX size={20} color="#fff" />
          </button>
          {photos.length > 1 && (
            <>
              <button onClick={(e) => { e.stopPropagation(); prev(); }}
                style={{ position: "absolute", left: "20px", backgroundColor: "rgba(255,255,255,0.15)", border: "none", borderRadius: "50%", width: "44px", height: "44px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                <HiChevronLeft size={22} color="#fff" />
              </button>
              <button onClick={(e) => { e.stopPropagation(); next(); }}
                style={{ position: "absolute", right: "20px", backgroundColor: "rgba(255,255,255,0.15)", border: "none", borderRadius: "50%", width: "44px", height: "44px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                <HiChevronRight size={22} color="#fff" />
              </button>
            </>
          )}
          <div style={{ position: "relative", width: "min(90vw, 900px)", height: "min(80vh, 600px)" }} onClick={(e) => e.stopPropagation()}>
            {photos[active] && <Image src={photos[active]} alt={name} fill style={{ objectFit: "contain" }} />}
          </div>
        </div>
      )}
    </>
  );
}

// ── Booking modal ────────────────────────────────────────────────────────────
type SharingKey = "single" | "double" | "triple";

function BookingModal({ pg, initialSharing, onClose }: { pg: PG; initialSharing?: SharingKey; onClose: () => void }) {
  const router = useRouter();
  const today = new Date().toISOString().split("T")[0];
  const [stayType, setStayType] = useState<"daily" | "monthly">("daily");
  const [sharing, setSharing] = useState<SharingKey>(initialSharing || (Object.keys(pg.sharingPrices)[0] as SharingKey));
  const [fromDate, setFromDate] = useState(today);
  const [toDate, setToDate] = useState("");
  const [months, setMonths] = useState(1);
  const [idProofUrl, setIdProofUrl] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState("");
  const [uploading, setUploading] = useState(false);

  const sharingOptions: SharingKey[] = (["single", "double", "triple"] as SharingKey[]).filter(
    (k) => pg.sharingPrices[k] !== undefined
  );

  const sharingLabel: Record<SharingKey, string> = { single: "1 Sharing", double: "2 Sharing", triple: "3 Sharing" };

  function calcNights() {
    if (!fromDate || !toDate) return 0;
    const diff = new Date(toDate).getTime() - new Date(fromDate).getTime();
    return Math.max(0, Math.round(diff / (1000 * 60 * 60 * 24)));
  }

  const nights = calcNights();
  const dailyRate = pg.dailyPrices[sharing] || 0;
  const monthlyRate = pg.sharingPrices[sharing] || 0;
  const total = stayType === "daily" ? nights * dailyRate : months * monthlyRate;

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadIdProof(file);
      setIdProofUrl(url);
      setUploadedFileName(file.name);
    } catch {
      toast.error("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  function handleConfirm() {
    if (stayType === "daily" && (!fromDate || !toDate || nights === 0)) {
      toast.error("Please select valid check-in and check-out dates.");
      return;
    }
    if (!idProofUrl) {
      toast.error("Please upload your ID proof to continue.");
      return;
    }
    const params = new URLSearchParams({
      pgName: pg.name,
      sharing,
      stayType,
      total: String(total),
      ...(stayType === "daily"
        ? { fromDate, toDate, nights: String(nights) }
        : { months: String(months) }),
    });
    // Persist booking to localStorage
    const currentUser = useAuthStore.getState().user;
    if (currentUser) {
      saveBooking({
        objectId: `bk_${Date.now()}`,
        userId: currentUser.objectId,
        pgId: pg.objectId,
        pgOwnerId: pg.owner.objectId,
        pgName: pg.name,
        pgArea: pg.area,
        pgPhoto: pg.photos[0] || "",
        sharing,
        stayType,
        fromDate,
        toDate: stayType === "daily" ? toDate : undefined,
        months: stayType === "monthly" ? months : undefined,
        nights: stayType === "daily" ? nights : undefined,
        total,
        status: "pending",
        createdAt: new Date().toISOString(),
      });
    }
    toast.success("Booking request sent! The owner will contact you shortly.");
    onClose();
    router.push(`/bookings/confirm?${params.toString()}`);
  }

  return (
    <div className="bk-modal" onClick={onClose}>
      <div className="bk-backdrop" />

      <div className="bk-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="bk-handle-row"><div className="bk-handle" /></div>

        <div className="bk-sheet-head">
          <div className="bk-head-text">
            <p className="bk-eyebrow">Reserve your stay</p>
            <h2 className="bk-pgname">{pg.name}</h2>
            <p className="bk-pglocation">{pg.area}, Hyderabad</p>
          </div>
          <button onClick={onClose} aria-label="Close" className="bk-close">
            <HiX size={18} />
          </button>
        </div>

        <div className="bk-body">
          <section className="bk-section">
            <p className="bk-label">Stay type</p>
            <div className="bk-segment">
              {(["daily", "monthly"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setStayType(t)}
                  className={`bk-segment-btn ${stayType === t ? "is-active" : ""}`}
                >
                  {t === "daily" ? "Short stay" : "Monthly"}
                </button>
              ))}
            </div>
          </section>

          <section className="bk-section">
            <p className="bk-label">Room type</p>
            <div className="bk-rooms">
              {sharingOptions.map((k) => {
                const price = (stayType === "daily" ? pg.dailyPrices[k] : pg.sharingPrices[k]) || 0;
                const active = sharing === k;
                return (
                  <button
                    key={k}
                    onClick={() => setSharing(k)}
                    className={`bk-room ${active ? "is-active" : ""}`}
                  >
                    <span className="bk-room-label">{sharingLabel[k]}</span>
                    <span className="bk-room-price">
                      <span className="bk-room-price-value">₹{price.toLocaleString()}</span>
                      <span className="bk-room-price-unit">/{stayType === "daily" ? "night" : "mo"}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          {stayType === "daily" && (
            <section className="bk-section">
              <p className="bk-label">Select dates</p>
              <div className="bk-dates">
                <label className="bk-date">
                  <span className="bk-date-cap">Check-in</span>
                  <input
                    type="date"
                    value={fromDate}
                    min={today}
                    onChange={(e) => { setFromDate(e.target.value); if (toDate && e.target.value >= toDate) setToDate(""); }}
                  />
                  <span className="bk-date-hint">10:00 – 11:00 AM</span>
                </label>
                <label className="bk-date">
                  <span className="bk-date-cap">Check-out</span>
                  <input
                    type="date"
                    value={toDate}
                    min={fromDate || today}
                    onChange={(e) => setToDate(e.target.value)}
                  />
                  <span className="bk-date-hint">Within 24 hrs</span>
                </label>
              </div>
              {nights > 0 && (
                <div className="bk-nights">
                  {nights} night{nights !== 1 ? "s" : ""} · ₹{dailyRate.toLocaleString()}/night
                </div>
              )}
            </section>
          )}

          {stayType === "monthly" && (
            <section className="bk-section">
              <p className="bk-label">Duration</p>
              <div className="bk-stepper">
                <button
                  onClick={() => setMonths((m) => Math.max(1, m - 1))}
                  className="bk-stepper-btn"
                  aria-label="Decrease months"
                >−</button>
                <div className="bk-stepper-value">
                  <span className="bk-stepper-num">{months}</span>
                  <span className="bk-stepper-unit">month{months !== 1 ? "s" : ""} · ₹{monthlyRate.toLocaleString()}/mo</span>
                </div>
                <button
                  onClick={() => setMonths((m) => Math.min(12, m + 1))}
                  className="bk-stepper-btn"
                  aria-label="Increase months"
                >+</button>
              </div>
            </section>
          )}

          <section className="bk-section">
            <p className="bk-label">ID proof</p>
            <p className="bk-helper">Aadhaar / Driving Licence / PAN Card</p>
            {idProofUrl ? (
              <div className="bk-id-uploaded">
                <span className="bk-id-check"><HiShieldCheck size={18} /></span>
                <div className="bk-id-text">
                  <span className="bk-id-title">ID uploaded</span>
                  <span className="bk-id-name">{uploadedFileName}</span>
                </div>
                <button onClick={() => { setIdProofUrl(null); setUploadedFileName(""); }} className="bk-id-remove" aria-label="Remove ID">
                  <HiX size={14} />
                </button>
              </div>
            ) : (
              <label className={`bk-id-drop ${uploading ? "is-uploading" : ""}`}>
                <input type="file" accept="image/*,.pdf" hidden disabled={uploading} onChange={handleFileChange} />
                {uploading ? (
                  <>
                    <div className="booking-spinner" />
                    <span className="bk-id-drop-title">Uploading…</span>
                  </>
                ) : (
                  <>
                    <span className="bk-id-drop-icon"><HiUpload size={18} /></span>
                    <span className="bk-id-drop-title">Tap to upload ID proof</span>
                    <span className="bk-id-drop-sub">JPG, PNG or PDF · Max 10 MB</span>
                  </>
                )}
              </label>
            )}
          </section>

          <section className="bk-summary">
            <div className="bk-summary-row">
              <span className="bk-summary-line">
                {stayType === "daily"
                  ? `₹${dailyRate.toLocaleString()} × ${nights || "—"} night${nights !== 1 ? "s" : ""}`
                  : `₹${monthlyRate.toLocaleString()} × ${months} month${months !== 1 ? "s" : ""}`}
              </span>
              <span className="bk-summary-amount">{total > 0 ? `₹${total.toLocaleString()}` : "—"}</span>
            </div>
            <div className="bk-summary-divider" />
            <div className="bk-summary-row">
              <span className="bk-summary-total">Total</span>
              <span className="bk-summary-grand">{total > 0 ? `₹${total.toLocaleString()}` : "—"}</span>
            </div>
          </section>
        </div>

        <div className="bk-foot">
          <button
            onClick={handleConfirm}
            disabled={uploading}
            className="bk-cta"
          >
            {uploading ? "Uploading…" : "Confirm booking request"}
          </button>
          <p className="bk-foot-note">Payment collected offline · Owner will contact you to confirm</p>
        </div>
      </div>

      <style jsx>{`
        .bk-modal {
          position: fixed;
          inset: 0;
          z-index: 300;
          display: flex;
          align-items: flex-end;
          justify-content: center;
        }
        .bk-backdrop {
          position: absolute;
          inset: 0;
          background: rgba(28,25,23,0.55);
          backdrop-filter: blur(6px);
          -webkit-backdrop-filter: blur(6px);
        }
        .bk-sheet {
          position: relative;
          width: 100%;
          max-width: 540px;
          background: #fff;
          border-radius: 22px 22px 0 0;
          max-height: 92vh;
          display: flex;
          flex-direction: column;
          box-shadow: 0 -24px 60px rgba(28,25,23,0.25);
          animation: bookingSlideUp 0.36s cubic-bezier(0.22, 1, 0.36, 1);
          overflow: hidden;
        }
        .bk-handle-row {
          display: flex;
          justify-content: center;
          padding: 10px 0 4px;
          flex-shrink: 0;
        }
        .bk-handle {
          width: 38px;
          height: 4px;
          border-radius: 2px;
          background: #E8E4DE;
        }
        .bk-sheet-head {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 12px 22px 16px;
          border-bottom: 1px solid #F0EDE8;
          flex-shrink: 0;
        }
        .bk-head-text { flex: 1; min-width: 0; }
        .bk-eyebrow {
          font-family: var(--font-body);
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 1.4px;
          text-transform: uppercase;
          color: #FF385C;
          margin: 0 0 4px;
        }
        .bk-pgname {
          font-family: var(--font-display);
          font-size: 20px;
          font-weight: 700;
          color: #1C1917;
          letter-spacing: -0.4px;
          margin: 0 0 3px;
          line-height: 1.15;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .bk-pglocation {
          font-family: var(--font-body);
          font-size: 12px;
          color: #78716C;
          margin: 0;
        }
        .bk-close {
          width: 34px; height: 34px;
          border: 1px solid #E8E4DE;
          background: #fff;
          border-radius: 50%;
          color: #44403C;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          padding: 0;
          flex-shrink: 0;
          transition: background 0.15s, color 0.15s, border-color 0.15s;
        }
        .bk-close:hover { background: #F9F7F4; color: #1C1917; border-color: #1C1917; }

        .bk-body {
          flex: 1;
          overflow-y: auto;
          padding: 20px 22px 12px;
          -webkit-overflow-scrolling: touch;
        }

        .bk-section { margin-bottom: 22px; }
        .bk-label {
          font-family: var(--font-body);
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.8px;
          text-transform: uppercase;
          color: #78716C;
          margin: 0 0 10px;
        }
        .bk-helper {
          font-family: var(--font-body);
          font-size: 12px;
          color: #A8A29E;
          margin: -6px 0 10px;
        }

        .bk-segment {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 6px;
          padding: 4px;
          background: #F5F3F0;
          border-radius: 12px;
        }
        .bk-segment-btn {
          padding: 10px;
          border: none;
          background: transparent;
          font-family: var(--font-body);
          font-size: 13px;
          font-weight: 600;
          color: #78716C;
          cursor: pointer;
          border-radius: 9px;
          transition: background 0.18s ease, color 0.18s ease, box-shadow 0.18s ease;
        }
        .bk-segment-btn.is-active {
          background: #fff;
          color: #1C1917;
          box-shadow: 0 1px 3px rgba(28,25,23,0.06);
        }

        .bk-rooms {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .bk-room {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 12px 16px;
          border-radius: 14px;
          border: 1.5px solid #E8E4DE;
          background: #fff;
          cursor: pointer;
          transition: border-color 0.15s, background 0.15s;
          text-align: left;
        }
        .bk-room:hover { border-color: #D6D3CE; }
        .bk-room.is-active {
          border-color: #FF385C;
          background: #FFF7F8;
        }
        .bk-room-label {
          font-family: var(--font-body);
          font-size: 14px;
          font-weight: 600;
          color: #1C1917;
        }
        .bk-room-price {
          display: inline-flex;
          align-items: baseline;
          gap: 2px;
        }
        .bk-room-price-value {
          font-family: var(--font-display);
          font-size: 16px;
          font-weight: 700;
          color: #1C1917;
          letter-spacing: -0.3px;
        }
        .bk-room.is-active .bk-room-price-value { color: #FF385C; }
        .bk-room-price-unit {
          font-family: var(--font-body);
          font-size: 11px;
          color: #78716C;
        }

        .bk-dates {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }
        .bk-date { display: flex; flex-direction: column; gap: 6px; }
        .bk-date-cap {
          font-family: var(--font-body);
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.6px;
          text-transform: uppercase;
          color: #A8A29E;
        }
        .bk-date input {
          width: 100%;
          padding: 11px 12px;
          border: 1.5px solid #E8E4DE;
          border-radius: 10px;
          background: #FAFAF9;
          font-family: var(--font-body);
          font-size: 14px;
          color: #1C1917;
          outline: none;
          box-sizing: border-box;
          transition: border-color 0.15s, background 0.15s;
        }
        .bk-date input:focus {
          border-color: #FF385C;
          background: #fff;
          box-shadow: 0 0 0 3px rgba(255,56,92,0.12);
        }
        .bk-date-hint {
          font-family: var(--font-body);
          font-size: 11px;
          color: #A8A29E;
        }
        .bk-nights {
          margin-top: 10px;
          padding: 8px 12px;
          background: #F5F3F0;
          border-radius: 10px;
          font-family: var(--font-body);
          font-size: 12px;
          color: #44403C;
        }

        .bk-stepper {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: #fff;
          border: 1.5px solid #E8E4DE;
          border-radius: 16px;
          padding: 14px 18px;
        }
        .bk-stepper-btn {
          width: 40px; height: 40px;
          border-radius: 50%;
          border: 1.5px solid #E8E4DE;
          background: #fff;
          color: #1C1917;
          font-size: 22px;
          font-weight: 600;
          line-height: 1;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0;
          transition: background 0.15s, border-color 0.15s, transform 0.1s;
        }
        .bk-stepper-btn:hover { background: #FFF0F3; border-color: #FF385C; color: #FF385C; }
        .bk-stepper-btn:active { transform: scale(0.94); }
        .bk-stepper-value { display: flex; flex-direction: column; align-items: center; }
        .bk-stepper-num {
          font-family: var(--font-display);
          font-size: 32px;
          font-weight: 700;
          color: #1C1917;
          letter-spacing: -1px;
          line-height: 1;
        }
        .bk-stepper-unit {
          font-family: var(--font-body);
          font-size: 11px;
          color: #78716C;
          margin-top: 4px;
        }

        .bk-id-drop {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 22px 16px;
          background: #FAFAF9;
          border: 1.5px dashed #D6D3CE;
          border-radius: 14px;
          cursor: pointer;
          transition: border-color 0.18s, background 0.18s;
        }
        .bk-id-drop:hover { border-color: #FF385C; background: #FFF7F8; }
        .bk-id-drop.is-uploading { cursor: not-allowed; border-color: #FF385C; }
        .bk-id-drop-icon {
          width: 40px; height: 40px;
          border-radius: 50%;
          background: #fff;
          color: #FF385C;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 4px;
          box-shadow: 0 1px 3px rgba(28,25,23,0.06);
        }
        .bk-id-drop-title {
          font-family: var(--font-body);
          font-size: 13px;
          font-weight: 600;
          color: #1C1917;
        }
        .bk-id-drop-sub {
          font-family: var(--font-body);
          font-size: 11px;
          color: #A8A29E;
        }
        .bk-id-uploaded {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 14px;
          background: #F0FDF4;
          border: 1.5px solid #BBF7D0;
          border-radius: 14px;
        }
        .bk-id-check {
          width: 34px; height: 34px;
          border-radius: 50%;
          background: #DCFCE7;
          color: #15803D;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .bk-id-text { flex: 1; min-width: 0; display: flex; flex-direction: column; }
        .bk-id-title {
          font-family: var(--font-body);
          font-size: 13px;
          font-weight: 600;
          color: #15803D;
        }
        .bk-id-name {
          font-family: var(--font-body);
          font-size: 11px;
          color: #16A34A;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .bk-id-remove {
          border: none;
          background: transparent;
          color: #65A30D;
          cursor: pointer;
          padding: 4px;
        }

        .bk-summary {
          background: linear-gradient(135deg, #FFF0F3 0%, #FFF7F4 100%);
          border: 1px solid #FFD4DC;
          border-radius: 16px;
          padding: 16px 18px;
        }
        .bk-summary-row {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          gap: 12px;
        }
        .bk-summary-line {
          font-family: var(--font-body);
          font-size: 13px;
          color: #57534E;
        }
        .bk-summary-amount {
          font-family: var(--font-display);
          font-size: 16px;
          font-weight: 600;
          color: #1C1917;
        }
        .bk-summary-divider {
          height: 1px;
          background: rgba(255,56,92,0.18);
          margin: 12px 0;
        }
        .bk-summary-total {
          font-family: var(--font-body);
          font-size: 13px;
          font-weight: 600;
          color: #1C1917;
        }
        .bk-summary-grand {
          font-family: var(--font-display);
          font-size: 26px;
          font-weight: 700;
          color: #FF385C;
          letter-spacing: -0.8px;
          line-height: 1;
        }

        .bk-foot {
          flex-shrink: 0;
          padding: 14px 22px calc(18px + env(safe-area-inset-bottom));
          background: #fff;
          border-top: 1px solid #F0EDE8;
        }
        .bk-cta {
          width: 100%;
          padding: 15px;
          border-radius: 100px;
          background: #FF385C;
          color: #fff;
          border: none;
          font-family: var(--font-body);
          font-size: 15px;
          font-weight: 700;
          cursor: pointer;
          letter-spacing: -0.1px;
          box-shadow: 0 6px 20px rgba(255,56,92,0.4);
          transition: background 0.18s, transform 0.12s, box-shadow 0.18s;
        }
        .bk-cta:hover {
          background: #E31C5F;
          box-shadow: 0 10px 28px rgba(255,56,92,0.5);
        }
        .bk-cta:active { transform: scale(0.98); }
        .bk-cta:disabled {
          background: rgba(255,56,92,0.5);
          cursor: not-allowed;
          box-shadow: none;
        }
        .bk-foot-note {
          font-family: var(--font-body);
          font-size: 11px;
          color: #A8A29E;
          text-align: center;
          margin: 8px 0 0;
        }

        @media (max-width: 480px) {
          .bk-sheet {
            max-height: 96vh;
            border-radius: 18px 18px 0 0;
          }
          .bk-sheet-head { padding: 10px 18px 14px; }
          .bk-pgname { font-size: 18px; }
          .bk-body { padding: 16px 18px 10px; }
          .bk-foot { padding: 12px 18px calc(16px + env(safe-area-inset-bottom)); }
          .bk-section { margin-bottom: 18px; }
          .bk-room { padding: 11px 14px; gap: 10px; }
          .bk-room-price-value { font-size: 15px; }
          .bk-stepper-num { font-size: 28px; }
          .bk-summary-grand { font-size: 24px; }
        }
      `}</style>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  fontFamily: "var(--font-body)", fontSize: "13px", fontWeight: "600", color: "#1C1917", marginBottom: "8px",
};

// ── Main page ────────────────────────────────────────────────────────────────
export default function PGDetailPage() {
  const router = useRouter();
  const { id, sharing: sharingParam } = router.query as { id: string; sharing?: SharingKey };
  const [liked, setLiked] = useState(false);
  const [bookingOpen, setBookingOpen] = useState(false);
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    if (!user || !id) { setLiked(false); return; }
    const sync = () => setLiked(isWishlisted(user.objectId, id));
    sync();
    window.addEventListener("roomsy:wishlist", sync);
    return () => window.removeEventListener("roomsy:wishlist", sync);
  }, [user, id]);

  function handleToggleWishlist() {
    if (!user) {
      toast.error("Please log in to save properties");
      router.push("/auth/login");
      return;
    }
    if (!id) return;
    const nowLiked = toggleWishlist(user.objectId, id);
    setLiked(nowLiked);
    toast.success(nowLiked ? "Saved to wishlist" : "Removed from wishlist");
  }

  function handleShare() {
    if (navigator.share) {
      navigator.share({ title: pg?.name, url: window.location.href }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!");
    }
  }
  const [bookingSharing, setBookingSharing] = useState<SharingKey | undefined>();
  const isLoadingDetail = useInitialLoading(500);

  const pg: PG | undefined = getPGWithOverrides(id) ?? undefined;

  useEffect(() => {
    if (router.isReady && router.query.book === "true") {
      if (!user) {
        toast.error("Please log in to book a stay");
        router.replace("/auth/login");
        return;
      }
      setBookingSharing(sharingParam);
      setBookingOpen(true);
    }
  }, [router.isReady]);

  function openBooking(sharing?: SharingKey) {
    if (!user) {
      toast.error("Please log in to book a stay");
      router.push("/auth/login");
      return;
    }
    setBookingSharing(sharing);
    setBookingOpen(true);
  }

  if (!router.isReady || isLoadingDetail) {
    return (
      <>
        <Navbar />
        <main style={{ minHeight: "100vh", backgroundColor: "#F9F7F4", paddingTop: "72px" }}>
          <PGDetailSkeleton />
        </main>
        <Footer />
      </>
    );
  }

  if (!pg) {
    return (
      <>
        <Navbar />
        <main style={{ minHeight: "100vh", backgroundColor: "#F9F7F4", display: "flex", alignItems: "center", justifyContent: "center", paddingTop: "72px" }}>
          <div style={{ textAlign: "center" }}>
            <h1 style={{ fontFamily: "var(--font-display)", fontSize: "28px", fontWeight: "600", color: "#1C1917", marginBottom: "12px" }}>PG not found</h1>
            <Link href="/pgs" style={{ color: "#FF385C", fontFamily: "var(--font-body)", fontSize: "14px" }}>← Back to listings</Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const sharingRows = [
    { key: "single", label: "1 Sharing", price: pg.sharingPrices.single },
    { key: "double", label: "2 Sharing", price: pg.sharingPrices.double },
    { key: "triple", label: "3 Sharing", price: pg.sharingPrices.triple },
  ].filter((r) => r.price !== undefined);

  return (
    <>
      <Head>
        <title>{pg.name} — Roomsy</title>
      </Head>
      <Navbar />

      <main style={{ minHeight: "100vh", backgroundColor: "#F9F7F4", paddingTop: "72px" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "28px 24px 80px" }}>

          {/* Back link */}
          <Link href="/pgs" style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontFamily: "var(--font-body)", fontSize: "13px", color: "#78716C", textDecoration: "none", marginBottom: "20px" }}>
            <HiArrowLeft size={14} /> Back to listings
          </Link>

          {/* Two-column layout */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "32px", alignItems: "flex-start" }} className="detail-grid">

            {/* ── Left column ── */}
            <div>
              {/* Gallery */}
              <Gallery photos={pg.photos} name={pg.name} />

              {/* Name + meta */}
              <div style={{ backgroundColor: "#fff", borderRadius: "16px", border: "1px solid #E8E4DE", padding: "24px", marginTop: "20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px", marginBottom: "12px" }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px", flexWrap: "wrap" }}>
                      <PGTypeLabel type={pg.pgType} />
                      {pg.isApproved && (
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", backgroundColor: "#F0FDF4", borderRadius: "100px", padding: "4px 10px" }}>
                          <div style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "#15803D" }} />
                          <span style={{ fontFamily: "var(--font-body)", fontSize: "11px", fontWeight: "600", color: "#15803D" }}>Verified</span>
                        </span>
                      )}
                    </div>
                    <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(22px,3vw,30px)", fontWeight: "600", color: "#1C1917", letterSpacing: "-0.5px", lineHeight: 1.2, marginBottom: "8px" }}>
                      {pg.name}
                    </h1>
                    <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                      <HiLocationMarker size={14} color="#FF385C" />
                      <span style={{ fontFamily: "var(--font-body)", fontSize: "13px", color: "#78716C" }}>{pg.address}</span>
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "10px", flexShrink: 0 }}>
                    {/* Share + Wishlist row */}
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button onClick={handleShare}
                        title="Share"
                        style={{ width: "36px", height: "36px", borderRadius: "50%", border: "1.5px solid #E8E4DE", backgroundColor: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "all 0.15s" }}
                        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#F9F7F4"; e.currentTarget.style.borderColor = "#1C1917"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#fff"; e.currentTarget.style.borderColor = "#E8E4DE"; }}
                      >
                        <HiShare size={16} color="#1C1917" />
                      </button>
                      <button onClick={handleToggleWishlist}
                        title={liked ? "Remove from wishlist" : "Save to wishlist"}
                        aria-label={liked ? "Remove from wishlist" : "Save to wishlist"}
                        style={{ width: "36px", height: "36px", borderRadius: "50%", border: `1.5px solid ${liked ? "#FF385C" : "#E8E4DE"}`, backgroundColor: liked ? "#FFF0F3" : "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "all 0.15s" }}
                        onMouseEnter={(e) => { if (!liked) { e.currentTarget.style.backgroundColor = "#F9F7F4"; e.currentTarget.style.borderColor = "#1C1917"; }}}
                        onMouseLeave={(e) => { if (!liked) { e.currentTarget.style.backgroundColor = "#fff"; e.currentTarget.style.borderColor = "#E8E4DE"; }}}
                      >
                        {liked ? <HiHeart size={16} color="#FF385C" /> : <HiOutlineHeart size={16} color="#1C1917" />}
                      </button>
                    </div>

                    {/* Rating */}
                    {pg.rating > 0 && (
                      <div style={{ display: "flex", alignItems: "center", gap: "3px" }}>
                        <HiStar size={14} color="#FF385C" />
                        <span style={{ fontFamily: "var(--font-body)", fontSize: "13px", fontWeight: "600", color: "#1C1917" }}>{pg.rating.toFixed(1)}</span>
                      </div>
                    )}

                    {/* Directions */}
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${pg.location.latitude},${pg.location.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ display: "inline-flex", alignItems: "center", gap: "5px", fontFamily: "var(--font-body)", fontSize: "12px", fontWeight: "600", color: "#FF385C", textDecoration: "none", padding: "6px 12px", borderRadius: "100px", border: "1.5px solid #FF385C", backgroundColor: "#FFF0F3", transition: "all 0.15s", whiteSpace: "nowrap" }}
                      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#FF385C"; e.currentTarget.style.color = "#fff"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#FFF0F3"; e.currentTarget.style.color = "#FF385C"; }}
                    >
                      <HiExternalLink size={13} /> Directions
                    </a>
                  </div>
                </div>

                <p style={{ fontFamily: "var(--font-body)", fontSize: "14px", color: "#57534E", lineHeight: "1.75" }}>
                  {pg.description}
                </p>
              </div>

              {/* Amenities */}
              <div style={{ backgroundColor: "#fff", borderRadius: "16px", border: "1px solid #E8E4DE", padding: "24px", marginTop: "16px" }}>
                <h2 style={{ fontFamily: "var(--font-display)", fontSize: "18px", fontWeight: "600", color: "#1C1917", marginBottom: "18px", letterSpacing: "-0.2px" }}>Amenities</h2>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: "12px" }}>
                  {pg.amenities.map((a) => (
                    <div key={a} style={{ display: "flex", alignItems: "center", gap: "10px", backgroundColor: "#F9F7F4", borderRadius: "10px", padding: "12px 14px", border: "1px solid #E8E4DE" }}>
                      <span style={{ color: "#FF385C", flexShrink: 0 }}>{AMENITY_ICONS[a] || <HiShieldCheck size={20} />}</span>
                      <span style={{ fontFamily: "var(--font-body)", fontSize: "13px", fontWeight: "500", color: "#1C1917" }}>{a}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Details grid */}
              <div style={{ backgroundColor: "#fff", borderRadius: "16px", border: "1px solid #E8E4DE", padding: "24px", marginTop: "16px" }}>
                <h2 style={{ fontFamily: "var(--font-display)", fontSize: "18px", fontWeight: "600", color: "#1C1917", marginBottom: "18px", letterSpacing: "-0.2px" }}>PG Details</h2>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }} className="details-grid">
                  {[
                    { label: "Food", value: FOOD_LABELS[pg.food] || pg.food, icon: <MdOutlineFoodBank size={18} /> },
                    { label: "Parking", value: PARKING_LABELS[pg.parking] || pg.parking, icon: <MdLocalParking size={18} /> },
                    { label: "City", value: pg.city, icon: <HiLocationMarker size={18} /> },
                    { label: "Area", value: pg.area, icon: <HiLocationMarker size={18} /> },
                    { label: "Occupancy", value: pg.occupancy.map((o) => o.charAt(0).toUpperCase() + o.slice(1)).join(", "), icon: <MdPeople size={18} /> },
                  ].map((item) => (
                    <div key={item.label} style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                      <span style={{ color: "#FF385C", marginTop: "1px", flexShrink: 0 }}>{item.icon}</span>
                      <div>
                        <div style={{ fontFamily: "var(--font-body)", fontSize: "11px", color: "#A8A29E", fontWeight: "500", marginBottom: "2px", textTransform: "uppercase", letterSpacing: "0.5px" }}>{item.label}</div>
                        <div style={{ fontFamily: "var(--font-body)", fontSize: "14px", color: "#1C1917", fontWeight: "500" }}>{item.value}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Map */}
              <div style={{ backgroundColor: "#fff", borderRadius: "16px", border: "1px solid #E8E4DE", overflow: "hidden", marginTop: "16px" }}>
                <div style={{ padding: "20px 24px 0" }}>
                  <h2 style={{ fontFamily: "var(--font-display)", fontSize: "18px", fontWeight: "600", color: "#1C1917", letterSpacing: "-0.2px" }}>Location</h2>
                  <p style={{ fontFamily: "var(--font-body)", fontSize: "13px", color: "#78716C", marginTop: "4px" }}>{pg.address}</p>
                </div>
                <div style={{ marginTop: "16px", height: "240px", backgroundColor: "#F0EDE8", position: "relative", overflow: "hidden" }}>
                  <iframe
                    title="map"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    loading="lazy"
                    src={`https://maps.google.com/maps?q=${pg.location.latitude},${pg.location.longitude}&z=15&output=embed`}
                  />
                </div>
              </div>
            </div>

            {/* ── Right sticky card ── */}
            <div style={{ position: "sticky", top: "92px" }}>
              <div style={{ backgroundColor: "#fff", borderRadius: "16px", border: "1px solid #E8E4DE", boxShadow: "0 4px 24px rgba(0,0,0,0.08)", overflow: "hidden" }}>
                <div style={{ padding: "20px 20px 0", borderBottom: "1px solid #F0EDE8", paddingBottom: "16px" }}>
                  <p style={{ fontFamily: "var(--font-body)", fontSize: "12px", fontWeight: "600", color: "#FF385C", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "4px" }}>Monthly Rent</p>
                  <p style={{ fontFamily: "var(--font-display)", fontSize: "28px", fontWeight: "700", color: "#1C1917", letterSpacing: "-0.5px" }}>
                    from ₹{Math.min(...sharingRows.map((r) => r.price!)).toLocaleString()}
                  </p>
                </div>

                {/* Sharing price rows */}
                <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: "10px" }}>
                  {sharingRows.map((row) => (
                    <div key={row.key} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", backgroundColor: "#F9F7F4", borderRadius: "10px", padding: "12px 14px", border: "1px solid #E8E4DE" }}>
                      <div>
                        <div style={{ fontFamily: "var(--font-body)", fontSize: "12px", color: "#78716C", marginBottom: "2px" }}>{row.label}</div>
                        <div style={{ fontFamily: "var(--font-display)", fontSize: "20px", fontWeight: "700", color: "#1C1917", letterSpacing: "-0.3px" }}>
                          ₹{row.price!.toLocaleString()}<span style={{ fontFamily: "var(--font-body)", fontSize: "11px", fontWeight: "400", color: "#A8A29E" }}>/mo</span>
                        </div>
                        {pg.dailyPrices[row.key as SharingKey] && (
                          <div style={{ fontFamily: "var(--font-body)", fontSize: "11px", color: "#A8A29E", marginTop: "1px" }}>
                            ₹{pg.dailyPrices[row.key as SharingKey]}/day
                          </div>
                        )}
                      </div>
                      <button onClick={() => openBooking(row.key as SharingKey)}
                        style={{ fontFamily: "var(--font-body)", fontSize: "12px", fontWeight: "600", color: "#fff", border: "none", padding: "8px 14px", borderRadius: "100px", backgroundColor: "#FF385C", whiteSpace: "nowrap", transition: "background 0.15s", cursor: "pointer" }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#E31C5F")}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#FF385C")}
                      >Book Now</button>
                    </div>
                  ))}
                </div>

                {/* Owner */}
                <div style={{ padding: "0 20px 20px" }}>
                  <div style={{ backgroundColor: "#F9F7F4", borderRadius: "12px", padding: "14px", display: "flex", alignItems: "center", gap: "12px", marginBottom: "14px", border: "1px solid #E8E4DE" }}>
                    <div style={{ width: "40px", height: "40px", borderRadius: "50%", backgroundColor: "#FF385C", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <span style={{ fontFamily: "var(--font-display)", fontSize: "16px", fontWeight: "700", color: "#fff" }}>
                        {pg.owner.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <div style={{ fontFamily: "var(--font-body)", fontSize: "13px", fontWeight: "600", color: "#1C1917" }}>{pg.owner.name}</div>
                      <div style={{ fontFamily: "var(--font-body)", fontSize: "12px", color: "#78716C" }}>PG Owner</div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      if (!user) {
                        toast.error("Please log in to view owner contact");
                        router.push("/auth/login");
                        return;
                      }
                      window.location.href = `tel:${pg.owner.phone}`;
                    }}
                    style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", width: "100%", padding: "13px", borderRadius: "100px", backgroundColor: "#1C1917", color: "#fff", border: "none", fontFamily: "var(--font-body)", fontSize: "14px", fontWeight: "600", transition: "background 0.15s", boxSizing: "border-box", cursor: "pointer" }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#292524")}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#1C1917")}
                  >
                    <HiPhone size={16} />
                    Contact Owner
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />

      {/* Booking modal */}
      {bookingOpen && (
        <BookingModal
          pg={pg}
          initialSharing={bookingSharing}
          onClose={() => setBookingOpen(false)}
        />
      )}

      <style>{`
        @media (max-width: 900px) {
          .detail-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 640px) {
          .details-grid { grid-template-columns: 1fr !important; }
        }
        @keyframes bookingSlideUp {
          from { transform: translateY(100%); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
        @keyframes bookingSpin {
          to { transform: rotate(360deg); }
        }
        .booking-spinner {
          width: 22px; height: 22px;
          border: 2.5px solid #F0EDE8;
          border-top-color: #FF385C;
          border-radius: 50%;
          animation: bookingSpin 0.7s linear infinite;
        }
      `}</style>
    </>
  );
}
