import { motion } from "framer-motion";
import { HiBan, HiShieldCheck, HiUserGroup, HiCalendar } from "react-icons/hi";
import { ReactNode } from "react";

interface Feature { icon: ReactNode; title: string; desc: string; }

const FEATURES: Feature[] = [
  { icon: <HiBan size={20} />, title: "Zero Brokerage", desc: "Connect directly with PG owners. No middlemen, no hidden charges, no commission." },
  { icon: <HiShieldCheck size={20} />, title: "Verified Listings", desc: "Every PG is reviewed and approved by our team before going live on the platform." },
  { icon: <HiUserGroup size={20} />, title: "Boys, Girls & Co-living", desc: "Filter by PG type. Find the right environment that matches your comfort and lifestyle." },
  { icon: <HiCalendar size={20} />, title: "Flexible Stays", desc: "Book daily, weekly or monthly. Move in fast and move out with a simple notice period." },
];

const ease: [number, number, number, number] = [0.22, 1, 0.36, 1];

export default function WhyRoomsy() {
  return (
    <section className="why-section" style={{ backgroundColor: "#F2F2F2", padding: "80px 24px 96px", position: "relative" }}>
      <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease }}
          className="why-header"
          style={{ marginBottom: "48px" }}
        >
          <p className="why-eyebrow" style={{
            display: "inline-flex", alignItems: "center", gap: "10px",
            fontFamily: "var(--font-body)", fontSize: "10px", fontWeight: 700,
            color: "var(--terracotta)", textTransform: "uppercase", letterSpacing: "3px",
            marginBottom: "16px",
          }}>
            <span style={{ width: "28px", height: "1px", backgroundColor: "var(--terracotta)" }} />
            Why Roomsy
          </p>
          <h2 className="why-h2" style={{
            fontFamily: "var(--font-display)", fontSize: "clamp(28px, 3.6vw, 48px)",
            fontWeight: 600, color: "var(--ink)", letterSpacing: "-0.025em", lineHeight: "1.15",
            marginBottom: "16px", whiteSpace: "nowrap",
          }}>
            Renting a PG should be <span style={{ fontStyle: "italic", color: "var(--terracotta)" }}>simple</span>.
          </h2>
          <p className="why-sub" style={{
            fontFamily: "var(--font-body)", fontSize: "15px", color: "var(--muted-ink)",
            lineHeight: "1.75", maxWidth: "640px",
          }}>
            We started Roomsy because finding a decent PG meant ten broker calls, three site
            visits, and a deposit you&apos;d never see again. Four promises take the friction out.
          </p>
        </motion.div>

        <div className="why-grid" style={{
          display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "20px",
        }}>
          {FEATURES.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, ease, delay: i * 0.08 }}
              whileHover={{ y: -4 }}
              className="why-card"
              style={{
                backgroundColor: "#FFFFFF",
                border: "1.5px solid var(--rule)",
                borderRadius: "14px",
                padding: "26px 24px",
                boxShadow: "0 1px 2px rgba(26,23,20,0.04)",
                cursor: "default",
              }}
            >
              <div className="why-icon" style={{
                width: "44px", height: "44px",
                borderRadius: "12px",
                backgroundColor: "transparent",
                border: "1.5px solid var(--terracotta)",
                color: "var(--terracotta)",
                display: "flex", alignItems: "center", justifyContent: "center",
                marginBottom: "20px",
              }}>
                {f.icon}
              </div>
              <h3 className="why-title" style={{
                fontFamily: "var(--font-body)", fontSize: "17px", fontWeight: 700,
                color: "var(--ink)", letterSpacing: "-0.2px", marginBottom: "10px",
                lineHeight: 1.25,
              }}>
                {f.title}
              </h3>
              <p className="why-desc" style={{
                fontFamily: "var(--font-body)", fontSize: "13.5px",
                color: "var(--muted-ink)", lineHeight: 1.65,
              }}>
                {f.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>

      <style>{`
        .why-card {
          transition: border-color 0.25s ease, box-shadow 0.3s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .why-icon {
          transition: background-color 0.25s ease, border-color 0.25s ease, color 0.25s ease, box-shadow 0.25s ease;
        }
        @media (min-width: 769px) {
          .why-card:hover {
            border-color: var(--terracotta) !important;
            box-shadow: 0 14px 36px rgba(255,56,92,0.14);
          }
          .why-card:hover .why-icon {
            background-color: var(--terracotta) !important;
            border-color: var(--terracotta) !important;
            color: #fff !important;
            box-shadow: inset 0 0 0 1.5px rgba(255,255,255,0.85);
          }
        }
        @media (max-width: 1100px) {
          .why-h2 { white-space: normal !important; font-size: clamp(24px, 4vw, 40px) !important; }
          .why-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 640px) {
          .why-section { padding: 56px 18px !important; }
          .why-header { margin-bottom: 28px !important; }
          .why-grid { grid-template-columns: 1fr 1fr !important; gap: 12px !important; }
          .why-card { padding: 18px 16px !important; border-radius: 12px !important; }
          .why-icon {
            width: 36px !important; height: 36px !important;
            border-radius: 10px !important; margin-bottom: 12px !important;
          }
          .why-icon svg { width: 16px !important; height: 16px !important; }
          .why-title { font-size: 14px !important; margin-bottom: 6px !important; }
          .why-desc { font-size: 12px !important; line-height: 1.5 !important; }
        }
      `}</style>
    </section>
  );
}
