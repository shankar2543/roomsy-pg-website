import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/router";
import { motion, AnimatePresence } from "framer-motion";
import {
  HiShieldCheck, HiCurrencyRupee, HiLocationMarker, HiSearch,
  HiChevronLeft, HiChevronRight, HiCalendar,
} from "react-icons/hi";
import { MdOutlineVerified } from "react-icons/md";

const IMAGES = [
  "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=700&q=85",
  "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=700&q=85",
  "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=700&q=85",
];

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
  const [lightbox, setLightbox]       = useState<string | null>(null);
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
    <section id="home" style={{ backgroundColor: "#F9F7F4", paddingTop: "72px", overflow: "hidden" }}>
      {/* Dot grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.5 }}
        transition={{ duration: 1.2 }}
        style={{
          position: "absolute", inset: 0,
          backgroundImage: "radial-gradient(circle, #E8E4DE 1px, transparent 1px)",
          backgroundSize: "28px 28px",
          pointerEvents: "none", zIndex: 0,
        }}
      />

      {/* ── Search bar ── */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease, delay: 0.1 }}
        style={{
          position: "relative", zIndex: 10, backgroundColor: "#F9F7F4",
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
          display: "grid", gridTemplateColumns: "1fr 1fr", gap: "64px",
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
            fontWeight: "600", color: "#1C1917", lineHeight: "1.08",
            letterSpacing: "-2px", marginBottom: "24px",
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
            fontFamily: "var(--font-body)", fontSize: "16px", color: "#78716C",
            lineHeight: "1.7", marginBottom: "36px", maxWidth: "420px",
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
                borderRight: i < 2 ? "1px solid #E8E4DE" : "none",
              }}>
                <div style={{ fontFamily: "var(--font-display)", fontSize: "28px", fontWeight: "600", color: "#1C1917", letterSpacing: "-0.5px", lineHeight: 1 }}>
                  {stat.value}
                </div>
                <div style={{ fontFamily: "var(--font-body)", fontSize: "12px", color: "#78716C", marginTop: "4px" }}>
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* RIGHT — Image collage */}
        <div style={{ position: "relative", height: "560px" }} className="hero-images">
          <motion.div
            animate={{ scale: [1, 1.15, 1], opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            style={{
              position: "absolute", top: "50%", left: "50%",
              transform: "translate(-50%, -50%)", width: "360px", height: "360px",
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(249,115,22,0.14) 0%, transparent 70%)",
              pointerEvents: "none",
            }}
          />
          <motion.div
            initial={{ opacity: 0, x: 60, scale: 0.92 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ duration: 0.9, ease, delay: 0.3 }}
            onClick={() => setLightbox(IMAGES[0])}
            whileHover={{ scale: 1.02 }}
            style={{ position: "absolute", top: "0", right: "0", width: "78%", height: "68%", borderRadius: "24px", overflow: "hidden", boxShadow: "0 20px 60px rgba(0,0,0,0.15)", cursor: "zoom-in" }}
          >
            <motion.img
              src={IMAGES[0]} alt="PG Room"
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              style={{ width: "100%", height: "110%", objectFit: "cover" }}
            />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: -40, y: 40 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            transition={{ duration: 0.8, ease, delay: 0.55 }}
            onClick={() => setLightbox(IMAGES[1])}
            whileHover={{ scale: 1.03 }}
            style={{ position: "absolute", bottom: "0", left: "0", width: "46%", height: "40%", borderRadius: "20px", overflow: "hidden", boxShadow: "0 12px 40px rgba(0,0,0,0.12)", cursor: "zoom-in" }}
          >
            <img src={IMAGES[1]} alt="PG Room" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 40, y: 40 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            transition={{ duration: 0.8, ease, delay: 0.7 }}
            onClick={() => setLightbox(IMAGES[2])}
            whileHover={{ scale: 1.03 }}
            style={{ position: "absolute", bottom: "0", right: "0", width: "46%", height: "40%", borderRadius: "20px", overflow: "hidden", boxShadow: "0 12px 40px rgba(0,0,0,0.12)", cursor: "zoom-in" }}
          >
            <img src={IMAGES[2]} alt="PG Room" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </motion.div>
        </div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={() => setLightbox(null)}
            style={{ position: "fixed", inset: 0, zIndex: 1000, backgroundColor: "rgba(0,0,0,0.85)", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}
          >
            <motion.div
              initial={{ scale: 0.88, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.88, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 28 }}
              onClick={(e) => e.stopPropagation()}
              style={{ position: "relative", maxWidth: "900px", width: "100%", borderRadius: "20px", overflow: "hidden", boxShadow: "0 40px 120px rgba(0,0,0,0.5)" }}
            >
              <img src={lightbox} alt="PG Room" style={{ width: "100%", display: "block", maxHeight: "80vh", objectFit: "cover" }} />
              <motion.button
                onClick={() => setLightbox(null)}
                whileHover={{ scale: 1.1, backgroundColor: "#FF385C" }}
                whileTap={{ scale: 0.95 }}
                style={{ position: "absolute", top: "14px", right: "14px", width: "36px", height: "36px", borderRadius: "50%", backgroundColor: "rgba(0,0,0,0.55)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "18px", lineHeight: 1 }}
              >
                ×
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        /* Desktop polish: gentle hero-image float */
        @media (min-width: 769px) {
          .hero-images img {
            transition: transform 0.6s cubic-bezier(0.22, 1, 0.36, 1) !important;
          }
          .hero-images > div:hover img {
            transform: scale(1.03);
          }
        }
        @media (max-width: 768px) {
          .hero-grid { grid-template-columns: 1fr !important; gap: 32px !important; padding: 32px 16px 56px !important; }
          .hero-images { display: none !important; }
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
