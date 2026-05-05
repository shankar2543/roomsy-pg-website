import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import { PGCardSkeleton, useInitialLoading } from "@/components/common/Skeleton";
import { filterPGs, ACTIVE_CITY } from "@/lib/dummyPGs";
import { PG } from "@/types/pg";
import {
  HiX, HiLocationMarker, HiStar, HiHeart, HiOutlineHeart,
  HiWifi, HiShieldCheck, HiShare, HiExternalLink,
  HiChevronDown,
} from "react-icons/hi";
import toast from "react-hot-toast";
import {
  MdOutlineFoodBank, MdLocalLaundryService, MdFitnessCenter,
  MdAcUnit, MdLocalParking, MdBusiness,
} from "react-icons/md";
import { useAuthStore } from "@/store/useAuthStore";
import { isWishlisted, toggleWishlist } from "@/lib/dummyWishlist";

const NON_ACTIVE_CITIES = ["Bangalore", "Mumbai", "Delhi", "Pune", "Chennai"];

const MAX_PRICE_MIN = 3000;
const MAX_PRICE_MAX = 20000;

// Icons for PG card amenity tags
const AMENITY_ICONS: Record<string, React.ReactNode> = {
  "WiFi":          <HiWifi size={12} />,
  "AC":            <MdAcUnit size={12} />,
  "Meals":         <MdOutlineFoodBank size={12} />,
  "Food":          <MdOutlineFoodBank size={12} />,
  "Laundry":       <MdLocalLaundryService size={12} />,
  "Gym":           <MdFitnessCenter size={12} />,
  "CCTV":          <HiShieldCheck size={12} />,
  "24/7 Security": <HiShieldCheck size={12} />,
  "Parking":       <MdLocalParking size={12} />,
  "Coworking":     <MdBusiness size={12} />,
};

// Sidebar amenity pills (no Pool)
const SIDEBAR_AMENITIES: { label: string; icon: React.ReactNode }[] = [
  { label: "WiFi",      icon: <HiWifi size={13} /> },
  { label: "AC",        icon: <MdAcUnit size={13} /> },
  { label: "Food",      icon: <MdOutlineFoodBank size={13} /> },
  { label: "Gym",       icon: <MdFitnessCenter size={13} /> },
  { label: "Laundry",   icon: <MdLocalLaundryService size={13} /> },
  { label: "Parking",   icon: <MdLocalParking size={13} /> },
  { label: "Coworking", icon: <MdBusiness size={13} /> },
];

// ── Sidebar card wrapper ─────────────────────────────────────────────────────
function SidebarCard({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      backgroundColor: "#fff",
      borderRadius: "14px",
      boxShadow: "0 1px 6px rgba(0,0,0,0.07)",
      padding: "14px 14px",
    }}>
      {children}
    </div>
  );
}

// ── PG type badge (used on cards) ────────────────────────────────────────────
function PGTypeLabel({ type }: { type: string }) {
  const map: Record<string, { label: string; color: string; bg: string }> = {
    boys:     { label: "Boys",      color: "#1D4ED8", bg: "#EFF6FF" },
    girls:    { label: "Girls",     color: "#BE185D", bg: "#FDF2F8" },
    coliving: { label: "Co-Living", color: "#7C3AED", bg: "#F5F3FF" },
  };
  const s = map[type] || { label: type, color: "#78716C", bg: "#F9F7F4" };
  return (
    <span style={{ fontFamily: "var(--font-body)", fontSize: "11px", fontWeight: "600", color: s.color, backgroundColor: s.bg, borderRadius: "100px", padding: "3px 10px" }}>
      {s.label}
    </span>
  );
}

