import { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";
import { useAuthStore } from "@/store/useAuthStore";
import { getPGsForOwner } from "@/lib/pgService";
import { getBookingsForOwner, StoredBooking } from "@/lib/bookingService";
import { PG } from "@/types/pg";
import {
  HiHome, HiClipboardList, HiPhotograph, HiSparkles,
  HiOfficeBuilding, HiTrendingUp, HiClock, HiCheckCircle,
  HiChevronRight, HiLocationMarker, HiBadgeCheck,
  HiExclamationCircle, HiCurrencyRupee, HiX, HiOutlineBell,
  HiOutlineLogout, HiOutlineMenu, HiOutlineUser, HiArrowLeft,
} from "react-icons/hi";
import toast from "react-hot-toast";
import NotificationBell from "@/components/common/NotificationBell";
import { MdMeetingRoom } from "react-icons/md";

const NAV_ITEMS = [
  { href: "/pg-admin/dashboard", label: "Dashboard", icon: <HiHome size={20} />,          iconSm: <HiHome size={22} /> },
  { href: "/pg-admin/my-pgs",    label: "My PGs",    icon: <HiOfficeBuilding size={20} />, iconSm: <HiOfficeBuilding size={22} /> },
  { href: "/pg-admin/bookings",  label: "Bookings",  icon: <HiClipboardList size={20} />,  iconSm: <HiClipboardList size={22} /> },
  { href: "/pg-admin/earnings",  label: "Earnings",  icon: <HiCurrencyRupee size={20} />,  iconSm: <HiCurrencyRupee size={22} /> },
  { href: "/pg-admin/rooms",     label: "Rooms",     icon: <MdMeetingRoom size={20} />,    iconSm: <MdMeetingRoom size={22} /> },
  { href: "/pg-admin/photos",    label: "Photos",    icon: <HiPhotograph size={20} />,     iconSm: <HiPhotograph size={22} /> },
  { href: "/pg-admin/amenities", label: "Amenities", icon: <HiSparkles size={20} />,       iconSm: <HiSparkles size={22} /> },
];

const TYPE_LABEL: Record<string, string> = { boys: "Boys", girls: "Girls", coliving: "Co-living" };
const TYPE_COLOR: Record<string, string> = { boys: "#3B82F6", girls: "#EC4899", coliving: "#8B5CF6" };

const SHARING_LABEL: Record<string, string> = {
  single: "Single Room",
  double: "2 Sharing",
  triple: "3 Sharing",
};

function formatDate(d: string) {
  if (!d) return "—";
  const [y, m, day] = d.split("-").map(Number);
  return new Date(y, m - 1, day).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
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

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const h = Math.floor(diff / 3600000);
  if (h < 1) return "just now";
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function getInitials(name?: string) {
  if (!name) return "U";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "U";
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function LogoutModal({ onCancel, onConfirm }: { onCancel: () => void; onConfirm: () => void }) {
  return (
    <div
      style={{ position: "fixed", inset: 0, zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}
      onClick={onCancel}
    >
      <div style={{ position: "absolute", inset: 0, backgroundColor: "rgba(0,0,0,0.45)", backdropFilter: "blur(6px)" }} />
      <div
        style={{ position: "relative", backgroundColor: "#fff", borderRadius: "20px", padding: "32px 28px", width: "100%", maxWidth: "360px", boxShadow: "0 24px 60px rgba(0,0,0,0.2)", textAlign: "center" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ width: "52px", height: "52px", borderRadius: "50%", backgroundColor: "#FEF2F2", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 18px" }}>
          <span style={{ fontSize: "22px" }}>👋</span>
        </div>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: "20px", fontWeight: "600", color: "#1C1917", letterSpacing: "-0.3px", marginBottom: "8px" }}>Log out?</h2>
        <p style={{ fontFamily: "var(--font-body)", fontSize: "14px", color: "#78716C", marginBottom: "24px", lineHeight: 1.6 }}>
          You&apos;ll be signed out of your Owner Panel.
        </p>
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            onClick={onCancel}
            style={{ flex: 1, padding: "12px", borderRadius: "100px", border: "1.5px solid #E8E4DE", backgroundColor: "#fff", fontFamily: "var(--font-body)", fontSize: "14px", fontWeight: "600", color: "#1C1917", cursor: "pointer" }}
          >
            Stay
          </button>
          <button
            onClick={onConfirm}
            style={{ flex: 1, padding: "12px", borderRadius: "100px", border: "none", backgroundColor: "#DC2626", fontFamily: "var(--font-body)", fontSize: "14px", fontWeight: "700", color: "#fff", cursor: "pointer" }}
          >
            Log out
          </button>
        </div>
      </div>
    </div>
  );
}

function Sidebar({ active }: { active: string }) {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const [confirmLogout, setConfirmLogout] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    if (!drawerOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [drawerOpen]);

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="pg-sidebar">
        <div className="pg-sidebar-head">
          <Link href="/pg-admin/dashboard" className="pg-sidebar-brand">
            <div className="pg-sidebar-logo">R</div>
            <span>Roomsy</span>
          </Link>
        </div>

        <div style={{ padding: "0 14px", marginBottom: "8px" }}>
          <p style={{ fontFamily: "var(--font-body)", fontSize: "11px", fontWeight: "700", color: "#A8A29E", letterSpacing: "1px", textTransform: "uppercase", padding: "0 10px", marginBottom: "6px" }}>
            Owner Panel
          </p>
          {NAV_ITEMS.map((item) => {
            const isActive = active === item.href || (item.href !== "/pg-admin/dashboard" && active.startsWith(item.href));
            return (
              <Link key={item.href} href={item.href} style={{
                display: "flex", alignItems: "center", gap: "10px",
                padding: "7px 12px", borderRadius: "10px", textDecoration: "none",
                backgroundColor: isActive ? "#FFF0F3" : "transparent",
                color: isActive ? "#FF385C" : "#1C1917",
                fontFamily: "var(--font-body)", fontSize: "14px",
                fontWeight: isActive ? "600" : "500", marginBottom: "1px",
                transition: "all 0.15s",
              }}
              onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.backgroundColor = "#F9F7F4"; }}
              onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.backgroundColor = "transparent"; }}
              >
                <span style={{ color: isActive ? "#FF385C" : "#78716C" }}>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </div>

        {(() => {
          const isProfileActive = active === "/profile";
          return (
            <div style={{ marginTop: "auto", padding: "0 14px 8px" }}>
              <p style={{ fontFamily: "var(--font-body)", fontSize: "11px", fontWeight: "700", color: "#A8A29E", letterSpacing: "1px", textTransform: "uppercase", padding: "0 10px", marginBottom: "6px" }}>
                Account
              </p>
              <Link href="/profile" style={{
                display: "flex", alignItems: "center", gap: "12px",
                padding: "11px 14px", borderRadius: "11px", textDecoration: "none",
                backgroundColor: isProfileActive ? "#FFF0F3" : "transparent",
                color: isProfileActive ? "#FF385C" : "#1C1917",
                fontFamily: "var(--font-body)", fontSize: "15px",
                fontWeight: isProfileActive ? "600" : "500",
                transition: "all 0.15s",
              }}
              onMouseEnter={(e) => { if (!isProfileActive) e.currentTarget.style.backgroundColor = "#F9F7F4"; }}
              onMouseLeave={(e) => { if (!isProfileActive) e.currentTarget.style.backgroundColor = "transparent"; }}
              >
                <span style={{ color: isProfileActive ? "#FF385C" : "#78716C" }}><HiOutlineUser size={20} /></span>
                My Profile
              </Link>
            </div>
          );
        })()}

        <button
          onClick={() => setConfirmLogout(true)}
          className="pg-sidebar-profile"
          aria-label="Account · log out"
        >
          <div className="pg-sidebar-profile-avatar">
            {user?.profilePic ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.profilePic} alt={user.name || "Profile"} />
            ) : (
              <span>{getInitials(user?.name || user?.email)}</span>
            )}
          </div>
          <div className="pg-sidebar-profile-text">
            <p className="pg-sidebar-profile-name">{user?.name || "Owner"}</p>
            <p className="pg-sidebar-profile-email">{user?.email || ""}</p>
          </div>
          <span className="pg-sidebar-profile-logout" aria-hidden>
            <HiOutlineLogout size={18} />
          </span>
        </button>
      </aside>

      {/* Mobile top bar */}
      <div className="pg-mobile-topbar">
        <div className="pg-topbar-left">
          <button
            onClick={() => setDrawerOpen(true)}
            aria-label="Open menu"
            className="pg-topbar-menu"
          >
            <HiOutlineMenu size={22} />
          </button>
          <Link href="/pg-admin/dashboard" className="pg-topbar-brand">
            <div className="pg-topbar-logo">R</div>
            <span>Roomsy</span>
          </Link>
        </div>
        <div className="pg-topbar-right">
          <NotificationBell />
        </div>
      </div>

      {/* Mobile drawer */}
      {drawerOpen && (
        <>
          <div
            className="pg-drawer-overlay"
            onClick={() => setDrawerOpen(false)}
          />
          <aside className="pg-drawer">
            <header className="pg-drawer-head">
              <span className="pg-drawer-blob pg-drawer-blob-1" />
              <span className="pg-drawer-blob pg-drawer-blob-2" />
              <Link
                href="/profile"
                onClick={() => setDrawerOpen(false)}
                aria-label="Open my profile"
                className="pg-drawer-avatar"
              >
                {user?.profilePic ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={user.profilePic} alt={user.name || "Profile"} />
                ) : (
                  <span>{getInitials(user?.name || user?.email)}</span>
                )}
              </Link>
              <Link
                href="/profile"
                onClick={() => setDrawerOpen(false)}
                className="pg-drawer-head-text"
              >
                <p className="pg-drawer-greet">Welcome back</p>
                <p className="pg-drawer-name">{user?.name || "Owner"}</p>
              </Link>
              <button
                onClick={() => setDrawerOpen(false)}
                aria-label="Close menu"
                className="pg-drawer-close"
              >
                <HiX size={20} />
              </button>
            </header>

            <nav className="pg-drawer-nav">
              <p className="pg-drawer-section">Owner Panel</p>
              {NAV_ITEMS.map((item) => {
                const isActive = active === item.href || (item.href !== "/pg-admin/dashboard" && active.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setDrawerOpen(false)}
                    className={`pg-drawer-link ${isActive ? "is-active" : ""}`}
                  >
                    <span className="pg-drawer-link-icon">{item.icon}</span>
                    <span className="pg-drawer-link-text">{item.label}</span>
                    <HiChevronRight size={16} className="pg-drawer-link-chev" />
                  </Link>
                );
              })}

              <p className="pg-drawer-section" style={{ marginTop: "14px" }}>Account</p>
              <Link
                href="/profile"
                onClick={() => setDrawerOpen(false)}
                className={`pg-drawer-link ${active === "/profile" ? "is-active" : ""}`}
              >
                <span className="pg-drawer-link-icon"><HiOutlineUser size={18} /></span>
                <span className="pg-drawer-link-text">My Profile</span>
                <HiChevronRight size={16} className="pg-drawer-link-chev" />
              </Link>
            </nav>

            <div className="pg-drawer-foot">
              <button
                onClick={() => { setDrawerOpen(false); setConfirmLogout(true); }}
                className="pg-drawer-logout"
              >
                <span className="pg-drawer-link-icon"><HiOutlineLogout size={18} /></span>
                Log out
              </button>
            </div>
          </aside>
        </>
      )}

      {confirmLogout && (
        <LogoutModal
          onCancel={() => setConfirmLogout(false)}
          onConfirm={() => { logout(); setConfirmLogout(false); router.push("/"); }}
        />
      )}
    </>
  );
}

