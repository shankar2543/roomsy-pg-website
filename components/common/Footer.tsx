import Link from "next/link";
import { HiLocationMarker, HiPhone, HiMail, HiChevronRight } from "react-icons/hi";
import { FaFacebookF, FaInstagram, FaGooglePlay, FaApple } from "react-icons/fa";

function ColTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="footer-coltitle" style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
      <span className="footer-coltitle-bar" style={{ width: "3px", height: "18px", backgroundColor: "var(--terracotta)", borderRadius: "2px", flexShrink: 0 }} />
      <h4 style={{ fontFamily: "var(--font-body)", fontSize: "15px", fontWeight: 700, color: "#fff", margin: 0, letterSpacing: "-0.1px" }}>
        {children}
      </h4>
    </div>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="footer-link"
      style={{
        display: "flex", alignItems: "center", gap: "8px",
        fontFamily: "var(--font-body)", fontSize: "13px", fontWeight: 500,
        color: "rgba(244,238,227,0.65)", textDecoration: "none",
        transition: "color 0.2s, transform 0.2s", marginBottom: "12px",
        lineHeight: 1.5,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.color = "#fff";
        e.currentTarget.style.transform = "translateX(4px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.color = "rgba(244,238,227,0.65)";
        e.currentTarget.style.transform = "translateX(0)";
      }}
    >
      <HiChevronRight size={13} color="var(--terracotta)" style={{ flexShrink: 0 }} />
      {children}
    </Link>
  );
}