// ── Horizontal PG card ───────────────────────────────────────────────────────
function PGListCard({ pg }: { pg: PG }) {
  const [liked, setLiked] = useState(false);
  const [activePhoto, setActivePhoto] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const user = useAuthStore((s) => s.user);
  const router = useRouter();

  useEffect(() => {
    if (!user) { setLiked(false); return; }
    const sync = () => setLiked(isWishlisted(user.objectId, pg.objectId));
    sync();
    window.addEventListener("roomsy:wishlist", sync);
    return () => window.removeEventListener("roomsy:wishlist", sync);
  }, [user, pg.objectId]);

  function requireAuth(action: () => void) {
    if (!user) {
      toast.error("Please log in to continue");
      router.push("/auth/login");
      return;
    }
    action();
  }

  function handleToggleWishlist() {
    if (!user) {
      toast.error("Please log in to save properties");
      router.push("/auth/login");
      return;
    }
    const nowLiked = toggleWishlist(user.objectId, pg.objectId);
    setLiked(nowLiked);
    toast.success(nowLiked ? "Saved to wishlist" : "Removed from wishlist");
  }

  // Pick the cheapest sharing option to surface when the card is collapsed
  const sharingEntries: { label: string; price: number }[] = [
    pg.sharingPrices.triple !== undefined && { label: "3 Share", price: pg.sharingPrices.triple },
    pg.sharingPrices.double !== undefined && { label: "2 Share", price: pg.sharingPrices.double },
    pg.sharingPrices.single !== undefined && { label: "1 Share", price: pg.sharingPrices.single },
  ].filter(Boolean) as { label: string; price: number }[];
  const cheapestSharing = sharingEntries.sort((a, b) => a.price - b.price)[0];

  return (
    <div
      style={{ backgroundColor: "#fff", border: "1px solid #E8E4DE", borderRadius: "16px", overflow: "hidden", display: "flex", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", transition: "box-shadow 0.2s" }}
      onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 6px 24px rgba(0,0,0,0.10)")}
      onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,0.06)")}
      className={`pg-list-card ${expanded ? "expanded" : "collapsed"}`}
    >
      <div style={{ width: "260px", flexShrink: 0, display: "flex", flexDirection: "column" }} className="pg-card-img">
        <div className="pg-card-img-frame" style={{ position: "relative", height: "180px", backgroundColor: "#F0EDE8" }}>
          {pg.photos[activePhoto] ? (
            <Image src={pg.photos[activePhoto]} alt={pg.name} fill style={{ objectFit: "cover" }} />
          ) : (
            <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontFamily: "var(--font-display)", fontSize: "40px", color: "#E8E4DE" }}>R</span>
            </div>
          )}
          {pg.isApproved && (
            <div className="pg-verified-badge" style={{ position: "absolute", top: "10px", left: "10px", backgroundColor: "rgba(255,255,255,0.92)", borderRadius: "100px", padding: "3px 10px", display: "flex", alignItems: "center", gap: "4px" }}>
              <div style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "#15803D" }} />
              <span style={{ fontFamily: "var(--font-body)", fontSize: "10px", fontWeight: "600", color: "#15803D" }}>Verified</span>
            </div>
          )}
          <button
            className="pg-wishlist-mobile"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleToggleWishlist(); }}
            aria-label={liked ? "Remove from wishlist" : "Save to wishlist"}
            style={{
              position: "absolute",
              top: "10px",
              right: "10px",
              border: "none",
              background: "transparent",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              padding: 4,
              display: "none",
              filter: "drop-shadow(0 1px 3px rgba(0,0,0,0.45))",
              WebkitTapHighlightColor: "transparent",
            }}
          >
            {liked ? <HiHeart size={26} color="#FF385C" /> : <HiOutlineHeart size={26} color="#fff" />}
          </button>
        </div>
        {pg.photos.length > 1 && (
          <div className="pg-thumbnails" style={{ display: "flex", gap: "4px", padding: "6px" }}>
            {pg.photos.slice(0, 4).map((photo, i) => (
              <button key={i} onClick={() => setActivePhoto(i)} style={{ width: "44px", height: "32px", borderRadius: "5px", overflow: "hidden", border: `2px solid ${activePhoto === i ? "#FF385C" : "transparent"}`, cursor: "pointer", padding: 0, position: "relative", flexShrink: 0, backgroundColor: "#F0EDE8" }}>
                <Image src={photo} alt="" fill style={{ objectFit: "cover" }} />
              </button>
            ))}
            {pg.photos.length > 4 && (
              <button onClick={() => setActivePhoto(4)} style={{ width: "44px", height: "32px", borderRadius: "5px", overflow: "hidden", border: "2px solid transparent", cursor: "pointer", padding: 0, position: "relative", flexShrink: 0, backgroundColor: "#1C1917", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Image src={pg.photos[4]} alt="" fill style={{ objectFit: "cover", opacity: 0.3 }} />
                <span style={{ position: "relative", zIndex: 1, fontFamily: "var(--font-body)", fontSize: "11px", fontWeight: "700", color: "#fff" }}>+{pg.photos.length - 4}</span>
              </button>
            )}
          </div>
        )}

        {/* Bed availability strip — always pinned to bottom */}
        {pg.availableBeds === 0 ? (
          <div className="pg-bed-strip pg-bed-strip-full" style={{ margin: "auto 6px 6px", borderRadius: "7px", padding: "6px 10px", backgroundColor: "#FEE2E2", display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ fontSize: "12px" }}>🚫</span>
            <span style={{ fontFamily: "var(--font-body)", fontSize: "11px", fontWeight: "700", color: "#991B1B" }}>Fully Booked</span>
          </div>
        ) : pg.availableBeds < 2 ? (
          <div className="pg-bed-strip pg-bed-strip-low" style={{ margin: "auto 6px 6px", borderRadius: "7px", padding: "6px 10px", backgroundColor: "#FEF3C7", display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ fontSize: "12px" }}>🔥</span>
            <span style={{ fontFamily: "var(--font-body)", fontSize: "11px", fontWeight: "700", color: "#92400E" }}>Only {pg.availableBeds} bed left — Hurry up!</span>
          </div>
        ) : (
          <div className="pg-bed-strip pg-bed-strip-ok" style={{ margin: "auto 6px 6px", borderRadius: "7px", padding: "6px 10px", backgroundColor: "#D1FAE5", display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ fontSize: "12px" }}>🛏</span>
            <span style={{ fontFamily: "var(--font-body)", fontSize: "11px", fontWeight: "600", color: "#065F46" }}>{pg.availableBeds} beds available</span>
          </div>
        )}
      </div>

      <div style={{ flex: 1, padding: "18px 20px 16px", display: "flex", flexDirection: "column", gap: "10px", minWidth: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "8px" }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "19px", fontWeight: "600", color: "#1C1917", letterSpacing: "-0.3px", marginBottom: "4px", lineHeight: 1.2 }}>{pg.name}</h2>
            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <HiLocationMarker size={12} color="#FF385C" />
              <span style={{ fontFamily: "var(--font-body)", fontSize: "12px", color: "#78716C" }}>{pg.area}, Hyderabad</span>
            </div>
            {cheapestSharing && (
              <div className="pg-collapsed-price" style={{ marginTop: "6px", display: "none", alignItems: "center", gap: "6px" }}>
                <span style={{ fontFamily: "var(--font-body)", fontSize: "11px", color: "#78716C", fontWeight: "500" }}>{cheapestSharing.label}</span>
                <span style={{ fontFamily: "var(--font-display)", fontSize: "15px", fontWeight: "700", color: "#1C1917", letterSpacing: "-0.3px" }}>₹{cheapestSharing.price.toLocaleString()}</span>
                <span style={{ fontFamily: "var(--font-body)", fontSize: "10px", color: "#A8A29E" }}>/mo</span>
              </div>
            )}
          </div>
          <button
            className="pg-card-chevron"
            onClick={() => setExpanded((v) => !v)}
            aria-label={expanded ? "Show less" : "Show more"}
            style={{
              display: "none",
              alignItems: "center", justifyContent: "center",
              width: "32px", height: "32px", flexShrink: 0,
              borderRadius: "50%", border: "1.5px solid #E8E4DE",
              background: "#fff", cursor: "pointer", padding: 0,
            }}
          >
            <HiChevronDown size={18} color="#1C1917" style={{ transform: expanded ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }} />
          </button>
          <div className="pg-card-actions" style={{ display: "flex", gap: "6px", flexShrink: 0, alignItems: "center" }}>
            <button
              onClick={() => {
                const url = `${window.location.origin}/pgs/${pg.objectId}`;
                if (navigator.share) { navigator.share({ title: pg.name, url }).catch(() => {}); }
                else { navigator.clipboard.writeText(url); toast.success("Link copied!"); }
              }}
              title="Share"
              style={{ width: "32px", height: "32px", borderRadius: "50%", border: "1.5px solid #E8E4DE", backgroundColor: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "all 0.15s" }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#F9F7F4"; e.currentTarget.style.borderColor = "#1C1917"; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#fff"; e.currentTarget.style.borderColor = "#E8E4DE"; }}
            >
              <HiShare size={14} color="#1C1917" />
            </button>
            <button onClick={handleToggleWishlist} title={liked ? "Remove from wishlist" : "Save"} aria-label={liked ? "Remove from wishlist" : "Save to wishlist"}
              className="pg-wishlist-desktop"
              style={{ width: "32px", height: "32px", borderRadius: "50%", border: `1.5px solid ${liked ? "#FF385C" : "#E8E4DE"}`, backgroundColor: liked ? "#FFF0F3" : "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "all 0.15s" }}
              onMouseEnter={(e) => { if (!liked) { e.currentTarget.style.backgroundColor = "#F9F7F4"; e.currentTarget.style.borderColor = "#1C1917"; }}}
              onMouseLeave={(e) => { if (!liked) { e.currentTarget.style.backgroundColor = "#fff"; e.currentTarget.style.borderColor = "#E8E4DE"; }}}
            >
              {liked ? <HiHeart size={14} color="#FF385C" /> : <HiOutlineHeart size={14} color="#1C1917" />}
            </button>
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${pg.location.latitude},${pg.location.longitude}`}
              target="_blank" rel="noopener noreferrer" title="Directions"
              style={{ width: "32px", height: "32px", borderRadius: "50%", border: "1.5px solid #E8E4DE", backgroundColor: "#fff", display: "flex", alignItems: "center", justifyContent: "center", textDecoration: "none", transition: "all 0.15s" }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#FFF0F3"; e.currentTarget.style.borderColor = "#FF385C"; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#fff"; e.currentTarget.style.borderColor = "#E8E4DE"; }}
            >
              <HiExternalLink size={14} color="#FF385C" />
            </a>
          </div>
        </div>

        <div className="pg-card-amenities" style={{ display: "flex", flexWrap: "wrap", gap: "6px", alignItems: "center" }}>
          <PGTypeLabel type={pg.pgType} />
          {pg.amenities.slice(0, 4).map((a) => (
            <span key={a} style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontFamily: "var(--font-body)", fontSize: "11px", fontWeight: "500", color: "#44403C", backgroundColor: "#F5F3F0", borderRadius: "100px", padding: "3px 10px", border: "1px solid #E8E4DE" }}>
              {AMENITY_ICONS[a] || null}{a}
            </span>
          ))}
          {pg.amenities.length > 4 && (
            <span style={{ fontFamily: "var(--font-body)", fontSize: "11px", color: "#FF385C" }}>+{pg.amenities.length - 4} more</span>
          )}
        </div>

        <p className="pg-card-desc" style={{ fontFamily: "var(--font-body)", fontSize: "13px", color: "#78716C", lineHeight: "1.6", overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
          {pg.description}
        </p>

        <div className="pg-card-footer" style={{ marginTop: "auto", paddingTop: "10px", borderTop: "1px solid #F0EDE8" }}>
          <div className="pg-price-row" style={{ display: "flex", alignItems: "flex-start", gap: "8px", flexWrap: "wrap", marginBottom: "12px" }}>
            {pg.rating > 0 && (
              <div className="pg-rating" style={{ display: "flex", alignItems: "center", gap: "4px", marginRight: "4px", paddingTop: "8px" }}>
                <HiStar size={14} color="#FF385C" />
                <span style={{ fontFamily: "var(--font-body)", fontSize: "13px", fontWeight: "600", color: "#1C1917" }}>{pg.rating.toFixed(1)}</span>
              </div>
            )}
            <div className="pg-share-chips" style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "6px" }}>
              {pg.sharingPrices.single !== undefined && (
                <div className="pg-share-chip" style={{ display: "flex", alignItems: "center", gap: "6px", backgroundColor: "#F9F7F4", border: "1px solid #E8E4DE", borderRadius: "8px", padding: "6px 12px" }}>
                  <span style={{ fontFamily: "var(--font-body)", fontSize: "11px", color: "#78716C", fontWeight: "500" }}>1 Share</span>
                  <span style={{ fontFamily: "var(--font-display)", fontSize: "16px", fontWeight: "700", color: "#1C1917", letterSpacing: "-0.3px" }}>₹{pg.sharingPrices.single.toLocaleString()}</span>
                  <span style={{ fontFamily: "var(--font-body)", fontSize: "10px", color: "#A8A29E" }}>/mo</span>
                </div>
              )}
              {pg.sharingPrices.double !== undefined && (
                <div className="pg-share-chip" style={{ display: "flex", alignItems: "center", gap: "6px", backgroundColor: "#F9F7F4", border: "1px solid #E8E4DE", borderRadius: "8px", padding: "6px 12px" }}>
                  <span style={{ fontFamily: "var(--font-body)", fontSize: "11px", color: "#78716C", fontWeight: "500" }}>2 Share</span>
                  <span style={{ fontFamily: "var(--font-display)", fontSize: "16px", fontWeight: "700", color: "#1C1917", letterSpacing: "-0.3px" }}>₹{pg.sharingPrices.double.toLocaleString()}</span>
                  <span style={{ fontFamily: "var(--font-body)", fontSize: "10px", color: "#A8A29E" }}>/mo</span>
                </div>
              )}
              {pg.sharingPrices.triple !== undefined && (
                <div className="pg-share-chip" style={{ display: "flex", alignItems: "center", gap: "6px", backgroundColor: "#F9F7F4", border: "1px solid #E8E4DE", borderRadius: "8px", padding: "6px 12px" }}>
                  <span style={{ fontFamily: "var(--font-body)", fontSize: "11px", color: "#78716C", fontWeight: "500" }}>3 Share</span>
                  <span style={{ fontFamily: "var(--font-display)", fontSize: "16px", fontWeight: "700", color: "#1C1917", letterSpacing: "-0.3px" }}>₹{pg.sharingPrices.triple.toLocaleString()}</span>
                  <span style={{ fontFamily: "var(--font-body)", fontSize: "10px", color: "#A8A29E" }}>/mo</span>
                </div>
              )}
            </div>
          </div>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            <button
              onClick={() => requireAuth(() => { window.location.href = `tel:${pg.owner.phone}`; })}
              style={{ flex: 1, textAlign: "center", fontFamily: "var(--font-body)", fontSize: "13px", fontWeight: "600", color: "#fff", border: "none", padding: "10px 14px", borderRadius: "100px", backgroundColor: "#FF385C", transition: "background 0.15s", whiteSpace: "nowrap", cursor: "pointer" }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#E31C5F")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#FF385C")}
            >Contact Owner</button>
            {pg.availableBeds === 0 ? (
              <button
                onClick={() => requireAuth(() => { window.location.href = `tel:${pg.owner.phone}`; })}
                style={{ flex: 1, textAlign: "center", fontFamily: "var(--font-body)", fontSize: "13px", fontWeight: "600", color: "#A8A29E", border: "1.5px solid #E8E4DE", padding: "10px 14px", borderRadius: "100px", backgroundColor: "#F5F3F0", transition: "all 0.2s", whiteSpace: "nowrap", cursor: "pointer", opacity: 0.7 }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = "1";
                  e.currentTarget.style.backgroundColor = "#FF385C";
                  e.currentTarget.style.color = "#fff";
                  e.currentTarget.style.border = "1.5px solid #FF385C";
                  e.currentTarget.textContent = "Contact Owner for Vacancy";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = "0.7";
                  e.currentTarget.style.backgroundColor = "#F5F3F0";
                  e.currentTarget.style.color = "#A8A29E";
                  e.currentTarget.style.border = "1.5px solid #E8E4DE";
                  e.currentTarget.textContent = "Book Now";
                }}
              >Book Now</button>
            ) : (
              <button
                onClick={() => requireAuth(() => router.push(`/pgs/${pg.objectId}?book=true`))}
                style={{ flex: 1, textAlign: "center", fontFamily: "var(--font-body)", fontSize: "13px", fontWeight: "600", color: "#FF385C", border: "1.5px solid #FF385C", padding: "10px 14px", borderRadius: "100px", backgroundColor: "#FFF0F3", transition: "all 0.15s", whiteSpace: "nowrap", cursor: "pointer" }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#FF385C"; e.currentTarget.style.color = "#fff"; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#FFF0F3"; e.currentTarget.style.color = "#FF385C"; }}
              >Book Now</button>
            )}
            <button
              onClick={() => requireAuth(() => router.push(`/pgs/${pg.objectId}`))}
              style={{ flex: 1, textAlign: "center", fontFamily: "var(--font-body)", fontSize: "13px", fontWeight: "600", color: "#1C1917", border: "1.5px solid #E8E4DE", padding: "10px 14px", borderRadius: "100px", backgroundColor: "#fff", transition: "background 0.15s", whiteSpace: "nowrap", cursor: "pointer" }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#F9F7F4")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#fff")}
            >View Details</button>
            <button
              className="pg-card-chevron-bottom"
              onClick={() => setExpanded(false)}
              aria-label="Show less"
              style={{
                display: "none",
                alignItems: "center", justifyContent: "center",
                width: "38px", height: "38px", flexShrink: 0,
                borderRadius: "50%", border: "1.5px solid #E8E4DE",
                background: "#fff", cursor: "pointer", padding: 0,
              }}
            >
              <HiChevronDown size={18} color="#1C1917" style={{ transform: "rotate(180deg)" }} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main page ────────────────────────────────────────────────────────────────
export default function PGsPage() {
  const router = useRouter();
  const { area, pgType } = router.query as Record<string, string>;

  const isComingSoon = area && NON_ACTIVE_CITIES.some((c) => c.toLowerCase() === area.toLowerCase());

  const [areaInput, setAreaInput]               = useState("");
  const [selectedPgType, setPgType]             = useState("any");
  const [occupancy, setOccupancy]               = useState<string[]>([]);
  const [maxPrice, setMaxPrice]                 = useState(MAX_PRICE_MAX);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [sortBy, setSortBy]                     = useState("best-rated");
  const [results, setResults]                   = useState<PG[]>([]);
  const [typeCounts, setTypeCounts]             = useState({ all: 0, boys: 0, girls: 0, coliving: 0 });
  const isLoading                               = useInitialLoading(500);

  useEffect(() => {
    if (!router.isReady) return;
    setAreaInput(isComingSoon ? "" : (area || ""));
    setPgType(pgType || "any");
  }, [router.isReady]);

  useEffect(() => {
    if (!router.isReady) return;

    const base = filterPGs({ area: areaInput, occupancy });

    const afterPrice = maxPrice < MAX_PRICE_MAX
      ? base.filter((pg) => pg.monthlyPrice <= maxPrice)
      : base;

    // "Food" in sidebar maps to "Meals" or "Food" in PG data
    const afterAmenities = selectedAmenities.length === 0 ? afterPrice : afterPrice.filter((pg) =>
      selectedAmenities.every((a) => {
        if (a === "Food") return pg.amenities.includes("Meals") || pg.amenities.includes("Food");
        return pg.amenities.includes(a);
      })
    );

    setTypeCounts({
      all:      afterAmenities.length,
      boys:     afterAmenities.filter((pg) => pg.pgType === "boys").length,
      girls:    afterAmenities.filter((pg) => pg.pgType === "girls").length,
      coliving: afterAmenities.filter((pg) => pg.pgType === "coliving").length,
    });

    const afterType = selectedPgType === "any"
      ? afterAmenities
      : afterAmenities.filter((pg) => pg.pgType === selectedPgType);

    const sorted = [...afterType];
    if (sortBy === "best-rated") sorted.sort((a, b) => b.rating - a.rating);
    else if (sortBy === "price-asc") sorted.sort((a, b) => a.monthlyPrice - b.monthlyPrice);
    else if (sortBy === "price-desc") sorted.sort((a, b) => b.monthlyPrice - a.monthlyPrice);

    setResults(sorted);
  }, [areaInput, selectedPgType, maxPrice, occupancy, selectedAmenities, sortBy, router.isReady]);

  function selectPgType(val: string) {
    setPgType(val);
    const q: Record<string, string> = {};
    if (areaInput) q.area = areaInput;
    if (val !== "any") q.pgType = val;
    router.replace({ pathname: "/pgs", query: q }, undefined, { shallow: true });
  }

  function toggleAmenity(a: string) {
    setSelectedAmenities((prev) => prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]);
  }

  function clearAll() {
    setAreaInput(""); setPgType("any");
    setOccupancy([]); setMaxPrice(MAX_PRICE_MAX);
    setSelectedAmenities([]); setSortBy("best-rated");
    router.replace({ pathname: "/pgs" }, undefined, { shallow: true });
  }

  const hasAnyFilter = !!(
    areaInput || selectedPgType !== "any" || occupancy.length ||
    maxPrice < MAX_PRICE_MAX || selectedAmenities.length
  );

  const PG_TABS = [
    { value: "any",      label: "All PGs",   count: typeCounts.all },
    { value: "boys",     label: "Boys",      count: typeCounts.boys },
    { value: "girls",    label: "Girls",     count: typeCounts.girls },
    { value: "coliving", label: "Co-Living", count: typeCounts.coliving },
  ];

  const maxPricePct = ((maxPrice - MAX_PRICE_MIN) / (MAX_PRICE_MAX - MAX_PRICE_MIN)) * 100;

  const SHARING_OPTIONS = [
    { value: "any",    label: "Any Sharing" },
    { value: "single", label: "Single" },
    { value: "double", label: "Double" },
    { value: "triple", label: "Triple" },
  ];

  // ── Coming Soon ──
  if (isComingSoon) {
    return (
      <>
        <Head><title>{area} — Coming Soon | Roomsy</title></Head>
        <Navbar />
        <main style={{ minHeight: "100vh", backgroundColor: "#F9F7F4", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px", paddingTop: "72px" }}>
          <div style={{ textAlign: "center", maxWidth: "480px" }}>
            <div style={{ width: "72px", height: "72px", borderRadius: "50%", backgroundColor: "#FFF0F3", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
              <HiLocationMarker size={32} color="#FF385C" />
            </div>
            <p style={{ fontFamily: "var(--font-body)", fontSize: "12px", fontWeight: "600", color: "#FF385C", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "12px" }}>Coming Soon</p>
            <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(28px,5vw,42px)", fontWeight: "600", color: "#1C1917", letterSpacing: "-0.5px", lineHeight: "1.2", marginBottom: "16px" }}>We're launching in {area}!</h1>
            <p style={{ fontFamily: "var(--font-body)", fontSize: "15px", color: "#78716C", lineHeight: "1.7", marginBottom: "32px" }}>Roomsy is currently live in {ACTIVE_CITY}. We're working hard to bring verified PGs to {area} very soon.</p>
            <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
              <Link href="/" style={{ fontFamily: "var(--font-body)", fontSize: "14px", fontWeight: "600", color: "#1C1917", textDecoration: "none", padding: "12px 24px", borderRadius: "100px", border: "1.5px solid #E8E4DE", backgroundColor: "#fff" }}>← Back to Home</Link>
              <Link href="/pgs" style={{ fontFamily: "var(--font-body)", fontSize: "14px", fontWeight: "600", color: "#fff", textDecoration: "none", padding: "12px 24px", borderRadius: "100px", backgroundColor: "#FF385C" }}>Browse Hyderabad PGs</Link>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Head><title>PGs in Hyderabad — Roomsy</title></Head>
      <Navbar />

      <main className="pgs-main" style={{ minHeight: "100vh", backgroundColor: "#F0EDE8", paddingTop: "72px" }}>

        {/* ── PG Type Tab Bar ── */}
        <div className="pg-tab-wrap" style={{ backgroundColor: "#fff", borderBottom: "1px solid #E8E4DE", position: "sticky", top: "72px", zIndex: 40 }}>
          <div className="pg-tab-bar" style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 24px", display: "flex", alignItems: "center", gap: "4px" }}>
            {PG_TABS.map((tab) => {
              const active = selectedPgType === tab.value;
              return (
                <button
                  key={tab.value}
                  onClick={() => selectPgType(tab.value)}
                  className="pg-tab"
                  style={{
                    display: "flex", alignItems: "center", gap: "8px",
                    padding: "16px 20px", background: "none", border: "none", cursor: "pointer",
                    borderBottom: active ? "2px solid #FF385C" : "2px solid transparent",
                    marginBottom: "-1px", transition: "all 0.15s",
                    flexShrink: 0,
                  }}
                >
                  <span style={{ fontFamily: "var(--font-body)", fontSize: "14px", fontWeight: active ? "700" : "500", color: active ? "#1C1917" : "#78716C", transition: "color 0.15s" }}>
                    {tab.label}
                  </span>
                  <span style={{ fontFamily: "var(--font-body)", fontSize: "12px", fontWeight: "600", color: active ? "#FF385C" : "#A8A29E", backgroundColor: active ? "#FFF0F3" : "#F0EDE8", borderRadius: "100px", padding: "2px 8px", transition: "all 0.15s" }}>
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Body: sidebar + list */}
        <div className="pg-body" style={{ maxWidth: "1280px", margin: "0 auto", padding: "28px 24px 64px", display: "flex", gap: "24px", alignItems: "flex-start" }}>

          {/* ── Sidebar ── */}
          <aside
            className="pg-sidebar"
            style={{ width: "240px", flexShrink: 0, alignSelf: "flex-start", position: "sticky", top: "140px", display: "flex", flexDirection: "column", gap: "8px" }}
          >

            {/* LOCATION */}
            <SidebarCard>
              <p style={{ fontFamily: "var(--font-body)", fontSize: "11px", fontWeight: "700", color: "#78716C", letterSpacing: "1px", textTransform: "uppercase", marginBottom: "8px" }}>Location</p>
              <div style={{ position: "relative" }}>
                <HiLocationMarker size={14} color="#A8A29E" style={{ position: "absolute", left: "11px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                <input
                  type="text"
                  placeholder="Area or landmark"
                  value={areaInput}
                  onChange={(e) => setAreaInput(e.target.value)}
                  style={{ width: "100%", padding: "9px 12px 9px 32px", border: "none", borderRadius: "9px", fontFamily: "var(--font-body)", fontSize: "13px", color: "#44403C", outline: "none", boxSizing: "border-box", backgroundColor: "#F0EDE8" }}
                />
              </div>
            </SidebarCard>

            {/* SHARING TYPE */}
            <SidebarCard>
              <p style={{ fontFamily: "var(--font-body)", fontSize: "11px", fontWeight: "700", color: "#78716C", letterSpacing: "1px", textTransform: "uppercase", marginBottom: "8px" }}>Sharing Type</p>
              <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                {SHARING_OPTIONS.map((o) => {
                  const isAny = o.value === "any";
                  const selected = isAny ? occupancy.length === 0 : occupancy.includes(o.value);
                  return (
                    <button
                      key={o.value}
                      onClick={() => {
                        if (isAny) { setOccupancy([]); }
                        else {
                          setOccupancy((prev) =>
                            prev.includes(o.value) ? prev.filter((x) => x !== o.value) : [...prev, o.value]
                          );
                        }
                      }}
                      style={{
                        width: "100%", padding: "8px 12px", borderRadius: "9px",
                        display: "flex", alignItems: "center", justifyContent: "space-between",
                        border: selected ? "1.5px solid #FF385C" : "1.5px solid transparent",
                        backgroundColor: selected ? "#FFF0F3" : "#F0EDE8",
                        color: selected ? "#FF385C" : "#44403C",
                        fontFamily: "var(--font-body)", fontSize: "13px",
                        fontWeight: selected ? "600" : "500",
                        cursor: "pointer", transition: "all 0.15s", textAlign: "left",
                      }}
                    >
                      {o.label}
                      {selected && (
                        <svg width="14" height="11" viewBox="0 0 14 11" fill="none">
                          <path d="M1 5.5L5 9.5L13 1.5" stroke="#FF385C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </button>
                  );
                })}
              </div>
            </SidebarCard>

            {/* MAX PRICE */}
            <SidebarCard>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                <p style={{ fontFamily: "var(--font-body)", fontSize: "11px", fontWeight: "700", color: "#78716C", letterSpacing: "1px", textTransform: "uppercase", margin: 0 }}>Max Price</p>
                <span style={{ fontFamily: "var(--font-display)", fontSize: "15px", fontWeight: "700", color: "#FF385C" }}>
                  {maxPrice >= MAX_PRICE_MAX ? "Any" : `₹${maxPrice.toLocaleString()}`}
                </span>
              </div>
              <input
                type="range"
                className="max-price-slider"
                min={MAX_PRICE_MIN} max={MAX_PRICE_MAX} step={500}
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                style={{
                  width: "100%",
                  background: `linear-gradient(to right, #FF385C 0%, #FF385C ${maxPricePct}%, #D6D3CE ${maxPricePct}%, #D6D3CE 100%)`,
                }}
              />
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: "10px" }}>
                <span style={{ fontFamily: "var(--font-body)", fontSize: "12px", color: "#78716C" }}>₹3,000</span>
                <span style={{ fontFamily: "var(--font-body)", fontSize: "12px", color: "#78716C" }}>₹20,000</span>
              </div>
            </SidebarCard>

            {/* AMENITIES */}
            <SidebarCard>
              <p style={{ fontFamily: "var(--font-body)", fontSize: "11px", fontWeight: "700", color: "#78716C", letterSpacing: "1px", textTransform: "uppercase", marginBottom: "8px" }}>Amenities</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {SIDEBAR_AMENITIES.map(({ label, icon }) => {
                  const sel = selectedAmenities.includes(label);
                  return (
                    <button
                      key={label}
                      onClick={() => toggleAmenity(label)}
                      style={{
                        display: "inline-flex", alignItems: "center", gap: "5px",
                        padding: "7px 12px", borderRadius: "100px",
                        border: sel ? "1.5px solid #FF385C" : "1.5px solid #E8E4DE",
                        backgroundColor: sel ? "#FFF0F3" : "#F5F3F0",
                        color: sel ? "#FF385C" : "#44403C",
                        fontFamily: "var(--font-body)", fontSize: "13px",
                        fontWeight: sel ? "600" : "500",
                        cursor: "pointer", transition: "all 0.15s",
                      }}
                    >
                      {icon}{label}
                    </button>
                  );
                })}
              </div>
            </SidebarCard>

            {/* Clear all */}
            {hasAnyFilter && (
              <button
                onClick={clearAll}
                style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", padding: "11px 14px", borderRadius: "12px", border: "none", backgroundColor: "#fff", boxShadow: "0 1px 6px rgba(0,0,0,0.07)", fontFamily: "var(--font-body)", fontSize: "13px", color: "#78716C", cursor: "pointer", width: "100%", transition: "background 0.15s" }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#F9F7F4")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#fff")}
              >
                <HiX size={12} /> Clear all filters
              </button>
            )}
          </aside>

          {/* ── Results ── */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="pg-results-header" style={{ marginBottom: "18px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "nowrap", gap: "8px" }}>
              <h1 className="pg-results-heading" style={{ fontFamily: "var(--font-display)", fontSize: "20px", fontWeight: "600", color: "#1C1917", letterSpacing: "-0.3px", margin: 0 }}>
                <span style={{ color: "#FF385C", marginRight: "6px" }}>{results.length}</span>
                PGs found in Hyderabad
              </h1>
              <select
                className="pg-sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={{ padding: "9px 14px", border: "1.5px solid #E8E4DE", borderRadius: "10px", fontFamily: "var(--font-body)", fontSize: "13px", color: "#1C1917", backgroundColor: "#fff", outline: "none", cursor: "pointer" }}
              >
                <option value="best-rated">Best Rated</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>
            </div>

            {isLoading ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {Array.from({ length: 4 }).map((_, i) => <PGCardSkeleton key={i} />)}
              </div>
            ) : results.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {results.map((pg) => <PGListCard key={pg.objectId} pg={pg} />)}
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: "80px 24px" }}>
                <div style={{ fontSize: "44px", marginBottom: "14px" }}>🔍</div>
                <h2 style={{ fontFamily: "var(--font-display)", fontSize: "20px", fontWeight: "600", color: "#1C1917", marginBottom: "8px" }}>No PGs match your filters</h2>
                <p style={{ fontFamily: "var(--font-body)", fontSize: "14px", color: "#78716C", marginBottom: "20px" }}>Try adjusting the area, type, or sidebar filters.</p>
                <button onClick={clearAll} style={{ padding: "11px 24px", borderRadius: "100px", backgroundColor: "#FF385C", color: "#fff", border: "none", fontFamily: "var(--font-body)", fontSize: "14px", fontWeight: "600", cursor: "pointer" }}>Clear filters</button>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />

      <style>{`
        /* ── Desktop polish (≥769px) ─────────────────────────── */
        @media (min-width: 769px) {
          .pg-list-card {
            transition: transform 0.25s cubic-bezier(0.22, 1, 0.36, 1),
                        box-shadow 0.25s cubic-bezier(0.22, 1, 0.36, 1),
                        border-color 0.25s ease !important;
          }
          .pg-list-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 12px 32px rgba(28,25,23,0.08) !important;
            border-color: #DCD5CC !important;
          }
          .pg-list-card .pg-card-img-frame img {
            transition: transform 0.7s cubic-bezier(0.22, 1, 0.36, 1) !important;
          }
          .pg-list-card:hover .pg-card-img-frame img {
            transform: scale(1.04);
          }

          /* Sidebar: a quieter card style */
          .pg-sidebar > div {
            transition: box-shadow 0.2s ease, transform 0.2s ease !important;
          }
          .pg-sidebar input,
          .pg-sidebar select {
            transition: background 0.15s ease, box-shadow 0.15s ease !important;
          }
          .pg-sidebar input:focus {
            background: #fff !important;
            box-shadow: 0 0 0 3px rgba(255,56,92,0.12);
          }

          /* Tab bar — subtle hover */
          .pg-tab {
            transition: background 0.15s ease, color 0.15s ease !important;
            position: relative;
          }
          .pg-tab:hover { background: rgba(245,243,240,0.6) !important; }

          /* Sort select — refined hover */
          .pg-sort-select {
            transition: border-color 0.15s ease, box-shadow 0.15s ease !important;
          }
          .pg-sort-select:hover { border-color: #1C1917 !important; }
          .pg-sort-select:focus {
            border-color: #FF385C !important;
            box-shadow: 0 0 0 3px rgba(255,56,92,0.12);
          }
        }

        /* Single max-price slider */
        .max-price-slider {
          -webkit-appearance: none;
          appearance: none;
          height: 5px;
          border-radius: 3px;
          outline: none;
          cursor: pointer;
          display: block;
        }
        .max-price-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #FF385C;
          cursor: pointer;
          border: 3px solid #fff;
          box-shadow: 0 1px 5px rgba(0,0,0,0.22);
          transition: transform 0.1s;
        }
        .max-price-slider::-webkit-slider-thumb:hover { transform: scale(1.15); }
        .max-price-slider::-moz-range-thumb {
          width: 20px; height: 20px; border-radius: 50%;
          background: #FF385C; cursor: pointer;
          border: 3px solid #fff; box-shadow: 0 1px 5px rgba(0,0,0,0.22);
        }

        @media (max-width: 768px) {
          .pg-sidebar { display: none !important; }
          .pg-list-card { flex-direction: column !important; }
          .pg-card-img { width: 100% !important; }
          .pg-wishlist-mobile { display: flex !important; }
          .pg-wishlist-desktop { display: none !important; }

          /* Tab bar: fit all 4 tabs across screen, no scroll */
          .pg-tab-bar {
            padding: 0 4px !important;
            gap: 0 !important;
            overflow: hidden;
          }
          .pg-tab {
            flex: 1 1 0 !important;
            min-width: 0 !important;
            padding: 12px 4px !important;
            gap: 4px !important;
            justify-content: center !important;
          }
          .pg-tab span:first-child {
            font-size: 12px !important;
            white-space: nowrap;
          }
          .pg-tab span:last-child {
            font-size: 10px !important;
            padding: 1px 6px !important;
          }

          /* Body: remove side gutter so cards fill the screen */
          .pg-body {
            padding: 16px 8px 48px !important;
            gap: 0 !important;
          }

          /* Collapsed card: hide everything except name + location + cheapest price */
          .pg-list-card.collapsed .pg-card-actions,
          .pg-list-card.collapsed .pg-card-amenities,
          .pg-list-card.collapsed .pg-card-desc,
          .pg-list-card.collapsed .pg-card-footer {
            display: none !important;
          }
          .pg-list-card.collapsed .pg-collapsed-price {
            display: inline-flex !important;
          }
          /* Chevron sits next to the name when collapsed,
             and beside View Details once expanded */
          .pg-list-card.collapsed .pg-card-chevron { display: flex !important; }
          .pg-list-card.expanded .pg-card-chevron-bottom { display: flex !important; }
        }

        /* Navbar shrinks to 60px under 640px — match it to remove the gap */
        @media (max-width: 640px) {
          .pgs-main { padding-top: 60px !important; }
          .pg-tab-wrap { top: 60px !important; }

          /* ── Refined PG card on mobile ────────────────────────── */
          .pg-list-card {
            border: 1px solid #EFEAE3 !important;
            border-radius: 14px !important;
            box-shadow: 0 1px 2px rgba(28,25,23,0.04) !important;
          }
          .pg-card-img-frame { height: 160px !important; }

          /* Hide image-side noise on collapsed cards */
          .pg-list-card.collapsed .pg-thumbnails { display: none !important; }
          .pg-list-card.collapsed .pg-verified-badge {
            top: 8px !important;
            left: 8px !important;
            padding: 2px 8px !important;
            background: rgba(255,255,255,0.85) !important;
            backdrop-filter: blur(6px);
          }
          .pg-list-card.collapsed .pg-verified-badge span:last-child { font-size: 9px !important; }

          /* Bed strip becomes a glass pill anchored to image bottom-left */
          .pg-list-card.collapsed .pg-card-img { position: relative !important; }
          .pg-list-card.collapsed .pg-bed-strip {
            position: absolute !important;
            bottom: 8px !important;
            left: 8px !important;
            margin: 0 !important;
            padding: 4px 10px !important;
            border-radius: 100px !important;
            backdrop-filter: blur(8px);
            -webkit-backdrop-filter: blur(8px);
          }
          .pg-list-card.collapsed .pg-bed-strip-ok { background: rgba(255,255,255,0.85) !important; }
          .pg-list-card.collapsed .pg-bed-strip-low { background: rgba(254,243,199,0.92) !important; }
          .pg-list-card.collapsed .pg-bed-strip-full { background: rgba(254,226,226,0.92) !important; }
          .pg-list-card.collapsed .pg-bed-strip span:last-child {
            font-size: 10px !important;
            font-weight: 600 !important;
          }

          /* Card body — quieter typography, tighter rhythm */
          .pg-list-card .pg-card-img + div {
            padding: 14px 14px 14px !important;
            gap: 6px !important;
          }
          .pg-list-card h2 {
            font-size: 16px !important;
            letter-spacing: -0.2px !important;
            margin-bottom: 2px !important;
            font-weight: 600 !important;
          }
          .pg-list-card .pg-card-img + div > div:first-child > div:first-child > div:nth-child(2) span {
            /* location text, calmer */
            font-size: 11px !important;
            color: #8A847C !important;
          }

          /* Cheapest-price line — flat inline, not a chip */
          .pg-list-card.collapsed .pg-collapsed-price {
            margin-top: 6px !important;
            gap: 4px !important;
          }
          .pg-list-card.collapsed .pg-collapsed-price span:first-child {
            font-size: 10px !important;
            color: #A8A29E !important;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            font-weight: 600 !important;
          }
          .pg-list-card.collapsed .pg-collapsed-price span:nth-child(2) {
            font-size: 16px !important;
            color: #1C1917 !important;
          }
          .pg-list-card.collapsed .pg-collapsed-price span:last-child {
            font-size: 10px !important;
          }

          /* Chevron — flat, no border circle */
          .pg-card-chevron {
            width: 30px !important;
            height: 30px !important;
            border: none !important;
            background: transparent !important;
          }
          .pg-card-chevron:active { background: #F5F3F0 !important; }

          /* Compact "Best Rated" select, pinned to the right */
          .pg-results-heading { font-size: 16px !important; }
          .pg-sort-select {
            padding: 6px 8px !important;
            font-size: 11px !important;
            border-radius: 8px !important;
            margin-left: auto;
            max-width: 130px;
          }

          /* Stack share-price chips in a column aligned next to rating */
          .pg-share-chips {
            flex-direction: column !important;
            align-items: stretch !important;
            flex: 1 1 0 !important;
            min-width: 0;
            gap: 6px !important;
          }
          .pg-share-chip {
            width: 100%;
            justify-content: space-between;
          }

          /* Results header refinements */
          .pg-results-header {
            margin-bottom: 12px !important;
          }
          .pg-results-heading {
            font-size: 14px !important;
            font-weight: 500 !important;
            color: #44403C !important;
            font-family: var(--font-body) !important;
            letter-spacing: 0 !important;
          }
          .pg-results-heading span { font-weight: 700 !important; color: #1C1917 !important; }

        }
      `}</style>
    </>
  );
}
