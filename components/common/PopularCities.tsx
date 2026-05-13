import { useRouter } from "next/router";
import { motion } from "framer-motion";
import { ACTIVE_CITY } from "@/lib/dummyPGs";

const CITIES = [
  { name: "Hyderabad", area: "Hitech City", count: "10+ PGs" },
  { name: "Bangalore", area: "Koramangala", count: "120+ PGs" },
  { name: "Mumbai", area: "Andheri", count: "85+ PGs" },
  { name: "Delhi", area: "Lajpat Nagar", count: "96+ PGs" },
  { name: "Pune", area: "Kothrud", count: "63+ PGs" },
  { name: "Chennai", area: "Velachery", count: "58+ PGs" },
];

const ease = [0.22, 1, 0.36, 1];

export default function PopularCities() {
  const router = useRouter();

  return (
    <section id="explore" className="cities-section" style={{ backgroundColor: "#F9F7F4", padding: "56px 16px" }}>
      <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease }}
          className="cities-header"
          style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: "40px", flexWrap: "wrap", gap: "16px" }}
        >
          <div>
            <p className="cities-eyebrow" style={{ display: "inline-flex", alignItems: "center", gap: "6px", backgroundColor: "#FFF0F3", border: "1px solid #FFD6DE", borderRadius: "100px", padding: "3px 9px 3px 7px", fontFamily: "var(--font-body)", fontSize: "10px", fontWeight: "600", color: "#FF385C", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "12px" }}>
              <span style={{ width: "5px", height: "5px", borderRadius: "50%", backgroundColor: "#FF385C", flexShrink: 0 }} />
              Popular Cities
            </p>
            <h2 className="cities-h2" style={{ fontFamily: "var(--font-display)", fontSize: "clamp(28px, 4vw, 48px)", fontWeight: "600", color: "#1C1917", letterSpacing: "-1px", lineHeight: "1.15" }}>
              Explore PGs across India
            </h2>
          </div>
          <motion.button
            onClick={() => router.push("/pgs")}
            whileHover={{ x: 4 }}
            transition={{ type: "spring", stiffness: 400 }}
            className="cities-viewall"
            style={{ fontFamily: "var(--font-body)", fontSize: "14px", fontWeight: "500", color: "#FF385C", background: "none", border: "none", cursor: "pointer", textDecoration: "underline", textUnderlineOffset: "3px", padding: 0 }}
          >
            View all cities →
          </motion.button>
        </motion.div>

        <div className="cities-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "16px" }}>
          {CITIES.map((city, i) => {
            const isActive = city.name === ACTIVE_CITY;
            return (
              <motion.button
                key={i}
                onClick={() => router.push(`/pgs?area=${city.name}`)}
                initial={{ opacity: 0, scale: 0.88, y: 20 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ type: "spring", stiffness: 280, damping: 24, delay: i * 0.07 }}
                whileHover={isActive ? { borderColor: "#FF385C", y: -4, boxShadow: "0 8px 24px rgba(255,56,92,0.14)" } : { y: -2 }}
                className="city-card"
                style={{
                  backgroundColor: isActive ? "#fff" : "#F9F7F4",
                  border: `1px solid ${isActive ? "#E8E4DE" : "#E8E4DE"}`,
                  borderRadius: "16px",
                  padding: "24px 20px",
                  textAlign: "left",
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                  position: "relative",
                  opacity: isActive ? 1 : 0.7,
                }}
              >
                {!isActive && (
                  <div style={{
                    position: "absolute", top: "10px", right: "10px",
                    backgroundColor: "#F0EDE8", borderRadius: "100px",
                    padding: "2px 8px",
                    fontFamily: "var(--font-body)", fontSize: "10px",
                    fontWeight: "600", color: "#A8A29E", letterSpacing: "0.3px",
                  }}>
                    Soon
                  </div>
                )}
                <div>
                  <div className="city-name" style={{ fontFamily: "var(--font-display)", fontSize: "18px", fontWeight: "600", color: isActive ? "#1C1917" : "#78716C", letterSpacing: "-0.2px" }}>{city.name}</div>
                  <div className="city-area" style={{ fontFamily: "var(--font-body)", fontSize: "12px", color: "#A8A29E", marginTop: "2px" }}>{city.area}</div>
                </div>
                <div className="city-count" style={{
                  fontFamily: "var(--font-body)", fontSize: "12px", fontWeight: "500",
                  color: isActive ? "#FF385C" : "#A8A29E",
                  backgroundColor: isActive ? "#FFF0F3" : "#F0EDE8",
                  borderRadius: "100px", padding: "3px 10px",
                  display: "inline-block", width: "fit-content",
                }}>
                  {isActive ? city.count : "Coming Soon"}
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      <style>{`
        @media (min-width: 769px) {
          .city-card {
            transition: transform 0.3s cubic-bezier(0.22, 1, 0.36, 1),
                        border-color 0.3s ease,
                        box-shadow 0.3s ease !important;
          }
        }
        @media (max-width: 640px) {
          .cities-section { padding: 28px 14px !important; }
          .cities-header {
            margin-bottom: 16px !important;
            align-items: flex-start !important;
            gap: 8px !important;
          }
          .cities-eyebrow { font-size: 10px !important; margin-bottom: 6px !important; letter-spacing: 0.8px !important; }
          .cities-h2 { font-size: 22px !important; letter-spacing: -0.5px !important; }
          .cities-viewall { font-size: 12px !important; }
          .cities-grid {
            grid-template-columns: 1fr 1fr !important;
            gap: 10px !important;
          }
          .city-card {
            padding: 14px !important;
            border-radius: 12px !important;
            gap: 8px !important;
          }
          .city-name { font-size: 15px !important; }
          .city-area { font-size: 11px !important; }
          .city-count { font-size: 10px !important; padding: 2px 8px !important; }
        }
      `}</style>
    </section>
  );
}
