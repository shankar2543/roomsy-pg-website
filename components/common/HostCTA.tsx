import Link from "next/link";
import { motion } from "framer-motion";

const ease = [0.22, 1, 0.36, 1];

export default function HostCTA() {
  return (
    <section className="hostcta-section" style={{ backgroundColor: "#F9F7F4", padding: "32px 16px 56px" }}>
      <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
        <motion.div
          initial={{ opacity: 0, y: 60, scale: 0.97 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, ease }}
          style={{ backgroundColor: "#1C1917", borderRadius: "28px", padding: "64px 56px", display: "grid", gridTemplateColumns: "1fr auto", alignItems: "center", gap: "40px", position: "relative", overflow: "hidden" }}
          className="host-cta-grid"
        >
          {/* Glows */}
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="hostcta-glow"
            style={{ position: "absolute", top: "-60px", right: "200px", width: "300px", height: "300px", borderRadius: "50%", background: "radial-gradient(circle, rgba(249,115,22,0.1) 0%, transparent 70%)", pointerEvents: "none" }}
          />
          <motion.div
            animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0.9, 0.5] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="hostcta-glow"
            style={{ position: "absolute", bottom: "-40px", right: "80px", width: "200px", height: "200px", borderRadius: "50%", background: "radial-gradient(circle, rgba(249,115,22,0.08) 0%, transparent 70%)", pointerEvents: "none" }}
          />

          <div style={{ position: "relative", zIndex: 1 }}>
            <motion.p
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, ease, delay: 0.2 }}
              className="hostcta-eyebrow"
              style={{ fontFamily: "var(--font-body)", fontSize: "12px", fontWeight: "600", color: "#FF385C", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "16px" }}
            >
              For PG Owners
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease, delay: 0.3 }}
              className="hostcta-h2"
              style={{ fontFamily: "var(--font-display)", fontSize: "clamp(26px, 3.5vw, 44px)", fontWeight: "600", color: "#F9F7F4", letterSpacing: "-1px", lineHeight: "1.15", marginBottom: "16px" }}
            >
              List your PG and{" "}
              <span style={{ color: "#FF385C", fontStyle: "italic" }}>start earning</span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease, delay: 0.4 }}
              className="hostcta-desc"
              style={{ fontFamily: "var(--font-body)", fontSize: "15px", color: "#A8A29E", lineHeight: "1.6", maxWidth: "480px" }}
            >
              Join hundreds of verified PG owners on Roomsy. Get quality tenants with ID-verified bookings directly — no brokerage, no middlemen.
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ type: "spring", stiffness: 260, damping: 22, delay: 0.4 }}
            style={{ position: "relative", zIndex: 1, flexShrink: 0 }}
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
              <Link
                href="/auth/signup?role=pg_admin"
                className="hostcta-btn"
                style={{ display: "inline-flex", alignItems: "center", gap: "8px", backgroundColor: "#FF385C", color: "#fff", textDecoration: "none", fontFamily: "var(--font-body)", fontSize: "15px", fontWeight: "600", borderRadius: "14px", padding: "16px 32px", whiteSpace: "nowrap" }}
              >
                Become a Host →
              </Link>
            </motion.div>
            <p className="hostcta-fineprint" style={{ fontFamily: "var(--font-body)", fontSize: "12px", color: "#57534E", textAlign: "center", marginTop: "10px" }}>
              Free to list · No commission
            </p>
          </motion.div>
        </motion.div>
      </div>

      <style>{`
        @media (max-width: 640px) {
          .hostcta-section { padding: 12px 14px 32px !important; }
          .host-cta-grid {
            grid-template-columns: 1fr !important;
            padding: 22px 18px !important;
            gap: 14px !important;
            border-radius: 18px !important;
            text-align: left;
          }
          .hostcta-glow { display: none !important; }
          .hostcta-eyebrow {
            font-size: 10px !important;
            margin-bottom: 8px !important;
            letter-spacing: 0.8px !important;
          }
          .hostcta-h2 {
            font-size: 20px !important;
            letter-spacing: -0.5px !important;
            margin-bottom: 8px !important;
          }
          .hostcta-desc {
            font-size: 12px !important;
            line-height: 1.45 !important;
          }
          .hostcta-btn {
            font-size: 14px !important;
            padding: 12px 22px !important;
            border-radius: 100px !important;
          }
          .hostcta-fineprint {
            font-size: 11px !important;
            margin-top: 6px !important;
          }
        }
      `}</style>
    </section>
  );
}
