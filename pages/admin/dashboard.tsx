import { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useAuthStore } from "@/store/useAuthStore";
import { listAllPGs } from "@/lib/pgService";
import { PG } from "@/types/pg";
import {
  HiHome, HiOfficeBuilding, HiUsers,
  HiChevronRight, HiShieldCheck, HiCurrencyRupee, HiOutlineBell,
  HiOutlineUser,
} from "react-icons/hi";
import toast from "react-hot-toast";

const NAV_ITEMS = [
  { href: "/admin/dashboard", label: "Dashboard", icon: <HiHome size={20} />,           iconSm: <HiHome size={22} /> },
  { href: "/admin/pgs",       label: "PGs",       icon: <HiOfficeBuilding size={20} />, iconSm: <HiOfficeBuilding size={22} /> },
  { href: "/admin/users",     label: "Users",     icon: <HiUsers size={20} />,           iconSm: <HiUsers size={22} /> },
  { href: "/admin/revenue",   label: "Revenue",   icon: <HiCurrencyRupee size={20} />,   iconSm: <HiCurrencyRupee size={22} /> },
  { href: "/profile",         label: "My Profile", icon: <HiOutlineUser size={20} />,    iconSm: <HiOutlineUser size={22} /> },
];

export const STATES = [
  { name: "Telangana",   slug: "telangana",   active: true,  accent: "#FF385C", cities: ["hyderabad"] },
  { name: "Karnataka",   slug: "karnataka",   active: false, accent: "#6366F1", cities: ["bengaluru"] },
  { name: "Tamil Nadu",  slug: "tamilnadu",   active: false, accent: "#F59E0B", cities: ["chennai"] },
  { name: "Maharashtra", slug: "maharashtra", active: false, accent: "#10B981", cities: ["mumbai", "pune"] },
  { name: "Delhi",       slug: "delhi",       active: false, accent: "#3B82F6", cities: ["delhi"] },
  { name: "Gujarat",     slug: "gujarat",     active: false, accent: "#14B8A6", cities: ["ahmedabad"] },
  { name: "West Bengal", slug: "westbengal",  active: false, accent: "#EC4899", cities: ["kolkata"] },
];

function getInitials(name?: string) {
  if (!name) return "A";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "A";
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function LogoutModal({ onCancel, onConfirm }: { onCancel: () => void; onConfirm: () => void }) {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }} onClick={onCancel}>
      <div style={{ position: "absolute", inset: 0, backgroundColor: "rgba(0,0,0,0.45)", backdropFilter: "blur(6px)" }} />
      <div style={{ position: "relative", backgroundColor: "#fff", borderRadius: "20px", padding: "32px 28px", width: "100%", maxWidth: "360px", boxShadow: "0 24px 60px rgba(0,0,0,0.2)", textAlign: "center" }} onClick={(e) => e.stopPropagation()}>
        <div style={{ width: "52px", height: "52px", borderRadius: "50%", backgroundColor: "#FEF2F2", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 18px" }}>
          <span style={{ fontSize: "22px" }}>👋</span>
        </div>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: "20px", fontWeight: "600", color: "#1C1917", marginBottom: "8px" }}>Log out?</h2>
        <p style={{ fontFamily: "var(--font-body)", fontSize: "14px", color: "#78716C", marginBottom: "24px" }}>You'll be signed out of the Admin Panel.</p>
        <div style={{ display: "flex", gap: "10px" }}>
          <button onClick={onCancel} style={{ flex: 1, padding: "12px", borderRadius: "100px", border: "1.5px solid #E8E4DE", backgroundColor: "#fff", fontFamily: "var(--font-body)", fontSize: "14px", fontWeight: "600", color: "#1C1917", cursor: "pointer" }}>Stay</button>
          <button onClick={onConfirm} style={{ flex: 1, padding: "12px", borderRadius: "100px", border: "none", backgroundColor: "#DC2626", fontFamily: "var(--font-body)", fontSize: "14px", fontWeight: "700", color: "#fff", cursor: "pointer" }}>Log out</button>
        </div>
      </div>
    </div>
  );
}

