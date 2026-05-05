import Link from "next/link";
import { HiLocationMarker, HiPhone, HiMail, HiChevronRight } from "react-icons/hi";
import { FaFacebookF, FaInstagram, FaTwitter, FaLinkedinIn } from "react-icons/fa";

function ColTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="footer-coltitle" style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
      <div className="footer-coltitle-bar" style={{ width: "4px", height: "24px", backgroundColor: "#FF385C", borderRadius: "2px", flexShrink: 0 }} />
      <h4 style={{ fontFamily: "var(--font-body)", fontSize: "16px", fontWeight: "700", color: "#fff", margin: 0, letterSpacing: "-0.2px" }}>
        {children}
      </h4>
    </div>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="footer-link" style={{ display: "flex", alignItems: "center", gap: "8px", fontFamily: "var(--font-body)", fontSize: "14px", color: "#A8A29E", textDecoration: "none", transition: "color 0.15s", marginBottom: "14px" }}
      onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
      onMouseLeave={(e) => (e.currentTarget.style.color = "#A8A29E")}
    >
      <HiChevronRight size={13} color="#FF385C" style={{ flexShrink: 0 }} />
      {children}
    </Link>
  );
}

function ContactRow({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="footer-contact-row" style={{ display: "flex", gap: "12px", alignItems: "flex-start", marginBottom: "14px" }}>
      <div className="footer-contact-icon" style={{ width: "36px", height: "36px", borderRadius: "8px", backgroundColor: "#1C1917", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, border: "1px solid #292524" }}>
        <span style={{ color: "#FF385C" }}>{icon}</span>
      </div>
      <span className="footer-contact-text" style={{ fontFamily: "var(--font-body)", fontSize: "13px", color: "#A8A29E", lineHeight: "1.6", paddingTop: "8px" }}>
        {children}
      </span>
    </div>
  );
}

const SOCIAL = [
  { icon: <FaFacebookF size={14} />, href: "#" },
  { icon: <FaInstagram size={14} />, href: "#" },
  { icon: <FaTwitter size={14} />, href: "#" },
  { icon: <FaLinkedinIn size={14} />, href: "#" },
];

