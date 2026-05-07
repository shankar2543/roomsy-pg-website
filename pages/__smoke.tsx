import { useState } from "react";
import Head from "next/head";
import Parse from "@/lib/parseConfig";

type EnvCheck = { name: string; present: boolean; preview: string };

const envChecks: EnvCheck[] = [
  envCheck("NEXT_PUBLIC_BACK4APP_APP_ID", process.env.NEXT_PUBLIC_BACK4APP_APP_ID),
  envCheck("NEXT_PUBLIC_BACK4APP_JS_KEY", process.env.NEXT_PUBLIC_BACK4APP_JS_KEY),
  envCheck("NEXT_PUBLIC_BACK4APP_SERVER_URL", process.env.NEXT_PUBLIC_BACK4APP_SERVER_URL),
];

function envCheck(name: string, value: string | undefined): EnvCheck {
  if (!value) return { name, present: false, preview: "—" };
  const preview =
    value.length <= 8 ? "•".repeat(value.length) : `${value.slice(0, 4)}…${value.slice(-2)}`;
  return { name, present: true, preview };
}

export default function Smoke() {
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">("idle");
  const [result, setResult] = useState<unknown>(null);
  const [error, setError] = useState<string>("");

  const [seedStatus, setSeedStatus] = useState<"idle" | "loading" | "ok" | "error">("idle");
  const [seedResult, setSeedResult] = useState<unknown>(null);
  const [seedError, setSeedError] = useState<string>("");

  const [pgSeedStatus, setPgSeedStatus] = useState<"idle" | "loading" | "ok" | "error">("idle");
  const [pgSeedResult, setPgSeedResult] = useState<unknown>(null);
  const [pgSeedError, setPgSeedError] = useState<string>("");

  const ping = async () => {
    setStatus("loading");
    setError("");
    setResult(null);
    try {
      const data = await Parse.Cloud.run("hello", { from: "smoke-page" });
      setResult(data);
      setStatus("ok");
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setStatus("error");
    }
  };

  const seed = async () => {
    setSeedStatus("loading");
    setSeedError("");
    setSeedResult(null);
    try {
      const data = await Parse.Cloud.run("seedUsers");
      setSeedResult(data);
      setSeedStatus("ok");
    } catch (e) {
      setSeedError(e instanceof Error ? e.message : String(e));
      setSeedStatus("error");
    }
  };

  const clearSession = async () => {
    try {
      await Parse.User.logOut();
    } catch {
      // ignore — fall through to local cleanup
    }
    // Belt-and-suspenders: nuke any Parse-prefixed localStorage keys that may
    // still hold a stale session token (e.g. from before users were reseeded).
    if (typeof window !== "undefined") {
      Object.keys(window.localStorage)
        .filter((k) => k.startsWith("Parse/"))
        .forEach((k) => window.localStorage.removeItem(k));
    }
    window.location.reload();
  };

  const seedPGs = async () => {
    setPgSeedStatus("loading");
    setPgSeedError("");
    setPgSeedResult(null);
    try {
      const data = await Parse.Cloud.run("seedPGs");
      setPgSeedResult(data);
      setPgSeedStatus("ok");
    } catch (e) {
      setPgSeedError(e instanceof Error ? e.message : String(e));
      setPgSeedStatus("error");
    }
  };

  return (
    <>
      <Head>
        <title>Back4App smoke test</title>
        <meta name="robots" content="noindex" />
      </Head>
      <div style={{ maxWidth: 720, margin: "40px auto", padding: 24, fontFamily: "var(--font-body), system-ui" }}>
        <h1 style={{ fontFamily: "var(--font-display), serif", fontSize: 28, marginBottom: 8 }}>
          Back4App smoke test
        </h1>
        <p style={{ color: "#78716C", marginBottom: 24 }}>
          Verifies env vars are loaded, Parse SDK initialised, and Cloud Code is reachable.
        </p>

        <section style={card}>
          <h2 style={h2}>1. Environment variables</h2>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
            <tbody>
              {envChecks.map((c) => (
                <tr key={c.name} style={{ borderBottom: "1px solid #F0EDE8" }}>
                  <td style={{ padding: "8px 0", fontFamily: "ui-monospace, monospace" }}>{c.name}</td>
                  <td style={{ padding: "8px 0", color: c.present ? "#16A34A" : "#DC2626" }}>
                    {c.present ? "loaded" : "missing"}
                  </td>
                  <td style={{ padding: "8px 0", fontFamily: "ui-monospace, monospace", color: "#78716C" }}>
                    {c.preview}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section style={card}>
          <h2 style={h2}>2. Cloud Code round-trip</h2>
          <button onClick={ping} disabled={status === "loading"} style={btn}>
            {status === "loading" ? "Pinging…" : "Run Parse.Cloud.run('hello')"}
          </button>

          {status === "ok" && (
            <pre style={{ ...pre, borderColor: "#86EFAC", background: "#F0FDF4" }}>
              {JSON.stringify(result, null, 2)}
            </pre>
          )}
          {status === "error" && (
            <pre style={{ ...pre, borderColor: "#FECACA", background: "#FEF2F2", color: "#991B1B" }}>
              {error}
            </pre>
          )}
        </section>

        <section style={card}>
          <h2 style={h2}>3. Seed test users</h2>
          <p style={{ fontSize: 13, color: "#78716C", marginBottom: 12 }}>
            Creates the 5 dev users on Back4App (idempotent — skips ones that already exist).
          </p>
          <button onClick={seed} disabled={seedStatus === "loading"} style={btn}>
            {seedStatus === "loading" ? "Seeding…" : "Run Parse.Cloud.run('seedUsers')"}
          </button>
          {seedStatus === "ok" && (
            <pre style={{ ...pre, borderColor: "#86EFAC", background: "#F0FDF4" }}>
              {JSON.stringify(seedResult, null, 2)}
            </pre>
          )}
          {seedStatus === "error" && (
            <pre style={{ ...pre, borderColor: "#FECACA", background: "#FEF2F2", color: "#991B1B" }}>
              {seedError}
            </pre>
          )}
        </section>

        <section style={card}>
          <h2 style={h2}>Clear local Parse session</h2>
          <p style={{ fontSize: 13, color: "#78716C", marginBottom: 12 }}>
            Use this if you see <code>Invalid session token</code>. Logs you out locally and removes any stale Parse keys from localStorage.
          </p>
          <button onClick={clearSession} style={{ ...btn, background: "#78716C" }}>
            Clear session & reload
          </button>
        </section>

        <section style={card}>
          <h2 style={h2}>4. Seed PGs</h2>
          <p style={{ fontSize: 13, color: "#78716C", marginBottom: 12 }}>
            Creates the 12 dev PG listings on Back4App (idempotent — uses <code>slug</code> as key). Run <strong>seedUsers</strong> first.
          </p>
          <button onClick={seedPGs} disabled={pgSeedStatus === "loading"} style={btn}>
            {pgSeedStatus === "loading" ? "Seeding…" : "Run Parse.Cloud.run('seedPGs')"}
          </button>
          {pgSeedStatus === "ok" && (
            <pre style={{ ...pre, borderColor: "#86EFAC", background: "#F0FDF4" }}>
              {JSON.stringify(pgSeedResult, null, 2)}
            </pre>
          )}
          {pgSeedStatus === "error" && (
            <pre style={{ ...pre, borderColor: "#FECACA", background: "#FEF2F2", color: "#991B1B" }}>
              {pgSeedError}
            </pre>
          )}
        </section>
      </div>
    </>
  );
}

const card: React.CSSProperties = {
  border: "1px solid #E8E4DE",
  borderRadius: 12,
  padding: 20,
  marginBottom: 16,
  background: "#fff",
};

const h2: React.CSSProperties = {
  fontFamily: "var(--font-display), serif",
  fontSize: 18,
  marginBottom: 12,
};

const btn: React.CSSProperties = {
  padding: "10px 16px",
  borderRadius: 100,
  border: "none",
  background: "#FF385C",
  color: "#fff",
  fontSize: 14,
  fontWeight: 600,
  cursor: "pointer",
};

const pre: React.CSSProperties = {
  marginTop: 14,
  padding: 14,
  borderRadius: 10,
  border: "1px solid",
  fontSize: 12,
  fontFamily: "ui-monospace, monospace",
  whiteSpace: "pre-wrap",
  wordBreak: "break-word",
};
