import { useEffect, useState } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";

interface SplashScreenProps {
  onComplete: () => void;
}

const CUBE_SIZE = 110;
const HALF = CUBE_SIZE / 2;
const FLY_DISTANCE = 360; // how far each face starts from the cube center

// Each face: final position + the direction it flies in from
const FACES = [
  // front  — flies in from the front
  { tx: 0,    ty: 0,    tz: HALF,  rx: 0,    ry: 0,    fx: 0,             fy: 0,             fz: FLY_DISTANCE,  shade: "linear-gradient(145deg, #FF6B85 0%, #FF385C 55%, #E8284F 100%)", light: 1,    delay: 0.10 },
  // back   — flies in from behind
  { tx: 0,    ty: 0,    tz: -HALF, rx: 0,    ry: 180,  fx: 0,             fy: 0,             fz: -FLY_DISTANCE, shade: "linear-gradient(145deg, #C81F49 0%, #9C1538 100%)",            light: 0.55, delay: 0.30 },
  // right  — flies in from the right
  { tx: HALF, ty: 0,    tz: 0,     rx: 0,    ry: 90,   fx: FLY_DISTANCE,  fy: 0,             fz: 0,             shade: "linear-gradient(180deg, #FF5070 0%, #D8224B 100%)",            light: 0.8,  delay: 0.20 },
  // left   — flies in from the left
  { tx: -HALF,ty: 0,    tz: 0,     rx: 0,    ry: -90,  fx: -FLY_DISTANCE, fy: 0,             fz: 0,             shade: "linear-gradient(180deg, #BB1F46 0%, #821331 100%)",            light: 0.5,  delay: 0.40 },
  // top    — flies down from above
  { tx: 0,    ty: -HALF,tz: 0,     rx: 90,   ry: 0,    fx: 0,             fy: -FLY_DISTANCE, fz: 0,             shade: "linear-gradient(180deg, #FFA0B5 0%, #FF6B85 100%)",            light: 0.95, delay: 0.05 },
  // bottom — flies up from below
  { tx: 0,    ty: HALF, tz: 0,     rx: -90,  ry: 0,    fx: 0,             fy: FLY_DISTANCE,  fz: 0,             shade: "linear-gradient(0deg, #6E0F2A 0%, #2C0612 100%)",              light: 0.3,  delay: 0.50 },
];

