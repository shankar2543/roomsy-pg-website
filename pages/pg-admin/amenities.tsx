import { useState, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { useAuthStore } from "@/store/useAuthStore";
import { getPGsForOwner, updatePGAmenities } from "@/lib/pgService";
import { PG } from "@/types/pg";
import { Sidebar } from "./dashboard";
import {
  HiWifi, HiShieldCheck, HiCheck, HiArrowLeft,
} from "react-icons/hi";
import {
  MdOutlineFoodBank, MdLocalLaundryService, MdFitnessCenter,
  MdAcUnit, MdLocalParking, MdMeetingRoom, MdPeople, MdWaterDrop,
  MdTv, MdSportsTennis,
} from "react-icons/md";
import { BsBuilding } from "react-icons/bs";
import toast from "react-hot-toast";

const ALL_AMENITIES: { label: string; icon: React.ReactNode }[] = [
  { label: "WiFi",          icon: <HiWifi size={18} /> },
  { label: "AC",            icon: <MdAcUnit size={18} /> },
  { label: "Meals",         icon: <MdOutlineFoodBank size={18} /> },
  { label: "Laundry",       icon: <MdLocalLaundryService size={18} /> },
  { label: "Gym",           icon: <MdFitnessCenter size={18} /> },
  { label: "CCTV",          icon: <HiShieldCheck size={18} /> },
  { label: "24/7 Security", icon: <HiShieldCheck size={18} /> },
  { label: "Parking",       icon: <MdLocalParking size={18} /> },
  { label: "Housekeeping",  icon: <MdPeople size={18} /> },
  { label: "Study Room",    icon: <MdMeetingRoom size={18} /> },
  { label: "Lounge",        icon: <MdMeetingRoom size={18} /> },
  { label: "Rooftop",       icon: <BsBuilding size={18} /> },
  { label: "TV Room",       icon: <MdTv size={18} /> },
  { label: "RO Water",      icon: <MdWaterDrop size={18} /> },
  { label: "Coworking",     icon: <BsBuilding size={18} /> },
  { label: "Badminton",     icon: <MdSportsTennis size={18} /> },
];

function PGAmenitiesCard({ pg, onSave }: { pg: PG; onSave: (pgId: string, amenities: string[]) => void }) {
  const [selected, setSelected] = useState<Set<string>>(new Set(pg.amenities));
  const [dirty, setDirty] = useState(false);

  const allSelected = selected.size === ALL_AMENITIES.length;

  function toggle(label: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(label) ? next.delete(label) : next.add(label);
      return next;
    });
    setDirty(true);
  }

  function toggleAll() {
    setSelected(allSelected ? new Set() : new Set(ALL_AMENITIES.map((a) => a.label)));
    setDirty(true);
  }

  function handleSave() {
    onSave(pg.objectId, Array.from(selected));
    setDirty(false);
  }

  function handleReset() {
    setSelected(new Set(pg.amenities));
    setDirty(false);
  }

  return (
    <div style={{ backgroundColor: "#fff", border: "1px solid #E8E4DE", borderRadius: "16px", overflow: "hidden", marginBottom: "24px" }}>
      <div className="o-card-header" style={{ padding: "16px 20px", borderBottom: "1px solid #F0EDE8" }}>
        <div className="o-card-header-left">
          <h3 style={{ fontFamily: "var(--font-display)", fontSize: "16px", fontWeight: "600", color: "#1C1917", marginBottom: "2px" }}>{pg.name}</h3>
          <p style={{ fontFamily: "var(--font-body)", fontSize: "12px", color: "#78716C" }}>
            {selected.size} amenit{selected.size !== 1 ? "ies" : "y"} selected
          </p>
        </div>
        <div className="o-card-header-right">
          <button
            onClick={toggleAll}
            style={{ fontFamily: "var(--font-body)", fontSize: "13px", fontWeight: "500", color: "#FF385C", padding: "7px 14px", borderRadius: "100px", border: "1.5px solid #FF385C", backgroundColor: "#fff", cursor: "pointer" }}
          >
            {allSelected ? "Deselect All" : "Select All"}
          </button>
          {dirty && (
            <>
              <button
                onClick={handleReset}
                style={{ fontFamily: "var(--font-body)", fontSize: "13px", fontWeight: "500", color: "#44403C", padding: "7px 14px", borderRadius: "100px", border: "1.5px solid #E8E4DE", backgroundColor: "#fff", cursor: "pointer" }}
              >
                Reset
              </button>
              <button
                onClick={handleSave}
                style={{ fontFamily: "var(--font-body)", fontSize: "13px", fontWeight: "700", color: "#fff", padding: "7px 16px", borderRadius: "100px", border: "none", backgroundColor: "#FF385C", cursor: "pointer" }}
              >
                Save Changes
              </button>
            </>
          )}
        </div>
      </div>

      <div style={{ padding: "20px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: "10px" }}>
          {ALL_AMENITIES.map(({ label, icon }) => {
            const active = selected.has(label);
            return (
              <button
                key={label}
                onClick={() => toggle(label)}
                style={{
                  display: "flex", alignItems: "center", gap: "10px",
                  padding: "10px 14px", borderRadius: "10px", cursor: "pointer",
                  border: active ? "1.5px solid #FF385C" : "1.5px solid #E8E4DE",
                  backgroundColor: active ? "#FFF0F3" : "#FAFAF9",
                  transition: "all 0.15s", textAlign: "left",
                }}
              >
                <span style={{ color: active ? "#FF385C" : "#78716C", flexShrink: 0 }}>{icon}</span>
                <span style={{ fontFamily: "var(--font-body)", fontSize: "13px", fontWeight: active ? "600" : "500", color: active ? "#FF385C" : "#44403C", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {label}
                </span>
                {active && (
                  <span style={{ flexShrink: 0 }}>
                    <HiCheck size={14} color="#FF385C" />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function PGAdminAmenities() {
  const router = useRouter();
  const { user, hydrated } = useAuthStore();
  const [pgs, setPGs] = useState<PG[]>([]);

  useEffect(() => {
    if (!hydrated) return;
    if (!user) { router.replace("/"); return; }
    if (user.role !== "pg_admin") { router.replace("/"); return; }
    let cancelled = false;
    getPGsForOwner(user.objectId).then((rows) => { if (!cancelled) setPGs(rows); }).catch(() => {});
    return () => { cancelled = true; };
  }, [user, hydrated]);

  if (!user || user.role !== "pg_admin") return null;

  async function handleSave(pgId: string, amenities: string[]) {
    try {
      await updatePGAmenities(pgId, amenities);
      const rows = await getPGsForOwner(user!.objectId);
      setPGs(rows);
      toast.success("Amenities saved!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save");
    }
  }

  return (
    <>
      <Head><title>Amenities — Roomsy Owner</title></Head>
      <div className="pg-layout">
        <Sidebar active="/pg-admin/amenities" />

        <main className="pg-main">
          <div className="dash-hero-bar">
            <div className="dash-hero-text">
              <button onClick={() => router.push("/pg-admin/dashboard")} aria-label="Back to dashboard" className="dash-hero-back">
                <HiArrowLeft size={16} />
              </button>
              <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(20px,3vw,26px)", fontWeight: "700", color: "#fff", letterSpacing: "-0.5px", marginBottom: "4px" }}>
                Amenities
              </h1>
              <p style={{ fontFamily: "var(--font-body)", fontSize: "14px", color: "rgba(255,255,255,0.68)", margin: 0 }}>
                Pick amenities shown on each listing
              </p>
            </div>
          </div>

          <div className="pg-content">

            {pgs.length > 0 ? (
              pgs.map((pg) => (
                <PGAmenitiesCard key={pg.objectId} pg={pg} onSave={handleSave} />
              ))
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
