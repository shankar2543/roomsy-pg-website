import { useRouter } from "next/router";
import { motion } from "framer-motion";
import { HiArrowRight } from "react-icons/hi";

const CATEGORIES = [
  { label: "PGs For Boys", pgType: "boys", image: "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=800&q=85" },
  { label: "PGs For Girls", pgType: "girls", image: "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=800&q=85" },
  { label: "PGs For Co-Living", pgType: "coliving", image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=85" },
];

const ease = [0.22, 1, 0.36, 1];

export default function SearchByCategory() {
  const router = useRouter();

  return (
    <section id="pg" className="cat-section" style={{ backgroundColor: "#F9F7F4", padding: "56px 16px" }}>
      <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease }}
          className="cat-header"
          style={{ marginBottom: "36px" }}
        >
          <p className="cat-eyebrow" style={{ fontFamily: "var(--font-body)", fontSize: "12px", fontWeight: "600", color: "#FF385C", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "12px" }}>
            Paying Guest
          </p>
          <h2 className="cat-h2" style={{ fontFamily: "var(--font-display)", fontSize: "clamp(26px, 3.5vw, 42px)", fontWeight: "600", color: "#1C1917", letterSpacing: "-1px", lineHeight: "1.15", marginBottom: "10px" }}>
            Find PGs Based on Your Need
          </h2>
          <p className="cat-sub" style={{ fontFamily: "var(--font-body)", fontSize: "14px", color: "#78716C", lineHeight: "1.6" }}>
            Browse by category and discover the perfect accommodation for you.
          </p>
        </motion.div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px" }} className="category-grid">
          {CATEGORIES.map((cat, i) => (
            <motion.button
              key={i}
              onClick={() => router.push(`/pgs?pgType=${cat.pgType}`)}
              initial={{ opacity: 0, y: 60, scale: 0.94 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.7, ease, delay: i * 0.12 }}
              whileHover="hover"
              className="category-card"
              style={{ position: "relative", height: "280px", borderRadius: "20px", overflow: "hidden", border: "none", cursor: "pointer", padding: 0, display: "block", width: "100%" }}
            >
              {/* Image */}
              <motion.img
                src={cat.image} alt={cat.label}
                variants={{ hover: { scale: 1.07 } }}
                transition={{ duration: 0.5, ease }}
                style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
              />

              {/* Gradient */}
              <motion.div
                variants={{ hover: { opacity: 1.2 } }}
                style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.08) 55%, transparent 100%)" }}
              />

              {/* Bottom row */}
              <div className="category-bottom" style={{ position: "absolute", bottom: "20px", left: "20px", right: "20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span className="category-label" style={{ fontFamily: "var(--font-display)", fontSize: "20px", fontWeight: "600", color: "#fff", letterSpacing: "-0.3px" }}>
                  {cat.label}
                </span>
                <motion.div
                  variants={{ hover: { x: 4, backgroundColor: "#FF385C" } }}
                  transition={{ type: "spring", stiffness: 400, damping: 20 }}
                  className="category-arrow"
                  style={{ width: "38px", height: "38px", borderRadius: "50%", backgroundColor: "#fff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}
                >
                  <motion.span variants={{ hover: { color: "#fff" } }}>
                    <HiArrowRight size={16} color="#1C1917" />
                  </motion.span>
                </motion.div>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      <style>{`
        @media (min-width: 769px) {
          .category-card {
            transition: transform 0.4s cubic-bezier(0.22, 1, 0.36, 1),
                        box-shadow 0.4s cubic-bezier(0.22, 1, 0.36, 1) !important;
            box-shadow: 0 1px 2px rgba(28,25,23,0.04);
          }
          .category-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 22px 50px rgba(28,25,23,0.12);
          }
        }
        @media (max-width: 768px) {
          .category-grid { grid-template-columns: 1fr !important; gap: 10px !important; }
        }
        @media (max-width: 640px) {
          .cat-section { padding: 28px 14px !important; }
          .cat-header { margin-bottom: 16px !important; }
          .cat-eyebrow { font-size: 10px !important; margin-bottom: 6px !important; letter-spacing: 0.8px !important; }
          .cat-h2 { font-size: 20px !important; letter-spacing: -0.5px !important; margin-bottom: 4px !important; }
          .cat-sub { font-size: 13px !important; }
          .category-card { height: 130px !important; border-radius: 14px !important; }
          .category-bottom { bottom: 12px !important; left: 14px !important; right: 14px !important; }
          .category-label { font-size: 16px !important; }
          .category-arrow { width: 30px !important; height: 30px !important; }
        }
      `}</style>
    </section>
  );
}
