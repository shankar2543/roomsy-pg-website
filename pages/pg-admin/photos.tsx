import { useState, useEffect, useRef } from "react";
import Head from "next/head";
import Image from "next/image";
import { useRouter } from "next/router";
import { useAuthStore } from "@/store/useAuthStore";
import { getPGsForOwner, updatePGPhotos } from "@/lib/pgService";
import { uploadPGPhoto } from "@/lib/cloudinary";
import { PG } from "@/types/pg";
import { Sidebar } from "./dashboard";
import { HiPlus, HiTrash, HiPhotograph, HiUpload, HiArrowLeft } from "react-icons/hi";
import toast from "react-hot-toast";

function PhotoGrid({ pg, onRefresh }: { pg: PG; onRefresh: () => void }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5MB.");
      return;
    }

    setUploading(true);
    try {
      const url = await uploadPGPhoto(file);
      await updatePGPhotos(pg.objectId, [...pg.photos, url]);
      onRefresh();
      toast.success("Photo uploaded!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed. Please try again.");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function handleDelete(photoUrl: string) {
    if (pg.photos.length <= 1) {
      toast.error("You need at least one photo.");
      return;
    }
    setDeleting(photoUrl);
    try {
      await updatePGPhotos(pg.objectId, pg.photos.filter((p) => p !== photoUrl));
      onRefresh();
      toast.success("Photo removed.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not remove photo");
    } finally {
      setDeleting(null);
    }
  }

  return (
    <div style={{ backgroundColor: "#fff", border: "1px solid #E8E4DE", borderRadius: "16px", overflow: "hidden", marginBottom: "24px" }}>
      <div className="o-card-header" style={{ padding: "16px 20px", borderBottom: "1px solid #F0EDE8" }}>
        <div className="o-card-header-left">
          <h3 style={{ fontFamily: "var(--font-display)", fontSize: "16px", fontWeight: "600", color: "#1C1917", marginBottom: "2px" }}>{pg.name}</h3>
          <p style={{ fontFamily: "var(--font-body)", fontSize: "12px", color: "#78716C" }}>{pg.photos.length} photo{pg.photos.length !== 1 ? "s" : ""}</p>
        </div>
        <button
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          style={{
            display: "flex", alignItems: "center", gap: "6px",
            fontFamily: "var(--font-body)", fontSize: "13px", fontWeight: "600",
            color: uploading ? "#A8A29E" : "#fff",
            padding: "8px 16px", borderRadius: "100px",
            backgroundColor: uploading ? "#E8E4DE" : "#FF385C",
            border: "none", cursor: uploading ? "default" : "pointer",
            transition: "background 0.15s",
          }}
        >
          {uploading ? (
            <>
              <span style={{ display: "inline-block", width: "12px", height: "12px", border: "2px solid #A8A29E", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.6s linear infinite" }} />
              Uploading…
            </>
          ) : (
            <><HiUpload size={14} /> Add Photo</>
          )}
        </button>
        <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleFileChange} />
      </div>

      <div style={{ padding: "20px" }}>
        {pg.photos.length > 0 ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: "12px" }}>
            {pg.photos.map((url, idx) => (
              <div key={url} style={{ position: "relative", borderRadius: "10px", overflow: "hidden", aspectRatio: "4/3", backgroundColor: "#F0EDE8" }}
                onMouseEnter={(e) => e.currentTarget.querySelector<HTMLDivElement>(".del-btn")!.style.opacity = "1"}
                onMouseLeave={(e) => e.currentTarget.querySelector<HTMLDivElement>(".del-btn")!.style.opacity = "0"}
              >
                <Image src={url} alt={`Photo ${idx + 1}`} fill style={{ objectFit: "cover" }} />
                {idx === 0 && (
                  <div style={{ position: "absolute", top: "6px", left: "6px", fontFamily: "var(--font-body)", fontSize: "10px", fontWeight: "700", color: "#fff", backgroundColor: "rgba(0,0,0,0.6)", borderRadius: "6px", padding: "2px 7px", letterSpacing: "0.3px" }}>
                    Cover
                  </div>
                )}
                <div className="del-btn" style={{ position: "absolute", inset: 0, backgroundColor: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", opacity: 0, transition: "opacity 0.2s" }}>
                  <button
                    onClick={() => handleDelete(url)}
                    style={{ width: "36px", height: "36px", borderRadius: "50%", backgroundColor: "#DC2626", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}
                  >
                    <HiTrash size={16} />
                  </button>
                </div>
              </div>
            ))}

            {/* Add new tile */}
            <button
              onClick={() => fileRef.current?.click()}
              style={{ aspectRatio: "4/3", borderRadius: "10px", border: "2px dashed #E8E4DE", backgroundColor: "#FAFAF9", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "8px", cursor: "pointer", transition: "border-color 0.15s, background 0.15s" }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#FF385C"; e.currentTarget.style.backgroundColor = "#FFF0F3"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#E8E4DE"; e.currentTarget.style.backgroundColor = "#FAFAF9"; }}
            >
              <HiPlus size={20} color="#A8A29E" />
              <span style={{ fontFamily: "var(--font-body)", fontSize: "12px", color: "#A8A29E" }}>Add</span>
            </button>
          </div>
        ) : (
          <div
            onClick={() => fileRef.current?.click()}
            style={{ padding: "48px 24px", border: "2px dashed #E8E4DE", borderRadius: "14px", display: "flex", flexDirection: "column", alignItems: "center", gap: "12px", cursor: "pointer", transition: "all 0.15s" }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#FF385C"; e.currentTarget.style.backgroundColor = "#FFF0F3"; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#E8E4DE"; e.currentTarget.style.backgroundColor = "transparent"; }}
          >
            <HiPhotograph size={36} color="#D6D3CE" />
            <p style={{ fontFamily: "var(--font-body)", fontSize: "14px", color: "#78716C" }}>Click to upload your first photo</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function PGAdminPhotos() {
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

  function refresh() {
    getPGsForOwner(user!.objectId).then((rows) => setPGs(rows)).catch(() => {});
  }

  return (
    <>
      <Head><title>Photos — Roomsy Owner</title></Head>
      <div className="pg-layout">
        <Sidebar active="/pg-admin/photos" />

        <main className="pg-main">
          <div className="dash-hero-bar">
            <div className="dash-hero-text">
              <button onClick={() => router.push("/pg-admin/dashboard")} aria-label="Back to dashboard" className="dash-hero-back">
                <HiArrowLeft size={16} />
              </button>
              <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(20px,3vw,26px)", fontWeight: "700", color: "#fff", letterSpacing: "-0.5px", marginBottom: "4px" }}>
                Photos
              </h1>
              <p style={{ fontFamily: "var(--font-body)", fontSize: "14px", color: "rgba(255,255,255,0.68)", margin: 0 }}>
                First photo is the cover image
              </p>
            </div>
          </div>

          <div className="pg-content">

            {pgs.length > 0 ? (
              pgs.map((pg) => <PhotoGrid key={pg.objectId} pg={pg} onRefresh={refresh} />)
            ) : (
              <div style={{ textAlign: "center", padding: "60px 24px", backgroundColor: "#fff", borderRadius: "20px", border: "1px solid #E8E4DE" }}>
                <p style={{ fontFamily: "var(--font-body)", fontSize: "15px", color: "#78716C" }}>No PGs found.</p>
              </div>
            )}
          </div>
        </main>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </>
  );
}
