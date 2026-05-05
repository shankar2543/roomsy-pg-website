"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import {
  HiOutlineMenu, HiUserCircle, HiX, HiOutlineBell,
  HiOutlineUser, HiOutlineHeart, HiOutlineCalendar,
  HiOutlineViewGrid, HiOutlineLogout, HiChevronRight,
  HiSparkles, HiHome, HiOfficeBuilding, HiUsers, HiCurrencyRupee,
  HiOutlineShieldCheck,
} from "react-icons/hi";
import toast from "react-hot-toast";
import { useAuthStore } from "@/store/useAuthStore";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const [confirmLogout, setConfirmLogout] = useState(false);
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // On /pgs route, PG link is always active regardless of scroll
  const onPgsRoute = router.pathname === "/pgs" || router.pathname.startsWith("/pgs/");
  const activeLink = onPgsRoute ? "pg" : activeSection;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const sections = ["home", "pg"];
    const observers: IntersectionObserver[] = [];

    sections.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      const observer = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActiveSection(id); },
        { threshold: 0.3, rootMargin: "-72px 0px 0px 0px" }
      );
      observer.observe(el);
      observers.push(observer);
    });

    return () => observers.forEach((o) => o.disconnect());
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (!menuOpen) setConfirmLogout(false);
  }, [menuOpen]);

  // Two-letter initials from a name; falls back to the first letter or "?"
  function getInitials(name?: string) {
    if (!name) return "?";
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return "?";
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  return (
    <header
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        background: scrolled
          ? "linear-gradient(135deg, rgba(255,228,234,0.92) 0%, rgba(255,245,240,0.92) 55%, rgba(253,252,250,0.92) 100%)"
          : "linear-gradient(135deg, #FFE4EA 0%, #FFF5F0 55%, #FDFCFA 100%)",
        backdropFilter: scrolled ? "blur(12px)" : "none",
        borderBottom: "1px solid rgba(232, 228, 222, 0.6)",
        transition: "all 0.3s ease",
      }}
    >
      <div
        className="navbar-inner"
        style={{
          width: "100%",
          padding: "0 32px",
          height: "72px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "24px",
        }}
      >
        {/* Logo */}
        <Link href="/" style={{ textDecoration: "none", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "8px",
                backgroundColor: "#FF385C",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "16px",
                  fontWeight: "700",
                  color: "#fff",
                  lineHeight: 1,
                }}
              >
                R
              </span>
            </div>
            <span
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "22px",
                fontWeight: "600",
                color: "#1C1917",
                letterSpacing: "-0.3px",
              }}
            >
              Roomsy
            </span>
          </div>
        </Link>

        {/* Center nav links */}
        <nav style={{ display: "flex", alignItems: "center", gap: "4px" }} className="nav-links">
          {user?.role === "pg_admin" || user?.role === "platform_admin" ? (
            <Link
              href="/profile"
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "16px",
                fontWeight: router.pathname === "/profile" ? "600" : "500",
                color: router.pathname === "/profile" ? "#FF385C" : "#1C1917",
                textDecoration: "none",
                padding: "8px 16px",
                borderRadius: "100px",
                backgroundColor: router.pathname === "/profile" ? "#FFF0F3" : "transparent",
                transition: "background 0.15s, color 0.15s",
              }}
              onMouseEnter={(e) => { if (router.pathname !== "/profile") e.currentTarget.style.backgroundColor = "#F0EDE8"; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = router.pathname === "/profile" ? "#FFF0F3" : "transparent"; }}
            >
              My Profile
            </Link>
          ) : (
            <>
              <Link
                href="/"
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "16px",
                  fontWeight: activeLink === "home" ? "600" : "500",
                  color: activeLink === "home" ? "#FF385C" : "#1C1917",
                  textDecoration: "none",
                  padding: "8px 16px",
                  borderRadius: "100px",
                  backgroundColor: activeLink === "home" ? "#FFF0F3" : "transparent",
                  transition: "background 0.15s, color 0.15s",
                }}
                onMouseEnter={(e) => { if (activeSection !== "home") e.currentTarget.style.backgroundColor = "#F0EDE8"; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = activeLink === "home" ? "#FFF0F3" : "transparent"; }}
              >
                Home
              </Link>
              <span style={{ color: "#D6D3CE", fontSize: "16px", fontWeight: "300" }}>/</span>
              <Link
                href="/pgs"
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "16px",
                  fontWeight: activeLink === "pg" ? "600" : "500",
                  color: activeLink === "pg" ? "#FF385C" : "#1C1917",
                  textDecoration: "none",
                  padding: "8px 16px",
                  borderRadius: "100px",
                  backgroundColor: activeLink === "pg" ? "#FFF0F3" : "transparent",
                  transition: "background 0.15s, color 0.15s",
                }}
                onMouseEnter={(e) => { if (activeSection !== "pg") e.currentTarget.style.backgroundColor = "#F0EDE8"; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = activeLink === "pg" ? "#FFF0F3" : "transparent"; }}
              >
                PG
              </Link>
            </>
          )}
        </nav>

        {/* Right */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }} ref={dropdownRef}>
          {!user && (
            <Link
              href="/auth/signup?role=pg_admin"
              className="become-host-btn"
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "14px",
                fontWeight: "600",
                color: "#fff",
                textDecoration: "none",
                padding: "8px 18px",
                borderRadius: "100px",
                backgroundColor: "#FF385C",
                transition: "background 0.15s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#E31C5F")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#FF385C")}
            >
              Become a Host
            </Link>
          )}

          {/* Notification bell — only when logged in */}
          {user && (
            <button
              className="notif-icon-btn"
              onClick={() => toast("No new notifications")}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "42px",
                height: "42px",
                border: "none",
                background: "transparent",
                cursor: "pointer",
                padding: 0,
                position: "relative",
                borderRadius: "50%",
                transition: "background 0.15s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#F5F3F0")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              aria-label="Notifications"
            >
              <HiOutlineBell size={22} color="#1C1917" />
              <span className="notif-dot" />
            </button>
          )}

          {/* Desktop: profile icon — picture, initials, or fallback */}
          <button
            className="profile-icon-btn"
            onClick={() => setMenuOpen((v) => !v)}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "42px",
              height: "42px",
              borderRadius: "50%",
              border: `1.5px solid ${menuOpen ? "#FF385C" : "#E8E4DE"}`,
              backgroundColor: menuOpen ? "#FFF0F3" : "#fff",
              cursor: "pointer",
              transition: "border-color 0.2s, background 0.2s, box-shadow 0.2s",
              padding: 0,
              overflow: "hidden",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#FF385C"; }}
            onMouseLeave={(e) => { if (!menuOpen) e.currentTarget.style.borderColor = "#E8E4DE"; }}
            aria-label="Account"
          >
            {user?.profilePic ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.profilePic}
                alt={user.name || "Profile"}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : user ? (
              <span style={{
                width: "100%", height: "100%",
                display: "flex", alignItems: "center", justifyContent: "center",
                background: "#FF385C", color: "#fff",
                fontFamily: "var(--font-display)",
                fontSize: "14px", fontWeight: 700,
                letterSpacing: "0.2px",
              }}>
                {getInitials(user.name || user.email)}
              </span>
            ) : (
              <HiUserCircle size={26} color={menuOpen ? "#FF385C" : "#44403C"} />
            )}
          </button>

          <button
            className="hamburger-icon-btn"
            onClick={() => setMenuOpen((v) => !v)}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "40px",
              height: "40px",
              border: "none",
              background: "transparent",
              cursor: "pointer",
              padding: 0,
            }}
            aria-label={user ? "Menu" : "Account"}
          >
            {user ? (
              <HiOutlineMenu size={26} color="#1C1917" />
            ) : (
              <HiUserCircle size={28} color="#1C1917" />
            )}
          </button>

          {/* Desktop dropdown — pill for guests, account card for logged-in */}
          {menuOpen && !user && (
            <div
              className="navbar-dropdown desktop-auth-dropdown"
              style={{
                position: "absolute",
                top: "calc(100% + 10px)",
                right: "32px",
                display: "flex",
                alignItems: "center",
                flexWrap: "wrap",
                backgroundColor: "#fff",
                border: "1px solid #E8E4DE",
                borderRadius: "100px",
                boxShadow: "0 4px 16px rgba(0,0,0,0.10)",
                overflow: "hidden",
                zIndex: 100,
              }}
            >
              <Link
                href="/auth/login"
                onClick={() => setMenuOpen(false)}
                style={{
                  padding: "10px 20px",
                  fontFamily: "var(--font-body)",
                  fontSize: "15px",
                  fontWeight: "600",
                  color: "#1C1917",
                  textDecoration: "none",
                  transition: "background 0.15s",
                  whiteSpace: "nowrap",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#F9F7F4")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
              >
                Log in
              </Link>
              <span style={{ color: "#D6D3CE", fontSize: "16px", fontWeight: "300" }}>/</span>
              <Link
                href="/auth/signup"
                onClick={() => setMenuOpen(false)}
                style={{
                  padding: "10px 20px",
                  fontFamily: "var(--font-body)",
                  fontSize: "15px",
                  fontWeight: "500",
                  color: "#1C1917",
                  textDecoration: "none",
                  transition: "background 0.15s",
                  whiteSpace: "nowrap",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#F9F7F4")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
              >
                Sign up
              </Link>
            </div>
          )}

          {menuOpen && user && (
            <div className="account-menu desktop-auth-dropdown">
              {/* Profile header */}
              <div className="account-menu-profile">
                <div className="account-menu-avatar">
                  {user.profilePic ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={user.profilePic} alt={user.name || "Profile"} />
                  ) : (
                    <span>{getInitials(user.name || user.email)}</span>
                  )}
                </div>
                <div className="account-menu-id">
                  <p className="account-menu-name">{user.name || "Account"}</p>
                  <p className="account-menu-email">{user.email}</p>
                </div>
              </div>

              <div className="account-menu-divider" />

              {/* Quick links */}
              {user.role === "pg_admin" ? (
                <Link href="/pg-admin/dashboard" onClick={() => setMenuOpen(false)} className="account-menu-item">Dashboard</Link>
              ) : user.role === "platform_admin" ? (
                <Link href="/admin/dashboard" onClick={() => setMenuOpen(false)} className="account-menu-item">Dashboard</Link>
              ) : (
                <>
                  <Link href="/profile" onClick={() => setMenuOpen(false)} className="account-menu-item">My Profile</Link>
                  <Link href="/wishlist" onClick={() => setMenuOpen(false)} className="account-menu-item">Wishlisted Properties</Link>
                  <Link href="/bookings" onClick={() => setMenuOpen(false)} className="account-menu-item">My Bookings</Link>
                </>
              )}

              {user.role !== "pg_admin" && user.role !== "platform_admin" && (
                <>
                  <div className="account-menu-divider" />
                  <Link
                    href="/auth/signup?role=pg_admin"
                    onClick={() => setMenuOpen(false)}
                    className="account-menu-item account-menu-host"
                  >
                    Become a Host
                  </Link>
                </>
              )}

              <div className="account-menu-divider" />

              {!confirmLogout ? (
                <button
                  onClick={() => setConfirmLogout(true)}
                  className="account-menu-item account-menu-logout"
                >
                  Log out
                </button>
              ) : (
                <div className="account-menu-confirm">
                  <p>Log out of your account?</p>
                  <div className="account-menu-confirm-actions">
                    <button onClick={() => setConfirmLogout(false)} className="account-menu-cancel">Cancel</button>
                    <button
                      onClick={() => {
                        logout();
                        setConfirmLogout(false);
                        setMenuOpen(false);
                        router.push("/");
                      }}
                      className="account-menu-confirm-btn"
                    >
                      Log out
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Mobile slide-in sidebar */}
          {menuOpen && (
            <>
              <div
                className="mobile-sidebar-overlay"
                onClick={() => setMenuOpen(false)}
              />
              <aside className="mobile-sidebar">
                <div className="mobile-sidebar-header">
                  <span className="mobile-sidebar-blob mobile-sidebar-blob-1" />
                  <span className="mobile-sidebar-blob mobile-sidebar-blob-2" />
                  <button
                    onClick={() => setMenuOpen(false)}
                    aria-label="Close menu"
                    className="mobile-sidebar-close"
                  >
                    <HiX size={20} />
                  </button>

                  {user ? (
                    <>
                      <div className="mobile-sidebar-profile-text">
                        <p className="mobile-sidebar-greet">Welcome back</p>
                        <p className="mobile-sidebar-username">{user.name || user.email}</p>
                      </div>
                      <div className="mobile-sidebar-avatar">
                        {user.profilePic ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={user.profilePic}
                            alt={user.name || "Profile"}
                            style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }}
                          />
                        ) : user.name || user.email ? (
                          getInitials(user.name || user.email)
                        ) : (
                          <HiUserCircle size={28} />
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="mobile-sidebar-profile-text">
                      <p className="mobile-sidebar-greet">Hello there</p>
                      <p className="mobile-sidebar-username">Welcome to Roomsy</p>
                    </div>
                  )}
                </div>

                <nav className="mobile-sidebar-nav">
                  {user ? (
                    <>
                      <p className="mobile-sidebar-section">Account</p>
                      <Link
                        href="/profile"
                        onClick={() => setMenuOpen(false)}
                        className={`mobile-sidebar-link ${router.pathname === "/profile" ? "is-active" : ""}`}
                        style={{ animationDelay: "40ms" }}
                      >
                        <span className="mobile-sidebar-link-icon"><HiOutlineUser size={18} /></span>
                        <span className="mobile-sidebar-link-text">My Profile</span>
                        <HiChevronRight className="mobile-sidebar-link-chev" size={16} />
                      </Link>
                      {user.role === "pg_admin" ? (
                        <Link
                          href="/pg-admin/dashboard"
                          onClick={() => setMenuOpen(false)}
                          className={`mobile-sidebar-link ${router.pathname.startsWith("/pg-admin") ? "is-active" : ""}`}
                          style={{ animationDelay: "80ms" }}
                        >
                          <span className="mobile-sidebar-link-icon"><HiOutlineViewGrid size={18} /></span>
                          <span className="mobile-sidebar-link-text">Dashboard</span>
                          <HiChevronRight className="mobile-sidebar-link-chev" size={16} />
                        </Link>
                      ) : user.role === "platform_admin" ? (
                        <>
                          <span className="mobile-sidebar-admin-badge">
                            <HiOutlineShieldCheck size={12} /> Platform Admin
                          </span>
                          {[
                            { href: "/admin/dashboard", label: "Dashboard", icon: <HiHome size={18} /> },
                            { href: "/admin/pgs",       label: "PGs",       icon: <HiOfficeBuilding size={18} /> },
                            { href: "/admin/users",     label: "Users",     icon: <HiUsers size={18} /> },
                            { href: "/admin/revenue",   label: "Revenue",   icon: <HiCurrencyRupee size={18} /> },
                          ].map((it, i) => (
                            <Link
                              key={it.href}
                              href={it.href}
                              onClick={() => setMenuOpen(false)}
                              className={`mobile-sidebar-link ${router.pathname.startsWith(it.href) ? "is-active" : ""}`}
                              style={{ animationDelay: `${80 + i * 40}ms` }}
                            >
                              <span className="mobile-sidebar-link-icon">{it.icon}</span>
                              <span className="mobile-sidebar-link-text">{it.label}</span>
                              <HiChevronRight className="mobile-sidebar-link-chev" size={16} />
                            </Link>
                          ))}
                        </>
                      ) : (
                        <>
                          <Link
                            href="/wishlist"
                            onClick={() => setMenuOpen(false)}
                            className={`mobile-sidebar-link ${router.pathname.startsWith("/wishlist") ? "is-active" : ""}`}
                            style={{ animationDelay: "80ms" }}
                          >
                            <span className="mobile-sidebar-link-icon"><HiOutlineHeart size={18} /></span>
                            <span className="mobile-sidebar-link-text">Wishlist</span>
                            <HiChevronRight className="mobile-sidebar-link-chev" size={16} />
                          </Link>
                          <Link
                            href="/bookings"
                            onClick={() => setMenuOpen(false)}
                            className={`mobile-sidebar-link ${router.pathname.startsWith("/bookings") ? "is-active" : ""}`}
                            style={{ animationDelay: "120ms" }}
                          >
                            <span className="mobile-sidebar-link-icon"><HiOutlineCalendar size={18} /></span>
                            <span className="mobile-sidebar-link-text">My Bookings</span>
                            <HiChevronRight className="mobile-sidebar-link-chev" size={16} />
                          </Link>
                        </>
                      )}
                    </>
                  ) : (
                    <>
                      <p className="mobile-sidebar-section">Account</p>
                      <div className="mobile-sidebar-auth-row">
                        <Link href="/auth/login" onClick={() => setMenuOpen(false)} className="mobile-sidebar-link mobile-sidebar-auth">Log in</Link>
                        <Link href="/auth/signup" onClick={() => setMenuOpen(false)} className="mobile-sidebar-link mobile-sidebar-auth">Sign up</Link>
                      </div>
                    </>
                  )}
                </nav>

                <div className="mobile-sidebar-footer">
                  {user?.role !== "pg_admin" && user?.role !== "platform_admin" && (
                    <div className="mobile-sidebar-cta-card">
                      <span className="mobile-sidebar-cta-spark"><HiSparkles size={14} /></span>
                      <p className="mobile-sidebar-cta-title">List your property</p>
                      <p className="mobile-sidebar-cta-sub">Earn steady monthly income with Roomsy.</p>
                      <Link
                        href="/auth/signup?role=pg_admin"
                        onClick={() => setMenuOpen(false)}
                        className="mobile-sidebar-cta"
                      >
                        Become a Host
                      </Link>
                    </div>
                  )}

                  {user && (
                    !confirmLogout ? (
                      <button
                        onClick={() => setConfirmLogout(true)}
                        className="mobile-sidebar-link mobile-sidebar-logout"
                      >
                        <span className="mobile-sidebar-link-icon"><HiOutlineLogout size={18} /></span>
                        Log out
                      </button>
                    ) : (
                      <div className="mobile-sidebar-confirm">
                        <p className="mobile-sidebar-confirm-text">Log out of your account?</p>
                        <div className="mobile-sidebar-confirm-actions">
                          <button
                            onClick={() => setConfirmLogout(false)}
                            className="mobile-sidebar-confirm-btn cancel"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => {
                              logout();
                              setConfirmLogout(false);
                              setMenuOpen(false);
                              router.push("/");
                            }}
                            className="mobile-sidebar-confirm-btn confirm"
                          >
                            Log out
                          </button>
                        </div>
                      </div>
                    )
                  )}
                </div>
              </aside>
            </>
          )}
        </div>
      </div>

      <style>{`
        .hamburger-icon-btn { display: none !important; }
        .become-host-mobile { display: none !important; }
        .become-host-divider { display: none !important; }
        .mobile-sidebar-overlay,
        .mobile-sidebar { display: none; }

        /* ── Desktop account menu (logged-in dropdown) ──────────── */
        .account-menu {
          position: absolute;
          top: calc(100% + 10px);
          right: 32px;
          width: 260px;
          background: #fff;
          border: 1px solid #E8E4DE;
          border-radius: 16px;
          box-shadow: 0 16px 48px rgba(28,25,23,0.14), 0 4px 12px rgba(28,25,23,0.06);
          padding: 8px;
          z-index: 100;
          overflow: hidden;
          animation: account-pop 0.18s cubic-bezier(0.22, 1, 0.36, 1);
        }
        @keyframes account-pop {
          from { opacity: 0; transform: translateY(-6px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        .account-menu-profile {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 10px 12px;
        }
        .account-menu-avatar {
          width: 40px; height: 40px;
          border-radius: 50%;
          background: #FF385C;
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: var(--font-display);
          font-size: 15px;
          font-weight: 700;
          flex-shrink: 0;
          overflow: hidden;
          letter-spacing: 0.2px;
        }
        .account-menu-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .account-menu-id { min-width: 0; flex: 1; }
        .account-menu-name {
          font-family: var(--font-display);
          font-size: 15px;
          font-weight: 600;
          color: #1C1917;
          margin: 0 0 2px;
          letter-spacing: -0.2px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .account-menu-email {
          font-family: var(--font-body);
          font-size: 12px;
          color: #78716C;
          margin: 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .account-menu-divider {
          height: 1px;
          background: #F0EDE8;
          margin: 4px 0;
        }
        .account-menu-item {
          display: block;
          padding: 10px 12px;
          font-family: var(--font-body);
          font-size: 14px;
          font-weight: 500;
          color: #1C1917;
          text-decoration: none;
          border-radius: 10px;
          background: transparent;
          border: none;
          width: 100%;
          text-align: left;
          cursor: pointer;
          transition: background 0.15s ease, color 0.15s ease;
        }
        .account-menu-item:hover { background: #F5F3F0; }
        .account-menu-host {
          color: #FF385C;
          font-weight: 600;
        }
        .account-menu-host:hover { background: #FFF0F3; }
        .account-menu-logout { color: #B91C1C; font-weight: 600; }
        .account-menu-logout:hover { background: #FEF2F2; }

        .account-menu-confirm {
          padding: 10px;
          background: #FEF2F2;
          border: 1px solid #FCA5A5;
          border-radius: 10px;
          margin-top: 2px;
        }
        .account-menu-confirm p {
          margin: 0 0 8px;
          font-family: var(--font-body);
          font-size: 12px;
          font-weight: 600;
          color: #7F1D1D;
          text-align: center;
        }
        .account-menu-confirm-actions { display: flex; gap: 6px; }
        .account-menu-cancel,
        .account-menu-confirm-btn {
          flex: 1;
          padding: 7px 10px;
          border-radius: 100px;
          font-family: var(--font-body);
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.15s, color 0.15s, border-color 0.15s;
        }
        .account-menu-cancel {
          background: #fff;
          border: 1px solid #E8E4DE;
          color: #1C1917;
        }
        .account-menu-cancel:hover { background: #F5F3F0; }
        .account-menu-confirm-btn {
          background: #DC2626;
          border: 1px solid #DC2626;
          color: #fff;
        }
        .account-menu-confirm-btn:hover { background: #B91C1C; border-color: #B91C1C; }

        .notif-dot {
          position: absolute;
          top: 8px;
          right: 8px;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #FF385C;
          border: 2px solid #F9F7F4;
        }

        @media (max-width: 640px) {
          .nav-links { display: none !important; }
          .become-host-btn { display: none !important; }
          .profile-icon-btn { display: none !important; }
          .hamburger-icon-btn { display: flex !important; }
          /* Suppress the desktop dropdown on mobile — sidebar takes over */
          .desktop-auth-dropdown { display: none !important; }

          .mobile-sidebar-overlay {
            display: block;
            position: fixed;
            inset: 0;
            background: rgba(0,0,0,0.4);
            z-index: 90;
            animation: sidebar-fade 0.2s ease-out;
          }
          .mobile-sidebar {
            display: flex;
            flex-direction: column;
            position: fixed;
            top: 0; right: 0; bottom: 0;
            width: 84%;
            max-width: 360px;
            background: #FDFCFA;
            box-shadow: -16px 0 50px rgba(0,0,0,0.22);
            z-index: 100;
            animation: sidebar-slide 0.32s cubic-bezier(0.22, 1, 0.36, 1);
            overflow-y: auto;
            scrollbar-width: none;
          }
          .mobile-sidebar::-webkit-scrollbar { display: none; }

          .mobile-sidebar-header {
            position: relative;
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 18px 20px 22px;
            background: linear-gradient(135deg, #FFE4EA 0%, #FFF5F0 55%, #FDFCFA 100%);
            border-bottom: 1px solid rgba(232, 228, 222, 0.6);
            overflow: hidden;
          }
          .mobile-sidebar-blob {
            position: absolute;
            border-radius: 50%;
            filter: blur(40px);
            pointer-events: none;
          }
          .mobile-sidebar-blob-1 {
            width: 180px; height: 180px;
            background: radial-gradient(circle, rgba(255,56,92,0.28), transparent 70%);
            top: -80px; right: -50px;
          }
          .mobile-sidebar-blob-2 {
            width: 140px; height: 140px;
            background: radial-gradient(circle, rgba(255,180,140,0.32), transparent 70%);
            bottom: -60px; left: -30px;
          }

          .mobile-sidebar-close {
            position: relative;
            width: 32px; height: 32px;
            border: none;
            background: transparent;
            display: flex; align-items: center; justify-content: center;
            cursor: pointer; padding: 0;
            color: #1C1917;
            transition: color 0.15s, transform 0.12s;
            z-index: 1;
          }
          .mobile-sidebar-close:hover { color: #FF385C; }
          .mobile-sidebar-close:active { transform: scale(0.92); }

          .mobile-sidebar-avatar {
            position: relative;
            width: 44px; height: 44px;
            border-radius: 50%;
            background: linear-gradient(135deg, #FF385C 0%, #FF6B85 100%);
            color: #fff;
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: var(--font-display);
            font-size: 16px;
            font-weight: 700;
            flex-shrink: 0;
            overflow: hidden;
            letter-spacing: 0.2px;
            margin-left: auto;
            border: 2px solid #fff;
            box-shadow: 0 4px 12px rgba(255,56,92,0.25);
            z-index: 1;
          }

          .mobile-sidebar-profile-text {
            position: relative;
            display: flex;
            flex-direction: column;
            min-width: 0;
            text-align: left;
            flex: 1;
            z-index: 1;
          }
          .mobile-sidebar-greet {
            font-family: var(--font-body);
            font-size: 10px;
            font-weight: 700;
            color: #FF385C;
            margin: 0;
            letter-spacing: 1px;
            text-transform: uppercase;
          }
          .mobile-sidebar-username {
            font-family: var(--font-display);
            font-size: 18px;
            font-weight: 700;
            color: #1C1917;
            margin: 4px 0 0;
            letter-spacing: -0.4px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            line-height: 1.15;
          }


          .mobile-sidebar-logout {
            border: 1px solid #E8E4DE;
            background: #fff;
            font-family: var(--font-body);
            font-size: 14px;
            font-weight: 600;
            color: #B91C1C;
            cursor: pointer;
            margin-top: 12px;
            justify-content: flex-start;
          }
          .mobile-sidebar-logout:hover {
            background: #FEF2F2;
            border-color: #FCA5A5;
          }
          .mobile-sidebar-logout .mobile-sidebar-link-icon {
            background: #FEF2F2;
            color: #B91C1C;
          }
          .mobile-sidebar-logout:hover .mobile-sidebar-link-icon {
            background: #FEE2E2;
          }

          .mobile-sidebar-confirm {
            margin: 4px 4px 0;
            padding: 14px;
            border-radius: 12px;
            background: #FEF2F2;
            border: 1px solid #FCA5A5;
            text-align: center;
            animation: confirm-pop 0.18s ease-out;
          }
          .mobile-sidebar-confirm-text {
            margin: 0 0 12px;
            font-family: var(--font-body);
            font-size: 13px;
            font-weight: 600;
            color: #7F1D1D;
          }
          .mobile-sidebar-confirm-actions {
            display: flex;
            gap: 8px;
          }
          .mobile-sidebar-confirm-btn {
            flex: 1;
            padding: 10px 12px;
            border-radius: 100px;
            font-family: var(--font-body);
            font-size: 13px;
            font-weight: 600;
            cursor: pointer;
            transition: background 0.15s, color 0.15s, border-color 0.15s;
          }
          .mobile-sidebar-confirm-btn.cancel {
            background: #fff;
            border: 1px solid #E8E4DE;
            color: #1C1917;
          }
          .mobile-sidebar-confirm-btn.cancel:hover {
            background: #F5F3F0;
          }
          .mobile-sidebar-confirm-btn.confirm {
            background: #DC2626;
            border: 1px solid #DC2626;
            color: #fff;
          }
          .mobile-sidebar-confirm-btn.confirm:hover {
            background: #B91C1C;
            border-color: #B91C1C;
          }

          @keyframes confirm-pop {
            from { opacity: 0; transform: scale(0.96); }
            to   { opacity: 1; transform: scale(1); }
          }

          .mobile-sidebar-nav {
            display: flex;
            flex-direction: column;
            padding: 14px 12px 10px;
            gap: 2px;
            flex: 1;
          }
          .mobile-sidebar-section {
            font-family: var(--font-body);
            font-size: 10px;
            font-weight: 700;
            color: #A8A29E;
            letter-spacing: 1.4px;
            text-transform: uppercase;
            margin: 8px 14px 8px;
          }
          .mobile-sidebar-admin-badge {
            display: inline-flex;
            align-items: center;
            gap: 5px;
            margin: 8px 14px 10px;
            padding: 4px 10px;
            background: linear-gradient(135deg, #FFF0F3 0%, #FFE4EA 100%);
            border: 1px solid #FFCCD5;
            border-radius: 100px;
            color: #FF385C;
            font-family: var(--font-body);
            font-size: 10px;
            font-weight: 700;
            letter-spacing: 0.6px;
            text-transform: uppercase;
            width: fit-content;
            box-shadow: 0 1px 3px rgba(255, 56, 92, 0.12);
          }
          .mobile-sidebar-link {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 12px 14px;
            font-family: var(--font-display);
            font-size: 15.5px;
            font-weight: 500;
            color: #1C1917;
            text-decoration: none;
            border-radius: 14px;
            letter-spacing: -0.2px;
            transition: background 0.2s ease, color 0.2s ease, transform 0.18s cubic-bezier(0.22, 1, 0.36, 1);
            width: 100%;
            box-sizing: border-box;
            text-align: left;
            position: relative;
            opacity: 0;
            animation: link-in 0.36s cubic-bezier(0.22, 1, 0.36, 1) forwards;
          }
          .mobile-sidebar-link-text {
            flex: 1;
            min-width: 0;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
          .mobile-sidebar-link-chev {
            color: #D6D3CE;
            flex-shrink: 0;
            transition: transform 0.2s ease, color 0.2s ease;
          }
          .mobile-sidebar-link:hover {
            background: #F9F5F1;
            transform: translateX(2px);
          }
          .mobile-sidebar-link:hover .mobile-sidebar-link-chev {
            transform: translateX(2px);
            color: #1C1917;
          }
          .mobile-sidebar-link:active {
            background: #F0EDE8;
            transform: translateX(2px) scale(0.99);
          }
          .mobile-sidebar-link.is-active {
            color: #FF385C;
            background: linear-gradient(95deg, #FFF0F3 0%, #FFF7F4 100%);
            font-weight: 600;
            box-shadow: 0 1px 3px rgba(255,56,92,0.08);
          }
          .mobile-sidebar-link.is-active .mobile-sidebar-link-chev {
            color: #FF385C;
          }
          .mobile-sidebar-link-icon {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 36px;
            height: 36px;
            border-radius: 11px;
            background: #F5F3F0;
            color: #57534E;
            flex-shrink: 0;
            transition: background 0.2s ease, color 0.2s ease, transform 0.2s ease;
          }
          .mobile-sidebar-link:hover .mobile-sidebar-link-icon {
            background: #fff;
            color: #1C1917;
          }
          .mobile-sidebar-link.is-active .mobile-sidebar-link-icon {
            background: linear-gradient(135deg, #FF385C 0%, #FF6B85 100%);
            color: #fff;
            box-shadow: 0 4px 12px rgba(255,56,92,0.3);
          }

          @keyframes link-in {
            from { opacity: 0; transform: translateX(-8px); }
            to   { opacity: 1; transform: translateX(0); }
          }

          .mobile-sidebar-auth-row {
            display: flex;
            gap: 8px;
            margin-top: 4px;
          }
          .mobile-sidebar-auth {
            flex: 1;
            border: 1px solid #E8E4DE;
            font-size: 14px;
            font-weight: 600;
            font-family: var(--font-body);
            padding: 11px 12px;
            background: #fff;
            justify-content: center;
            text-align: center;
          }
          .mobile-sidebar-auth:hover { background: #F5F3F0; }

          .mobile-sidebar-footer {
            padding: 12px 12px 20px;
          }
          .mobile-sidebar-cta-card {
            position: relative;
            background:
              radial-gradient(120% 80% at 100% 0%, rgba(255,107,133,0.35) 0%, transparent 60%),
              linear-gradient(140deg, #1C1917 0%, #2C2724 100%);
            border-radius: 18px;
            padding: 18px 18px 16px;
            color: #fff;
            text-align: left;
            overflow: hidden;
            box-shadow: 0 10px 24px rgba(28,25,23,0.18);
          }
          .mobile-sidebar-cta-spark {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 26px; height: 26px;
            border-radius: 8px;
            background: rgba(255,255,255,0.12);
            color: #FFD166;
            margin-bottom: 10px;
            backdrop-filter: blur(6px);
          }
          .mobile-sidebar-cta-title {
            font-family: var(--font-display);
            font-size: 16px;
            font-weight: 600;
            color: #fff;
            margin: 0 0 4px;
            letter-spacing: -0.2px;
          }
          .mobile-sidebar-cta-sub {
            font-family: var(--font-body);
            font-size: 12px;
            color: rgba(255,255,255,0.72);
            margin: 0 0 14px;
            line-height: 1.5;
          }
          .mobile-sidebar-cta {
            display: block;
            padding: 11px 16px;
            font-family: var(--font-body);
            font-size: 14px;
            font-weight: 600;
            color: #fff !important;
            background: #FF385C;
            border-radius: 100px;
            text-decoration: none;
            text-align: center;
            transition: background 0.15s, transform 0.12s;
            box-shadow: 0 4px 12px rgba(255,56,92,0.4);
          }
          .mobile-sidebar-cta:hover { background: #E31C5F !important; }
          .mobile-sidebar-cta:active {
            background: #E31C5F !important;
            transform: scale(0.98);
          }
        }

        @keyframes sidebar-slide {
          from { transform: translateX(100%); }
          to   { transform: translateX(0); }
        }
        @keyframes sidebar-fade {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
      `}</style>

    </header>
  );
}
