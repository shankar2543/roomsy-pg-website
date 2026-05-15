import { useRouter } from "next/router";
import { motion } from "framer-motion";
import { ACTIVE_CITY } from "@/lib/dummyPGs";
import { HiArrowRight } from "react-icons/hi";

const CITIES = [
  { name: "Hyderabad", area: "Hitech City", count: "10+ PGs" },
  { name: "Bengaluru", area: "Koramangala", count: "120+ PGs" },
  { name: "Mumbai", area: "Andheri", count: "85+ PGs" },
  { name: "Delhi", area: "Lajpat Nagar", count: "96+ PGs" },
  { name: "Pune", area: "Kothrud", count: "63+ PGs" },
  { name: "Chennai", area: "Velachery", count: "58+ PGs" },
];

const ease: [number, number, number, number] = [0.22, 1, 0.36, 1];

export default function PopularCities() {
  const router = useRouter();

  return (
    <section id="explore" className="cities-section" style={{ backgroundColor: "#F2F2F2", padding: "96px 24px 96px", position: "relative" }}>
      <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease }}
          className="cities-header"
          style={{ marginBottom: "48px" }}
        >
          <p style={{
            display: "inline-flex", alignItems: "center", gap: "10px",
            fontFamily: "var(--font-body)", fontSize: "10px", fontWeight: 700,
            color: "var(--terracotta)", textTransform: "uppercase", letterSpacing: "3px",
            marginBottom: "16px",
          }}>
            <span style={{ width: "28px", height: "1px", backgroundColor: "var(--terracotta)" }} />
            Popular Cities
          </p>
          <h2 className="cities-h2" style={{
            fontFamily: "var(--font-display)", fontSize: "clamp(28px, 3.6vw, 48px)",
            fontWeight: 600, color: "var(--ink)", letterSpacing: "-0.025em", lineHeight: "1.15",
            marginBottom: "16px",
          }}>
            Six cities, <span style={{ fontStyle: "italic", color: "var(--terracotta)" }}>one shortlist</span>.
          </h2>
          <div className="cities-subline" style={{
            display: "flex", alignItems: "center", gap: "20px",
            flexWrap: "nowrap", whiteSpace: "nowrap",
          }}>
            <p className="cities-sub" style={{
              fontFamily: "var(--font-body)", fontSize: "15px", color: "var(--muted-ink)",
              lineHeight: "1.6", margin: 0,
            }}>
              We&apos;re live in Hyderabad first; the rest of the map opens in 2026. Tap any name to see what&apos;s on the books.
            </p>
            <motion.button
              onClick={() => router.push("/pgs")}
              whileHover={{ x: 4 }}
              transition={{ type: "spring", stiffness: 400 }}
              className="cities-viewall"
              style={{
                fontFamily: "var(--font-body)", fontSize: "11px", fontWeight: 700,
                color: "var(--terracotta)", background: "none", border: "none",
                cursor: "pointer", padding: 0,
                letterSpacing: "2.4px", textTransform: "uppercase",
                display: "inline-flex", alignItems: "center", gap: "10px",
                flexShrink: 0,
              }}
            >
              See every property
              <HiArrowRight size={14} />
            </motion.button>
          </div>
        </motion.div>

        <div className="cities-list" style={{ borderTop: "1px solid var(--rule)" }}>
          {CITIES.map((city, i) => {
            const isActive = city.name === ACTIVE_CITY;
            return (
              <motion.button
                key={i}
                onClick={() => router.push(`/pgs?area=${city.name}`)}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.6, ease, delay: i * 0.06 }}
                whileHover={isActive ? "hover" : undefined}
                className="city-row"
                style={{
                  display: "grid",
                  gridTemplateColumns: "60px 1fr 1fr auto auto",
                  alignItems: "center",
                  gap: "24px",
                  padding: "26px 4px",
                  width: "100%",
                  border: "none",
                  borderBottom: "1px solid var(--rule)",
                  background: "transparent",
                  cursor: isActive ? "pointer" : "default",
                  opacity: isActive ? 1 : 0.55,
                  textAlign: "left",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                {/* Hover sweep */}
                {isActive && (
                  <motion.div
                    variants={{ hover: { scaleX: 1 } }}
                    initial={{ scaleX: 0 }}
                    style={{
                      position: "absolute", inset: 0,
                      background: "#FFFFFF",
                      transformOrigin: "left center",
                      zIndex: 0,
                    }}
                    transition={{ duration: 0.5, ease }}
                  />
                )}

                <span className="city-num" style={{
                  position: "relative", zIndex: 1,
                  fontFamily: "var(--font-display)", fontStyle: "italic",
                  fontSize: "14px", fontWeight: 400, color: "var(--muted-ink)",
                  letterSpacing: "1px", fontVariantNumeric: "tabular-nums",
                }}>
                  — 0{i + 1}
                </span>

                <span className="city-name" style={{
                  position: "relative", zIndex: 1,
                  fontFamily: "var(--font-display)", fontSize: "30px", fontWeight: 400,
                  color: "var(--ink)", letterSpacing: "-0.025em", lineHeight: 1,
                  fontVariationSettings: "'opsz' 144, 'SOFT' 40",
                }}>
                  {city.name}
                </span>

                <span className="city-area" style={{
                  position: "relative", zIndex: 1,
                  fontFamily: "var(--font-body)", fontSize: "13px",
                  color: "var(--muted-ink)", letterSpacing: "0.2px",
                }}>
                  {city.area}
                </span>

                <span className="city-count" style={{
                  position: "relative", zIndex: 1,
                  fontFamily: "var(--font-body)", fontSize: "11px", fontWeight: 600,
                  color: isActive ? "var(--terracotta)" : "var(--muted-ink)",
                  letterSpacing: "2px", textTransform: "uppercase", whiteSpace: "nowrap",
                }}>
                  {isActive ? city.count : "Coming soon"}
                </span>

                <span className="city-arrow" style={{
                  position: "relative", zIndex: 1,
                  display: "inline-flex", alignItems: "center", justifyContent: "center",
                  width: "32px", height: "32px",
                  borderRadius: "50%", border: "1px solid var(--rule)",
                  color: "var(--ink)",
                  opacity: isActive ? 1 : 0,
                }}>
                  <HiArrowRight size={13} />
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>

      <style>{`
        @media (min-width: 769px) {
          .city-row {
            transition: padding 0.25s ease;
          }
          .city-row:hover {
            padding-left: 18px !important;
          }
        }
        @media (max-width: 1100px) {
          .cities-subline { flex-wrap: wrap !important; white-space: normal !important; gap: 12px !important; }
          .cities-sub { white-space: normal !important; }
        }
        @media (max-width: 640px) {
          .cities-section { padding: 56px 18px 56px !important; }
          .cities-header { margin-bottom: 36px !important; }
          .city-row {
            grid-template-columns: 28px 1fr auto !important;
            gap: 14px !important;
            padding: 18px 4px !important;
          }
          .city-area,
          .city-arrow { display: none !important; }
          .city-name { font-size: 22px !important; }
        }
      `}</style>
    </section>
  );
}
