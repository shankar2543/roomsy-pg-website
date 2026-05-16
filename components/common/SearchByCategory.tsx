import { useRouter } from "next/router";
import { motion } from "framer-motion";

const CATEGORIES = [
  { num: "01", label: "Boys", italic: "for boys", desc: "Single, twin and triple-share rooms for working men and male students.", pgType: "boys", image: "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=900&q=85" },
  { num: "02", label: "Girls", italic: "for girls", desc: "Safe, well-lit, women-only properties with 24/7 staff and security.", pgType: "girls", image: "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=900&q=85" },
  { num: "03", label: "Co-Living", italic: "co-living", desc: "Modern mixed-gender spaces with shared lounges, kitchens and events.", pgType: "coliving", image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=900&q=85" },
];

const ease: [number, number, number, number] = [0.22, 1, 0.36, 1];

export default function SearchByCategory() {
  const router = useRouter();

  return (
    <section id="pg" className="cat-section" style={{ backgroundColor: "#FFFFFF", padding: "112px 24px 80px", position: "relative" }}>
      <div style={{ maxWidth: "1280px", margin: "0 auto", position: "relative", zIndex: 2 }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease }}
          className="cat-header"
          style={{ marginBottom: "44px" }}
        >
          <p className="cat-eyebrow" style={{
            display: "inline-flex", alignItems: "center", gap: "10px",
            fontFamily: "var(--font-body)", fontSize: "10px", fontWeight: 700,
            color: "var(--terracotta)", textTransform: "uppercase", letterSpacing: "3px",
            marginBottom: "20px",
          }}>
            <span style={{ width: "28px", height: "1px", backgroundColor: "var(--terracotta)" }} />
            Choose your room
          </p>
          <h2 className="cat-h2" style={{
            fontFamily: "var(--font-display)", fontSize: "clamp(28px, 3.6vw, 48px)",
            fontWeight: 600, color: "var(--ink)", letterSpacing: "-0.025em", lineHeight: "1.1",
            marginBottom: "16px", whiteSpace: "nowrap",
          }}>
            Rooms made <span style={{ fontStyle: "italic", color: "var(--terracotta)" }}>for the way you actually live</span>.
          </h2>
          <p className="cat-sub" style={{
            fontFamily: "var(--font-body)", fontSize: "15px", color: "var(--muted-ink)",
            lineHeight: "1.7", maxWidth: "640px",
          }}>
            Three kinds of households, hundreds of properties, one trusted shortlist —
            each photographed, walked, and verified by our team before going live.
          </p>
        </motion.div>

        <div className="category-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px" }}>
          {CATEGORIES.map((cat, i) => (
            <motion.button
              key={i}
              onClick={() => router.push(`/pgs?pgType=${cat.pgType}`)}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.8, ease, delay: i * 0.12 }}
              whileHover="hover"
              className="category-card"
              style={{
                position: "relative", aspectRatio: "4 / 5",
                borderRadius: "4px", overflow: "hidden",
                border: "none", cursor: "pointer", padding: 0, display: "block", width: "100%",
                background: "var(--ink)",
              }}
            >
              <motion.img
                src={cat.image} alt={cat.italic}
                variants={{ hover: { scale: 1.05 } }}
                transition={{ duration: 0.9, ease }}
                style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", filter: "saturate(0.85) brightness(0.95)" }}
              />

              <motion.div
                variants={{ hover: { opacity: 0.6 } }}
                style={{
                  position: "absolute", inset: 0,
                  background: "linear-gradient(180deg, rgba(26,23,20,0.10) 0%, rgba(26,23,20,0.30) 45%, rgba(26,23,20,0.85) 100%)",
                  opacity: 0.85,
                }}
              />

              {/* Top-left: chapter number */}
              <span style={{
                position: "absolute", top: "20px", left: "22px",
                fontFamily: "var(--font-display)", fontSize: "13px", fontWeight: 500,
                color: "rgba(244,238,227,0.85)", letterSpacing: "2px",
                fontStyle: "italic",
              }}>
                — {cat.num}
              </span>

              {/* Top-right: hairline label */}
              <span style={{
                position: "absolute", top: "22px", right: "22px",
                fontFamily: "var(--font-body)", fontSize: "9px", fontWeight: 700,
                color: "rgba(244,238,227,0.7)", letterSpacing: "2.4px", textTransform: "uppercase",
              }}>
                {cat.label}
              </span>

              {/* Bottom */}
              <div style={{
                position: "absolute", bottom: "26px", left: "24px", right: "24px",
                display: "flex", flexDirection: "column", gap: "10px",
              }}>
                <span className="category-italic" style={{
                  fontFamily: "var(--font-display)", fontStyle: "italic",
                  fontSize: "40px", fontWeight: 400, color: "var(--paper)",
                  letterSpacing: "-0.02em", lineHeight: 0.95,
                  fontVariationSettings: "'opsz' 144, 'SOFT' 80",
                }}>
                  {cat.italic}
                </span>
                <span style={{
                  fontFamily: "var(--font-body)", fontSize: "12px", color: "rgba(244,238,227,0.75)",
                  lineHeight: 1.5, maxWidth: "85%",
                }}>
                  {cat.desc}
                </span>
                <motion.span
                  variants={{ hover: { x: 6, color: "var(--terracotta)" } }}
                  style={{
                    fontFamily: "var(--font-body)", fontSize: "10px", fontWeight: 700,
                    color: "var(--paper)", letterSpacing: "2.4px", textTransform: "uppercase",
                    marginTop: "6px",
                  }}
                >
                  View listings →
                </motion.span>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      <style>{`
        @media (min-width: 769px) {
          .category-card {
            transition: transform 0.5s cubic-bezier(0.22, 1, 0.36, 1) !important;
          }
          .category-card:hover { transform: translateY(-6px); }
        }
        @media (max-width: 1100px) {
          .cat-h2 { white-space: normal !important; font-size: clamp(24px, 4vw, 40px) !important; }
        }
        @media (max-width: 900px) {
          .category-grid { grid-template-columns: 1fr 1fr !important; }
          .category-grid > button:last-child { grid-column: 1 / -1; aspect-ratio: 16 / 9 !important; }
        }
        @media (max-width: 640px) {
          .cat-section { padding: 64px 18px 56px !important; }
          .cat-header { margin-bottom: 32px !important; }
          .cat-h2 { font-size: 22px !important; line-height: 1.2 !important; }
          .category-grid { grid-template-columns: 1fr !important; gap: 12px !important; }
          .category-grid > button { aspect-ratio: 5 / 4 !important; }
          .category-grid > button:last-child { aspect-ratio: 5 / 4 !important; }
          .category-italic { font-size: 30px !important; }
        }
      `}</style>
    </section>
  );
}
