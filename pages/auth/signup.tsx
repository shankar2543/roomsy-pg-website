import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import Head from "next/head";
import { signupUser } from "@/lib/authService";
import { useAuthStore } from "@/store/useAuthStore";
import toast from "react-hot-toast";

export default function Signup() {
  const router = useRouter();
  const isPgAdmin = router.query.role === "pg_admin";
  const setUser = useAuthStore((s) => s.setUser);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [role] = useState(isPgAdmin ? "pg_admin" : "customer");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length !== 10) { setError("Enter a valid 10-digit phone number."); return; }
    setLoading(true);
    setError("");
    try {
      const user = await signupUser({ name, email, phone, password, role: role as "customer" | "pg_admin" });
      setUser(user);
      toast.success("Account created! Welcome to Roomsy.");
      if (user.role === "pg_admin") {
        router.push("/pg-admin/dashboard");
      } else {
        router.push("/");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Sign up — Roomsy</title>
      </Head>

      <div style={{ position: "relative", minHeight: "100vh", overflow: "hidden" }}>
        {/* Background */}
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundImage: "url(/auth-bg.png)",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />

        {/* Dark overlay */}
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.35)",
          }}
        />

        {/* Centered card */}
        <div
          className="auth-wrapper"
          style={{
            position: "relative",
            zIndex: 10,
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "24px",
          }}
        >
          <div
            className="auth-card"
            style={{
              backgroundColor: "#fff",
              borderRadius: "20px",
              padding: "40px 36px",
              width: "100%",
              maxWidth: "400px",
              boxShadow: "0 24px 80px rgba(0,0,0,0.3)",
            }}
          >
            {/* Close button */}
            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "8px" }}>
              <Link
                href="/"
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  backgroundColor: "#F5F3F0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  textDecoration: "none",
                  color: "#1C1917",
                  fontSize: "18px",
                  lineHeight: 1,
                  transition: "background 0.15s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#E8E4DE")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#F5F3F0")}
                aria-label="Back to home"
              >
                ×
              </Link>
            </div>

            {/* Logo */}
            <div style={{ display: "flex", justifyContent: "center", marginBottom: "24px" }}>
              <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "8px" }}>
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "50%",
                    backgroundColor: "#FF385C",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <span style={{ fontFamily: "var(--font-display)", fontSize: "20px", fontWeight: "700", color: "#fff", lineHeight: 1 }}>R</span>
                </div>
                <span style={{ fontFamily: "var(--font-display)", fontSize: "22px", fontWeight: "600", color: "#1C1917", letterSpacing: "-0.3px" }}>
                  Roomsy
                </span>
              </Link>
            </div>

            <h1
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "22px",
                fontWeight: "600",
                color: "#1C1917",
                textAlign: "center",
                marginBottom: "28px",
                letterSpacing: "-0.3px",
              }}
            >
              Create your account
            </h1>

            {error && (
              <div
                style={{
                  backgroundColor: "#FEF2F2",
                  border: "1px solid #FECACA",
                  borderRadius: "10px",
                  padding: "12px 14px",
                  marginBottom: "16px",
                  fontFamily: "var(--font-body)",
                  fontSize: "13px",
                  color: "#DC2626",
                }}
              >
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label style={labelStyle}>Full name</label>
                <input
                  type="text"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  style={inputStyle}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "#FF385C")}
                  onBlur={(e) => (e.currentTarget.style.borderColor = "#E8E4DE")}
                />
              </div>

              <div>
                <label style={labelStyle}>Email address</label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  style={inputStyle}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "#FF385C")}
                  onBlur={(e) => (e.currentTarget.style.borderColor = "#E8E4DE")}
                />
              </div>

              <div>
                <label style={labelStyle}>Contact number</label>
                <div style={{ display: "flex", alignItems: "center", border: "1.5px solid #E8E4DE", borderRadius: "10px", backgroundColor: "#FAFAF9", overflow: "hidden", transition: "border-color 0.15s" }}
                  onFocus={() => {}}
                  onBlurCapture={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) e.currentTarget.style.borderColor = "#E8E4DE"; }}
                  onFocusCapture={(e) => { e.currentTarget.style.borderColor = "#FF385C"; }}
                >
                  <span style={{ padding: "11px 12px", fontFamily: "var(--font-body)", fontSize: "14px", color: "#78716C", borderRight: "1.5px solid #E8E4DE", backgroundColor: "#F5F3F0", whiteSpace: "nowrap" }}>
                    +91
                  </span>
                  <input
                    type="tel"
                    placeholder="98765 43210"
                    value={phone}
                    onChange={(e) => { if (/^\d*$/.test(e.target.value) && e.target.value.length <= 10) setPhone(e.target.value); }}
                    required
                    style={{ ...inputStyle, border: "none", borderRadius: 0, backgroundColor: "transparent", flex: 1 }}
                  />
                </div>
              </div>

              <div>
                <label style={labelStyle}>Password</label>
                <input
                  type="password"
                  placeholder="Min. 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  style={inputStyle}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "#FF385C")}
                  onBlur={(e) => (e.currentTarget.style.borderColor = "#E8E4DE")}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  backgroundColor: loading ? "#FDBA74" : "#FF385C",
                  color: "#fff",
                  border: "none",
                  borderRadius: "100px",
                  padding: "14px",
                  fontFamily: "var(--font-body)",
                  fontSize: "15px",
                  fontWeight: "600",
                  cursor: loading ? "not-allowed" : "pointer",
                  transition: "background 0.2s",
                  marginTop: "4px",
                }}
                onMouseEnter={(e) => { if (!loading) e.currentTarget.style.backgroundColor = "#E31C5F"; }}
                onMouseLeave={(e) => { if (!loading) e.currentTarget.style.backgroundColor = "#FF385C"; }}
              >
                {loading ? "Creating account…" : "Create account"}
              </button>
            </form>

            <div style={{ display: "flex", alignItems: "center", gap: "12px", margin: "20px 0" }}>
              <div style={{ flex: 1, height: "1px", backgroundColor: "#E8E4DE" }} />
              <span style={{ fontFamily: "var(--font-body)", fontSize: "12px", color: "#A8A29E" }}>or</span>
              <div style={{ flex: 1, height: "1px", backgroundColor: "#E8E4DE" }} />
            </div>

            <p style={{ fontFamily: "var(--font-body)", fontSize: "14px", color: "#78716C", textAlign: "center" }}>
              Already have an account?{" "}
              <Link href="/auth/login" style={{ color: "#FF385C", fontWeight: "600", textDecoration: "none" }}>
                Log in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

const labelStyle: React.CSSProperties = {
  display: "block",
  fontFamily: "var(--font-body)",
  fontSize: "13px",
  fontWeight: "500",
  color: "#1C1917",
  marginBottom: "6px",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  border: "1.5px solid #E8E4DE",
  borderRadius: "10px",
  padding: "11px 14px",
  fontFamily: "var(--font-body)",
  fontSize: "14px",
  color: "#1C1917",
  outline: "none",
  backgroundColor: "#FAFAF9",
  boxSizing: "border-box",
  transition: "border-color 0.15s",
};
