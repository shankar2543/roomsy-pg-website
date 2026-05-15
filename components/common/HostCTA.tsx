import Link from "next/link";
import { motion } from "framer-motion";
import { HiArrowRight } from "react-icons/hi";

const ease: [number, number, number, number] = [0.22, 1, 0.36, 1];

export default function HostCTA() {
  return (
    <section className="hostcta-section" style={{ backgroundColor: "#FFFFFF", padding: "24px 24px 112px" }}>
      <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, ease }}
          style={{
            backgroundColor: "var(--ink)", borderRadius: "6px",
            padding: "72px 72px",
            position: "relative", overflow: "hidden",
            display: "grid", gridTemplateColumns: "1.4fr 1fr",
            alignItems: "center", gap: "48px",
          }}
          className="host-cta-grid"
        >
          {/* Decorative oversize italic background */}
          <span aria-hidden="true" style={{
            position: "absolute",
            top: "-30px", right: "-20px",
            fontFamily: "var(--font-display)", fontStyle: "italic",
            fontSize: "240px", fontWeight: 400, lineHeight: 1,
            color: "rgba(244,238,227,0.04)",
            pointerEvents: "none", letterSpacing: "-0.05em",
            fontVariationSettings: "'opsz' 144, 'SOFT' 100",
            whiteSpace: "nowrap",
          }}>
            owners
          </span>

          {/* Soft glow */}
          <motion.div
            aria-hidden="true"
            animate={{ opacity: [0.4, 0.7, 0.4] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            style={{
              position: "absolute", bottom: "-80px", left: "30%",
              width: "320px", height: "320px", borderRadius: "50%",
              background: "radial-gradient(circle, rgba(255,56,92,0.22) 0%, transparent 60%)",
              pointerEvents: "none",
            }}
          />

          <div style={{ position: "relative", zIndex: 1 }}>
            <motion.p
              initial={{ opacity: 0, x: -16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, ease, delay: 0.2 }}
              style={{
                display: "inline-flex", alignItems: "center", gap: "10px",
                fontFamily: "var(--font-body)", fontSize: "10px", fontWeight: 700,
                color: "var(--terracotta)", letterSpacing: "3px", textTransform: "uppercase",
                marginBottom: "20px",
              }}
            >
              <span style={{ width: "28px", height: "1px", backgroundColor: "var(--terracotta)" }} />
              For owners
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, ease, delay: 0.3 }}
              className="hostcta-h2"
              style={{
                fontFamily: "var(--font-display)", fontSize: "clamp(28px, 3.6vw, 48px)",
                fontWeight: 600, color: "var(--paper)", letterSpacing: "-0.025em", lineHeight: "1.1",
                marginBottom: "20px",
              }}
            >
              List your PG. <span style={{ fontStyle: "italic", color: "var(--terracotta)" }}>Start earning</span> by month-end.
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, ease, delay: 0.4 }}
              className="hostcta-desc"
              style={{
                fontFamily: "var(--font-body)", fontSize: "15px",
                color: "rgba(244,238,227,0.6)", lineHeight: "1.7",
                maxWidth: "460px",
              }}
            >
              Join verified PG owners across India. Get ID-checked tenants directly —
              free to list, no commission, no platform cut on rent.
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ type: "spring", stiffness: 260, damping: 24, delay: 0.4 }}
            style={{ position: "relative", zIndex: 1, justifySelf: "end" }}
            className="hostcta-cta-wrap"
          >
            <Link
              href="/auth/signup?role=pg_admin"
              className="hostcta-btn"
              style={{
                display: "inline-flex", alignItems: "center", gap: "14px",
                backgroundColor: "var(--terracotta)", color: "#fff",
                textDecoration: "none",
                fontFamily: "var(--font-body)", fontSize: "12px",
                fontWeight: 700, letterSpacing: "2.4px", textTransform: "uppercase",
                borderRadius: "4px", padding: "20px 32px", whiteSpace: "nowrap",
                transition: "background 0.2s ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--terracotta-deep)")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "var(--terracotta)")}
            >
              Become a host
              <HiArrowRight size={14} />
            </Link>
            <p style={{
              fontFamily: "var(--font-body)", fontSize: "11px",
              color: "rgba(244,238,227,0.4)", textAlign: "center",
              marginTop: "14px", letterSpacing: "1.2px",
            }}>
              Free to list &middot; No commission
            </p>
          </motion.div>
        </motion.div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .host-cta-grid {
            grid-template-columns: 1fr !important;
            padding: 48px 36px !important;
            gap: 32px !important;
          }
          .hostcta-cta-wrap { justify-self: start !important; }
        }
        @media (max-width: 640px) {
          .hostcta-section { padding: 12px 16px 72px !important; }
          .host-cta-grid { padding: 32px 24px !important; gap: 24px !important; }
          .hostcta-h2 { font-size: 26px !important; }
          .hostcta-desc { font-size: 13px !important; }
          .hostcta-btn { padding: 16px 24px !important; font-size: 11px !important; }
        }
      `}</style>
    </section>
  );
}
