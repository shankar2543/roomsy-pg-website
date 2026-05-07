import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import { useAuthStore } from "@/store/useAuthStore";
import {
  listMyNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  ServiceNotification,
} from "@/lib/notificationService";
import { HiArrowLeft, HiOutlineBell } from "react-icons/hi";

function timeAgo(iso: string): string {
  const then = new Date(iso).getTime();
  const diff = Math.max(0, Date.now() - then);
  const m = Math.floor(diff / 60_000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d ago`;
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export default function NotificationsPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const hydrated = useAuthStore((s) => s.hydrated);
  const [items, setItems] = useState<ServiceNotification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!hydrated) return;
    if (!user) { router.replace("/auth/login"); return; }
    let cancelled = false;
    listMyNotifications()
      .then((rows) => { if (!cancelled) { setItems(rows); setLoading(false); } })
      .catch(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [user, hydrated, router]);

  async function handleClick(n: ServiceNotification) {
    if (!n.isRead) {
      try {
        await markNotificationRead(n.objectId);
        setItems((prev) => prev.map((x) => x.objectId === n.objectId ? { ...x, isRead: true } : x));
      } catch { /* silent */ }
    }
    if (n.link) router.push(n.link);
  }

  async function handleMarkAll() {
    try {
      await markAllNotificationsRead();
      setItems((prev) => prev.map((x) => ({ ...x, isRead: true })));
    } catch { /* silent */ }
  }

  if (!user) return null;

  const unreadCount = items.filter((n) => !n.isRead).length;

  return (
    <>
      <Head><title>Notifications — Roomsy</title></Head>
      <Navbar />

      <main style={{ minHeight: "100vh", background: "#F9F7F4", paddingTop: 72 }}>
        <div style={{ maxWidth: 720, margin: "0 auto", padding: "32px 24px" }}>
          <Link
            href="/"
            aria-label="Back home"
            style={{
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              width: 36, height: 36, borderRadius: "50%",
              background: "#fff", border: "1px solid #E8E4DE",
              color: "#1C1917", textDecoration: "none", marginBottom: 16,
            }}
          >
            <HiArrowLeft size={16} />
          </Link>

          <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
            <div>
              <h1 style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 700, color: "#1C1917", margin: 0, letterSpacing: "-0.5px" }}>
                Notifications
              </h1>
              <p style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "#78716C", marginTop: 4 }}>
                {items.length === 0
                  ? "You're all caught up."
                  : `${unreadCount} unread of ${items.length} total`}
              </p>
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAll}
                style={{
                  background: "#fff", border: "1px solid #E8E4DE", borderRadius: 100,
                  padding: "8px 14px", fontFamily: "var(--font-body)", fontSize: 13,
                  fontWeight: 600, color: "#FF385C", cursor: "pointer",
                }}
              >
                Mark all read
              </button>
            )}
          </header>

          {loading ? (
            <p style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "#78716C", textAlign: "center", padding: 40 }}>
              Loading…
            </p>
          ) : items.length === 0 ? (
            <div style={{ background: "#fff", border: "1px solid #E8E4DE", borderRadius: 16, padding: "60px 24px", textAlign: "center" }}>
              <HiOutlineBell size={36} color="#D6D3CE" style={{ marginBottom: 12 }} />
              <p style={{ fontFamily: "var(--font-body)", fontSize: 15, color: "#78716C", margin: 0 }}>
                No notifications yet.
              </p>
            </div>
          ) : (
            <ul style={{ listStyle: "none", padding: 0, margin: 0, background: "#fff", borderRadius: 16, border: "1px solid #E8E4DE", overflow: "hidden" }}>
              {items.map((n) => (
                <li key={n.objectId} style={{ borderBottom: "1px solid #F5F3F0" }}>
                  <button
                    onClick={() => handleClick(n)}
                    style={{
                      display: "flex", flexDirection: "column", gap: 6,
                      padding: "16px 20px", width: "100%",
                      textAlign: "left", background: n.isRead ? "transparent" : "#FFF7F8",
                      border: "none", cursor: "pointer", transition: "background 0.15s",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#F9F7F4")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = n.isRead ? "transparent" : "#FFF7F8")}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      {!n.isRead && (
                        <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#FF385C", flexShrink: 0 }} />
                      )}
                      <span style={{ fontFamily: "var(--font-body)", fontSize: 15, fontWeight: 600, color: "#1C1917" }}>
                        {n.title}
                      </span>
                    </div>
                    <span style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "#57534E", lineHeight: 1.5 }}>
                      {n.body}
                    </span>
                    <span style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "#A8A29E" }}>
                      {timeAgo(n.createdAt)}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}