export default function Footer() {
  return (
    <footer style={{ backgroundColor: "#0D0D0D", position: "relative" }}>
      {/* Wave top */}
      <div style={{ lineHeight: 0, overflow: "hidden" }}>
        <svg viewBox="0 0 1440 80" xmlns="http://www.w3.org/2000/svg" style={{ display: "block", width: "100%" }} preserveAspectRatio="none">
          <path d="M0,40 C240,80 480,0 720,40 C960,80 1200,0 1440,40 L1440,0 L0,0 Z" fill="#F9F7F4" />
        </svg>
      </div>

      <div className="footer-inner" style={{ maxWidth: "1200px", margin: "0 auto", padding: "56px 24px 32px" }}>
        {/* 4-column grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr 1fr 1.2fr", gap: "48px" }} className="footer-grid">

          {/* Brand */}
          <div className="footer-brand">
            <Link href="/" className="footer-brand-link" style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
              <div className="footer-brand-logo" style={{ width: "38px", height: "38px", borderRadius: "10px", backgroundColor: "#FF385C", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontFamily: "var(--font-display)", fontSize: "20px", fontWeight: "700", color: "#fff", lineHeight: 1 }}>R</span>
              </div>
              <span className="footer-brand-name" style={{ fontFamily: "var(--font-display)", fontSize: "22px", fontWeight: "600", color: "#fff", letterSpacing: "-0.3px" }}>
                Roomsy<span style={{ color: "#FF385C" }}>.</span>
              </span>
            </Link>
            <p className="footer-brand-desc" style={{ fontFamily: "var(--font-body)", fontSize: "13px", color: "#78716C", lineHeight: "1.75", maxWidth: "220px", marginBottom: "24px" }}>
              India's most trusted platform for finding verified PGs &amp; Hostels. We ensure a safe and comfortable stay for everyone.
            </p>
            <div className="footer-socials" style={{ display: "flex", gap: "10px" }}>
              {SOCIAL.map((s, i) => (
                <a key={i} href={s.href}
                  style={{ width: "34px", height: "34px", borderRadius: "8px", backgroundColor: "#1C1917", border: "1px solid #292524", display: "flex", alignItems: "center", justifyContent: "center", color: "#A8A29E", textDecoration: "none", transition: "all 0.15s" }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#FF385C"; e.currentTarget.style.color = "#fff"; e.currentTarget.style.borderColor = "#FF385C"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#1C1917"; e.currentTarget.style.color = "#A8A29E"; e.currentTarget.style.borderColor = "#292524"; }}
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <ColTitle>Quick Links</ColTitle>
            <FooterLink href="/">Home</FooterLink>
            <FooterLink href="/pgs">Find PG</FooterLink>
            <FooterLink href="/auth/signup?role=pg_admin">Become a Host</FooterLink>
            <FooterLink href="#">About Us</FooterLink>
            <FooterLink href="#">Contact</FooterLink>
          </div>

          {/* For Owners */}
          <div>
            <ColTitle>For Owners</ColTitle>
            <FooterLink href="/auth/signup?role=pg_admin">List Property</FooterLink>
            <FooterLink href="/auth/login">Owner Login</FooterLink>
            <FooterLink href="/user/dashboard">Dashboard</FooterLink>
            <FooterLink href="#">Terms &amp; Conditions</FooterLink>
            <FooterLink href="#">Privacy Policy</FooterLink>
          </div>

          {/* Contact Us */}
          <div className="footer-contact-col">
            <ColTitle>Contact Us</ColTitle>
            <ContactRow icon={<HiLocationMarker size={16} />}>
              Hitech City, Hyderabad,<br />Telangana, India
            </ContactRow>
            <ContactRow icon={<HiPhone size={16} />}>
              +91 90000 00001
            </ContactRow>
            <ContactRow icon={<HiMail size={16} />}>
              support@roomsy.in
            </ContactRow>
          </div>
        </div>

        {/* Divider + bottom bar */}
        <div className="footer-bottom" style={{ borderTop: "1px solid #1C1917", marginTop: "48px", paddingTop: "24px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
          <span style={{ fontFamily: "var(--font-body)", fontSize: "12px", color: "#44403C" }}>
            © 2026 Roomsy. All rights reserved.
          </span>
          <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
            <div style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "#FF385C" }} />
            <span style={{ fontFamily: "var(--font-body)", fontSize: "12px", color: "#44403C" }}>
              Made with care in India
            </span>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .footer-grid { grid-template-columns: 1fr 1fr !important; }
        }

        /* ── Mobile: tight, minimal layout ─────────────────────── */
        @media (max-width: 640px) {
          .footer-inner {
            padding: 28px 18px 18px !important;
          }
          .footer-grid {
            grid-template-columns: 1fr 1fr !important;
            gap: 22px 18px !important;
          }
          /* Brand row spans the full width with logo + socials inline */
          .footer-brand {
            grid-column: 1 / -1;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 12px;
          }
          .footer-brand-link {
            margin-bottom: 0 !important;
            gap: 8px !important;
          }
          .footer-brand-logo {
            width: 30px !important;
            height: 30px !important;
            border-radius: 8px !important;
          }
          .footer-brand-logo span { font-size: 16px !important; }
          .footer-brand-name { font-size: 18px !important; }
          .footer-brand-desc { display: none !important; }
          .footer-socials { gap: 6px !important; }
          .footer-socials a {
            width: 30px !important;
            height: 30px !important;
            border-radius: 7px !important;
          }

          /* Section titles smaller and tighter */
          .footer-coltitle {
            margin-bottom: 12px !important;
            gap: 8px !important;
          }
          .footer-coltitle-bar {
            width: 3px !important;
            height: 16px !important;
          }
          .footer-coltitle h4 { font-size: 13px !important; }

          /* Compact link rows */
          .footer-link {
            font-size: 12px !important;
            margin-bottom: 8px !important;
            gap: 6px !important;
          }

          /* Contact column spans full width with inline rows */
          .footer-contact-col { grid-column: 1 / -1; }
          .footer-contact-row {
            margin-bottom: 8px !important;
            gap: 8px !important;
            align-items: center !important;
          }
          .footer-contact-icon {
            width: 28px !important;
            height: 28px !important;
            border-radius: 6px !important;
          }
          .footer-contact-icon span { transform: scale(0.85); display: inline-flex; }
          .footer-contact-text {
            font-size: 12px !important;
            padding-top: 0 !important;
            line-height: 1.4 !important;
          }
          .footer-contact-text br { display: none; }

          /* Bottom bar: centered, slim */
          .footer-bottom {
            margin-top: 22px !important;
            padding-top: 14px !important;
            flex-direction: column !important;
            text-align: center;
            gap: 6px !important;
          }
          .footer-bottom span { font-size: 11px !important; }
        }
      `}</style>
    </footer>
  );
}
