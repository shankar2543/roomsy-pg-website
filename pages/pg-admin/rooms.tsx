import { useState, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { useAuthStore } from "@/store/useAuthStore";
import { getPGsForOwner, updatePGPrices, updatePGAvailableBeds } from "@/lib/dummyPGAdmin";
import { PG, Occupancy } from "@/types/pg";
import { Sidebar } from "./dashboard";
import { HiPencil, HiCheck, HiX, HiArrowLeft } from "react-icons/hi";
import toast from "react-hot-toast";

const OCCUPANCY_LABEL: Record<Occupancy, string> = {
  single: "Single Room",
  double: "2 Sharing",
  triple: "3 Sharing",
};

type RoomEdit = {
  monthlyPrice: number;
  dailyPrice: number;
};

type PGEdit = {
  rooms: Record<Occupancy, RoomEdit>;
  availableBeds: number;
};

function PGRoomCard({ pg, onSave }: { pg: PG; onSave: (pgId: string, edit: PGEdit) => void }) {
  const [editing, setEditing] = useState(false);
  const [availableBeds, setAvailableBeds] = useState(pg.availableBeds);
  const [rooms, setRooms] = useState<Record<Occupancy, RoomEdit>>(() => {
    const r: any = {};
    (pg.occupancy as Occupancy[]).forEach((occ) => {
      r[occ] = {
        monthlyPrice: pg.sharingPrices[occ] ?? 0,
        dailyPrice: pg.dailyPrices[occ] ?? 0,
      };
    });
    return r;
  });

  function handleSave() {
    onSave(pg.objectId, { rooms, availableBeds });
    setEditing(false);
  }

  function handleCancel() {
    setAvailableBeds(pg.availableBeds);
    const r: any = {};
    (pg.occupancy as Occupancy[]).forEach((occ) => {
      r[occ] = {
        monthlyPrice: pg.sharingPrices[occ] ?? 0,
        dailyPrice: pg.dailyPrices[occ] ?? 0,
      };
    });
    setRooms(r);
    setEditing(false);
  }

  return (
    <div style={{ backgroundColor: "#fff", border: "1px solid #E8E4DE", borderRadius: "16px", overflow: "hidden" }}>
      {/* PG Header */}
      <div className="o-card-header" style={{ padding: "16px 20px", borderBottom: "1px solid #F0EDE8" }}>
        <div className="o-card-header-left">
          <h3 style={{ fontFamily: "var(--font-display)", fontSize: "16px", fontWeight: "600", color: "#1C1917", marginBottom: "2px" }}>{pg.name}</h3>
          <p style={{ fontFamily: "var(--font-body)", fontSize: "12px", color: "#78716C" }}>{pg.area} · Hyderabad</p>
        </div>
        <div className="o-card-header-right">
          {!editing ? (
            <button
              onClick={() => setEditing(true)}
              style={{ display: "flex", alignItems: "center", gap: "6px", fontFamily: "var(--font-body)", fontSize: "13px", fontWeight: "600", color: "#FF385C", padding: "7px 14px", borderRadius: "100px", border: "1.5px solid #FECDD3", backgroundColor: "#FFF0F3", cursor: "pointer" }}
            >
              <HiPencil size={13} /> Edit
            </button>
          ) : (
            <>
              <button
                onClick={handleSave}
                style={{ display: "flex", alignItems: "center", gap: "6px", fontFamily: "var(--font-body)", fontSize: "13px", fontWeight: "700", color: "#065F46", padding: "7px 14px", borderRadius: "100px", border: "1.5px solid #6EE7B7", backgroundColor: "#D1FAE5", cursor: "pointer" }}
              >
                <HiCheck size={13} /> Save
              </button>
              <button
                onClick={handleCancel}
                style={{ display: "flex", alignItems: "center", gap: "6px", fontFamily: "var(--font-body)", fontSize: "13px", fontWeight: "600", color: "#44403C", padding: "7px 14px", borderRadius: "100px", border: "1.5px solid #E8E4DE", backgroundColor: "#fff", cursor: "pointer" }}
              >
                <HiX size={13} /> Cancel
              </button>
            </>
          )}
        </div>
      </div>

      <div style={{ padding: "20px" }}>
        {/* Available beds */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "14px 16px", backgroundColor: "#F9F7F4", borderRadius: "12px", marginBottom: "16px" }}>
          <div style={{ flex: 1 }}>
            <p style={{ fontFamily: "var(--font-body)", fontSize: "12px", fontWeight: "700", color: "#78716C", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "2px" }}>Available Beds</p>
            <p style={{ fontFamily: "var(--font-body)", fontSize: "12px", color: "#A8A29E" }}>Total free beds shown to customers</p>
          </div>
          {editing ? (
            <input
              type="number"
              min={0}
              value={availableBeds}
              onChange={(e) => setAvailableBeds(Math.max(0, Number(e.target.value)))}
              style={{ width: "72px", padding: "6px 10px", borderRadius: "8px", border: "1.5px solid #FF385C", fontFamily: "var(--font-body)", fontSize: "15px", fontWeight: "700", color: "#1C1917", textAlign: "center", outline: "none" }}
            />
          ) : (
            <span style={{ fontFamily: "var(--font-display)", fontSize: "24px", fontWeight: "700", color: availableBeds === 0 ? "#DC2626" : "#10B981" }}>
              {availableBeds}
            </span>
          )}
        </div>

        {/* Room type prices */}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {(pg.occupancy as Occupancy[]).map((occ) => (
            <div key={occ} style={{ border: "1px solid #F0EDE8", borderRadius: "12px", padding: "14px 16px" }}>
              <p style={{ fontFamily: "var(--font-body)", fontSize: "13px", fontWeight: "700", color: "#1C1917", marginBottom: "12px" }}>
                {OCCUPANCY_LABEL[occ]}
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ fontFamily: "var(--font-body)", fontSize: "11px", fontWeight: "600", color: "#78716C", textTransform: "uppercase", letterSpacing: "0.4px", display: "block", marginBottom: "6px" }}>
                    Monthly (per person)
                  </label>
                  {editing ? (
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <span style={{ fontFamily: "var(--font-body)", fontSize: "14px", color: "#44403C" }}>₹</span>
                      <input
                        type="number"
                        min={0}
                        value={rooms[occ]?.monthlyPrice ?? 0}
                        onChange={(e) => setRooms((r) => ({ ...r, [occ]: { ...r[occ], monthlyPrice: Number(e.target.value) } }))}
                        style={{ width: "100%", padding: "7px 10px", borderRadius: "8px", border: "1.5px solid #E8E4DE", fontFamily: "var(--font-body)", fontSize: "14px", color: "#1C1917", outline: "none" }}
                      />
                    </div>
                  ) : (
                    <span style={{ fontFamily: "var(--font-display)", fontSize: "18px", fontWeight: "700", color: "#1C1917" }}>
                      ₹{(rooms[occ]?.monthlyPrice ?? 0).toLocaleString()}
                    </span>
                  )}
                </div>
                <div>
                  <label style={{ fontFamily: "var(--font-body)", fontSize: "11px", fontWeight: "600", color: "#78716C", textTransform: "uppercase", letterSpacing: "0.4px", display: "block", marginBottom: "6px" }}>
                    Daily (per person)
                  </label>
                  {editing ? (
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <span style={{ fontFamily: "var(--font-body)", fontSize: "14px", color: "#44403C" }}>₹</span>
                      <input
                        type="number"
                        min={0}
                        value={rooms[occ]?.dailyPrice ?? 0}
                        onChange={(e) => setRooms((r) => ({ ...r, [occ]: { ...r[occ], dailyPrice: Number(e.target.value) } }))}
                        style={{ width: "100%", padding: "7px 10px", borderRadius: "8px", border: "1.5px solid #E8E4DE", fontFamily: "var(--font-body)", fontSize: "14px", color: "#1C1917", outline: "none" }}
                      />
                    </div>
                  ) : (
                    <span style={{ fontFamily: "var(--font-display)", fontSize: "18px", fontWeight: "700", color: "#1C1917" }}>
                      ₹{(rooms[occ]?.dailyPrice ?? 0).toLocaleString()}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function PGAdminRooms() {
  const router = useRouter();
  const { user, hydrated } = useAuthStore();
  const [pgs, setPGs] = useState<PG[]>([]);

  useEffect(() => {
    if (!hydrated) return;
    if (!user) { router.replace("/"); return; }
    if (user.role !== "pg_admin") { router.replace("/"); return; }
    setPGs(getPGsForOwner(user.objectId));
  }, [user, hydrated]);

  if (!user || user.role !== "pg_admin") return null;

  function handleSave(pgId: string, edit: PGEdit) {
    const sharingPrices: PG["sharingPrices"] = {};
    const dailyPrices: PG["dailyPrices"] = {};

    (Object.entries(edit.rooms) as [Occupancy, RoomEdit][]).forEach(([occ, r]) => {
      sharingPrices[occ] = r.monthlyPrice;
      dailyPrices[occ] = r.dailyPrice;
    });

    updatePGPrices(pgId, sharingPrices, dailyPrices);
    updatePGAvailableBeds(pgId, edit.availableBeds);
    setPGs(getPGsForOwner(user!.objectId));
    toast.success("Room prices updated!");
  }

  return (
    <>
      <Head><title>Rooms — Roomsy Owner</title></Head>
      <div className="pg-layout">
        <Sidebar active="/pg-admin/rooms" />

        <main className="pg-main">
          <div className="dash-hero-bar">
            <div className="dash-hero-text">
              <button onClick={() => router.push("/pg-admin/dashboard")} aria-label="Back to dashboard" className="dash-hero-back">
                <HiArrowLeft size={16} />
              </button>
              <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(20px,3vw,26px)", fontWeight: "700", color: "#fff", letterSpacing: "-0.5px", marginBottom: "4px" }}>
                Rooms & Pricing
              </h1>
              <p style={{ fontFamily: "var(--font-body)", fontSize: "14px", color: "rgba(255,255,255,0.68)", margin: 0 }}>
                Set prices and bed availability
              </p>
            </div>
          </div>

          <div className="pg-content">

            {pgs.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                {pgs.map((pg) => (
                  <PGRoomCard key={pg.objectId} pg={pg} onSave={handleSave} />
                ))}
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: "60px 24px", backgroundColor: "#fff", borderRadius: "20px", border: "1px solid #E8E4DE" }}>
                <p style={{ fontFamily: "var(--font-body)", fontSize: "15px", color: "#78716C" }}>No PGs found.</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </>
  );
}
