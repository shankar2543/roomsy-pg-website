import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/router";
import { motion, Variants } from "framer-motion";
import {
  HiChevronLeft, HiChevronRight, HiArrowRight,
  HiShieldCheck, HiCurrencyRupee,
} from "react-icons/hi";

const ease: [number, number, number, number] = [0.22, 1, 0.36, 1];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.2 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease } },
};
const fadeRight: Variants = {
  hidden: { opacity: 0, x: -20 },
  show: { opacity: 1, x: 0, transition: { duration: 0.7, ease } },
};

const MONTH_NAMES = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];
const DAY_NAMES = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];

function toStr(y: number, m: number, d: number) {
  return `${y}-${String(m + 1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
}

function formatDate(s: string) {
  if (!s) return "";
  const [, m, d] = s.split("-");
  return `${MONTH_NAMES[parseInt(m) - 1].slice(0, 3)} ${parseInt(d)}`;
}

// ── Custom range calendar ────────────────────────────────────────────────────
interface CalendarPickerProps {
  initFrom: string;
  initTo: string;
  onDone: (from: string, to: string) => void;
  onClear: () => void;
}

function CalendarPicker({ initFrom, initTo, onDone, onClear }: CalendarPickerProps) {
  const now = new Date();
  const todayStr = now.toISOString().split("T")[0];

  const startDate = initFrom ? new Date(initFrom + "T00:00:00") : now;
  const [leftYear, setLeftYear]   = useState(startDate.getFullYear());
  const [leftMIdx, setLeftMIdx]   = useState(startDate.getMonth());

  const [from, setFrom]   = useState(initFrom);
  const [to, setTo]       = useState(initTo);
  const [hover, setHover] = useState("");
  const [phase, setPhase] = useState<"from"|"to">(initFrom && !initTo ? "to" : "from");

  const rightMIdx = (leftMIdx + 1) % 12;
  const rightYear = leftMIdx === 11 ? leftYear + 1 : leftYear;

  const isAtMin = leftYear === now.getFullYear() && leftMIdx === now.getMonth();

  function prevM() {
    if (isAtMin) return;
    if (leftMIdx === 0) { setLeftMIdx(11); setLeftYear(y => y - 1); }
    else setLeftMIdx(m => m - 1);
  }
  function nextM() {
    if (leftMIdx === 11) { setLeftMIdx(0); setLeftYear(y => y + 1); }
    else setLeftMIdx(m => m + 1);
  }

  const effectiveEnd = to || (phase === "to" && hover && from && hover > from ? hover : "");
  const hasRange = !!(from && effectiveEnd && from !== effectiveEnd);

  function clickDay(dateStr: string) {
    if (dateStr < todayStr) return;
    if (phase === "from" || !from || dateStr <= from) {
      setFrom(dateStr);
      setTo("");
      setPhase("to");
    } else {
      setTo(dateStr);
      onDone(from, dateStr);
    }
  }

  function renderMonth(year: number, mIdx: number) {
    const rawFirstDay = new Date(year, mIdx, 1).getDay();
    const offset = (rawFirstDay + 6) % 7;
    const daysInMonth = new Date(year, mIdx + 1, 0).getDate();

    const cells: (number | null)[] = [];
    for (let i = 0; i < offset; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);
    while (cells.length % 7 !== 0) cells.push(null);

    const rows: (number | null)[][] = [];
    for (let i = 0; i < cells.length; i += 7) rows.push(cells.slice(i, i + 7));

    return (
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", marginBottom: "4px" }}>
          {DAY_NAMES.map((d) => (
            <div key={d} style={{ textAlign: "center", fontFamily: "var(--font-body)", fontSize: "10px", fontWeight: 600, color: "rgba(26,23,20,0.45)", padding: "4px 0", letterSpacing: "0.6px", textTransform: "uppercase" }}>
              {d}
            </div>
          ))}
        </div>

        {rows.map((row, ri) => (
          <div key={ri} style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)" }}>
            {row.map((day, ci) => {
              if (day === null) return <div key={ci} style={{ height: "40px" }} />;

              const dateStr = toStr(year, mIdx, day);
              const isDisabled = dateStr < todayStr;
              const isToday    = dateStr === todayStr;
              const isFrom     = dateStr === from;
              const isTo       = dateStr === to;
              const isHovEnd   = !to && phase === "to" && dateStr === effectiveEnd && !!effectiveEnd;
              const isEndPt    = isFrom || isTo || isHovEnd;

              const inRange = !!(from && effectiveEnd && dateStr > from && dateStr < effectiveEnd);

              const showRightStrip = isFrom && hasRange;
              const showLeftStrip  = !isFrom && isEndPt && hasRange;
              const showFullStrip  = inRange;

              const circleBg = isFrom || isTo ? "var(--terracotta)" : isHovEnd ? "var(--terracotta-deep)" : "transparent";
              const textColor = isEndPt ? "#fff" : isDisabled ? "rgba(26,23,20,0.18)" : "var(--ink)";
              const showHoverCircle = hover === dateStr && !isEndPt && !inRange && !isDisabled;

              return (
                <div
                  key={`${dateStr}-${ci}`}
                  onClick={() => !isDisabled && clickDay(dateStr)}
                  onMouseEnter={() => !isDisabled && setHover(dateStr)}
                  onMouseLeave={() => setHover("")}
                  style={{ position: "relative", height: "40px", cursor: isDisabled ? "default" : "pointer" }}
                >
                  {(showRightStrip || showLeftStrip || showFullStrip) && (
                    <div style={{
                      position: "absolute", top: "4px", bottom: "4px",
                      left: showRightStrip ? "50%" : 0,
                      right: showLeftStrip ? "50%" : 0,
                      backgroundColor: "rgba(255, 56, 92, 0.10)",
                      pointerEvents: "none", zIndex: 0,
                    }} />
                  )}

                  <div style={{
                    position: "absolute",
                    top: "4px", left: "50%", transform: "translateX(-50%)",
                    width: "32px", height: "32px",
                    borderRadius: isEndPt ? "4px" : "50%",
                    backgroundColor: isEndPt ? circleBg : showHoverCircle ? "rgba(26,23,20,0.06)" : "transparent",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    zIndex: 1, transition: "background 0.1s",
                    flexDirection: "column",
                  }}>
                    <span style={{
                      fontFamily: "var(--font-body)", fontSize: "13px",
                      fontWeight: isEndPt ? 700 : 500,
                      color: textColor, lineHeight: 1,
                    }}>
                      {day}
                    </span>
                    {isToday && !isEndPt && (
                      <div style={{ width: "3px", height: "3px", borderRadius: "50%", backgroundColor: "var(--terracotta)", marginTop: "2px" }} />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div style={{
      position: "absolute", top: "calc(100% + 14px)", left: "50%",
      transform: "translateX(-50%)",
      backgroundColor: "#fff", border: "1px solid var(--rule)",
      borderRadius: "8px", boxShadow: "0 24px 60px rgba(26,23,20,0.18)",
      padding: "20px 24px 16px", zIndex: 200, width: "640px",
    }}>
      <div style={{ display: "flex", alignItems: "center", marginBottom: "14px" }}>
        <button
          onClick={prevM}
          disabled={isAtMin}
          style={{
            width: "32px", height: "32px", borderRadius: "50%",
            border: "1px solid var(--rule)", backgroundColor: "transparent",
            cursor: isAtMin ? "not-allowed" : "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            opacity: isAtMin ? 0.3 : 1, flexShrink: 0,
          }}
        >
          <HiChevronLeft size={16} color="var(--ink)" />
        </button>

        <div style={{ flex: 1, display: "flex" }}>
          <div style={{ flex: 1, textAlign: "center", fontFamily: "var(--font-display)", fontSize: "15px", fontWeight: 500, color: "var(--ink)", letterSpacing: "-0.2px" }}>
            {MONTH_NAMES[leftMIdx]} <span style={{ fontStyle: "italic", color: "var(--muted-ink)" }}>{leftYear}</span>
          </div>
          <div style={{ flex: 1, textAlign: "center", fontFamily: "var(--font-display)", fontSize: "15px", fontWeight: 500, color: "var(--ink)", letterSpacing: "-0.2px" }}>
            {MONTH_NAMES[rightMIdx]} <span style={{ fontStyle: "italic", color: "var(--muted-ink)" }}>{rightYear}</span>
          </div>
        </div>

        <button
          onClick={nextM}
          style={{
            width: "32px", height: "32px", borderRadius: "50%",
            border: "1px solid var(--rule)", backgroundColor: "transparent",
            cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          }}
        >
          <HiChevronRight size={16} color="var(--ink)" />
        </button>
      </div>

      <div style={{ display: "flex", gap: "0" }}>
        {renderMonth(leftYear, leftMIdx)}
        <div style={{ width: "1px", backgroundColor: "var(--rule)", flexShrink: 0, margin: "0 20px" }} />
        {renderMonth(rightYear, rightMIdx)}
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "14px", paddingTop: "12px", borderTop: "1px solid var(--rule)" }}>
        <span style={{ fontFamily: "var(--font-body)", fontSize: "12px", color: "var(--muted-ink)", letterSpacing: "0.2px" }}>
          {!from
            ? "Select check-in date"
            : !to
            ? "Now select check-out date"
            : `${formatDate(from)} → ${formatDate(to)}`}
        </span>
        {(from || to) && (
          <button
            onClick={() => { setFrom(""); setTo(""); setPhase("from"); onClear(); }}
            style={{ fontFamily: "var(--font-body)", fontSize: "11px", color: "var(--terracotta)", background: "none", border: "none", cursor: "pointer", textDecoration: "underline", textUnderlineOffset: "3px", padding: 0, fontWeight: 600, letterSpacing: "0.4px", textTransform: "uppercase" }}
          >
            Clear dates
          </button>
        )}
      </div>
    </div>
  );
}

// ── Main hero section ────────────────────────────────────────────────────────
export default function Main() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [gender, setGender]           = useState("any");
  const [fromDate, setFromDate]       = useState("");
  const [toDate, setToDate]           = useState("");
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const dateRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function outside(e: MouseEvent) {
      if (dateRef.current && !dateRef.current.contains(e.target as Node)) {
        setDatePickerOpen(false);
      }
    }
    document.addEventListener("mousedown", outside);
    return () => document.removeEventListener("mousedown", outside);
  }, []);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set("area", searchQuery.trim());
    if (gender !== "any") params.set("pgType", gender);
    if (fromDate) params.set("from", fromDate);
    if (toDate) params.set("to", toDate);
    router.push(`/pgs?${params.toString()}`);
  };

  const dateLabel =
    fromDate && toDate ? `${formatDate(fromDate)} → ${formatDate(toDate)}`
    : fromDate ? `${formatDate(fromDate)} → …`
    : "Add dates";

  return (
    <section
      id="home"
      style={{
        backgroundColor: "var(--ink)",
        paddingTop: "72px",
        overflow: "hidden",
        position: "relative",
        width: "100%",
        minHeight: "calc(100vw * 941 / 1672)",
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/roomsy_main_bg.png"
        alt=""
        aria-hidden="true"
        style={{
          position: "absolute",
          top: -4, left: 0, right: 0, bottom: -4,
          width: "100%", height: "calc(100% + 8px)",
          objectFit: "cover", objectPosition: "center right",
          zIndex: 0, pointerEvents: "none", display: "block",
        }}
      />


      {/* Vertical eyebrow on the far left */}
      <div className="hero-vlabel" style={{
        position: "absolute", top: "50%", left: "20px", zIndex: 4,
        transform: "rotate(-90deg) translateX(50%)", transformOrigin: "left top",
        display: "flex", alignItems: "center", gap: "12px",
        fontFamily: "var(--font-body)", fontSize: "10px", letterSpacing: "3px",
        textTransform: "uppercase", color: "rgba(255,255,255,0.85)",
        fontWeight: 600, whiteSpace: "nowrap",
        textShadow: "0 1px 6px rgba(0,0,0,0.55)",
      }}>
        <span style={{ width: "24px", height: "1px", backgroundColor: "rgba(255,255,255,0.55)" }} />
        Roomsy &middot; No. 01 &middot; Stay
      </div>

      {/* ── Magazine-style search bar ── */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease, delay: 0.15 }}
        className="hero-search-wrap"
        style={{
          position: "relative", zIndex: 10, padding: "16px 20px 0",
          display: "flex", justifyContent: "center",
        }}
      >
        <div className="hero-search-bar" style={{
          width: "100%", maxWidth: "780px", display: "flex", alignItems: "stretch",
          backgroundColor: "#FFFFFF",
          border: "1px solid rgba(255,255,255,0.6)",
          borderRadius: "4px",
          boxShadow: "0 18px 50px rgba(26,23,20,0.25)",
        }}>
          <label className="hero-search-field" style={fieldStyle}>
            <span style={labelStyle}>Where</span>
            <input
              type="text"
              placeholder="City, area, landmark"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              style={inputStyle}
            />
          </label>

          <div className="hero-search-sep" />

          <div className="hero-search-field" style={fieldStyle}>
            <span style={labelStyle}>Who</span>
            <select value={gender} onChange={(e) => setGender(e.target.value)} style={{ ...inputStyle, cursor: "pointer", appearance: "none", paddingRight: "16px" }}>
              <option value="any">Anyone</option>
              <option value="boys">Boys</option>
              <option value="girls">Girls</option>
              <option value="coliving">Co-living</option>
            </select>
          </div>

          <div className="hero-search-sep" />

          <div ref={dateRef} className="hero-search-field" style={{ ...fieldStyle, position: "relative" }}>
            <span style={labelStyle}>When</span>
            <button
              onClick={() => setDatePickerOpen((v) => !v)}
              style={{
                ...inputStyle,
                background: "transparent", border: "none", cursor: "pointer",
                textAlign: "left", padding: 0,
                color: fromDate || toDate ? "var(--ink)" : "rgba(26,23,20,0.45)",
              }}
            >
              {dateLabel}
            </button>

            {datePickerOpen && (
              <CalendarPicker
                initFrom={fromDate}
                initTo={toDate}
                onDone={(f, t) => { setFromDate(f); setToDate(t); setDatePickerOpen(false); }}
                onClear={() => { setFromDate(""); setToDate(""); }}
              />
            )}
          </div>

          <motion.button
            onClick={handleSearch}
            whileHover={{ backgroundColor: "var(--terracotta-deep)" }}
            whileTap={{ scale: 0.97 }}
            className="hero-search-submit"
            style={{
              backgroundColor: "var(--terracotta)", color: "#fff", border: "none",
              borderRadius: "0 3px 3px 0",
              padding: "0 28px", fontFamily: "var(--font-body)", fontSize: "13px",
              fontWeight: 600, letterSpacing: "1.4px", textTransform: "uppercase",
              cursor: "pointer", display: "flex", alignItems: "center", gap: "10px",
              whiteSpace: "nowrap", flexShrink: 0,
            }}
          >
            Search
            <HiArrowRight size={14} />
          </motion.button>
        </div>
      </motion.div>

      {/* Hero content */}
      <div
        style={{
          maxWidth: "1280px", margin: "0 auto",
          padding: "56px 24px 88px",
          display: "grid", gridTemplateColumns: "1fr",
          alignItems: "center", position: "relative", zIndex: 2,
        }}
        className="hero-grid"
      >
        <motion.div variants={container} initial="hidden" animate="show">
          <motion.div variants={fadeRight} style={{
            display: "inline-flex", alignItems: "center", gap: "10px",
            marginBottom: "28px", paddingLeft: "2px",
          }}>
            <span style={{ width: "28px", height: "1px", backgroundColor: "var(--terracotta)" }} />
            <span style={{
              fontFamily: "var(--font-body)", fontSize: "10px", fontWeight: 700,
              color: "#fff", letterSpacing: "3px", textTransform: "uppercase",
              textShadow: "0 1px 6px rgba(0,0,0,0.6)",
            }}>
              Verified PGs &middot; No Brokerage &middot; Across India
            </span>
          </motion.div>

          <motion.h1 variants={fadeUp} className="hero-headline" style={{
            fontFamily: "var(--font-display)", fontSize: "clamp(34px, 5vw, 76px)",
            fontWeight: 600, color: "#fff",
            lineHeight: "1.02", letterSpacing: "-0.025em", marginBottom: "28px",
            textShadow: "0 2px 16px rgba(0,0,0,0.5), 0 1px 4px rgba(0,0,0,0.35)",
          }}>
            Find your
            <br />
            <span style={{ display: "inline-block", position: "relative" }}>
              <span style={{ fontStyle: "italic", fontWeight: 400, color: "var(--terracotta)", fontVariationSettings: "'opsz' 144, 'SOFT' 100" }}>
                perfect stay
              </span>
              <motion.svg
                viewBox="0 0 320 16"
                preserveAspectRatio="none"
                style={{ position: "absolute", bottom: "-10px", left: "0", width: "100%", height: "14px", overflow: "visible" }}
              >
                <motion.path
                  d="M2 10 C 60 2, 130 14, 200 6 C 260 0, 300 12, 318 8"
                  stroke="var(--terracotta)" strokeWidth="2" fill="none" strokeLinecap="round"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 0.6 }}
                  transition={{ duration: 1.2, delay: 0.9, ease }}
                />
              </motion.svg>
            </span>
            <br />
            away from home.
          </motion.h1>

          <motion.p variants={fadeUp} className="hero-lede" style={{
            fontFamily: "var(--font-body)", fontSize: "16px",
            color: "rgba(255,255,255,0.95)",
            lineHeight: "1.65", marginBottom: "44px", maxWidth: "460px",
            fontWeight: 500,
            textShadow: "0 1px 8px rgba(0,0,0,0.6)",
          }}>
            Verified paying-guest accommodations across India — daily, weekly, monthly.
            No brokerage. No middlemen. Just a key, a door, and somewhere to call yours.
          </motion.p>

          <motion.div variants={fadeUp} className="hero-badges" style={{
            display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap",
            marginBottom: "28px",
          }}>
            {[
              { icon: <HiShieldCheck size={14} color="#fff" />, text: "ID Verified Tenants" },
              { icon: <HiCurrencyRupee size={14} color="#fff" />, text: "Zero Brokerage" },
            ].map((b, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -2 }}
                transition={{ type: "spring", stiffness: 400, damping: 18 }}
                style={{
                  display: "inline-flex", alignItems: "center", gap: "8px",
                  backgroundColor: "#fff",
                  borderRadius: "100px",
                  padding: "5px 16px 5px 5px",
                  boxShadow: "0 6px 20px rgba(0,0,0,0.18)",
                }}
              >
                <span style={{
                  width: "26px", height: "26px", borderRadius: "8px",
                  backgroundColor: "var(--terracotta)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: "0 4px 10px rgba(255,56,92,0.4)",
                  flexShrink: 0,
                }}>
                  {b.icon}
                </span>
                <span style={{
                  fontFamily: "var(--font-body)", fontSize: "12px", fontWeight: 600,
                  color: "var(--ink)", letterSpacing: "-0.1px",
                }}>
                  {b.text}
                </span>
              </motion.div>
            ))}
          </motion.div>

          <motion.div variants={fadeUp} className="hero-stats" style={{
            display: "flex", alignItems: "baseline", gap: "32px", flexWrap: "wrap",
            paddingTop: "28px", borderTop: "1px solid rgba(255,255,255,0.25)",
            maxWidth: "560px",
          }}>
            {[
              { value: "100+", label: "Verified PGs" },
              { value: "6", label: "Cities" },
              { value: "500+", label: "Residents" },
            ].map((s, i) => (
              <div key={i} style={{ display: "flex", alignItems: "baseline", gap: "10px" }}>
                <span style={{
                  fontFamily: "var(--font-display)", fontSize: "32px", fontWeight: 600,
                  color: "#fff", letterSpacing: "-0.02em", lineHeight: 1,
                  fontVariantNumeric: "tabular-nums",
                  fontVariationSettings: "'opsz' 144, 'SOFT' 60",
                  textShadow: "0 2px 12px rgba(0,0,0,0.6)",
                }}>
                  {s.value}
                </span>
                <span style={{
                  fontFamily: "var(--font-body)", fontSize: "11px", fontWeight: 600,
                  color: "rgba(255,255,255,0.9)", letterSpacing: "1.2px", textTransform: "uppercase",
                  textShadow: "0 1px 6px rgba(0,0,0,0.55)",
                }}>
                  {s.label}
                </span>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      <style>{`
        .hero-search-field {
          display: flex; flex-direction: column; justify-content: center;
          padding: 14px 22px; flex: 1; min-width: 0;
        }
        .hero-search-sep {
          width: 1px; align-self: stretch; background: rgba(26,23,20,0.12);
          margin: 14px 0;
        }
        .hero-search-submit {
          align-self: stretch;
        }
        @media (max-width: 768px) {
          .hero-grid { padding: 40px 20px 64px !important; }
          .hero-vlabel { display: none !important; }
        }
        @media (max-width: 640px) {
          .hero-search-wrap { display: none !important; }
          .hero-search-bar {
            flex-direction: column;
            border-radius: 6px !important;
            max-width: 460px !important;
          }
          .hero-search-field { padding: 8px 14px !important; }
          .hero-search-field input,
          .hero-search-field select,
          .hero-search-field button { font-size: 13px !important; }
          .hero-search-field > span {
            font-size: 8px !important;
            letter-spacing: 1.6px !important;
            margin-bottom: 2px !important;
          }
          .hero-search-sep {
            width: auto; height: 1px; margin: 0 14px;
          }
          .hero-search-submit {
            padding: 10px !important;
            font-size: 11px !important;
            letter-spacing: 1.2px !important;
            justify-content: center;
          }
          .hero-headline { font-size: clamp(30px, 8vw, 44px) !important; }
          .hero-lede { font-size: 14px !important; }
          .hero-stats { gap: 18px !important; padding-top: 20px !important; }
          .hero-stats > div > span:first-child { font-size: 24px !important; }
        }
      `}</style>
    </section>
  );
}

const fieldStyle: React.CSSProperties = {
  display: "flex", flexDirection: "column", justifyContent: "center",
  padding: "14px 22px", flex: 1, minWidth: 0,
};

const labelStyle: React.CSSProperties = {
  fontFamily: "var(--font-body)", fontSize: "9px", fontWeight: 700,
  color: "var(--terracotta)", letterSpacing: "2px", textTransform: "uppercase",
  marginBottom: "4px",
};

const inputStyle: React.CSSProperties = {
  fontFamily: "var(--font-display)", fontSize: "15px", fontWeight: 400,
  color: "var(--ink)", background: "transparent", border: "none", outline: "none",
  padding: 0, width: "100%", letterSpacing: "-0.2px",
};
