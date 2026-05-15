import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/router";
import { useAuthStore } from "@/store/useAuthStore";
import { LogoutModal } from "@/pages/admin/dashboard";
import {
  HiOutlineHome, HiOutlineUser, HiOutlineHeart, HiOutlineCalendar,
  HiOutlineSparkles, HiOutlineLogout,
} from "react-icons/hi";

const CUSTOMER_NAV = [
  { href: "/",                          label: "Home",                  icon: <HiOutlineHome size={20} /> },
  { href: "/profile",                   label: "My Profile",            icon: <HiOutlineUser size={20} /> },
  { href: "/wishlist",                  label: "Wishlisted Properties", icon: <HiOutlineHeart size={20} /> },
  { href: "/bookings",                  label: "My Bookings",           icon: <HiOutlineCalendar size={20} /> },
  { href: "/auth/signup?role=pg_admin", label: "Become a Host",         icon: <HiOutlineSparkles size={20} />, accent: true },
];

export default function CustomerSidebar({ active }: { active: string }) {
  const router = useRouter();
  const { logout } = useAuthStore();
  const [confirmLogout, setConfirmLogout] = useState(false);

  return (
    <>
      <aside className="pg-sidebar">
        <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "10px", padding: "28px 24px 22px" }}>
          <div style={{ width: "32px", height: "32px", borderRadius: "8px", backgroundColor: "#FF385C", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontFamily: "var(--font-display)", fontSize: "16px", fontWeight: 700, color: "#fff" }}>R</span>
          </div>
          <span style={{ fontFamily: "var(--font-display)", fontSize: "20px", fontWeight: 600, color: "#1C1917" }}>Roomsy</span>
        </Link>

        <div style={{ padding: "0 14px", marginBottom: "8px" }}>
          <p style={{ fontFamily: "var(--font-body)", fontSize: "11px", fontWeight: 700, color: "#A8A29E", letterSpacing: "1px", textTransform: "uppercase", padding: "0 10px", marginBottom: "6px" }}>
            Account
          </p>
          {CUSTOMER_NAV.map((item) => {
            const isActive = active === item.href;
            const linkColor = item.accent ? "#FF385C" : isActive ? "#FF385C" : "#1C1917";
            const iconColor = item.accent || isActive ? "#FF385C" : "#78716C";
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  display: "flex", alignItems: "center", gap: "12px",
                  padding: "11px 14px", borderRadius: "11px", textDecoration: "none",
                  backgroundColor: isActive ? "#FFF0F3" : "transparent",
                  color: linkColor,
                  fontFamily: "var(--font-body)", fontSize: "15px",
                  fontWeight: isActive ? 600 : 500, marginBottom: "3px",
                  transition: "all 0.15s",
                }}
                onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.backgroundColor = "#F9F7F4"; }}
                onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.backgroundColor = "transparent"; }}
              >
                <span style={{ color: iconColor, display: "inline-flex" }}>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </div>

        <div style={{
          marginTop: "auto", borderTop: "1px solid #F0EDE8",
          padding: "14px 16px calc(28px + env(safe-area-inset-bottom))",
          position: "sticky", bottom: 0,
          background: "linear-gradient(180deg, rgba(255,245,240,0.94) 0%, #FDFCFA 100%)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
        }}>
          <button
            onClick={() => setConfirmLogout(true)}
            style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", width: "100%",
              padding: "9px 14px", border: "1px solid #FECACA",
              borderRadius: "10px", background: "#FEF2F2", cursor: "pointer",
              fontFamily: "var(--font-body)", fontSize: "13px", fontWeight: 600, color: "#B91C1C",
              transition: "background 0.15s, border-color 0.15s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "#FEE2E2"; e.currentTarget.style.borderColor = "#FCA5A5"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "#FEF2F2"; e.currentTarget.style.borderColor = "#FECACA"; }}
          >
            <HiOutlineLogout size={16} />
            Log out
          </button>
        </div>
      </aside>

      {confirmLogout && (
        <LogoutModal
          onCancel={() => setConfirmLogout(false)}
          onConfirm={() => { logout(); setConfirmLogout(false); router.push("/"); }}
        />
      )}
    </>
  );
}
