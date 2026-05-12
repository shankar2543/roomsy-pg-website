import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/router";
import { motion } from "framer-motion";
import {
  HiShieldCheck, HiCurrencyRupee, HiLocationMarker, HiSearch,
  HiChevronLeft, HiChevronRight, HiCalendar,
} from "react-icons/hi";
import { MdOutlineVerified } from "react-icons/md";

const ease: [number, number, number, number] = [0.22, 1, 0.36, 1];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.15 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 36 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease } },
};
const popIn = {
  hidden: { opacity: 0, scale: 0.82 },
  show: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 320, damping: 28 } },
};

const MONTH_NAMES = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];
// Monday-first (matches screenshot)
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
  const [leftMIdx, setLeftMIdx]   = useState(startDate.getMonth()); // 0-based

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

  // effective end for range preview while hovering
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
    // Monday-first: Sunday (0) → 6, Monday (1) → 0 …
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
        {/* Day-of-week header */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", marginBottom: "4px" }}>
          {DAY_NAMES.map((d) => (
            <div key={d} style={{ textAlign: "center", fontFamily: "var(--font-body)", fontSize: "11px", fontWeight: "600", color: "#A8A29E", padding: "4px 0" }}>
              {d}
            </div>
          ))}
        </div>

        {/* Day rows */}
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

              // strip layers
              const showRightStrip = isFrom && hasRange;
              const showLeftStrip  = !isFrom && isEndPt && hasRange;
              const showFullStrip  = inRange;

              // circle/pill bg
              const circleBg = isFrom || isTo ? "#1C1917" : isHovEnd ? "#DC2626" : "transparent";
              const textColor = isEndPt ? "#fff" : isDisabled ? "#D6D3CE" : "#1C1917";
              const showHoverCircle = hover === dateStr && !isEndPt && !inRange && !isDisabled;

              return (
                <div
                  key={`${dateStr}-${ci}`}
                  onClick={() => !isDisabled && clickDay(dateStr)}
                  onMouseEnter={() => !isDisabled && setHover(dateStr)}
                  onMouseLeave={() => setHover("")}
                  style={{ position: "relative", height: "40px", cursor: isDisabled ? "default" : "pointer" }}
                >
                  {/* Pink range strip */}
                  {(showRightStrip || showLeftStrip || showFullStrip) && (
                    <div style={{
                      position: "absolute",
                      top: "4px", bottom: "4px",
                      left: showRightStrip ? "50%" : 0,
                      right: showLeftStrip ? "50%" : 0,
                      backgroundColor: "#FFF0F3",
                      pointerEvents: "none",
                      zIndex: 0,
                    }} />
                  )}

                  {/* Circle / hover highlight */}
                  <div style={{
                    position: "absolute",
                    top: "4px", left: "50%", transform: "translateX(-50%)",
                    width: "32px", height: "32px",
                    borderRadius: isEndPt ? "6px" : "50%",
                    backgroundColor: isEndPt ? circleBg : showHoverCircle ? "#F0EDE8" : "transparent",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    zIndex: 1,
                    transition: "background 0.1s",
                    flexDirection: "column",
                  }}>
                    <span style={{
                      fontFamily: "var(--font-body)", fontSize: "13px",
                      fontWeight: isEndPt ? "700" : "400",
                      color: textColor, lineHeight: 1,
                    }}>
                      {day}
                    </span>
                    {isToday && !isEndPt && (
                      <div style={{ width: "3px", height: "3px", borderRadius: "50%", backgroundColor: "#FF385C", marginTop: "2px" }} />
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
      backgroundColor: "#fff", border: "1.5px solid #E8E4DE",
      borderRadius: "20px", boxShadow: "0 12px 48px rgba(0,0,0,0.14)",
      padding: "20px 24px 16px", zIndex: 200, width: "640px",
    }}>
      {/* Month navigation */}
      <div style={{ display: "flex", alignItems: "center", marginBottom: "14px" }}>
        <button
          onClick={prevM}
          disabled={isAtMin}
          style={{
            width: "32px", height: "32px", borderRadius: "50%",
            border: "1.5px solid #E8E4DE", backgroundColor: "#fff",
            cursor: isAtMin ? "not-allowed" : "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            opacity: isAtMin ? 0.3 : 1, flexShrink: 0,
          }}
        >
          <HiChevronLeft size={16} color="#1C1917" />
        </button>

        <div style={{ flex: 1, display: "flex" }}>
          <div style={{ flex: 1, textAlign: "center", fontFamily: "var(--font-display)", fontSize: "14px", fontWeight: "600", color: "#1C1917" }}>
            {MONTH_NAMES[leftMIdx]} {leftYear}
          </div>
          <div style={{ flex: 1, textAlign: "center", fontFamily: "var(--font-display)", fontSize: "14px", fontWeight: "600", color: "#1C1917" }}>
            {MONTH_NAMES[rightMIdx]} {rightYear}
          </div>
        </div>

        <button
          onClick={nextM}
          style={{
            width: "32px", height: "32px", borderRadius: "50%",
            border: "1.5px solid #E8E4DE", backgroundColor: "#fff",
            cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          }}
        >
          <HiChevronRight size={16} color="#1C1917" />
        </button>
      </div>

      {/* Two month grids */}
      <div style={{ display: "flex", gap: "0" }}>
        {renderMonth(leftYear, leftMIdx)}
        <div style={{ width: "1px", backgroundColor: "#E8E4DE", flexShrink: 0, margin: "0 20px" }} />
        {renderMonth(rightYear, rightMIdx)}
      </div>

      {/* Footer */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "14px", paddingTop: "12px", borderTop: "1px solid #F0EDE8" }}>
        <span style={{ fontFamily: "var(--font-body)", fontSize: "13px", color: "#78716C" }}>
          {!from
            ? "Select check-in date"
            : !to
            ? "Now select check-out date"
            : `${formatDate(from)} → ${formatDate(to)}`}
        </span>
        {(from || to) && (
          <button
            onClick={() => { setFrom(""); setTo(""); setPhase("from"); onClear(); }}
            style={{ fontFamily: "var(--font-body)", fontSize: "12px", color: "#78716C", background: "none", border: "none", cursor: "pointer", textDecoration: "underline", padding: 0 }}
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
    : fromDate ? `${formatDate(fromDate)} → ...`
    : "Select dates";

  return (
    <section
      id="home"
      style={{
        backgroundColor: "#1C1917",
        paddingTop: "72px",
        overflow: "hidden",
        position: "relative",
        width: "100%",
        marginLeft: 0,
        marginRight: 0,
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/roomsy_main_bg.png"
        alt=""
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: "center right",
          zIndex: 0,
          pointerEvents: "none",
          display: "block",
        }}
      />

      {/* ── Search bar ── */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease, delay: 0.1 }}
        style={{
          position: "relative", zIndex: 10, backgroundColor: "transparent",
          padding: "20px 16px 12px", display: "flex", justifyContent: "center",
        }}
      >
        <div style={{
          width: "100%", maxWidth: "750px", display: "flex", alignItems: "center",
          backgroundColor: "#fff", border: "1.5px solid #E8E4DE", borderRadius: "100px",
          padding: "5px 5px 5px 18px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
          position: "relative",
        }}>
          <HiLocationMarker size={16} color="#FF385C" style={{ flexShrink: 0 }} />
          <input
            type="text"
            placeholder="Area, city or landmark..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            style={{ flex: 1, border: "none", outline: "none", background: "transparent", fontFamily: "var(--font-body)", fontSize: "14px", color: "#1C1917", padding: "6px 12px", minWidth: 0 }}
          />

          <div className="search-filters" style={{ display: "contents" }}>
            <div style={{ width: "1px", height: "22px", backgroundColor: "#E8E4DE", flexShrink: 0 }} />
            <select value={gender} onChange={(e) => setGender(e.target.value)} style={selectStyle}>
              <option value="any">Gender</option>
              <option value="boys">Boys</option>
              <option value="girls">Girls</option>
              <option value="coliving">Co-living</option>
            </select>

            <div style={{ width: "1px", height: "22px", backgroundColor: "#E8E4DE", flexShrink: 0 }} />

            {/* Date range trigger */}
            <div ref={dateRef} style={{ position: "relative", flexShrink: 0 }}>
              <button
                onClick={() => setDatePickerOpen((v) => !v)}
                style={{
                  display: "flex", alignItems: "center", gap: "7px",
                  padding: "6px 14px", border: "none", background: "transparent",
                  fontFamily: "var(--font-body)", fontSize: "13px",
                  color: fromDate || toDate ? "#1C1917" : "#78716C",
                  cursor: "pointer", whiteSpace: "nowrap",
                }}
              >
                <HiCalendar size={14} color={fromDate || toDate ? "#FF385C" : "#A8A29E"} />
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
          </div>

          <motion.button
            onClick={handleSearch}
            whileHover={{ backgroundColor: "#E31C5F", scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            style={{
              backgroundColor: "#FF385C", color: "#fff", border: "none", borderRadius: "100px",
              padding: "10px 20px", fontFamily: "var(--font-body)", fontSize: "14px", fontWeight: "600",
              cursor: "pointer", display: "flex", alignItems: "center", gap: "6px",
              whiteSpace: "nowrap", flexShrink: 0,
            }}
          >
            <HiSearch size={14} /> Search
          </motion.button>
        </div>
      </motion.div>

      {/* Hero grid */}
      <div
        style={{
          maxWidth: "1280px", margin: "0 auto", padding: "32px 24px 80px",
          display: "grid", gridTemplateColumns: "1fr", gap: "64px",
          alignItems: "center", position: "relative", zIndex: 1,
        }}
        className="hero-grid"
      >
        {/* LEFT */}
        <motion.div variants={container} initial="hidden" animate="show">
          <motion.div variants={fadeUp} style={{
            display: "inline-flex", alignItems: "center", gap: "6px",
            backgroundColor: "#fff", border: "1px solid #E8E4DE", borderRadius: "100px",
            padding: "5px 14px 5px 8px", marginBottom: "32px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
          }}>
            <div style={{ width: "22px", height: "22px", borderRadius: "50%", backgroundColor: "#FFF0F3", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <MdOutlineVerified size={13} color="#FF385C" />
            </div>
            <span style={{ fontFamily: "var(--font-body)", fontSize: "12px", fontWeight: "500", color: "#78716C", letterSpacing: "0.2px" }}>
              Verified PGs · No Brokerage · Across India
            </span>
          </motion.div>

          <motion.h1 variants={fadeUp} style={{
            fontFamily: "var(--font-display)", fontSize: "clamp(38px, 5.5vw, 72px)",
            fontWeight: "600", color: "#fff", lineHeight: "1.08",
            letterSpacing: "-2px", marginBottom: "24px",
            textShadow: "0 2px 12px rgba(0,0,0,0.35)",
          }}>
            Find your
            <br />
            <span style={{ color: "#FF385C", fontStyle: "italic", position: "relative", display: "inline-block" }}>
              perfect stay
              <motion.svg
                viewBox="0 0 300 12"
                style={{ position: "absolute", bottom: "-4px", left: 0, width: "100%", overflow: "visible" }}
              >
                <motion.path
                  d="M2 8 Q75 2 150 8 Q225 14 298 6"
                  stroke="#FF385C" strokeWidth="2.5" fill="none" strokeLinecap="round"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 0.5 }}
                  transition={{ duration: 1, delay: 0.8, ease }}
                />
              </motion.svg>
            </span>
            <br />
            away from home
          </motion.h1>

          <motion.p variants={fadeUp} style={{
            fontFamily: "var(--font-body)", fontSize: "16px", color: "rgba(255,255,255,0.9)",
            lineHeight: "1.7", marginBottom: "36px", maxWidth: "420px",
            textShadow: "0 1px 8px rgba(0,0,0,0.4)",
          }}>
            Discover verified PG accommodations with flexible daily, weekly, and monthly stays — without brokerage.
          </motion.p>

          <motion.div variants={container} style={{ display: "flex", alignItems: "center", gap: "12px", marginTop: "28px", flexWrap: "wrap" }}>
            {[
              { icon: <HiShieldCheck size={14} color="#fff" />, text: "ID Verified Tenants" },
              { icon: <HiCurrencyRupee size={14} color="#fff" />, text: "Zero Brokerage" },
            ].map((b, i) => (
              <motion.div key={i} variants={popIn} whileHover={{ scale: 1.05 }} style={{
                display: "flex", alignItems: "center", gap: "8px", backgroundColor: "#fff",
                border: "1px solid #E8E4DE", borderRadius: "100px", padding: "6px 14px 6px 6px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
              }}>
                <div style={{ width: "24px", height: "24px", borderRadius: "7px", backgroundColor: "#FF385C", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 3px 8px rgba(249,115,22,0.35)", flexShrink: 0 }}>
                  {b.icon}
                </div>
                <span style={{ fontFamily: "var(--font-body)", fontSize: "12px", fontWeight: "500", color: "#1C1917" }}>{b.text}</span>
              </motion.div>
            ))}
          </motion.div>

          <motion.div variants={container} style={{ display: "flex", alignItems: "center", gap: "0", marginTop: "40px" }}>
            {[
              { value: "100+", label: "Verified PGs" },
              { value: "10+", label: "Cities" },
              { value: "500+", label: "Happy Tenants" },
            ].map((stat, i) => (
              <motion.div key={i} variants={fadeUp} style={{
                paddingRight: i < 2 ? "32px" : 0,
                paddingLeft: i > 0 ? "32px" : 0,
                borderRight: i < 2 ? "1px solid rgba(255,255,255,0.25)" : "none",
              }}>
                <div style={{ fontFamily: "var(--font-display)", fontSize: "28px", fontWeight: "600", color: "#fff", letterSpacing: "-0.5px", lineHeight: 1, textShadow: "0 2px 8px rgba(0,0,0,0.4)" }}>
                  {stat.value}
                </div>
                <div style={{ fontFamily: "var(--font-body)", fontSize: "12px", color: "rgba(255,255,255,0.8)", marginTop: "4px", textShadow: "0 1px 6px rgba(0,0,0,0.4)" }}>
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

      </div>

      <style>{`
        @media (max-width: 768px) {
          .hero-grid { gap: 32px !important; padding: 32px 16px 56px !important; }
        }
        @media (max-width: 540px) {
          .search-filters { display: none !important; }
        }
      `}</style>
    </section>
  );
}

const selectStyle: React.CSSProperties = {
  border: "none", outline: "none", background: "transparent",
  fontFamily: "var(--font-body)", fontSize: "13px", color: "#78716C",
  padding: "6px 10px", cursor: "pointer", appearance: "none", flexShrink: 0,
};