function ContactRow({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="footer-contact-row" style={{ display: "flex", gap: "12px", alignItems: "flex-start", marginBottom: "14px" }}>
      <div className="footer-contact-icon" style={{ width: "32px", height: "32px", borderRadius: "8px", backgroundColor: "rgba(255,56,92,0.10)", border: "1px solid rgba(255,56,92,0.22)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <span style={{ color: "var(--terracotta)", display: "inline-flex" }}>{icon}</span>
      </div>
      <span className="footer-contact-text" style={{ fontFamily: "var(--font-body)", fontSize: "13px", color: "rgba(244,238,227,0.7)", lineHeight: "1.55", paddingTop: "6px" }}>
        {children}
      </span>
    </div>
  );
}

const SOCIAL = [
  { icon: <FaFacebookF size={14} />, href: "#", label: "Facebook" },
  { icon: <FaInstagram size={14} />, href: "#", label: "Instagram" },
  { icon: <FaGooglePlay size={14} />, href: "#", label: "Get it on Google Play" },
  { icon: <FaApple size={15} />, href: "#", label: "Download on the App Store" },
];

export default function Footer() {
  return (
    <footer style={{ backgroundColor: "var(--ink)", position: "relative" }}>
      <div className="footer-inner" style={{ maxWidth: "1280px", margin: "0 auto", padding: "36px 24px 22px" }}>
        {/* 4-column grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr 1fr 1.2fr", gap: "40px" }} className="footer-grid">

          {/* Brand */}
          <div className="footer-brand">
            <Link href="/" className="footer-brand-link" style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "10px", marginBottom: "14px" }}>
              <span className="footer-brand-logo" style={{ width: "34px", height: "34px", borderRadius: "9px", backgroundColor: "var(--terracotta)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 6px 16px rgba(255,56,92,0.35)", flexShrink: 0 }}>
                <span style={{ fontFamily: "var(--font-display)", fontSize: "18px", fontWeight: 700, color: "#fff", lineHeight: 1 }}>R</span>
              </span>
              <span className="footer-brand-name" style={{ fontFamily: "var(--font-display)", fontSize: "30px", fontWeight: 600, color: "var(--terracotta)", letterSpacing: "-0.03em", lineHeight: 1, display: "inline-block" }}>
                Roomsy<span style={{ color: "var(--terracotta)", fontStyle: "italic" }}>.</span>
              </span>
            </Link>
            <p className="footer-brand-desc" style={{ fontFamily: "var(--font-body)", fontSize: "12px", color: "rgba(244,238,227,0.5)", lineHeight: "1.6", maxWidth: "260px", marginBottom: "16px" }}>
              India&apos;s most trusted platform for finding verified PGs &amp; Hostels. We ensure a safe and comfortable stay for everyone.
            </p>
            <div className="footer-actions" style={{ display: "flex", flexWrap: "wrap", gap: "10px", alignItems: "center" }}>
              <div className="footer-socials" style={{ display: "flex", gap: "10px" }}>
                {SOCIAL.map((s, i) => (
                  <a key={i} href={s.href} aria-label={s.label}
                    style={{ width: "36px", height: "36px", borderRadius: "50%", backgroundColor: "transparent", border: "1px solid rgba(244,238,227,0.18)", display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(244,238,227,0.6)", textDecoration: "none", transition: "all 0.2s" }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "var(--terracotta)"; e.currentTarget.style.color = "#fff"; e.currentTarget.style.borderColor = "var(--terracotta)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "rgba(244,238,227,0.6)"; e.currentTarget.style.borderColor = "rgba(244,238,227,0.18)"; }}
                  >
                    {s.icon}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <ColTitle>Quick Links</ColTitle>
            <FooterLink href="/">Home</FooterLink>
            <FooterLink href="/pgs">Find PG</FooterLink>
            <FooterLink href="/auth/signup?role=pg_admin">Become a Host</FooterLink>
          </div>

          {/* For Owners */}
          <div>
            <ColTitle>For Owners</ColTitle>
            <FooterLink href="/auth/signup?role=pg_admin">List Property</FooterLink>
            <FooterLink href="/auth/login">Owner Login</FooterLink>
          </div>

          {/* Contact Us */}
          <div className="footer-contact-col">
            <ColTitle>Contact Us</ColTitle>
            <ContactRow icon={<HiPhone size={16} />}>
              +91 90000 00001
            </ContactRow>
            <ContactRow icon={<HiMail size={16} />}>
              support@roomsy.in
            </ContactRow>
            <ContactRow icon={<HiLocationMarker size={16} />}>
              Hitech City, Hyderabad,<br />Telangana, India
            </ContactRow>
          </div>
        </div>

        {/* Divider + bottom bar */}
        <div className="footer-bottom" style={{ borderTop: "1px solid rgba(244,238,227,0.10)", marginTop: "32px", paddingTop: "16px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
          <span style={{ fontFamily: "var(--font-body)", fontSize: "12px", color: "rgba(244,238,227,0.4)", letterSpacing: "0.2px" }}>
            © 2026 Roomsy. All rights reserved.
          </span>
          <div style={{ display: "flex", gap: "20px", alignItems: "center", flexWrap: "wrap" }}>
            <Link
              href="/privacy"
              style={{
                fontFamily: "var(--font-body)", fontSize: "12px", fontWeight: 500,
                color: "rgba(244,238,227,0.55)", textDecoration: "none",
                letterSpacing: "0.3px", transition: "color 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--terracotta)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(244,238,227,0.55)")}
            >
              Privacy Policy
            </Link>
            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <span style={{ width: "5px", height: "5px", borderRadius: "50%", backgroundColor: "var(--terracotta)" }} />
              <span style={{ fontFamily: "var(--font-body)", fontSize: "12px", color: "rgba(244,238,227,0.55)", letterSpacing: "0.2px" }}>
                Made with care in India
              </span>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .footer-grid { grid-template-columns: 1fr 1fr !important; }
        }

        /* ── Mobile: tight, editorial, calm ─────────────────────── */
        @media (max-width: 640px) {
          .footer-inner {
            padding: 28px 22px 18px !important;
          }
          .footer-grid {
            grid-template-columns: 1fr 1fr !important;
            gap: 24px 20px !important;
          }

          /* Brand row — centred, stacked */
          .footer-brand {
            grid-column: 1 / -1;
            display: flex !important;
            flex-direction: column !important;
            align-items: center !important;
            text-align: center;
            gap: 10px;
            padding-bottom: 18px;
            border-bottom: 1px solid rgba(244,238,227,0.08);
          }
          .footer-brand-link {
            margin-bottom: 0 !important;
            gap: 10px !important;
            justify-content: center;
          }
          .footer-brand-logo {
            width: 32px !important;
            height: 32px !important;
            border-radius: 8px !important;
          }
          .footer-brand-logo span { font-size: 16px !important; }
          .footer-brand-name { font-size: 22px !important; }
          .footer-brand-desc { display: none !important; }
          .footer-actions { gap: 8px !important; justify-content: center !important; margin-top: 4px; }
          .footer-socials { gap: 8px !important; }
          .footer-socials a {
            width: 32px !important;
            height: 32px !important;
            border-radius: 50% !important;
          }

          /* Section titles smaller and tighter */
          .footer-coltitle {
            margin-bottom: 12px !important;
            gap: 8px !important;
          }
          .footer-coltitle-bar {
            width: 2px !important;
            height: 14px !important;
          }
          .footer-coltitle h4 {
            font-size: 12px !important;
            letter-spacing: 0.6px !important;
            text-transform: uppercase;
          }

          /* Compact link rows */
          .footer-link {
            font-size: 13px !important;
            margin-bottom: 8px !important;
            gap: 6px !important;
          }

          /* Contact column spans full width */
          .footer-contact-col {
            grid-column: 1 / -1;
            padding-top: 18px;
            border-top: 1px solid rgba(244,238,227,0.08);
          }
          .footer-contact-row {
            margin-bottom: 10px !important;
            gap: 10px !important;
            align-items: center !important;
          }
          .footer-contact-icon {
            width: 30px !important;
            height: 30px !important;
            border-radius: 7px !important;
          }
          .footer-contact-icon span { display: inline-flex; transform: scale(0.85); }
          .footer-contact-text {
            font-size: 12.5px !important;
            padding-top: 0 !important;
            line-height: 1.45 !important;
          }
          .footer-contact-text br { display: none; }

          /* Bottom bar: centred, single line, slim */
          .footer-bottom {
            margin-top: 20px !important;
            padding-top: 14px !important;
            flex-direction: column !important;
            text-align: center;
            gap: 8px !important;
          }
          .footer-bottom > span { font-size: 11px !important; }
          .footer-bottom > div { gap: 14px !important; justify-content: center; }
        }
      `}</style>
    </footer>
  );
}