const ASSEMBLE_TIME  = 1.0;   // duration of the fly-in
const ASSEMBLE_END   = 1.6;   // by this time everything is locked in (last delay 0.5 + duration 1.0)
const ROTATE_DELAY   = ASSEMBLE_END + 0.2;

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const progress = useMotionValue(0);
  const [percent, setPercent] = useState(0);
  const barWidth = useTransform(progress, [0, 1], ["0%", "100%"]);
  const [assembled, setAssembled] = useState(false);

  useEffect(() => {
    const unsub = progress.on("change", (v) => setPercent(Math.round(v * 100)));
    return () => unsub();
  }, [progress]);

  useEffect(() => {
    // Trigger assembly on next frame so the CSS transition fires
    const t = requestAnimationFrame(() => setAssembled(true));
    return () => cancelAnimationFrame(t);
  }, []);

  useEffect(() => {
    const ctrl = animate(progress, 1, { duration: 3.6, ease: [0.22, 1, 0.36, 1] });
    const done = setTimeout(onComplete, 4400);
    return () => { ctrl.stop(); clearTimeout(done); };
  }, [progress, onComplete]);

  return (
    <motion.div
      key="splash"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.55, ease: [0.4, 0, 0.2, 1] }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "radial-gradient(ellipse at 50% 35%, #1A1413 0%, #0A0707 65%, #050303 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        perspective: "1400px",
      }}
    >
      {/* Ambient pink glow */}
      <div style={{
        position: "absolute",
        inset: 0,
        background: "radial-gradient(ellipse 55% 40% at 50% 45%, rgba(255,56,92,0.12) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      {/* Subtle dot grid */}
      <div style={{
        position: "absolute",
        inset: 0,
        backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px)",
        backgroundSize: "32px 32px",
        pointerEvents: "none",
        maskImage: "radial-gradient(ellipse at center, black 25%, transparent 75%)",
        WebkitMaskImage: "radial-gradient(ellipse at center, black 25%, transparent 75%)",
      }} />

      {/* Centered content */}
      <div style={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        zIndex: 1,
      }}>

        {/* 3D cube — assembled from 6 flying faces, then rotates slowly */}
        <div style={{
          position: "relative",
          width: CUBE_SIZE,
          height: CUBE_SIZE,
          marginBottom: "44px",
          perspective: "1100px",
        }}>
          <motion.div
            initial={{ rotateY: -28, rotateX: -22 }}
            animate={{
              rotateY: [-28, -28, 360 - 28],   // hold while assembling, then slow spin
              rotateX: -22,
            }}
            transition={{
              rotateY: {
                times: [0, ROTATE_DELAY / (ROTATE_DELAY + 9), 1],
                duration: ROTATE_DELAY + 9,
                ease: ["linear", "linear"],
                repeat: Infinity,
                repeatType: "loop",
              },
            }}
            style={{
              position: "relative",
              width: CUBE_SIZE,
              height: CUBE_SIZE,
              transformStyle: "preserve-3d",
              willChange: "transform",
            }}
          >
            {FACES.map((f, i) => {
              // Final pose on the cube
              const finalT = `translate3d(${f.tx}px, ${f.ty}px, ${f.tz}px) rotateX(${f.rx}deg) rotateY(${f.ry}deg)`;
              // Starting pose: same orientation, but offset far away in the face's own facing direction
              const startT = `translate3d(${f.tx + f.fx}px, ${f.ty + f.fy}px, ${f.tz + f.fz}px) rotateX(${f.rx}deg) rotateY(${f.ry}deg) scale(0.65)`;
              return (
                <div
                  key={i}
                  style={{
                    position: "absolute",
                    inset: 0,
                    background: f.shade,
                    border: "1px solid rgba(255,255,255,0.12)",
                    borderRadius: "8px",
                    transformOrigin: "50% 50%",
                    transform: assembled ? finalT : startT,
                    opacity: assembled ? 1 : 0,
                    transition: `transform ${ASSEMBLE_TIME}s cubic-bezier(0.34, 1.36, 0.64, 1) ${f.delay}s, opacity 0.55s ease-out ${f.delay}s`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: `inset 0 1px 0 rgba(255,255,255,${0.18 * f.light}), inset 0 -8px 18px rgba(0,0,0,${0.35 * (1 - f.light) + 0.1})`,
                    overflow: "hidden",
                    backfaceVisibility: "hidden",
                    willChange: "transform, opacity",
                  }}
                >
                  {/* Specular highlight */}
                  <div style={{
                    position: "absolute",
                    top: 0, left: 0, right: 0,
                    height: "55%",
                    background: `linear-gradient(180deg, rgba(255,255,255,${0.22 * f.light}) 0%, transparent 100%)`,
                    pointerEvents: "none",
                  }} />
                  {/* R logo on every face */}
                  <span style={{
                    fontFamily: "var(--font-display), Georgia, serif",
                    fontSize: "54px",
                    fontWeight: "800",
                    color: "#fff",
                    letterSpacing: "-2px",
                    lineHeight: 1,
                    position: "relative",
                    textShadow: `0 2px 10px rgba(0,0,0,${0.35 + (1 - f.light) * 0.3}), 0 1px 0 rgba(255,255,255,${0.25 * f.light})`,
                    opacity: 0.7 + 0.3 * f.light,
                  }}>R</span>
                </div>
              );
            })}
          </motion.div>

          {/* Soft ground shadow */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 0.55, scale: 1 }}
            transition={{ delay: ASSEMBLE_END - 0.3, duration: 0.6 }}
            style={{
              position: "absolute",
              left: "50%",
              top: "100%",
              transform: "translate(-50%, 18px)",
              width: CUBE_SIZE * 1.2,
              height: 22,
              background: "radial-gradient(ellipse at center, rgba(255,56,92,0.5) 0%, rgba(255,56,92,0.15) 45%, transparent 75%)",
              filter: "blur(6px)",
              pointerEvents: "none",
            }}
          />
        </div>

        {/* ROOMSY brand name — letters arrive from random directions, settle, then shimmer */}
        <div style={{
          position: "relative",
          display: "flex",
          gap: "1px",
          marginBottom: "12px",
          perspective: "600px",
        }}>
          {"ROOMSY".split("").map((letter, i) => {
            const dirs = [
              { x: -50, y: -30, rotateY: -90, rotateX: 30  },
              { x: 0,   y: -50, rotateY: 0,   rotateX: -90 },
              { x: 50,  y: -20, rotateY: 90,  rotateX: 0   },
              { x: -20, y: 50,  rotateY: 0,   rotateX: 90  },
              { x: 30,  y: 50,  rotateY: -45, rotateX: -45 },
              { x: 60,  y: 0,   rotateY: 90,  rotateX: 30  },
            ];
            const dir = dirs[i % dirs.length];
            return (
              <motion.span
                key={i}
                initial={{
                  opacity: 0,
                  x: dir.x,
                  y: dir.y,
                  rotateY: dir.rotateY,
                  rotateX: dir.rotateX,
                  scale: 0.4,
                  filter: "blur(8px)",
                }}
                animate={{
                  opacity: 1,
                  x: 0,
                  y: 0,
                  rotateY: 0,
                  rotateX: 0,
                  scale: 1,
                  filter: "blur(0px)",
                }}
                transition={{
                  delay: ASSEMBLE_END - 0.1 + i * 0.09,
                  duration: 0.85,
                  ease: [0.34, 1.56, 0.64, 1],
                }}
                style={{
                  fontFamily: "var(--font-display), Georgia, serif",
                  fontSize: "30px",
                  fontWeight: "700",
                  color: "#fff",
                  letterSpacing: "5px",
                  lineHeight: 1,
                  display: "inline-block",
                  transformStyle: "preserve-3d",
                  textShadow: "0 2px 12px rgba(255,56,92,0.25)",
                }}
              >
                {letter}
              </motion.span>
            );
          })}

          {/* Shimmer sweep across the brand name */}
          <motion.span
            initial={{ x: "-120%", opacity: 0 }}
            animate={{ x: "120%", opacity: [0, 1, 0] }}
            transition={{
              delay: ASSEMBLE_END + 0.85,
              duration: 1.4,
              ease: "easeInOut",
            }}
            style={{
              position: "absolute",
              top: 0, bottom: 0,
              left: 0,
              width: "40%",
              background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.35) 50%, transparent 100%)",
              pointerEvents: "none",
              mixBlendMode: "overlay",
            }}
          />
        </div>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 0.55, y: 0 }}
          transition={{ delay: ASSEMBLE_END + 0.6, duration: 0.5 }}
          style={{
            fontFamily: "var(--font-body), sans-serif",
            fontSize: "11px",
            fontWeight: "500",
            color: "#A8A29E",
            letterSpacing: "3.5px",
            textTransform: "uppercase",
            margin: "0 0 36px",
          }}
        >
          Find your perfect stay
        </motion.p>

        {/* Progress bar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: ASSEMBLE_END + 0.8, duration: 0.5 }}
          style={{
            position: "relative",
            width: 240,
            marginBottom: "12px",
          }}
        >
          <div style={{
            width: "100%",
            height: 4,
            borderRadius: 100,
            background: "rgba(255,255,255,0.07)",
            overflow: "hidden",
            position: "relative",
            boxShadow: "inset 0 1px 2px rgba(0,0,0,0.45)",
          }}>
            <motion.div
              style={{
                height: "100%",
                width: barWidth,
                borderRadius: 100,
                background: "linear-gradient(90deg, #FF385C 0%, #FF6B85 50%, #FF385C 100%)",
                boxShadow: "0 0 12px rgba(255,56,92,0.55), 0 0 22px rgba(255,56,92,0.28)",
              }}
            />
          </div>
        </motion.div>

        {/* Status caption */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: ASSEMBLE_END + 0.9, duration: 0.4 }}
          style={{
            fontFamily: "var(--font-body), sans-serif",
            fontSize: "10px",
            fontWeight: "600",
            letterSpacing: "1.6px",
            textTransform: "uppercase",
            color: "#57534E",
            margin: "12px 0 0",
            minHeight: "12px",
          }}
        >
          {percent < 25 ? "Initializing"
            : percent < 55 ? "Loading rooms"
            : percent < 85 ? "Preparing your stay"
            : percent < 100 ? "Almost there"
            : "Ready"}
        </motion.p>
      </div>

      {/* Bottom credit */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.4 }}
        transition={{ delay: ASSEMBLE_END + 1.1, duration: 0.6 }}
        style={{
          position: "absolute",
          bottom: 24,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
          fontFamily: "var(--font-body), sans-serif",
          fontSize: "10px",
          letterSpacing: "2px",
          color: "#44403C",
          pointerEvents: "none",
        }}
      >
        © ROOMSY · MADE IN INDIA
      </motion.div>
    </motion.div>
  );
}