export { Sidebar };

export default function PGAdminDashboard() {
  const router = useRouter();
  const { user, hydrated } = useAuthStore();
  const [pgs, setPGs] = useState<PG[]>([]);
  const [bookings, setBookings] = useState<StoredBooking[]>([]);

  useEffect(() => {
    if (!hydrated) return;
    if (!user) { router.replace("/"); return; }
    if (user.role !== "pg_admin") { router.replace("/"); return; }
    let cancelled = false;
    getPGsForOwner(user.objectId).then((rows) => { if (!cancelled) setPGs(rows); }).catch(() => {});
    getBookingsForOwner(user.objectId).then((rows) => { if (!cancelled) setBookings(rows); }).catch(() => {});
    return () => { cancelled = true; };
  }, [user, hydrated]);

  if (!user || user.role !== "pg_admin") return null;

  const pendingCount   = bookings.filter((b) => b.status === "pending").length;
  const confirmedCount = bookings.filter((b) => b.status === "confirmed").length;
  const totalRevenue   = bookings.filter((b) => b.status === "confirmed" || b.status === "completed").reduce((s, b) => s + b.total, 0);
  const pendingBookings = bookings.filter((b) => b.status === "pending").slice(0, 4);

  const kpis = [
    { label: "My PGs",           value: String(pgs.length),                     icon: <HiOfficeBuilding size={20} />, color: "#6366F1", href: undefined },
    { label: "Pending",          value: String(pendingCount),                   icon: <HiClock size={20} />,          color: "#F59E0B", urgent: pendingCount > 0, href: "/pg-admin/bookings" },
    { label: "Confirmed",        value: String(confirmedCount),                 icon: <HiCheckCircle size={20} />,    color: "#10B981", href: "/pg-admin/bookings?tab=confirmed" },
    { label: "Earnings",         value: `₹${totalRevenue.toLocaleString()}`,    icon: <HiTrendingUp size={20} />,     color: "#FF385C", href: "/pg-admin/earnings" },
  ];

  return (
    <>
      <Head><title>Dashboard — Roomsy Owner</title></Head>

      <div className="pg-layout">
        <Sidebar active="/pg-admin/dashboard" />

        <main className="pg-main">
          <div className="dash-hero-bar">
            <div className="dash-hero-text">
              <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(18px,3vw,24px)", fontWeight: "700", color: "#fff", letterSpacing: "-0.5px", marginBottom: "4px" }}>
                Welcome, {user.name.split(" ")[0]}!
              </h1>
              <p style={{ fontFamily: "var(--font-body)", fontSize: "14px", color: "rgba(255,255,255,0.72)", margin: 0 }}>
                Here&apos;s what&apos;s happening with your PGs today.
              </p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <NotificationBell iconColor="#fff" hoverBg="rgba(255,255,255,0.12)" size={40} />
              <Link
                href="/profile"
                aria-label="My Profile"
                title="My Profile"
                className="dash-hero-avatar"
              >
                {user.profilePic ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={user.profilePic} alt={user.name || "Profile"} />
                ) : (
                  <span>{getInitials(user.name || user.email)}</span>
                )}
              </Link>
            </div>
          </div>

          <div className="pg-content">

            {/* KPI cards */}
            <div className="kpi-grid">
              {kpis.map((k) => {
                const inner = (
                  <>
                    <div className="kpi-head">
                      <div className="kpi-icon" style={{ backgroundColor: `${k.color}15`, color: k.color }}>
                        {k.icon}
                      </div>
                      {k.urgent && <HiExclamationCircle size={15} color="#F59E0B" />}
                      {k.href && !k.urgent && <HiChevronRight size={14} color="#C8C4BE" />}
                    </div>
                    <div className="kpi-value">{k.value}</div>
                    <div className="kpi-label">{k.label}</div>
                  </>
                );
                const baseStyle: React.CSSProperties = {
                  backgroundColor: "#fff",
                  border: `1px solid ${k.urgent ? "#FDE68A" : "#E8E4DE"}`,
                  borderRadius: "16px",
                  boxShadow: k.urgent ? "0 0 0 3px rgba(245,158,11,0.1)" : "0 1px 3px rgba(0,0,0,0.04)",
                  textDecoration: "none",
                  display: "block",
                  transition: "box-shadow 0.15s, transform 0.15s",
                };
                return k.href ? (
                  <Link key={k.label} href={k.href} className="kpi-card" style={baseStyle}
                    onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.09)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.04)"; e.currentTarget.style.transform = "none"; }}
                  >{inner}</Link>
                ) : (
                  <div key={k.label} className="kpi-card" style={baseStyle}>{inner}</div>
                );
              })}
            </div>

            {/* My PGs */}
            <section style={{ marginBottom: "32px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
                <h2 style={{ fontFamily: "var(--font-display)", fontSize: "17px", fontWeight: "600", color: "#1C1917" }}>My PGs</h2>
                <Link href="/pg-admin/my-pgs" style={{ fontFamily: "var(--font-body)", fontSize: "13px", color: "#FF385C", textDecoration: "none", fontWeight: "500" }}>
                  View all →
                </Link>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {pgs.map((pg) => (
                  <Link key={pg.objectId} href={`/pg-admin/my-pgs/${pg.objectId}`} style={{ textDecoration: "none" }}>
                    <div className="pg-row"
                      onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.boxShadow = "0 4px 14px rgba(0,0,0,0.08)"; (e.currentTarget as HTMLDivElement).style.transform = "translateY(-1px)"; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.boxShadow = "none"; (e.currentTarget as HTMLDivElement).style.transform = "none"; }}
                    >
                      <div style={{ width: "48px", height: "48px", borderRadius: "10px", overflow: "hidden", flexShrink: 0, backgroundColor: "#F0EDE8", position: "relative" }}>
                        {pg.photos[0] ? (
                          <Image src={pg.photos[0]} alt={pg.name} fill style={{ objectFit: "cover" }} />
                        ) : (
                          <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <HiOfficeBuilding size={20} color="#D6D3CE" />
                          </div>
                        )}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontFamily: "var(--font-display)", fontSize: "14px", fontWeight: "600", color: "#1C1917", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginBottom: "3px" }}>
                          {pg.name}
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <HiLocationMarker size={11} color="#A8A29E" />
                          <span style={{ fontFamily: "var(--font-body)", fontSize: "12px", color: "#78716C" }}>{pg.area}</span>
                          <span style={{ fontFamily: "var(--font-body)", fontSize: "10px", fontWeight: "700", color: TYPE_COLOR[pg.pgType], backgroundColor: `${TYPE_COLOR[pg.pgType]}18`, borderRadius: "100px", padding: "1px 7px" }}>
                            {TYPE_LABEL[pg.pgType]}
                          </span>
                        </div>
                      </div>
                      <div style={{ textAlign: "right", flexShrink: 0 }}>
                        <div style={{ fontFamily: "var(--font-display)", fontSize: "18px", fontWeight: "700", color: pg.availableBeds === 0 ? "#DC2626" : "#10B981", letterSpacing: "-0.3px" }}>
                          {pg.availableBeds}
                        </div>
                        <div style={{ fontFamily: "var(--font-body)", fontSize: "10px", color: "#A8A29E" }}>beds free</div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "4px", flexShrink: 0 }}>
                        <HiBadgeCheck size={14} color={pg.isApproved ? "#10B981" : "#F59E0B"} />
                        <span className="pg-row-status" style={{ fontFamily: "var(--font-body)", fontSize: "12px", color: pg.isApproved ? "#065F46" : "#92400E", fontWeight: "500" }}>
                          {pg.isApproved ? "Live" : "Pending"}
                        </span>
                      </div>
                      <HiChevronRight size={15} color="#C8C4BE" style={{ flexShrink: 0 }} />
                    </div>
                  </Link>
                ))}
              </div>
            </section>

            {/* Pending requests */}
            {pendingBookings.length > 0 && (
              <section>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
                  <h2 style={{ fontFamily: "var(--font-display)", fontSize: "17px", fontWeight: "600", color: "#1C1917", display: "flex", alignItems: "center", gap: "8px" }}>
                    Pending
                    <span style={{ fontFamily: "var(--font-body)", fontSize: "11px", fontWeight: "700", color: "#fff", backgroundColor: "#FF385C", borderRadius: "100px", padding: "2px 7px" }}>
                      {pendingCount}
                    </span>
                  </h2>
                  <Link href="/pg-admin/bookings" style={{ fontFamily: "var(--font-body)", fontSize: "13px", color: "#FF385C", textDecoration: "none", fontWeight: "500" }}>
                    View all →
                  </Link>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {pendingBookings.map((b) => (
                    <Link key={b.objectId} href="/pg-admin/bookings" style={{ textDecoration: "none" }}>
                      <div style={{ backgroundColor: "#fff", border: "1px solid #FDE68A", borderRadius: "14px", padding: "14px 16px", display: "flex", alignItems: "center", gap: "12px", boxShadow: "0 0 0 3px rgba(245,158,11,0.07)", transition: "box-shadow 0.15s" }}
                        onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 4px 14px rgba(0,0,0,0.08)")}
                        onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "0 0 0 3px rgba(245,158,11,0.07)")}
                      >
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontFamily: "var(--font-display)", fontSize: "14px", fontWeight: "600", color: "#1C1917", marginBottom: "3px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {b.tenantName || "Guest"} · {b.pgName}
                          </div>
                          <div style={{ fontFamily: "var(--font-body)", fontSize: "12px", color: "#78716C" }}>
                            {SHARING_LABEL[b.sharing]} · {formatDate(b.fromDate)} → {formatDate(endDateForBooking(b))}
                          </div>
                        </div>
                        <div style={{ textAlign: "right", flexShrink: 0 }}>
                          <div style={{ fontFamily: "var(--font-display)", fontSize: "15px", fontWeight: "700", color: "#1C1917" }}>₹{b.total.toLocaleString()}</div>
                          <div style={{ fontFamily: "var(--font-body)", fontSize: "11px", color: "#A8A29E" }}>{timeAgo(b.createdAt)}</div>
                        </div>
                        <HiChevronRight size={16} color="#C8C4BE" style={{ flexShrink: 0 }} />
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {pgs.length === 0 && (
              <div style={{ textAlign: "center", padding: "60px 24px", backgroundColor: "#fff", borderRadius: "20px", border: "1px solid #E8E4DE" }}>
                <HiOfficeBuilding size={40} color="#D6D3CE" style={{ marginBottom: "16px" }} />
                <h2 style={{ fontFamily: "var(--font-display)", fontSize: "18px", fontWeight: "600", color: "#1C1917", marginBottom: "8px" }}>No PGs listed yet</h2>
                <p style={{ fontFamily: "var(--font-body)", fontSize: "14px", color: "#78716C" }}>Contact the platform admin to get your PG listed.</p>
              </div>
            )}
          </div>
        </main>
      </div>

    </>
  );
}
