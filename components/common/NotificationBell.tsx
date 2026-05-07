import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { HiOutlineBell } from "react-icons/hi";
import {
  listMyNotifications,
  countUnreadNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  ServiceNotification,
} from "@/lib/notificationService";
import { useAuthStore } from "@/store/useAuthStore";

const POLL_MS = 60_000;

function timeAgo(iso: string): string {
  const then = new Date(iso).getTime();
  const diff = Math.max(0, Date.now() - then);
  const m = Math.floor(diff / 60_000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

interface NotificationBellProps {
  /** Color used for the bell glyph itself. Defaults to dark text. */
  iconColor?: string;
  /** Width/height of the bell button in pixels. */
  size?: number;
  /** Hover background applied to the bell button. */
  hoverBg?: string;
}

export default function NotificationBell({
  iconColor = "#1C1917",
  size = 42,
  hoverBg = "#F5F3F0",
}: NotificationBellProps) {
  const user = useAuthStore((s) => s.user);
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const [items, setItems] = useState<ServiceNotification[]>([]);
  const [loading, setLoading] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  // Poll unread count every minute while signed in.
  useEffect(() => {
    if (!user) { setUnread(0); return; }
    let cancelled = false;
    const tick = () =>
      countUnreadNotifications()
        .then((n) => { if (!cancelled) setUnread(n); })
        .catch(() => {});
    tick();
    const id = setInterval(tick, POLL_MS);
    return () => { cancelled = true; clearInterval(id); };
  }, [user]);

  // Close dropdown on outside click.
  useEffect(() => {
    if (!open) return;
    function onDocClick(e: MouseEvent) {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open]);

  async function handleOpen() {
    if (!user) return;
    setOpen((prev) => !prev);
    if (!open) {
      setLoading(true);
      try {
        const rows = await listMyNotifications();
        setItems(rows);
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    }
  }

  async function handleClick(n: ServiceNotification) {
    if (!n.isRead) {
      try {
        await markNotificationRead(n.objectId);
        setItems((prev) => prev.map((x) => x.objectId === n.objectId ? { ...x, isRead: true } : x));
        setUnread((u) => Math.max(0, u - 1));
      } catch {
        // silent
      }
    }
    setOpen(false);
    if (n.link) router.push(n.link);
  }

  async function handleMarkAll() {
    try {
      await markAllNotificationsRead();
      setItems((prev) => prev.map((x) => ({ ...x, isRead: true })));
      setUnread(0);
    } catch {
      // silent
    }
  }

  if (!user) return null;

  return (
    <div ref={wrapRef} style={{ position: "relative" }}>
      <button
        onClick={handleOpen}
        aria-label={`Notifications${unread > 0 ? ` (${unread} unread)` : ""}`}
        style={{
          display: "flex", alignItems: "center", justifyContent: "center",
          width: size, height: size, border: "none", background: "transparent",
          cursor: "pointer", padding: 0, position: "relative",
          borderRadius: "50%", transition: "background 0.15s",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = hoverBg)}
        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
      >
        <HiOutlineBell size={Math.round(size * 0.5)} color={iconColor} />
        {unread > 0 && (
          <span
            style={{
              position: "absolute", top: 6, right: 6,
              minWidth: 16, height: 16, padding: "0 4px",
              borderRadius: 100, background: "#FF385C", color: "#fff",
              fontFamily: "var(--font-body)", fontSize: 10, fontWeight: 700,
              display: "flex", alignItems: "center", justifyContent: "center",
              border: "2px solid #fff", boxSizing: "border-box",
              lineHeight: 1,
            }}
          >
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div
          style={{
            position: "absolute", top: "calc(100% + 8px)", right: 0,
            width: 360, maxHeight: 480, overflow: "hidden",
            background: "#fff", borderRadius: 14, border: "1px solid #E8E4DE",
            boxShadow: "0 16px 48px rgba(0,0,0,0.16)",
            display: "flex", flexDirection: "column", zIndex: 1000,
          }}
        >
          <header
            style={{
              padding: "12px 16px", borderBottom: "1px solid #F0EDE8",
              display: "flex", alignItems: "center", justifyContent: "space-between",
            }}
          >
            <span style={{ fontFamily: "var(--font-display)", fontSize: 15, fontWeight: 600, color: "#1C1917" }}>
              Notifications
            </span>
            {items.some((i) => !i.isRead) && (
              <button
                onClick={handleMarkAll}
                style={{ background: "none", border: "none", cursor: "pointer", color: "#FF385C", fontFamily: "var(--font-body)", fontSize: 12, fontWeight: 600 }}
              >
                Mark all read
              </button>
            )}
          </header>

          <div style={{ flex: 1, overflowY: "auto" }}>
            {loading ? (
              <div style={{ padding: 24, textAlign: "center", fontFamily: "var(--font-body)", fontSize: 13, color: "#78716C" }}>Loading…</div>
            ) : items.length === 0 ? (
              <div style={{ padding: 32, textAlign: "center" }}>
                <p style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "#78716C", margin: 0 }}>
                  No notifications yet.
                </p>
              </div>
            ) : (
              items.map((n) => (
                <button
                  key={n.objectId}
                  onClick={() => handleClick(n)}
                  style={{
                    display: "flex", flexDirection: "column", gap: 4,
                    padding: "12px 16px", width: "100%",
                    textAlign: "left", background: n.isRead ? "transparent" : "#FFF7F8",
                    border: "none", borderBottom: "1px solid #F5F3F0", cursor: "pointer",
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#F9F7F4")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = n.isRead ? "transparent" : "#FFF7F8")}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    {!n.isRead && (
                      <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#FF385C", flexShrink: 0 }} />
                    )}
                    <span style={{ fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 600, color: "#1C1917" }}>
                      {n.title}
                    </span>
                  </div>
                  <span style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "#57534E", lineHeight: 1.4 }}>
                    {n.body}
                  </span>
                  <span style={{ fontFamily: "var(--font-body)", fontSize: 11, color: "#A8A29E" }}>
                    {timeAgo(n.createdAt)}
                  </span>
                </button>
              ))
            )}
          </div>

          <footer style={{ padding: "10px 16px", borderTop: "1px solid #F0EDE8", textAlign: "center" }}>
            <Link
              href="/notifications"
              onClick={() => setOpen(false)}
              style={{ fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 600, color: "#FF385C", textDecoration: "none" }}
            >
              View all
            </Link>
          </footer>
        </div>
      )}
    </div>
  );
}
