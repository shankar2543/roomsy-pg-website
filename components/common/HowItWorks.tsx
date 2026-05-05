import { motion } from "framer-motion";

const STEPS = [
  { step: "01", title: "Search your area", desc: "Enter your city, area or use GPS to find PGs near you. Filter by type, price, and amenities." },
  { step: "02", title: "Pick your room", desc: "Browse verified listings, view photos, check amenities, and contact the owner directly." },
  { step: "03", title: "Book & move in", desc: "Submit your ID proof, confirm with the owner, pay directly — and move in on your chosen date." },
];

const ease = [0.22, 1, 0.36, 1];

export default function HowItWorks() {
  return (
    <section className="how-it-works-section" style={{ backgroundColor: "#1C1917", padding: "56px 16px" }}>
      <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease }}
          className="how-it-works-header"
          style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: "56px", flexWrap: "wrap", gap: "20px" }}
        >
          <div>
            <p style={{ fontFamily: "var(--font-body)", fontSize: "12px", fontWeight: "600", color: "#FF385C", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "12px" }}>
              How it works
            </p>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(28px, 4vw, 48px)", fontWeight: "600", color: "#F9F7F4", letterSpacing: "-1px", lineHeight: "1.15" }}>
              Move in within{" "}
              <span style={{ color: "#FF385C", fontStyle: "italic" }}>3 simple steps</span>
            </h2>
          </div>
        </motion.div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "2px" }} className="steps-grid">
          {STEPS.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 60 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.7, ease, delay: i * 0.15 }}
              className={`step-card ${i < STEPS.length - 1 ? "step-border" : ""}`}
              style={{ padding: "36px", borderRight: i < STEPS.length - 1 ? "1px solid #292524" : "none", position: "relative" }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ type: "spring", stiffness: 260, damping: 22, delay: i * 0.15 + 0.2 }}
                className="step-number"
                style={{ fontFamily: "var(--font-display)", fontSize: "64px", fontWeight: "700", color: "#fff", letterSpacing: "-2px", lineHeight: 1, marginBottom: "24px", userSelect: "none" }}
              >
                {s.step}
              </motion.div>

              <motion.div
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.15 + 0.4 }}
                className="step-dot"
                style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#FF385C", marginBottom: "16px", originX: 0 }}
              />

              <h3 className="step-title" style={{ fontFamily: "var(--font-display)", fontSize: "22px", fontWeight: "600", color: "#F9F7F4", letterSpacing: "-0.3px", marginBottom: "12px" }}>
                {s.title}
              </h3>
              <p className="step-desc" style={{ fontFamily: "var(--font-body)", fontSize: "14px", color: "#78716C", lineHeight: "1.7" }}>
                {s.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>

      <style>{`
        @media (max-width: 640px) {
          .how-it-works-section { padding: 32px 14px !important; }
          .how-it-works-header { margin-bottom: 22px !important; gap: 8px !important; }

          .step-border { border-right: none !important; border-bottom: 1px solid #292524; }
          .steps-grid .step-card,
          .step-card { padding: 18px 16px !important; }

          .step-number {
            font-size: 36px !important;
            margin-bottom: 10px !important;
            letter-spacing: -1px !important;
          }
          .step-dot {
            width: 6px !important;
            height: 6px !important;
            margin-bottom: 8px !important;
          }
          .step-title {
            font-size: 16px !important;
            margin-bottom: 4px !important;
          }
          .step-desc {
            font-size: 13px !important;
            line-height: 1.5 !important;
          }
        }
      `}</style>
    </section>
  );
}
