import { useState, useEffect, useRef } from "react";
import Head from "next/head";
import Image from "next/image";
import { useRouter } from "next/router";
import { useAuthStore } from "@/store/useAuthStore";
import { createPG } from "@/lib/pgService";
import { uploadPGPhoto } from "@/lib/cloudinary";
import { PGType, FoodOption, Parking, Occupancy } from "@/types/pg";
import { Sidebar } from "../dashboard";
import { HiArrowLeft, HiTrash, HiUpload, HiPhotograph, HiLocationMarker } from "react-icons/hi";
import toast from "react-hot-toast";

const ALL_AMENITIES = [
  "WiFi", "AC", "Meals", "Laundry", "Gym", "CCTV",
  "24/7 Security", "Parking", "Housekeeping", "Study Room",
  "Lounge", "Rooftop", "TV Room", "RO Water", "Coworking", "Badminton",
];

type FormState = {
  name: string;
  description: string;
  city: string;
  area: string;
  address: string;
  pincode: string;
  pgType: PGType;
  occupancy: Set<Occupancy>;
  food: FoodOption;
  parking: Parking;
  latitude: string;
  longitude: string;
  availableBeds: string;
  singlePrice: string;
  doublePrice: string;
  triplePrice: string;
  singleDaily: string;
  doubleDaily: string;
  tripleDaily: string;
  amenities: Set<string>;
  photos: string[];
};

const INITIAL: FormState = {
  name: "", description: "", city: "Hyderabad", area: "", address: "", pincode: "",
  pgType: "boys", occupancy: new Set(["double"]), food: "none", parking: "none",
  latitude: "", longitude: "", availableBeds: "",
  singlePrice: "", doublePrice: "", triplePrice: "",
  singleDaily: "", doubleDaily: "", tripleDaily: "",
  amenities: new Set(), photos: [],
};

