import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import { HiCheckCircle, HiLocationMarker } from "react-icons/hi";

const sharingLabel: Record<string, string> = {
  single: "1 Sharing (Single Room)",
  double: "2 Sharing",
  triple: "3 Sharing",
};

function formatDate(dateStr: string) {
  if (!dateStr) return "—";
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
  });
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px" }}>
      <span style={{ fontFamily: "var(--font-body)", fontSize: "13px", color: "#78716C" }}>{label}</span>
      <span style={{ fontFamily: "var(--font-body)", fontSize: "13px", fontWeight: "600", color: "#1C1917", textAlign: "right" }}>{value}</span>
    </div>
  );
}

export default function BookingConfirmPage() {
  const router = useRouter();
  if (!router.isReady) return null;

  const { pgName, sharing, stayType, total, fromDate, toDate, nights, months } =
    router.query as Record<string, string>;

  if (!pgName) {
    return (
      <>
        <Navbar />
        <main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", paddingTop: "72px" }}>
          <div style={{ textAlign: "center" }}>
            <p style={{ fontFamily: "var(--font-body)", color: "#78716C", marginBottom: "16px" }}>No booking details found.</p>
            <Link href="/pgs" style={{ color: "#FF385C", fontFamily: "var(--font-body)", fontSize: "14px" }}>← Browse PGs</Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Head><title>Booking Request Sent — Roomsy</title></Head>
      <Navbar />

      <main style={{ minHeight: "100vh", backgroundColor: "#F9F7F4", paddingTop: "72px" }}>
        <div style={{ maxWidth: "520px", margin: "0 auto", padding: "48px 24px 80px" }}>

          {/* Success mark */}
          <div style={{ textAlign: "center", marginBottom: "36px" }}>
            <div style={{ position: "relative", display: "inline-block", marginBottom: "22px" }}>
              <div style={{ position: "absolute", inset: "-10px", borderRadius: "50%", backgroundColor: "rgba(255,56,92,0.08)", animation: "confirmPulse 2s ease-out infinite" }} />
              <div style={{ width: "72px", height: "72px", borderRadius: "50%", backgroundColor: "#FFF0F3", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
                <HiCheckCircle size={42} color="#FF385C" />
              </div>
            </div>
            <h1 style={{ fontFamily: "var(--font-display)", fontSize: "28px", fontWeight: "700", color: "#1C1917", letterSpacing: "-0.6px", marginBottom: "10px" }}>
              Request Sent!
            </h1>
            <p style={{ fontFamily: "var(--font-body)", fontSize: "15px", color: "#78716C", lineHeight: 1.65, maxWidth: "340px", margin: "0 auto" }}>
              Your booking request and ID proof have been received. The owner will contact you shortly.
            </p>
          </div>

          {/* Booking summary */}
          <div style={{ backgroundColor: "#fff", border: "1px solid #E8E4DE", borderRadius: "20px", overflow: "hidden", marginBottom: "16px", boxShadow: "0 2px 16px rgba(0,0,0,0.05)" }}>
            <div style={{ padding: "20px 24px 18px", borderBottom: "1px solid #F0EDE8", backgroundColor: "#FAFAF9" }}>
              <p style={{ fontFamily: "var(--font-body)", fontSize: "10px", fontWeight: "700", color: "#FF385C", letterSpacing: "1.6px", textTransform: "uppercase", marginBottom: "5px" }}>
                Booking Summary
              </p>
              <h2 style={{ fontFamily: "var(--font-display)", fontSize: "20px", fontWeight: "600", color: "#1C1917", letterSpacing: "-0.3px", lineHeight: 1.2 }}>
                {pgName}
              </h2>
            </div>

            <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: "13px" }}>
              <Row label="Room Type" value={sharingLabel[sharing] ?? sharing} />
              <Row label="Stay Type" value={stayType === "daily" ? "Short Stay" : "Monthly"} />
              {stayType === "daily" ? (
                <>
                  <Row label="Check-in"  value={formatDate(fromDate)} />
                  <Row label="Check-out" value={formatDate(toDate)} />
                  <Row label="Duration"  value={`${nights} night${Number(nights) !== 1 ? "s" : ""}`} />
                </>
              ) : (
                <Row label="Duration" value={`${months} month${Number(months) !== 1 ? "s" : ""}`} />
              )}

              <div style={{ borderTop: "1px solid #F0EDE8", paddingTop: "16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontFamily: "var(--font-body)", fontSize: "14px", fontWeight: "600", color: "#1C1917" }}>Total</span>
                <span style={{ fontFamily: "var(--font-display)", fontSize: "26px", fontWeight: "700", color: "#FF385C", letterSpacing: "-0.8px" }}>
                  ₹{Number(total).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* What happens next */}
          <div style={{ backgroundColor: "#fff", border: "1px solid #E8E4DE", borderRadius: "16px", padding: "20px 24px", marginBottom: "24px" }}>
            <p style={{ fontFamily: "var(--font-body)", fontSize: "12px", fontWeight: "700", color: "#1C1917", letterSpacing: "0.5px", textTransform: "uppercase", marginBottom: "18px" }}>
              What happens next
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {[
                { n: "1", text: "The PG owner reviews your request and ID proof." },
                { n: "2", text: "They call or WhatsApp you within 24 hours to confirm." },
                { n: "3", text: "Pay directly to the owner — UPI, cash, or bank transfer." },
              ].map((s) => (
                <div key={s.n} style={{ display: "flex", gap: "14px", alignItems: "flex-start" }}>
                  <div style={{ width: "26px", height: "26px", borderRadius: "50%", backgroundColor: "#FFF0F3", border: "1.5px solid rgba(255,56,92,0.25)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: "1px" }}>
                    <span style={{ fontFamily: "var(--font-body)", fontSize: "11px", fontWeight: "700", color: "#FF385C" }}>{s.n}</span>
                  </div>
                  <p style={{ fontFamily: "var(--font-body)", fontSize: "14px", color: "#57534E", lineHeight: 1.6 }}>{s.text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Payment note */}
          <div style={{ display: "flex", gap: "10px", alignItems: "flex-start", padding: "14px 16px", backgroundColor: "#FFFBEB", border: "1px solid #FDE68A", borderRadius: "12px", marginBottom: "24px" }}>
            <span style={{ fontSize: "16px", flexShrink: 0, marginTop: "1px" }}>💡</span>
            <p style={{ fontFamily: "var(--font-body)", fontSize: "13px", color: "#92400E", lineHeight: 1.5 }}>
              Roomsy does not collect any payments. All transactions are directly between you and the PG owner.
            </p>
          </div>

          {/* CTAs */}
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <Link
              href="/pgs"
              style={{ display: "block", textAlign: "center", padding: "15px", borderRadius: "100px", backgroundColor: "#FF385C", color: "#fff", fontFamily: "var(--font-body)", fontSize: "14px", fontWeight: "700", textDecoration: "none" }}
            >
              Browse More PGs
            </Link>
            <Link
              href="/"
              style={{ display: "block", textAlign: "center", padding: "15px", borderRadius: "100px", backgroundColor: "#fff", color: "#1C1917", fontFamily: "var(--font-body)", fontSize: "14px", fontWeight: "600", textDecoration: "none", border: "1.5px solid #E8E4DE" }}
            >
              Back to Home
            </Link>
          </div>
        </div>
      </main>

      <Footer />

      <style>{`
        @keyframes confirmPulse {
          0%   { transform: scale(1); opacity: 0.6; }
          70%  { transform: scale(1.5); opacity: 0; }
          100% { transform: scale(1.5); opacity: 0; }
        }
      `}</style>
    </>
  );
}
