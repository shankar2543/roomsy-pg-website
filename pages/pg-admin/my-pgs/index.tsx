import { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";
import { useAuthStore } from "@/store/useAuthStore";
import { getPGsForOwner } from "@/lib/pgService";
import { getBookingsForPG } from "@/lib/bookingService";
import { PG } from "@/types/pg";
import { Sidebar } from "../dashboard";
import { HiLocationMarker, HiChevronRight, HiOfficeBuilding, HiUsers, HiClock, HiBadgeCheck, HiArrowLeft, HiPlus } from "react-icons/hi";

const TYPE_LABEL: Record<string, string> = { boys: "Boys", girls: "Girls", coliving: "Co-living" };
const TYPE_COLOR: Record<string, string> = { boys: "#3B82F6", girls: "#EC4899", coliving: "#8B5CF6" };

export default function MyPGsPage() {
  const router = useRouter();
  const { user, hydrated } = useAuthStore();
  const [pgs, setPGs] = useState<PG[]>([]);
  const [pgStats, setPGStats] = useState<Record<string, { residents: number; pending: number }>>({});

  useEffect(() => {
    if (!hydrated) return;
    if (!user) { router.replace("/"); return; }
    if (user.role !== "pg_admin") { router.replace("/"); return; }
    let cancelled = false;
    (async () => {
      try {
        const list = await getPGsForOwner(user.objectId);
        if (cancelled) return;
        setPGs(list);
        const bookingsByPG = await Promise.all(list.map((pg) => getBookingsForPG(pg.objectId)));
        if (cancelled) return;
        const stats: Record<string, { residents: number; pending: number }> = {};
        list.forEach((pg, idx) => {
          const bookings = bookingsByPG[idx];
          stats[pg.objectId] = {
            residents: bookings.filter((b) => b.status === "confirmed").length,
            pending: bookings.filter((b) => b.status === "pending").length,
          };
        });
        setPGStats(stats);
      } catch { /* silent — list stays empty */ }
    })();
    return () => { cancelled = true; };
  }, [user, hydrated]);

  if (!user || user.role !== "pg_admin") return null;

  return (
    <>
      <Head><title>My PGs — Roomsy Owner</title></Head>
      <div className="pg-layout">
        <Sidebar active="/pg-admin/my-pgs" />

        <main className="pg-main">
          <div className="dash-hero-bar">
            <div className="dash-hero-text">
              <button onClick={() => router.push("/pg-admin/dashboard")} aria-label="Back to dashboard" className="dash-hero-back">
                <HiArrowLeft size={16} />
              </button>
              <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(20px,3vw,26px)", fontWeight: "700", color: "#fff", letterSpacing: "-0.5px", marginBottom: "4px" }}>
                My PGs
              </h1>
              <p style={{ fontFamily: "var(--font-body)", fontSize: "14px", color: "rgba(255,255,255,0.68)", margin: 0 }}>
                {pgs.length} propert{pgs.length !== 1 ? "ies" : "y"} · tap to manage
              </p>
            </div>
            <Link
              href="/pg-admin/my-pgs/new"
              className="add-pg-cta"
              style={{
                display: "inline-flex", alignItems: "center", gap: "6px",
                padding: "10px 18px", borderRadius: "100px",
                backgroundColor: "#fff", color: "#FF385C",
                fontFamily: "var(--font-body)", fontSize: "13px", fontWeight: "600",
                textDecoration: "none", marginLeft: "auto", whiteSpace: "nowrap",
                boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
                transition: "transform 0.15s, box-shadow 0.15s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 4px 14px rgba(0,0,0,0.18)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.12)"; }}
            >
              <HiPlus size={14} /> Add PG
            </Link>
          </div>

          <div className="pg-content">

            {pgs.length > 0 ? (
              <div className="o-pg-card-grid">
                {pgs.map((pg) => {
                  const stats = pgStats[pg.objectId] ?? { residents: 0, pending: 0 };
                  return (
                    <Link
                      key={pg.objectId}
                      href={`/pg-admin/my-pgs/${pg.objectId}`}
                      style={{ textDecoration: "none", display: "block" }}
                    >
                      <div style={{
                        backgroundColor: "#fff", border: "1px solid #E8E4DE", borderRadius: "18px",
                        overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
                        transition: "box-shadow 0.2s, transform 0.2s", cursor: "pointer",
                      }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.boxShadow = "0 8px 28px rgba(0,0,0,0.1)"; (e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)"; }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.boxShadow = "0 1px 4px rgba(0,0,0,0.05)"; (e.currentTarget as HTMLDivElement).style.transform = "none"; }}
                      >
                        {/* Photo */}
                        <div style={{ position: "relative", height: "170px", backgroundColor: "#F0EDE8" }}>
                          {pg.photos[0] ? (
                            <Image src={pg.photos[0]} alt={pg.name} fill style={{ objectFit: "cover" }} />
                          ) : (
                            <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                              <HiOfficeBuilding size={40} color="#D6D3CE" />
                            </div>
                          )}
                          {/* Type badge */}
                          <div style={{ position: "absolute", top: "12px", left: "12px", fontFamily: "var(--font-body)", fontSize: "11px", fontWeight: "700", color: "#fff", backgroundColor: TYPE_COLOR[pg.pgType], borderRadius: "100px", padding: "4px 10px" }}>
                            {TYPE_LABEL[pg.pgType]}
                          </div>
                          {/* Approval badge */}
                          <div style={{ position: "absolute", top: "12px", right: "12px", display: "flex", alignItems: "center", gap: "4px", fontFamily: "var(--font-body)", fontSize: "11px", fontWeight: "600", color: pg.isApproved ? "#065F46" : "#92400E", backgroundColor: pg.isApproved ? "#D1FAE5" : "#FEF3C7", borderRadius: "100px", padding: "4px 10px" }}>
                            <HiBadgeCheck size={12} />
                            {pg.isApproved ? "Live" : "Pending Approval"}
                          </div>
                        </div>

                        {/* Info */}
                        <div style={{ padding: "16px 18px 18px" }}>
                          <h3 style={{ fontFamily: "var(--font-display)", fontSize: "16px", fontWeight: "600", color: "#1C1917", marginBottom: "4px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {pg.name}
                          </h3>
                          <div style={{ display: "flex", alignItems: "center", gap: "4px", marginBottom: "14px" }}>
                            <HiLocationMarker size={12} color="#78716C" />
                            <span style={{ fontFamily: "var(--font-body)", fontSize: "12px", color: "#78716C" }}>{pg.area}, Hyderabad</span>
                          </div>

                          {/* Stats row */}
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px" }}>
                            <div style={{ textAlign: "center", padding: "10px 8px", backgroundColor: "#F9F7F4", borderRadius: "10px" }}>
                              <div style={{ fontFamily: "var(--font-display)", fontSize: "20px", fontWeight: "700", color: pg.availableBeds === 0 ? "#DC2626" : "#10B981" }}>{pg.availableBeds}</div>
                              <div style={{ fontFamily: "var(--font-body)", fontSize: "10px", color: "#78716C", marginTop: "2px" }}>Free Beds</div>
                            </div>
                            <div style={{ textAlign: "center", padding: "10px 8px", backgroundColor: "#F9F7F4", borderRadius: "10px" }}>
                              <div style={{ fontFamily: "var(--font-display)", fontSize: "20px", fontWeight: "700", color: "#1C1917" }}>{stats.residents}</div>
                              <div style={{ fontFamily: "var(--font-body)", fontSize: "10px", color: "#78716C", marginTop: "2px" }}>Residents</div>
                            </div>
                            <div style={{ textAlign: "center", padding: "10px 8px", backgroundColor: stats.pending > 0 ? "#FFFBEB" : "#F9F7F4", borderRadius: "10px", border: stats.pending > 0 ? "1px solid #FDE68A" : "none" }}>
                              <div style={{ fontFamily: "var(--font-display)", fontSize: "20px", fontWeight: "700", color: stats.pending > 0 ? "#F59E0B" : "#1C1917" }}>{stats.pending}</div>
                              <div style={{ fontFamily: "var(--font-body)", fontSize: "10px", color: "#78716C", marginTop: "2px" }}>Pending</div>
                            </div>
                          </div>

                          <div style={{ marginTop: "14px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                            <span style={{ fontFamily: "var(--font-body)", fontSize: "13px", color: "#78716C" }}>
                              From <strong style={{ color: "#1C1917" }}>₹{pg.monthlyPrice.toLocaleString()}</strong>/mo
                            </span>
                            <div style={{ display: "flex", alignItems: "center", gap: "4px", fontFamily: "var(--font-body)", fontSize: "13px", fontWeight: "600", color: "#FF385C" }}>
                              Manage <HiChevronRight size={14} />
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: "60px 24px", backgroundColor: "#fff", borderRadius: "20px", border: "1px solid #E8E4DE" }}>
                <HiOfficeBuilding size={40} color="#D6D3CE" style={{ marginBottom: "16px" }} />
                <p style={{ fontFamily: "var(--font-body)", fontSize: "15px", color: "#78716C", marginBottom: "16px" }}>You haven&apos;t listed any PGs yet.</p>
                <Link
                  href="/pg-admin/my-pgs/new"
                  style={{
                    display: "inline-flex", alignItems: "center", gap: "6px",
                    padding: "10px 22px", borderRadius: "100px",
                    backgroundColor: "#FF385C", color: "#fff",
                    fontFamily: "var(--font-body)", fontSize: "13px", fontWeight: "600",
                    textDecoration: "none",
                  }}
                >
                  <HiPlus size={14} /> List your first PG
                </Link>
              </div>
            )}
          </div>
        </main>
      </div>
    </>
  );
}
