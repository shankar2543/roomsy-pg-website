import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import Head from "next/head";
import { loginDummy } from "@/lib/dummyAuth";
import { useAuthStore } from "@/store/useAuthStore";
import toast from "react-hot-toast";

export default function Login() {
  const router = useRouter();
  const setUser = useAuthStore((s) => s.setUser);
  // Two visual roles: tenant-or-owner ("user") and platform admin
  const [role, setRole] = useState<"user" | "platform_admin">("user");
  const [loginMethod, setLoginMethod] = useState<"email" | "phone">("email");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const isPhone = loginMethod === "phone";
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const idValue = isPhone ? identifier : identifier.trim();
    try {
      // "Tenant / Owner" accepts either customer or pg_admin; "Admin" is platform_admin only.
      const allowedRoles: ("customer" | "pg_admin" | "platform_admin")[] =
        role === "platform_admin" ? ["platform_admin"] : ["customer", "pg_admin"];

      const user = loginDummy({ identifier: idValue, password, role: allowedRoles });

      setUser(user);
      toast.success(`Welcome back, ${user.name}!`);
      if (user.role === "pg_admin") {
        router.push("/pg-admin/dashboard");
      } else if (user.role === "platform_admin") {
        router.push("/admin/dashboard");
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
        <title>Log in — Roomsy</title>
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
              Log in to your account
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
                <label style={labelStyle}>Select role</label>
                {(() => {
                  const ROLES: { value: "user" | "platform_admin"; label: string }[] = [
                    { value: "user", label: "Tenant / Owner" },
                    { value: "platform_admin", label: "Admin" },
                  ];
                  const activeIndex = Math.max(0, ROLES.findIndex((r) => r.value === role));
                  return (
                    <div className="role-segmented">
                      <div
                        className="role-indicator"
                        style={{ transform: `translateX(${activeIndex * 100}%)` }}
                      />
                      {ROLES.map((r) => (
                        <button
                          key={r.value}
                          type="button"
                          onClick={() => setRole(r.value)}
                          className={`role-segment ${role === r.value ? "active" : ""}`}
                        >
                          {r.label}
                        </button>
                      ))}
                    </div>
                  );
                })()}
              </div>

              <div>
                <label style={labelStyle}>Log in with</label>
                <div className="login-method-radios">
                  {([
                    { value: "email", label: "Email" },
                    { value: "phone", label: "Phone" },
                  ] as { value: "email" | "phone"; label: string }[]).map((m) => (
                    <button
                      key={m.value}
                      type="button"
                      onClick={() => {
                        setLoginMethod(m.value);
                        setIdentifier("");
                      }}
                      className={`radio-option ${loginMethod === m.value ? "selected" : ""}`}
                      aria-pressed={loginMethod === m.value}
                    >
                      <span className="radio-circle">
                        <span className="radio-dot" />
                      </span>
                      <span className="radio-label">{m.label}</span>
                    </button>
                  ))}
                </div>

                {isPhone ? (
                  <div style={{ display: "flex", alignItems: "center", border: "1.5px solid #E8E4DE", borderRadius: "10px", backgroundColor: "#FAFAF9", overflow: "hidden", transition: "border-color 0.15s" }}>
                    <span style={{ padding: "11px 12px", fontFamily: "var(--font-body)", fontSize: "14px", color: "#78716C", borderRight: "1.5px solid #E8E4DE", backgroundColor: "#F5F3F0", whiteSpace: "nowrap" }}>
                      +91
                    </span>
                    <input
                      type="tel"
                      inputMode="numeric"
                      placeholder="98765 43210"
                      value={identifier}
                      onChange={(e) => { if (/^\d*$/.test(e.target.value) && e.target.value.length <= 10) setIdentifier(e.target.value); }}
                      required
                      style={{ ...inputStyle, border: "none", borderRadius: 0, backgroundColor: "transparent", flex: 1 }}
                    />
                  </div>
                ) : (
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    required
                    style={inputStyle}
                    onFocus={(e) => (e.currentTarget.style.borderColor = "#FF385C")}
                    onBlur={(e) => (e.currentTarget.style.borderColor = "#E8E4DE")}
                  />
                )}
              </div>

              <div>
                <label style={labelStyle}>Password</label>
                <input
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
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
                {loading ? "Logging in…" : "Log in"}
              </button>
            </form>

            <div style={{ display: "flex", alignItems: "center", gap: "12px", margin: "20px 0" }}>
              <div style={{ flex: 1, height: "1px", backgroundColor: "#E8E4DE" }} />
              <span style={{ fontFamily: "var(--font-body)", fontSize: "12px", color: "#A8A29E" }}>or</span>
              <div style={{ flex: 1, height: "1px", backgroundColor: "#E8E4DE" }} />
            </div>

            {/* Google */}
            <button
              type="button"
              style={socialBtnStyle}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#F9F7F4")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#fff")}
            >
              <svg width="18" height="18" viewBox="0 0 48 48">
                <path fill="#4285F4" d="M47.5 24.5c0-1.6-.1-3.2-.4-4.7H24v9h13.2c-.6 3-2.3 5.5-4.9 7.2v6h7.9c4.6-4.3 7.3-10.6 7.3-17.5z"/>
                <path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.9-6c-2.1 1.4-4.8 2.3-8 2.3-6.1 0-11.3-4.1-13.2-9.7H2.7v6.2C6.7 42.8 14.8 48 24 48z"/>
                <path fill="#FBBC05" d="M10.8 28.8c-.5-1.4-.8-2.8-.8-4.3s.3-3 .8-4.3v-6.2H2.7C1 17.2 0 20.5 0 24s1 6.8 2.7 9.7l8.1-4.9z"/>
                <path fill="#EA4335" d="M24 9.5c3.4 0 6.5 1.2 8.9 3.5l6.6-6.6C35.9 2.5 30.5 0 24 0 14.8 0 6.7 5.2 2.7 14.3l8.1 6.2C12.7 14.6 17.9 9.5 24 9.5z"/>
              </svg>
              <span style={{ fontFamily: "var(--font-body)", fontSize: "14px", fontWeight: "500", color: "#1C1917" }}>
                Continue with Google
              </span>
            </button>

            {/* Apple */}
            <button
              type="button"
              style={{ ...socialBtnStyle, marginTop: "10px" }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#F9F7F4")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#fff")}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.7 9.05 7.4c1.39.07 2.35.74 3.16.8.81-.1 2.16-.84 3.75-.72 1.61.12 2.84.7 3.62 1.87-3.23 2.06-2.71 6.55.47 8.03-.63 1.2-1.39 2.35-3 2.9zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
              </svg>
              <span style={{ fontFamily: "var(--font-body)", fontSize: "14px", fontWeight: "500", color: "#1C1917" }}>
                Continue with Apple
              </span>
            </button>

            <div style={{ height: "1px", backgroundColor: "#E8E4DE", margin: "20px 0" }} />

            <p style={{ fontFamily: "var(--font-body)", fontSize: "14px", color: "#78716C", textAlign: "center" }}>
              Don't have an account?{" "}
              <Link href="/auth/signup" style={{ color: "#FF385C", fontWeight: "600", textDecoration: "none" }}>
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>

      <style>{`
        .login-method-radios {
          display: flex;
          gap: 18px;
          margin-bottom: 10px;
        }
        .radio-option {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 6px 4px;
          background: transparent;
          border: none;
          cursor: pointer;
          font-family: var(--font-body);
          font-size: 14px;
          font-weight: 500;
          color: #78716C;
          transition: color 0.2s ease;
        }
        .radio-option:hover { color: #1C1917; }
        .radio-option.selected { color: #1C1917; font-weight: 600; }
        .radio-circle {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          border: 1.5px solid #D6D3CE;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: border-color 0.2s ease, background 0.2s ease;
        }
        .radio-option:hover .radio-circle { border-color: #A8A29E; }
        .radio-option.selected .radio-circle {
          border-color: #FF385C;
          background: #FFF0F3;
        }
        .radio-dot {
          width: 9px;
          height: 9px;
          border-radius: 50%;
          background: #FF385C;
          transform: scale(0);
          transition: transform 0.22s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .radio-option.selected .radio-dot {
          transform: scale(1);
        }

        .role-segmented {
          position: relative;
          display: flex;
          background: #F0EDE8;
          border-radius: 12px;
          padding: 4px;
          gap: 0;
          overflow: hidden;
        }
        .role-indicator {
          position: absolute;
          top: 4px;
          bottom: 4px;
          left: 4px;
          width: calc((100% - 8px) / 2);
          background: #FF385C;
          border-radius: 9px;
          box-shadow: 0 4px 14px rgba(255, 56, 92, 0.35),
                      0 1px 3px rgba(255, 56, 92, 0.25);
          transition: transform 0.38s cubic-bezier(0.22, 1, 0.36, 1);
          will-change: transform;
        }
        .role-segment {
          position: relative;
          z-index: 1;
          flex: 1;
          padding: 10px 8px;
          border: none;
          background: transparent;
          font-family: var(--font-body);
          font-size: 13px;
          font-weight: 500;
          color: #78716C;
          cursor: pointer;
          transition: color 0.25s ease, font-weight 0.25s ease;
          letter-spacing: 0.1px;
          white-space: nowrap;
        }
        .role-segment:hover { color: #1C1917; }
        .role-segment.active {
          color: #fff;
          font-weight: 600;
        }
      `}</style>
    </>
  );
}

const socialBtnStyle: React.CSSProperties = {
  width: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "10px",
  padding: "12px",
  border: "1.5px solid #E8E4DE",
  borderRadius: "100px",
  backgroundColor: "#fff",
  cursor: "pointer",
  transition: "background 0.15s",
};

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
