import { motion } from "framer-motion";

const STEPS = [
  {
    step: "01", title: "Search", caption: "your neighbourhood",
    desc: "Drop a pin or type a landmark. Filter by household, price, and amenities.",
    image: "https://images.unsplash.com/photo-1604357209793-fca5dca89f97?w=900&q=85",
    imageAlt: "A city map on a phone, ready to search",
  },
  {
    step: "02", title: "Choose", caption: "your room",
    desc: "Browse verified listings, see real photos, message the owner directly.",
    image: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=900&q=85",
    imageAlt: "A warm, well-lit PG room interior",
  },
  {
    step: "03", title: "Move in", caption: "by the weekend",
    desc: "Submit your ID, confirm with the owner, pay offline, and pick up your keys.",
    image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=900&q=85",
    imageAlt: "House keys on a table",
  },
];

const ease: [number, number, number, number] = [0.22, 1, 0.36, 1];

export default function HowItWorks() {
  return (
    <section className="how-it-works-section" style={{
      backgroundColor: "#FFFFFF", padding: "56px 24px 64px",
      position: "relative", overflow: "hidden",
    }}>
      <div style={{
        position: "absolute", inset: 0, opacity: 0.04, pointerEvents: "none",
        backgroundImage: "radial-gradient(circle at 80% 20%, var(--terracotta) 0%, transparent 35%), radial-gradient(circle at 10% 90%, var(--terracotta) 0%, transparent 40%)",
      }} />

      <div style={{ maxWidth: "1080px", margin: "0 auto", position: "relative" }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease }}
          className="hiw-header"
          style={{ marginBottom: "36px", textAlign: "center" }}
        >
          <p style={{
            display: "inline-flex", alignItems: "center", gap: "10px",
            fontFamily: "var(--font-body)", fontSize: "10px", fontWeight: 700,
            color: "var(--terracotta)", textTransform: "uppercase", letterSpacing: "3px",
            marginBottom: "16px",
          }}>
            <span style={{ width: "28px", height: "1px", backgroundColor: "var(--terracotta)" }} />
            How it works
            <span style={{ width: "28px", height: "1px", backgroundColor: "var(--terracotta)" }} />
          </p>
          <h2 className="hiw-h2" style={{
            fontFamily: "var(--font-display)", fontSize: "clamp(28px, 3.6vw, 48px)",
            fontWeight: 600, color: "var(--ink)", letterSpacing: "-0.025em", lineHeight: "1.15",
            marginBottom: "14px",
          }}>
            From search to <span style={{ fontStyle: "italic", color: "var(--terracotta)" }}>keys in hand</span> in three steps.
          </h2>
          <p style={{
            fontFamily: "var(--font-body)", fontSize: "14px",
            color: "var(--muted-ink)", lineHeight: "1.65", maxWidth: "520px",
            margin: "0 auto",
          }}>
            Most residents finish the entire booking in under thirty minutes — no paperwork,
            no broker, no awkward Sunday-afternoon tours.
          </p>
        </motion.div>

        {/* Timeline */}
        <div className="hiw-timeline" style={{ position: "relative", paddingTop: "10px", paddingBottom: "10px" }}>
          {/* Center line */}
          <div className="hiw-line" aria-hidden="true" style={{
            position: "absolute", left: "50%", top: 0, bottom: 0,
            width: "1px", backgroundColor: "var(--rule)",
            transform: "translateX(-50%)",
          }} />

          {STEPS.map((s, i) => {
            const isLeft = i % 2 === 0;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.7, ease, delay: i * 0.1 }}
                className="hiw-row"
                style={{
                  display: "grid", gridTemplateColumns: "1fr 1fr",
                  alignItems: "center", position: "relative",
                  marginBottom: i === STEPS.length - 1 ? 0 : "20px",
                }}
              >
                {/* Marker on the centerline */}
                <span className="hiw-marker" aria-hidden="true" style={{
                  position: "absolute", left: "50%", top: "50%",
                  transform: "translate(-50%, -50%)",
                  width: "12px", height: "12px", borderRadius: "50%",
                  backgroundColor: "var(--terracotta)",
                  boxShadow: "0 0 0 6px #FFFFFF, 0 0 0 7px var(--rule)",
                  zIndex: 2,
                }} />

                {/* Text content */}
                <div
                  className="hiw-card"
                  style={{
                    gridColumn: isLeft ? 1 : 2,
                    paddingRight: isLeft ? "64px" : 0,
                    paddingLeft: isLeft ? 0 : "64px",
                    textAlign: isLeft ? "right" : "left",
                  }}
                >
                  <div style={{
                    display: "flex",
                    flexDirection: isLeft ? "row-reverse" : "row",
                    alignItems: "baseline",
                    gap: "16px",
                    marginBottom: "8px",
                    justifyContent: "flex-start",
                  }}>
                    <span className="hiw-num" style={{
                      fontFamily: "var(--font-display)", fontStyle: "italic",
                      fontSize: "44px", fontWeight: 600, color: "var(--terracotta)",
                      letterSpacing: "-0.02em", lineHeight: 1, fontVariantNumeric: "tabular-nums",
                    }}>
                      {s.step}
                    </span>
                    <h3 className="hiw-title" style={{
                      fontFamily: "var(--font-display)", fontSize: "28px", fontWeight: 600,
                      color: "var(--ink)", letterSpacing: "-0.02em", lineHeight: 1.05,
                    }}>
                      {s.title}{" "}
                      <span style={{ fontStyle: "italic", color: "var(--terracotta)", fontWeight: 500 }}>
                        {s.caption}
                      </span>
                    </h3>
                  </div>
                  <p className="hiw-desc" style={{
                    fontFamily: "var(--font-body)", fontSize: "14px",
                    color: "var(--muted-ink)", lineHeight: 1.7,
                    maxWidth: "380px",
                    marginLeft: isLeft ? "auto" : 0,
                    marginRight: isLeft ? 0 : "auto",
                  }}>
                    {s.desc}
                  </p>
                </div>

                {/* Image on the opposite side of the line */}
                <div
                  className="hiw-image"
                  style={{
                    gridColumn: isLeft ? 2 : 1,
                    gridRow: 1,
                    paddingLeft: isLeft ? "64px" : 0,
                    paddingRight: isLeft ? 0 : "64px",
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={s.image}
                    alt={s.imageAlt}
                    style={{
                      width: "100%",
                      maxWidth: "260px",
                      aspectRatio: "16 / 10",
                      objectFit: "cover",
                      borderRadius: "6px",
                      display: "block",
                      marginLeft: isLeft ? 0 : "auto",
                      marginRight: isLeft ? "auto" : 0,
                      boxShadow: "0 10px 28px rgba(26,23,20,0.12)",
                    }}
                  />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .how-it-works-section { padding: 56px 18px 64px !important; }
          .hiw-header { margin-bottom: 36px !important; }
          .hiw-line {
            left: 16px !important;
            transform: none !important;
          }
          .hiw-row {
            grid-template-columns: 1fr !important;
            grid-template-rows: auto auto !important;
            margin-bottom: 36px !important;
            row-gap: 14px !important;
          }
          .hiw-marker {
            left: 16px !important;
            top: 14px !important;
            transform: translate(-50%, 0) !important;
            width: 10px !important;
            height: 10px !important;
            box-shadow: 0 0 0 5px #FFFFFF, 0 0 0 6px var(--rule) !important;
          }
          .hiw-card {
            grid-column: 1 !important;
            grid-row: 1 !important;
            text-align: left !important;
            padding: 0 0 0 38px !important;
          }
          .hiw-card > div:first-child {
            flex-direction: row !important;
            gap: 12px !important;
          }
          .hiw-card .hiw-desc {
            margin-left: 0 !important;
            margin-right: 0 !important;
          }
          .hiw-image {
            grid-column: 1 !important;
            grid-row: 2 !important;
            padding: 0 0 0 38px !important;
          }
          .hiw-image img {
            margin-left: 0 !important;
            margin-right: 0 !important;
            max-width: 100% !important;
          }
          .hiw-num { font-size: 30px !important; }
          .hiw-title { font-size: 20px !important; }
          .hiw-desc { font-size: 13px !important; }
        }
      `}</style>
    </section>
  );
}