function AdminSidebar({ active }: { active: string }) {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const [confirmLogout, setConfirmLogout] = useState(false);

  return (
    <>
      <aside className="pg-sidebar">
        <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "10px", padding: "28px 24px 22px" }}>
          <div style={{ width: "32px", height: "32px", borderRadius: "8px", backgroundColor: "#FF385C", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontFamily: "var(--font-display)", fontSize: "16px", fontWeight: "700", color: "#fff" }}>R</span>
          </div>
          <span style={{ fontFamily: "var(--font-display)", fontSize: "20px", fontWeight: "600", color: "#1C1917" }}>Roomsy</span>
        </Link>

        <div style={{ padding: "0 14px", marginBottom: "8px" }}>
          <p style={{ fontFamily: "var(--font-body)", fontSize: "11px", fontWeight: "700", color: "#A8A29E", letterSpacing: "1px", textTransform: "uppercase", padding: "0 10px", marginBottom: "6px" }}>
            Admin Panel
          </p>
          {NAV_ITEMS.map((item) => {
            const isActive = active === item.href;
            return (
              <Link key={item.href} href={item.href} style={{
                display: "flex", alignItems: "center", gap: "12px",
                padding: "11px 14px", borderRadius: "11px", textDecoration: "none",
                backgroundColor: isActive ? "#FFF0F3" : "transparent",
                color: isActive ? "#FF385C" : "#44403C",
                fontFamily: "var(--font-body)", fontSize: "15px",
                fontWeight: isActive ? "600" : "500", marginBottom: "3px",
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

          <button
            onClick={() => toast("No new notifications")}
            style={{
              display: "flex", alignItems: "center", gap: "12px",
              padding: "11px 14px", borderRadius: "11px",
              backgroundColor: "transparent", border: "none",
              color: "#44403C", fontFamily: "var(--font-body)",
              fontSize: "15px", fontWeight: "500",
              marginBottom: "3px", marginTop: "2px",
              cursor: "pointer", width: "100%", textAlign: "left",
              transition: "all 0.15s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#F9F7F4"; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
          >
            <span style={{ position: "relative", color: "#78716C", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
              <HiOutlineBell size={20} />
              <span style={{ position: "absolute", top: -2, right: -2, width: 8, height: 8, borderRadius: "50%", background: "#FF385C", border: "2px solid #FFF5F0" }} />
            </span>
            Notifications
          </button>
        </div>

        <div style={{ marginTop: "auto", borderTop: "1px solid #F0EDE8", padding: "20px 24px" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", backgroundColor: "#FFF0F3", borderRadius: "100px", padding: "3px 10px", marginBottom: "10px" }}>
            <HiShieldCheck size={12} color="#FF385C" />
            <span style={{ fontFamily: "var(--font-body)", fontSize: "11px", fontWeight: "700", color: "#FF385C", letterSpacing: "0.5px", textTransform: "uppercase" }}>Platform Admin</span>
          </div>
          {user && (
            <>
              <p style={{ fontFamily: "var(--font-display)", fontSize: "16px", fontWeight: "700", color: "#1C1917", marginBottom: "3px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.name}</p>
              <p style={{ fontFamily: "var(--font-body)", fontSize: "13px", color: "#78716C", marginBottom: "14px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.email}</p>
            </>
          )}
          <button onClick={() => setConfirmLogout(true)} style={{ fontFamily: "var(--font-body)", fontSize: "15px", fontWeight: "600", color: "#DC2626", background: "none", border: "none", cursor: "pointer", padding: 0 }}>
            Log out
          </button>
        </div>
      </aside>

      <div className="pg-mobile-topbar">
        <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "8px" }}>
          <div style={{ width: "28px", height: "28px", borderRadius: "7px", backgroundColor: "#FF385C", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontFamily: "var(--font-display)", fontSize: "14px", fontWeight: "700", color: "#fff" }}>R</span>
          </div>
          <span style={{ fontFamily: "var(--font-display)", fontSize: "18px", fontWeight: "600", color: "#1C1917" }}>Roomsy</span>
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <button
            onClick={() => toast("No new notifications")}
            aria-label="Notifications"
            style={{ position: "relative", border: "none", background: "transparent", cursor: "pointer", padding: 0, display: "flex", alignItems: "center", justifyContent: "center", width: 36, height: 36 }}
          >
            <HiOutlineBell size={22} color="#1C1917" />
            <span style={{ position: "absolute", top: 6, right: 6, width: 8, height: 8, borderRadius: "50%", background: "#FF385C", border: "2px solid #fff" }} />
          </button>
          <Link
            href="/profile"
            aria-label="My Profile"
            className="adm-topbar-avatar"
          >
            {user?.profilePic ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.profilePic} alt={user.name || "Profile"} />
            ) : (
              <span>{getInitials(user?.name || user?.email)}</span>
            )}
          </Link>
        </div>
      </div>

      <nav className="pg-bottom-nav">
        {NAV_ITEMS.map((item) => {
          const isActive = active === item.href;
          return (
            <Link key={item.href} href={item.href} className={`pg-bottom-tab ${isActive ? "is-active" : ""}`}>
              <span className="pg-bottom-tab-icon">{item.iconSm}</span>
              <span className="pg-bottom-tab-label">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {confirmLogout && (
        <LogoutModal
          onCancel={() => setConfirmLogout(false)}
          onConfirm={() => { sessionStorage.removeItem("roomsy_admin_state"); logout(); setConfirmLogout(false); router.push("/"); }}
        />
      )}

      <style>{`
        .pg-sidebar { width: 280px; flex-shrink: 0; background: linear-gradient(180deg, #FFE4EA 0%, #FFF5F0 35%, #FDFCFA 100%); border-right: 1px solid rgba(232, 228, 222, 0.6); display: flex; flex-direction: column; position: sticky; top: 0; height: 100vh; overflow-y: auto; }
        .pg-mobile-topbar { display: none; }
        .adm-topbar-avatar {
          width: 32px; height: 32px;
          border-radius: 50%;
          border: 2px solid #fff;
          background: linear-gradient(135deg, #FF385C 0%, #FF6B85 100%);
          color: #fff;
          font-family: var(--font-display);
          font-size: 12px;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          text-decoration: none;
          flex-shrink: 0;
          box-shadow: 0 2px 6px rgba(255, 56, 92, 0.28);
          transition: transform 0.12s, box-shadow 0.18s;
        }
        .adm-topbar-avatar:hover { box-shadow: 0 4px 12px rgba(255, 56, 92, 0.42); }
        .adm-topbar-avatar:active { transform: scale(0.94); }
        .adm-topbar-avatar img { width: 100%; height: 100%; object-fit: cover; }
        .pg-bottom-nav { display: none; }
        @media (max-width: 768px) {
          .pg-sidebar { display: none !important; }
          .pg-mobile-topbar { display: flex; align-items: center; justify-content: space-between; position: fixed; top: 0; left: 0; right: 0; height: calc(56px + env(safe-area-inset-top)); padding: env(safe-area-inset-top) 16px 0; background: linear-gradient(135deg, rgba(255,228,234,0.96) 0%, rgba(255,245,240,0.96) 55%, rgba(253,252,250,0.96) 100%); border-bottom: 1px solid rgba(232, 228, 222, 0.6); backdrop-filter: blur(10px); z-index: 100; }
          .pg-bottom-nav { display: flex; align-items: stretch; position: fixed; bottom: 0; left: 0; right: 0; height: 62px; background: linear-gradient(90deg, rgba(253,252,250,0.96) 0%, rgba(255,245,240,0.96) 55%, rgba(255,228,234,0.96) 100%); border-top: 1px solid rgba(232, 228, 222, 0.6); backdrop-filter: blur(10px); z-index: 100; padding-bottom: env(safe-area-inset-bottom); }
        }
      `}</style>
    </>
  );
}

export { AdminSidebar, LogoutModal };

export default function AdminDashboard() {
  const router = useRouter();
  const { user, hydrated } = useAuthStore();
  const [pgs, setPGs] = useState<PG[]>([]);

  useEffect(() => {
    if (!hydrated) return;
    if (!user) { router.replace("/"); return; }
    if (user.role !== "platform_admin") { router.replace("/"); return; }
    // If a state was already chosen this session, jump straight to it
    if (typeof window !== "undefined") {
      const saved = sessionStorage.getItem("roomsy_admin_state");
      if (saved) { router.replace(`/admin/pgs?state=${saved}`); return; }
    }
    let cancelled = false;
    listAllPGs().then((rows) => { if (!cancelled) setPGs(rows); }).catch(() => {});
    return () => { cancelled = true; };
  }, [user, hydrated]);

  if (!user || user.role !== "platform_admin") return null;

  return (
    <>
      <Head><title>Admin Dashboard — Roomsy</title></Head>
      <div className="pg-layout" style={{ minHeight: "100vh", backgroundColor: "#F9F7F4" }}>
        <AdminSidebar active="/admin/dashboard" />

        <main style={{ flex: 1, overflowX: "hidden" }}>
          <div className="dash-hero-bar">
            <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(18px,3vw,24px)", fontWeight: "700", color: "#fff", letterSpacing: "-0.5px", marginBottom: "4px" }}>
              Select a State
            </h1>
            <p style={{ fontFamily: "var(--font-body)", fontSize: "14px", color: "rgba(255,255,255,0.72)", margin: 0 }}>
              Choose a state to manage its PG listings.
            </p>
          </div>

          <div className="pg-content" style={{ maxWidth: "1100px", margin: "0 auto" }}>
            <div className="state-grid">
              {STATES.map((s) => {
                const count   = s.active ? pgs.filter((p) => s.cities.includes(p.city.toLowerCase())).length : 0;
                const pending = s.active ? pgs.filter((p) => s.cities.includes(p.city.toLowerCase()) && !p.isApproved && !p.isSuspended).length : 0;

                return s.active ? (
                  <button
                    key={s.slug}
                    onClick={() => router.push(`/admin/pgs?state=${s.slug}`)}
                    className="state-card"
                    style={{
                      position: "relative", textAlign: "left", backgroundColor: "#fff",
                      border: "1.5px solid #E8E4DE", borderRadius: "18px",
                      cursor: "pointer", transition: "all 0.18s", overflow: "hidden",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = s.accent;
                      e.currentTarget.style.boxShadow = `0 8px 28px ${s.accent}22`;
                      e.currentTarget.style.transform = "translateY(-2px)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = "#E8E4DE";
                      e.currentTarget.style.boxShadow = "none";
                      e.currentTarget.style.transform = "translateY(0)";
                    }}
                  >
                    <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "4px", backgroundColor: s.accent, borderRadius: "18px 18px 0 0" }} />

                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "16px" }}>
                      <div style={{ width: "44px", height: "44px", borderRadius: "12px", backgroundColor: `${s.accent}18`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <HiOfficeBuilding size={22} color={s.accent} />
                      </div>
                      <HiChevronRight size={16} color="#C8C4BE" />
                    </div>

                    <div style={{ fontFamily: "var(--font-display)", fontSize: "20px", fontWeight: "700", color: "#1C1917", letterSpacing: "-0.3px", marginBottom: "16px" }}>
                      {s.name}
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ fontFamily: "var(--font-display)", fontSize: "22px", fontWeight: "700", color: s.accent }}>{count}</span>
                      <span style={{ fontFamily: "var(--font-body)", fontSize: "12px", color: "#78716C" }}>PGs</span>
                      {pending > 0 && (
                        <span style={{ marginLeft: "4px", fontFamily: "var(--font-body)", fontSize: "10px", fontWeight: "700", color: "#92400E", backgroundColor: "#FFFBEB", border: "1px solid #FDE68A", borderRadius: "100px", padding: "2px 8px" }}>
                          {pending} pending
                        </span>
                      )}
                    </div>
                  </button>
                ) : (
                  <div
                    key={s.slug}
                    className="state-card"
                    style={{
                      position: "relative", textAlign: "left", backgroundColor: "#FAFAF9",
                      border: "1.5px solid #F0EDE8", borderRadius: "18px",
                      overflow: "hidden",
                    }}
                  >
                    <div style={{ position: "absolute", top: "14px", right: "-18px", backgroundColor: "#E8E4DE", color: "#A8A29E", fontFamily: "var(--font-body)", fontSize: "9px", fontWeight: "700", letterSpacing: "1px", textTransform: "uppercase", padding: "4px 28px", transform: "rotate(38deg)", transformOrigin: "center" }}>
                      Soon
                    </div>

                    <div style={{ display: "flex", alignItems: "flex-start", marginBottom: "16px" }}>
                      <div style={{ width: "44px", height: "44px", borderRadius: "12px", backgroundColor: "#F0EDE8", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <HiOfficeBuilding size={22} color="#C8C4BE" />
                      </div>
                    </div>

                    <div style={{ fontFamily: "var(--font-display)", fontSize: "20px", fontWeight: "700", color: "#C8C4BE", letterSpacing: "-0.3px", marginBottom: "16px" }}>
                      {s.name}
                    </div>

                    <span style={{ fontFamily: "var(--font-body)", fontSize: "11px", fontWeight: "600", color: "#A8A29E" }}>
                      Coming soon
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </main>
      </div>

      <style>{`
        .dash-hero-bar { background: linear-gradient(130deg, #1C1917 0%, #FF385C 100%); padding: 28px 40px; }
        .state-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
        .state-card { padding: 22px 20px; }
        .pg-content {
          padding: 36px 40px calc(80px + env(safe-area-inset-bottom));
          max-width: 1100px;
          margin: 0 auto;
        }
        @media (max-width: 1024px) { .state-grid { grid-template-columns: repeat(3, 1fr); } }
        @media (max-width: 768px)  {
          .dash-hero-bar { padding: calc(76px + env(safe-area-inset-top)) 16px 22px; }
          .state-grid { grid-template-columns: repeat(2, 1fr); gap: 10px; }
          .state-card { padding: 14px 14px; border-radius: 14px !important; }
          .state-card h2, .state-card div[style*="font-size: 20px"] { font-size: 16px !important; }
          .pg-content { padding: 22px 14px calc(90px + env(safe-area-inset-bottom)); }
        }
      `}</style>
    </>
  );
}
