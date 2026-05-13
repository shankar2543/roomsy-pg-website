import { motion } from "framer-motion";
import { HiBan, HiShieldCheck, HiUserGroup, HiCalendar } from "react-icons/hi";
import { ReactNode } from "react";

interface Feature { icon: ReactNode; title: string; desc: string; }

const FEATURES: Feature[] = [
  { icon: <HiBan size={22} color="#fff" />, title: "Zero Brokerage", desc: "Connect directly with PG owners. No middlemen, no hidden charges, no commission." },
  { icon: <HiShieldCheck size={22} color="#fff" />, title: "Verified Listings", desc: "Every PG is reviewed and approved by our team before going live on the platform." },
  { icon: <HiUserGroup size={22} color="#fff" />, title: "Boys, Girls & Co-living", desc: "Filter by PG type. Find the right environment that matches your comfort and lifestyle." },
  { icon: <HiCalendar size={22} color="#fff" />, title: "Flexible Stays", desc: "Book daily, weekly or monthly. Move in fast and move out with a simple notice period." },
];

const ease = [0.22, 1, 0.36, 1];

export default function WhyRoomsy() {
  return (
    <section className="why-section" style={{ backgroundColor: "#F9F7F4", padding: "56px 16px" }}>
      <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease }}
          className="why-header"
          style={{ marginBottom: "56px" }}
        >
          <p className="why-eyebrow" style={{ display: "inline-flex", alignItems: "center", gap: "6px", backgroundColor: "#FFF0F3", border: "1px solid #FFD6DE", borderRadius: "100px", padding: "3px 9px 3px 7px", fontFamily: "var(--font-body)", fontSize: "10px", fontWeight: "600", color: "#FF385C", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "12px" }}>
            <span style={{ width: "5px", height: "5px", borderRadius: "50%", backgroundColor: "#FF385C", flexShrink: 0 }} />
            Why Roomsy
          </p>
          <h2 className="why-h2" style={{ fontFamily: "var(--font-display)", fontSize: "clamp(28px, 4vw, 48px)", fontWeight: "600", color: "#1C1917", letterSpacing: "-1px", lineHeight: "1.15", maxWidth: "480px" }}>
            Renting a PG should be{" "}
            <span style={{ color: "#FF385C", fontStyle: "italic" }}>simple</span>
          </h2>
        </motion.div>

        <div className="why-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px" }}>
          {FEATURES.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, ease, delay: i * 0.1 }}
              whileHover={{ y: -6, boxShadow: "0 16px 48px rgba(0,0,0,0.1)" }}
              className="why-card"
              style={{ backgroundColor: "#fff", border: "1px solid #E8E4DE", borderRadius: "20px", padding: "28px", cursor: "default" }}
            >
              <motion.div
                whileHover={{ scale: 1.12, rotate: 3 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
                className="why-icon"
                style={{ width: "52px", height: "52px", borderRadius: "14px", backgroundColor: "#FF385C", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "20px", boxShadow: "0 6px 20px rgba(249,115,22,0.35)", flexShrink: 0 }}
              >
                {f.icon}
              </motion.div>
              <h3 className="why-title" style={{ fontFamily: "var(--font-display)", fontSize: "20px", fontWeight: "600", color: "#1C1917", letterSpacing: "-0.3px", marginBottom: "10px" }}>
                {f.title}
              </h3>
              <p className="why-desc" style={{ fontFamily: "var(--font-body)", fontSize: "14px", color: "#78716C", lineHeight: "1.65" }}>
                {f.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>

      <style>{`
        @media (min-width: 769px) {
          .why-card {
            transition: transform 0.35s cubic-bezier(0.22, 1, 0.36, 1),
                        box-shadow 0.35s cubic-bezier(0.22, 1, 0.36, 1),
                        border-color 0.35s ease !important;
          }
          .why-card:hover {
            border-color: #DCD5CC !important;
          }
        }
        @media (max-width: 640px) {
          .why-section { padding: 28px 14px !important; }
          .why-header { margin-bottom: 18px !important; }
          .why-eyebrow { font-size: 10px !important; margin-bottom: 6px !important; letter-spacing: 0.8px !important; }
          .why-h2 { font-size: 22px !important; letter-spacing: -0.5px !important; }
          .why-grid {
            grid-template-columns: 1fr 1fr !important;
            gap: 10px !important;
          }
          .why-card {
            padding: 14px !important;
            border-radius: 14px !important;
          }
          .why-icon {
            width: 36px !important;
            height: 36px !important;
            border-radius: 10px !important;
            margin-bottom: 10px !important;
            box-shadow: 0 3px 10px rgba(249,115,22,0.25) !important;
          }
          .why-icon svg { width: 18px !important; height: 18px !important; }
          .why-title { font-size: 14px !important; margin-bottom: 4px !important; letter-spacing: -0.1px !important; }
          .why-desc { font-size: 12px !important; line-height: 1.45 !important; }
        }
      `}</style>
    </section>
  );
}