export default function NewPGPage() {
  const router = useRouter();
  const { user, hydrated } = useAuthStore();
  const [form, setForm] = useState<FormState>(INITIAL);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [locating, setLocating] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!hydrated) return;
    if (!user) { router.replace("/"); return; }
    if (user.role !== "pg_admin") { router.replace("/"); return; }
  }, [user, hydrated]);

  if (!user || user.role !== "pg_admin") return null;

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function toggleSet<T>(key: "occupancy" | "amenities", value: T) {
    setForm((f) => {
      const next = new Set(f[key] as Set<T>);
      next.has(value) ? next.delete(value) : next.add(value);
      return { ...f, [key]: next };
    });
  }

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;

    setUploading(true);
    try {
      const urls: string[] = [];
      for (const file of files) {
        if (!file.type.startsWith("image/")) {
          toast.error(`${file.name}: not an image`);
          continue;
        }
        if (file.size > 5 * 1024 * 1024) {
          toast.error(`${file.name}: must be under 5MB`);
          continue;
        }
        const url = await uploadPGPhoto(file);
        urls.push(url);
      }
      if (urls.length > 0) {
        setForm((f) => ({ ...f, photos: [...f.photos, ...urls] }));
        toast.success(`${urls.length} photo${urls.length > 1 ? "s" : ""} uploaded`);
      }
    } catch {
      toast.error("Upload failed. Please try again.");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  function removePhoto(url: string) {
    setForm((f) => ({ ...f, photos: f.photos.filter((p) => p !== url) }));
  }

  function useMyLocation() {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      toast.error("Your browser doesn't support geolocation.");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setForm((f) => ({
          ...f,
          latitude: pos.coords.latitude.toFixed(6),
          longitude: pos.coords.longitude.toFixed(6),
        }));
        setLocating(false);
        toast.success("Location captured.");
      },
      (err) => {
        setLocating(false);
        if (err.code === err.PERMISSION_DENIED) {
          toast.error("Location permission denied. Enter coordinates manually.");
        } else {
          toast.error("Couldn't get your location. Try again or enter manually.");
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;
    if (!user) return;

    if (!form.name.trim()) return toast.error("PG name is required");
    if (!form.area.trim()) return toast.error("Area is required");
    if (!form.address.trim()) return toast.error("Address is required");
    if (!/^\d{6}$/.test(form.pincode.trim())) return toast.error("Pincode must be a 6-digit number");
    if (form.occupancy.size === 0) return toast.error("Select at least one occupancy type");
    if (form.photos.length === 0) return toast.error("Upload at least one photo");

    const lat = Number(form.latitude);
    const lng = Number(form.longitude);
    if (!isFinite(lat) || lat < -90 || lat > 90) return toast.error("Latitude must be between -90 and 90");
    if (!isFinite(lng) || lng < -180 || lng > 180) return toast.error("Longitude must be between -180 and 180");

    const beds = parseInt(form.availableBeds, 10);
    if (!isFinite(beds) || beds < 0) return toast.error("Available beds must be 0 or more");

    const sharingPrices = {
      single: form.singlePrice ? Number(form.singlePrice) : undefined,
      double: form.doublePrice ? Number(form.doublePrice) : undefined,
      triple: form.triplePrice ? Number(form.triplePrice) : undefined,
    };
    const anyPrice = Object.values(sharingPrices).some((v) => typeof v === "number" && v > 0);
    if (!anyPrice) return toast.error("Set at least one sharing-room monthly price");

    const draft = {
      name: form.name.trim(),
      description: form.description.trim(),
      city: form.city.trim() || "Hyderabad",
      area: form.area.trim(),
      address: form.address.trim(),
      pincode: form.pincode.trim(),
      pgType: form.pgType,
      occupancy: Array.from(form.occupancy),
      food: form.food,
      parking: form.parking,
      location: { latitude: lat, longitude: lng },
      photos: form.photos,
      amenities: Array.from(form.amenities),
      availableBeds: beds,
      sharingPrices,
      dailyPrices: {
        single: form.singleDaily ? Number(form.singleDaily) : undefined,
        double: form.doubleDaily ? Number(form.doubleDaily) : undefined,
        triple: form.tripleDaily ? Number(form.tripleDaily) : undefined,
      },
    };

    setSubmitting(true);
    try {
      const newPG = await createPG(draft);
      toast.success("PG submitted! Awaiting admin approval.");
      router.push(`/pg-admin/my-pgs/${newPG.objectId}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not save PG. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <>
      <Head><title>Add PG — Roomsy Owner</title></Head>
      <div className="pg-layout">
        <Sidebar active="/pg-admin/my-pgs" />

        <main className="pg-main">
          <div className="dash-hero-bar">
            <div className="dash-hero-text">
              <button onClick={() => router.push("/pg-admin/my-pgs")} aria-label="Back" className="dash-hero-back">
                <HiArrowLeft size={16} />
              </button>
              <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(20px,3vw,26px)", fontWeight: "700", color: "#fff", letterSpacing: "-0.5px", marginBottom: "4px" }}>
                Add a new PG
              </h1>
              <p style={{ fontFamily: "var(--font-body)", fontSize: "14px", color: "rgba(255,255,255,0.68)", margin: 0 }}>
                Submit details for admin approval
              </p>
            </div>
          </div>

          <div className="pg-content">
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

              {/* Basics */}
              <Section title="Basic information">
                <Field label="PG name" required>
                  <input className="o-input" value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Sunrise Boys PG" />
                </Field>
                <Field label="Description">
                  <textarea className="o-input" rows={3} value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="A brief about your PG" />
                </Field>
                <Row>
                  <Field label="City" required>
                    <input className="o-input" value={form.city} onChange={(e) => set("city", e.target.value)} />
                  </Field>
                  <Field label="Area / Locality" required>
                    <input className="o-input" value={form.area} onChange={(e) => set("area", e.target.value)} placeholder="Madhapur" />
                  </Field>
                  <Field label="Pincode" required>
                    <input
                      className="o-input"
                      inputMode="numeric"
                      maxLength={6}
                      value={form.pincode}
                      onChange={(e) => set("pincode", e.target.value.replace(/\D/g, "").slice(0, 6))}
                      placeholder="500081"
                    />
                  </Field>
                </Row>
                <Field label="Full address" required>
                  <input className="o-input" value={form.address} onChange={(e) => set("address", e.target.value)} placeholder="Plot 12, Road 5, …" />
                </Field>
              </Section>

              {/* Type & rules */}
              <Section title="Type & policies">
                <Row>
                  <Field label="PG type">
                    <select className="o-input" value={form.pgType} onChange={(e) => set("pgType", e.target.value as PGType)}>
                      <option value="boys">Boys</option>
                      <option value="girls">Girls</option>
                      <option value="coliving">Co-living</option>
                    </select>
                  </Field>
                  <Field label="Food">
                    <select className="o-input" value={form.food} onChange={(e) => set("food", e.target.value as FoodOption)}>
                      <option value="none">None</option>
                      <option value="breakfast">Breakfast only</option>
                      <option value="lunch">Lunch only</option>
                      <option value="dinner">Dinner only</option>
                      <option value="all">All meals</option>
                    </select>
                  </Field>
                  <Field label="Parking">
                    <select className="o-input" value={form.parking} onChange={(e) => set("parking", e.target.value as Parking)}>
                      <option value="none">None</option>
                      <option value="bike">Bike</option>
                      <option value="car">Car</option>
                      <option value="both">Bike & Car</option>
                    </select>
                  </Field>
                </Row>
                <Field label="Occupancy types offered" required>
                  <ChipRow>
                    {(["single", "double", "triple"] as Occupancy[]).map((o) => (
                      <Chip key={o} active={form.occupancy.has(o)} onClick={() => toggleSet<Occupancy>("occupancy", o)}>
                        {o.charAt(0).toUpperCase() + o.slice(1)}
                      </Chip>
                    ))}
                  </ChipRow>
                </Field>
              </Section>

              {/* Location */}
              <Section title="Location coordinates" hint="Use the button to capture your current position, or paste lat/long from Google Maps (right-click on the map → first row).">
                <button
                  type="button"
                  onClick={useMyLocation}
                  disabled={locating}
                  style={{
                    display: "inline-flex", alignItems: "center", gap: "6px",
                    padding: "10px 16px", borderRadius: "100px",
                    border: "1px solid #FF385C",
                    backgroundColor: locating ? "#FFE5EC" : "#FFF0F3",
                    color: "#FF385C",
                    fontFamily: "var(--font-body)", fontSize: "13px", fontWeight: "600",
                    cursor: locating ? "default" : "pointer",
                    alignSelf: "flex-start",
                  }}
                >
                  <HiLocationMarker size={14} /> {locating ? "Locating…" : "Use my current location"}
                </button>
                <Row>
                  <Field label="Latitude" required>
                    <input className="o-input" type="number" step="any" value={form.latitude} onChange={(e) => set("latitude", e.target.value)} placeholder="17.4448" />
                  </Field>
                  <Field label="Longitude" required>
                    <input className="o-input" type="number" step="any" value={form.longitude} onChange={(e) => set("longitude", e.target.value)} placeholder="78.3498" />
                  </Field>
                </Row>
              </Section>

              {/* Pricing */}
              <Section title="Pricing" hint="Fill prices only for the room types you offer.">
                <Row>
                  <Field label="Single — monthly (₹)">
                    <input className="o-input" type="number" min="0" value={form.singlePrice} onChange={(e) => set("singlePrice", e.target.value)} />
                  </Field>
                  <Field label="Double — monthly (₹)">
                    <input className="o-input" type="number" min="0" value={form.doublePrice} onChange={(e) => set("doublePrice", e.target.value)} />
                  </Field>
                  <Field label="Triple — monthly (₹)">
                    <input className="o-input" type="number" min="0" value={form.triplePrice} onChange={(e) => set("triplePrice", e.target.value)} />
                  </Field>
                </Row>
                <Row>
                  <Field label="Single — daily (₹)">
                    <input className="o-input" type="number" min="0" value={form.singleDaily} onChange={(e) => set("singleDaily", e.target.value)} />
                  </Field>
                  <Field label="Double — daily (₹)">
                    <input className="o-input" type="number" min="0" value={form.doubleDaily} onChange={(e) => set("doubleDaily", e.target.value)} />
                  </Field>
                  <Field label="Triple — daily (₹)">
                    <input className="o-input" type="number" min="0" value={form.tripleDaily} onChange={(e) => set("tripleDaily", e.target.value)} />
                  </Field>
                </Row>
                <Field label="Available beds" required>
                  <input className="o-input" type="number" min="0" value={form.availableBeds} onChange={(e) => set("availableBeds", e.target.value)} style={{ maxWidth: "200px" }} />
                </Field>
              </Section>

              {/* Amenities */}
              <Section title="Amenities">
                <ChipRow>
                  {ALL_AMENITIES.map((a) => (
                    <Chip key={a} active={form.amenities.has(a)} onClick={() => toggleSet<string>("amenities", a)}>{a}</Chip>
                  ))}
                </ChipRow>
              </Section>

              {/* Photos */}
              <Section title="Photos" hint="The first photo becomes the cover.">
                {form.photos.length > 0 && (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: "10px", marginBottom: "12px" }}>
                    {form.photos.map((url, idx) => (
                      <div key={url} style={{ position: "relative", borderRadius: "10px", overflow: "hidden", aspectRatio: "4/3", backgroundColor: "#F0EDE8" }}>
                        <Image src={url} alt={`Photo ${idx + 1}`} fill style={{ objectFit: "cover" }} />
                        {idx === 0 && (
                          <div style={{ position: "absolute", top: "6px", left: "6px", fontFamily: "var(--font-body)", fontSize: "10px", fontWeight: "700", color: "#fff", backgroundColor: "rgba(0,0,0,0.6)", borderRadius: "6px", padding: "2px 7px" }}>Cover</div>
                        )}
                        <button type="button" onClick={() => removePhoto(url)} style={{ position: "absolute", top: "6px", right: "6px", width: "28px", height: "28px", borderRadius: "50%", backgroundColor: "rgba(220,38,38,0.92)", color: "#fff", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <HiTrash size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                  style={{ display: "flex", alignItems: "center", gap: "6px", padding: "10px 16px", borderRadius: "100px", border: "1px solid #E8E4DE", backgroundColor: uploading ? "#F0EDE8" : "#fff", color: "#1C1917", fontFamily: "var(--font-body)", fontSize: "13px", fontWeight: "600", cursor: uploading ? "default" : "pointer" }}
                >
                  {uploading ? "Uploading…" : (<><HiUpload size={14} /> Add photos</>)}
                </button>
                <input ref={fileRef} type="file" accept="image/*" multiple style={{ display: "none" }} onChange={handlePhotoUpload} />
                {form.photos.length === 0 && (
                  <p style={{ fontFamily: "var(--font-body)", fontSize: "12px", color: "#A8A29E", marginTop: "8px", display: "flex", alignItems: "center", gap: "6px" }}>
                    <HiPhotograph size={14} /> At least one photo is required.
                  </p>
                )}
              </Section>

              {/* Submit */}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", paddingTop: "8px" }}>
                <button type="button" onClick={() => router.push("/pg-admin/my-pgs")} style={{ padding: "12px 24px", borderRadius: "100px", border: "1px solid #E8E4DE", backgroundColor: "#fff", color: "#1C1917", fontFamily: "var(--font-body)", fontSize: "14px", fontWeight: "600", cursor: "pointer" }}>Cancel</button>
                <button type="submit" disabled={submitting} style={{ padding: "12px 28px", borderRadius: "100px", border: "none", backgroundColor: submitting ? "#FCA5A5" : "#FF385C", color: "#fff", fontFamily: "var(--font-body)", fontSize: "14px", fontWeight: "600", cursor: submitting ? "default" : "pointer" }}>
                  {submitting ? "Submitting…" : "Submit for Approval"}
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>

      <style jsx global>{`
        .o-input {
          width: 100%;
          padding: 10px 14px;
          border: 1px solid #E8E4DE;
          border-radius: 10px;
          font-family: var(--font-body);
          font-size: 14px;
          color: #1C1917;
          background: #fff;
          transition: border-color 0.15s;
        }
        .o-input:focus {
          outline: none;
          border-color: #FF385C;
        }
      `}</style>
    </>
  );
}

function Section({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <section style={{ backgroundColor: "#fff", border: "1px solid #E8E4DE", borderRadius: "16px", padding: "20px 22px" }}>
      <h2 style={{ fontFamily: "var(--font-display)", fontSize: "16px", fontWeight: "600", color: "#1C1917", marginBottom: hint ? "4px" : "14px" }}>{title}</h2>
      {hint && <p style={{ fontFamily: "var(--font-body)", fontSize: "12px", color: "#78716C", marginBottom: "14px" }}>{hint}</p>}
      <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>{children}</div>
    </section>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ display: "block", fontFamily: "var(--font-body)", fontSize: "13px", fontWeight: "500", color: "#44403C", marginBottom: "6px" }}>
        {label}{required && <span style={{ color: "#FF385C", marginLeft: "3px" }}>*</span>}
      </label>
      {children}
    </div>
  );
}

function Row({ children }: { children: React.ReactNode }) {
  return <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px" }}>{children}</div>;
}

function ChipRow({ children }: { children: React.ReactNode }) {
  return <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>{children}</div>;
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: "7px 14px",
        borderRadius: "100px",
        border: `1px solid ${active ? "#FF385C" : "#E8E4DE"}`,
        backgroundColor: active ? "#FFF0F3" : "#fff",
        color: active ? "#FF385C" : "#1C1917",
        fontFamily: "var(--font-body)",
        fontSize: "13px",
        fontWeight: active ? "600" : "500",
        cursor: "pointer",
        transition: "all 0.15s",
      }}
    >
      {children}
    </button>
  );
}
