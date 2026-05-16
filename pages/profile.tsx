import { useEffect, useState, useRef } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import { useAuthStore } from "@/store/useAuthStore";
import { updateCurrentUser } from "@/lib/authService";
import { AdminSidebar, LogoutModal } from "@/pages/admin/dashboard";
import { Sidebar as PgAdminSidebar } from "@/pages/pg-admin/dashboard";
import {
  HiOutlineMail, HiOutlinePhone, HiOutlineLocationMarker,
  HiOutlineBadgeCheck, HiOutlineCamera, HiOutlinePencil,
  HiOutlineShieldCheck, HiOutlineCheckCircle, HiOutlineX,
  HiOutlineUpload, HiOutlineCalendar, HiOutlineHome,
} from "react-icons/hi";
import toast from "react-hot-toast";
import CustomerSidebar from "@/components/common/CustomerSidebar";

const ID_LABELS: Record<string, string> = {
  aadhaar: "Aadhaar Card",
  pan: "PAN Card",
  driving_license: "Driving License",
};

function getInitials(name?: string) {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function ProfilePage() {
  const router = useRouter();
  const { user, setUser, logout, hydrated } = useAuthStore();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", city: "", bio: "" });
  const [saving, setSaving] = useState(false);
  const [confirmLogout, setConfirmLogout] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const idProofInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!hydrated) return;
    if (!user) {
      router.replace("/");
      return;
    }
    setForm({
      name: user.name || "",
      phone: user.phone || "",
      city: user.city || "",
      bio: user.bio || "",
    });
  }, [user, hydrated]);

  if (!user) return null;

  const verified = !!user.idProofUrl;
  const isPlatformAdmin = user.role === "platform_admin";
  const isCustomer = user.role === "customer";
  const isPgAdmin = user.role === "pg_admin";
  const completionItems = [
    { label: "Name", done: !!user.name },
    { label: "Email", done: !!user.email },
    { label: "Phone", done: !!user.phone },
    { label: "Photo", done: !!user.profilePic },
    ...(isPlatformAdmin ? [] : [{ label: "ID proof", done: verified }]),
  ];
  const completion = Math.round(
    (completionItems.filter((i) => i.done).length / completionItems.length) * 100
  );

  async function handleSave() {
    if (!user) return;
    setSaving(true);
    try {
      const updated = await updateCurrentUser({
        name: form.name.trim(),
        phone: form.phone.trim(),
        city: form.city.trim() || undefined,
        bio: form.bio.trim() || undefined,
      });
      setUser(updated);
      toast.success("Profile updated");
      setEditing(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not save");
    } finally {
      setSaving(false);
    }
  }

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const updated = await updateCurrentUser({ profilePic: reader.result as string });
        setUser(updated);
        toast.success("Photo updated");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Could not update photo");
      }
    };
    reader.readAsDataURL(file);
  }

  function handleIdProofChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const updated = await updateCurrentUser({
          idProofUrl: reader.result as string,
          idProofType: user.idProofType || "aadhaar",
        });
        setUser(updated);
        toast.success("ID proof uploaded · Verification pending");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Could not upload ID proof");
      }
    };
    reader.readAsDataURL(file);
  }

  const firstName = (user.name || "").trim().split(/\s+/)[0] || "";

  const roleEyebrow = isPlatformAdmin
    ? "Administrator — Profile · 01"
    : isPgAdmin
    ? "Owner — Profile · 01"
    : "Member — Profile · 01";
  const roleAccountValue = isPlatformAdmin
    ? "Platform administrator"
    : isPgAdmin
    ? "Property owner"
    : "Member";
  const roleSubStatus = isPlatformAdmin
    ? "Administrator"
    : isPgAdmin
    ? (verified ? "Verified host" : "Identity pending")
    : (verified ? "Verified" : "Identity pending");
  const completionDoneNote = isPlatformAdmin
    ? "Everything in order."
    : isPgAdmin
    ? "Everything in order. Tenants will recognise you at a glance."
    : "Everything in order. You'll get the smoothest booking flow.";
  const completionPendingNote = isPlatformAdmin
    ? "Complete the remaining details for a tidy profile."
    : isPgAdmin
    ? "Complete the remaining details — verified profiles attract faster bookings."
    : "Complete the remaining details to unlock faster bookings.";
  const bioPlaceholder = isPgAdmin
    ? "A short note about yourself — for your tenants."
    : "A short note about yourself — work, study, lifestyle.";

  const ownerProfileBody = (
    <>
      {/* Editorial hero — full-bleed dark band */}
      <header className="own-hero">
        <div className="own-hero-inner">
          <p className="own-eyebrow">
            <span className="own-eyebrow-line" />
            {roleEyebrow}
          </p>
          <h1 className="own-title">
            {firstName ? (
              <>Welcome back, <em>{firstName}</em>.</>
            ) : (
              <>A note about <em>you</em>.</>
            )}
          </h1>
          <p className="own-sub">
            {roleSubStatus}
            <span className="own-sub-sep">·</span>
            Member since 2025
            <span className="own-sub-sep">·</span>
            {user.email}
          </p>
          {!editing && (
            <button className="own-edit-btn" onClick={() => setEditing(true)}>
              <HiOutlinePencil size={12} />
              <span>Edit profile</span>
            </button>
          )}
        </div>
      </header>

      <div className="own-profile">
      <div className="own-grid">
        {/* LEFT column: portrait + contact / form */}
        <section className="own-col own-col-left">
          <div className="own-portrait">
            <div className="own-avatar">
              {user.profilePic ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={user.profilePic} alt={user.name || user.email} />
              ) : (
                <span>{getInitials(user.name || user.email)}</span>
              )}
            </div>
            <button
              className="own-link-btn"
              onClick={() => fileInputRef.current?.click()}
            >
              {user.profilePic ? "Change photograph" : "Add a photograph"}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              hidden
              onChange={handlePhotoChange}
            />
          </div>

          {!editing && (
            <div className="own-section">
              <p className="own-section-label">
                <span className="own-eyebrow-line short" />
                02 — Contact details
              </p>
              <ul className="own-info">
                <li>
                  <span className="own-info-num">i.</span>
                  <div>
                    <p className="own-info-key">Email</p>
                    <p className="own-info-val">{user.email}</p>
                  </div>
                </li>
                <li>
                  <span className="own-info-num">ii.</span>
                  <div>
                    <p className="own-info-key">Phone</p>
                    <p className="own-info-val">{user.phone ? `+91 ${user.phone}` : "—"}</p>
                  </div>
                </li>
                <li>
                  <span className="own-info-num">iii.</span>
                  <div>
                    <p className="own-info-key">City</p>
                    <p className="own-info-val">{user.city || "—"}</p>
                  </div>
                </li>
                <li>
                  <span className="own-info-num">iv.</span>
                  <div>
                    <p className="own-info-key">Account</p>
                    <p className="own-info-val">{roleAccountValue}</p>
                  </div>
                </li>
              </ul>
              {user.bio && (
                <p className="own-bio">
                  <span className="own-bio-mark" aria-hidden>“</span>
                  {user.bio}
                </p>
              )}
            </div>
          )}

          {editing && (
            <div className="own-section">
              <p className="own-section-label">
                <span className="own-eyebrow-line short" />
                02 — Editing details
              </p>
              <div className="own-form">
                <label className="own-field">
                  <span>Full name</span>
                  <input
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  />
                </label>
                <label className="own-field">
                  <span>Phone</span>
                  <input
                    inputMode="numeric"
                    value={form.phone}
                    onChange={(e) => {
                      const v = e.target.value.replace(/\D/g, "").slice(0, 10);
                      setForm((f) => ({ ...f, phone: v }));
                    }}
                    placeholder="10-digit number"
                  />
                </label>
                <label className="own-field">
                  <span>City</span>
                  <input
                    value={form.city}
                    onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
                    placeholder="e.g. Hyderabad"
                  />
                </label>
                <label className="own-field own-field-full">
                  <span>About you</span>
                  <textarea
                    rows={3}
                    value={form.bio}
                    onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
                    placeholder={bioPlaceholder}
                  />
                </label>
              </div>
              <div className="own-form-actions">
                <button
                  className="own-btn own-btn-ghost"
                  onClick={() => setEditing(false)}
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  className="own-btn own-btn-primary"
                  onClick={handleSave}
                  disabled={saving || !form.name.trim() || form.phone.length !== 10}
                >
                  {saving ? "Saving…" : "Save changes"}
                </button>
              </div>
            </div>
          )}
        </section>

        {/* RIGHT column: completion + ID */}
        <section className="own-col own-col-right">
          <div className="own-section">
            <p className="own-section-label">
              <span className="own-eyebrow-line short" />
              03 — Profile completion
            </p>
            <div className="own-completion-row">
              <span className="own-completion-num">
                {completion}<small>%</small>
              </span>
              <p className="own-completion-note">
                {completion === 100 ? completionDoneNote : completionPendingNote}
              </p>
            </div>
            <div className="own-rule" />
            <ul className="own-checks">
              {completionItems.map((it) => (
                <li key={it.label} className={it.done ? "is-done" : ""}>
                  <span className="own-check-mark">
                    {it.done ? <HiOutlineCheckCircle size={14} /> : <span className="own-dot" />}
                  </span>
                  {it.label}
                </li>
              ))}
            </ul>
          </div>

          {!isPlatformAdmin && (
          <div className="own-section">
            <div className="own-id-head">
              <p className="own-section-label">
                <span className="own-eyebrow-line short" />
                04 — Identity
              </p>
              <span className={`own-pill ${verified ? "verified" : "pending"}`}>
                {verified ? <><HiOutlineShieldCheck size={12} /> Verified</> : "Pending"}
              </span>
            </div>
            {verified ? (
              <div className="own-id-uploaded">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={user.idProofUrl} alt="ID" />
                <div>
                  <p className="own-info-key">{ID_LABELS[user.idProofType || "aadhaar"]}</p>
                  <p className="own-info-val">Document on file</p>
                  <button
                    className="own-link-btn"
                    onClick={() => idProofInputRef.current?.click()}
                  >
                    Replace document
                  </button>
                </div>
              </div>
            ) : (
              <button
                className="own-id-upload"
                onClick={() => idProofInputRef.current?.click()}
              >
                <span className="own-id-upload-icon"><HiOutlineUpload size={18} /></span>
                <div>
                  <p className="own-id-upload-title">Upload your ID proof</p>
                  <p className="own-id-upload-sub">
                    Aadhaar · PAN · Driving Licence
                  </p>
                </div>
                <span className="own-id-upload-arrow">→</span>
              </button>
            )}
            <input
              ref={idProofInputRef}
              type="file"
              accept="image/*,application/pdf"
              hidden
              onChange={handleIdProofChange}
            />
          </div>
          )}
        </section>
      </div>
      </div>
    </>
  );

  const profileBody = (
    <>
      {/* Decorative gradient header */}
        <div className="profile-hero">
          <div className="profile-hero-blob blob-1" />
          <div className="profile-hero-blob blob-2" />
          <div className="profile-hero-blob blob-3" />
        </div>

        <div className="profile-shell">
          {/* Avatar + identity */}
          <section className="profile-card profile-identity">
            <div className="profile-avatar-wrap">
              <div className="profile-avatar">
                {user.profilePic ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={user.profilePic} alt={user.name} />
                ) : (
                  <span>{getInitials(user.name || user.email)}</span>
                )}
              </div>
              <button
                className="profile-avatar-edit"
                onClick={() => fileInputRef.current?.click()}
                aria-label="Change photo"
              >
                <HiOutlineCamera size={16} />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                hidden
                onChange={handlePhotoChange}
              />
            </div>

            <div className="profile-identity-text">
              <div className="profile-name-row">
                <h1>{user.name || "Add your name"}</h1>
                {verified && (
                  <span className="profile-verified" title="ID Verified">
                    <HiOutlineBadgeCheck size={20} />
                  </span>
                )}
              </div>
              <p className="profile-email">{user.email}</p>
              {user.city && (
                <p className="profile-city">
                  <HiOutlineLocationMarker size={14} /> {user.city}
                </p>
              )}
              {user.bio && <p className="profile-bio">{user.bio}</p>}
            </div>

            {!editing && (
              <button className="profile-edit-btn" onClick={() => setEditing(true)}>
                <HiOutlinePencil size={14} />
                Edit profile
              </button>
            )}
          </section>

          {/* Profile completion */}
          <section className="profile-card profile-completion">
            <div className="profile-completion-head">
              <div>
                <p className="profile-completion-title">Profile completion</p>
                <p className="profile-completion-sub">
                  {completion === 100
                    ? "Your profile is complete — well done!"
                    : "Add the remaining details to unlock faster bookings."}
                </p>
              </div>
              <span className="profile-completion-percent">{completion}%</span>
            </div>
            <div className="profile-progress">
              <div className="profile-progress-fill" style={{ width: `${completion}%` }} />
            </div>
            <div className="profile-completion-tags">
              {completionItems.map((it) => (
                <span
                  key={it.label}
                  className={`profile-completion-tag ${it.done ? "done" : ""}`}
                >
                  {it.done ? <HiOutlineCheckCircle size={14} /> : <HiOutlineX size={14} />}
                  {it.label}
                </span>
              ))}
            </div>
          </section>

          {/* Edit form */}
          {editing && (
            <section className="profile-card profile-edit-form">
              <div className="profile-section-head">
                <h2>Edit profile</h2>
                <button
                  className="profile-icon-btn"
                  onClick={() => setEditing(false)}
                  aria-label="Cancel"
                >
                  <HiOutlineX size={18} />
                </button>
              </div>

              <div className="profile-field-grid">
                <label className="profile-field">
                  <span>Full name</span>
                  <input
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  />
                </label>
                <label className="profile-field">
                  <span>Phone number</span>
                  <input
                    inputMode="numeric"
                    value={form.phone}
                    onChange={(e) => {
                      const v = e.target.value.replace(/\D/g, "").slice(0, 10);
                      setForm((f) => ({ ...f, phone: v }));
                    }}
                    placeholder="10-digit number"
                  />
                </label>
                <label className="profile-field">
                  <span>City</span>
                  <input
                    value={form.city}
                    onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
                    placeholder="e.g. Hyderabad"
                  />
                </label>
                <label className="profile-field profile-field-full">
                  <span>About you</span>
                  <textarea
                    rows={3}
                    value={form.bio}
                    onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
                    placeholder="A short note about yourself — work, study, lifestyle…"
                  />
                </label>
              </div>

              <div className="profile-edit-actions">
                <button
                  className="profile-btn profile-btn-ghost"
                  onClick={() => setEditing(false)}
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  className="profile-btn profile-btn-primary"
                  onClick={handleSave}
                  disabled={saving || !form.name.trim() || form.phone.length !== 10}
                >
                  {saving ? "Saving…" : "Save changes"}
                </button>
              </div>
            </section>
          )}

          {/* Contact details (read-only when not editing) */}
          {!editing && (
            <section className="profile-card profile-info">
              <h2>Contact details</h2>
              <ul className="profile-info-list">
                <li>
                  <span className="profile-info-icon"><HiOutlineMail size={16} /></span>
                  <div>
                    <p className="profile-info-label">Email</p>
                    <p className="profile-info-value">{user.email}</p>
                  </div>
                </li>
                <li>
                  <span className="profile-info-icon"><HiOutlinePhone size={16} /></span>
                  <div>
                    <p className="profile-info-label">Phone</p>
                    <p className="profile-info-value">+91 {user.phone || "—"}</p>
                  </div>
                </li>
                <li>
                  <span className="profile-info-icon"><HiOutlineHome size={16} /></span>
                  <div>
                    <p className="profile-info-label">Account type</p>
                    <p className="profile-info-value" style={{ textTransform: "capitalize" }}>
                      {user.role.replace("_", " ")}
                    </p>
                  </div>
                </li>
                <li>
                  <span className="profile-info-icon"><HiOutlineCalendar size={16} /></span>
                  <div>
                    <p className="profile-info-label">Member since</p>
                    <p className="profile-info-value">2025</p>
                  </div>
                </li>
              </ul>
            </section>
          )}

          {/* ID proof — hidden for platform admins */}
          {!isPlatformAdmin && (
            <section className="profile-card profile-id">
              <div className="profile-section-head">
                <h2>ID Verification</h2>
                {verified ? (
                  <span className="profile-status-badge done">
                    <HiOutlineShieldCheck size={14} /> Verified
                  </span>
                ) : (
                  <span className="profile-status-badge pending">Pending</span>
                )}
              </div>

              {verified ? (
                <div className="profile-id-uploaded">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={user.idProofUrl} alt="ID proof" />
                  <div>
                    <p className="profile-info-label">{ID_LABELS[user.idProofType || "aadhaar"]}</p>
                    <p className="profile-info-value">Document on file</p>
                    <button
                      className="profile-link-btn"
                      onClick={() => idProofInputRef.current?.click()}
                    >
                      Replace document
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  className="profile-id-upload"
                  onClick={() => idProofInputRef.current?.click()}
                >
                  <span className="profile-id-upload-icon">
                    <HiOutlineUpload size={22} />
                  </span>
                  <div>
                    <p className="profile-id-upload-title">Upload your ID proof</p>
                    <p className="profile-id-upload-sub">
                      Aadhaar, PAN, or Driving License · Required to confirm bookings
                    </p>
                  </div>
                </button>
              )}
              <input
                ref={idProofInputRef}
                type="file"
                accept="image/*,application/pdf"
                hidden
                onChange={handleIdProofChange}
              />
            </section>
          )}

        </div>
    </>
  );

  return (
    <>
      <Head><title>My Profile — Roomsy</title></Head>
      {isPlatformAdmin ? (
        <div className="pg-layout" style={{ minHeight: "100vh", backgroundColor: "#F9F7F4" }}>
          <AdminSidebar active="/profile" />
          <main className="profile-main profile-main-admin own-main" style={{ flex: 1, overflowX: "hidden" }}>
            {ownerProfileBody}
          </main>
        </div>
      ) : isCustomer ? (
        <div className="pg-layout" style={{ minHeight: "100vh", backgroundColor: "#F9F7F4" }}>
          <CustomerSidebar active="/profile" />
          <main className="profile-main profile-main-admin own-main" style={{ flex: 1, overflowX: "hidden" }}>
            {ownerProfileBody}
          </main>
          <Footer />
        </div>
      ) : isPgAdmin ? (
        <div className="pg-layout" style={{ minHeight: "100vh", backgroundColor: "#F9F7F4" }}>
          <PgAdminSidebar active="/profile" />
          <main className="profile-main profile-main-admin own-main" style={{ flex: 1, overflowX: "hidden" }}>
            {ownerProfileBody}
          </main>
        </div>
      ) : (
        <>
          <Navbar />
          <main className="profile-main">
            {profileBody}
          </main>
        </>
      )}

      {!isPlatformAdmin && !isCustomer && !isPgAdmin && <Footer />}

      {confirmLogout && (
        <LogoutModal
          onCancel={() => setConfirmLogout(false)}
          onConfirm={() => { logout(); setConfirmLogout(false); router.push("/"); }}
        />
      )}

      <style jsx global>{`
        .profile-logout-card {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 16px 18px;
          background: #fff;
          border: 1.5px solid #FECACA;
          border-radius: 16px;
          cursor: pointer;
          text-align: left;
          transition: background 0.15s, border-color 0.15s, transform 0.1s, box-shadow 0.18s;
          box-shadow: 0 1px 3px rgba(220, 38, 38, 0.06);
        }
        .profile-logout-card:hover {
          background: #FEF2F2;
          border-color: #FCA5A5;
          box-shadow: 0 4px 12px rgba(220, 38, 38, 0.12);
        }
        .profile-logout-card:active { transform: scale(0.99); }
        .profile-logout-icon {
          width: 40px;
          height: 40px;
          border-radius: 12px;
          background: #FEF2F2;
          color: #DC2626;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .profile-logout-text { flex: 1; min-width: 0; }
        .profile-logout-title {
          font-family: var(--font-display);
          font-size: 16px;
          font-weight: 700;
          color: #B91C1C;
          margin: 0 0 2px;
        }
        .profile-logout-sub {
          font-family: var(--font-body);
          font-size: 12px;
          color: #DC2626;
          margin: 0;
        }

        .profile-main {
          min-height: 100vh;
          background: #F9F7F4;
          padding-top: 72px;
          position: relative;
          overflow: hidden;
        }
        /* Admin profile (uses AdminSidebar instead of public Navbar) */
        .profile-main.profile-main-admin {
          padding-top: 0;
          padding-bottom: 32px;
          min-height: 0;
        }
        .profile-main.profile-main-admin .profile-shell { padding-bottom: 12px; }
        @media (max-width: 768px) {
          .profile-main.profile-main-admin {
            padding-top: calc(56px + env(safe-area-inset-top));
            padding-bottom: calc(70px + env(safe-area-inset-bottom));
            min-height: 0;
          }
          .profile-main.profile-main-admin .profile-shell { padding-bottom: 8px; }
        }
        .profile-hero {
          position: absolute;
          inset: 0;
          height: 280px;
          background: linear-gradient(135deg, #FFF0F3 0%, #FDFCFA 60%, #F9F7F4 100%);
          overflow: hidden;
          pointer-events: none;
          z-index: 0;
        }
        .profile-hero-blob {
          position: absolute;
          border-radius: 50%;
          filter: blur(60px);
          opacity: 0.55;
          animation: float-blob 12s ease-in-out infinite;
        }
        .blob-1 {
          width: 280px; height: 280px;
          background: radial-gradient(circle, rgba(255,56,92,0.32), transparent 70%);
          top: -80px; left: -60px;
        }
        .blob-2 {
          width: 320px; height: 320px;
          background: radial-gradient(circle, rgba(255,56,92,0.18), transparent 70%);
          top: 40px; right: -100px;
          animation-delay: 3s;
        }
        .blob-3 {
          width: 220px; height: 220px;
          background: radial-gradient(circle, rgba(28,25,23,0.06), transparent 70%);
          top: 100px; left: 40%;
          animation-delay: 6s;
        }
        @keyframes float-blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50%      { transform: translate(20px, -16px) scale(1.06); }
        }

        .profile-shell {
          position: relative;
          z-index: 1;
          max-width: 880px;
          margin: 0 auto;
          padding: 36px 20px 80px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .profile-card {
          background: #fff;
          border: 1px solid #EFEAE3;
          border-radius: 18px;
          padding: 22px;
          box-shadow: 0 1px 2px rgba(28,25,23,0.04), 0 8px 28px rgba(28,25,23,0.05);
          animation: slide-up 0.4s cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .profile-card:nth-child(2) { animation-delay: 60ms; }
        .profile-card:nth-child(3) { animation-delay: 120ms; }
        .profile-card:nth-child(4) { animation-delay: 180ms; }
        .profile-card:nth-child(5) { animation-delay: 240ms; }

        /* ── Identity card ── */
        .profile-identity {
          display: flex;
          align-items: center;
          gap: 18px;
          flex-wrap: wrap;
        }
        .profile-avatar-wrap {
          position: relative;
          flex-shrink: 0;
        }
        .profile-avatar {
          width: 84px; height: 84px;
          border-radius: 50%;
          background: linear-gradient(135deg, #FF385C 0%, #E31C5F 100%);
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: var(--font-display);
          font-size: 30px;
          font-weight: 700;
          letter-spacing: 0.2px;
          overflow: hidden;
          box-shadow: 0 8px 24px rgba(255,56,92,0.28);
          border: 4px solid #fff;
        }
        .profile-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .profile-avatar-edit {
          position: absolute;
          bottom: -2px;
          right: -2px;
          width: 30px;
          height: 30px;
          border-radius: 50%;
          background: #fff;
          border: 1.5px solid #E8E4DE;
          color: #1C1917;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: background 0.15s, border-color 0.15s, transform 0.15s;
        }
        .profile-avatar-edit:hover {
          background: #FFF0F3;
          border-color: #FF385C;
          color: #FF385C;
          transform: scale(1.06);
        }
        .profile-identity-text {
          flex: 1;
          min-width: 0;
        }
        .profile-name-row {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .profile-name-row h1 {
          font-family: var(--font-display);
          font-size: 24px;
          font-weight: 600;
          color: #1C1917;
          letter-spacing: -0.4px;
          margin: 0;
        }
        .profile-verified {
          color: #15803D;
          display: inline-flex;
        }
        .profile-email {
          font-family: var(--font-body);
          font-size: 13px;
          color: #78716C;
          margin: 4px 0 0;
        }
        .profile-city {
          margin-top: 4px;
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-family: var(--font-body);
          font-size: 12px;
          color: #78716C;
        }
        .profile-bio {
          margin-top: 10px;
          font-family: var(--font-body);
          font-size: 13px;
          color: #44403C;
          line-height: 1.55;
        }

        .profile-edit-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 10px 16px;
          background: #1C1917;
          color: #fff;
          border: none;
          border-radius: 100px;
          font-family: var(--font-body);
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.15s, transform 0.1s;
        }
        .profile-edit-btn:hover {
          background: #292524;
        }
        .profile-edit-btn:active { transform: scale(0.97); }

        /* ── Completion ── */
        .profile-completion-head {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 12px;
          margin-bottom: 12px;
        }
        .profile-completion-title {
          font-family: var(--font-display);
          font-size: 16px;
          font-weight: 600;
          color: #1C1917;
          margin: 0 0 2px;
        }
        .profile-completion-sub {
          font-family: var(--font-body);
          font-size: 12px;
          color: #78716C;
          margin: 0;
        }
        .profile-completion-percent {
          font-family: var(--font-display);
          font-size: 22px;
          font-weight: 700;
          color: #FF385C;
          letter-spacing: -0.3px;
        }
        .profile-progress {
          height: 8px;
          background: #F0EDE8;
          border-radius: 100px;
          overflow: hidden;
          margin-bottom: 12px;
        }
        .profile-progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #FF385C 0%, #FF6B85 100%);
          border-radius: 100px;
          transition: width 0.6s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .profile-completion-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }
        .profile-completion-tag {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 4px 10px;
          border-radius: 100px;
          font-family: var(--font-body);
          font-size: 11px;
          font-weight: 600;
          background: #F5F3F0;
          color: #A8A29E;
          border: 1px solid #EFEAE3;
        }
        .profile-completion-tag.done {
          background: #ECFDF5;
          color: #15803D;
          border-color: #BBF7D0;
        }

        /* ── Section header ── */
        .profile-section-head {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 14px;
        }
        .profile-section-head h2 {
          font-family: var(--font-display);
          font-size: 16px;
          font-weight: 600;
          color: #1C1917;
          margin: 0;
        }
        .profile-icon-btn {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          border: 1px solid #E8E4DE;
          background: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: #1C1917;
          transition: background 0.15s, color 0.15s;
        }
        .profile-icon-btn:hover {
          background: #FEF2F2;
          color: #DC2626;
        }

        /* ── Edit form ── */
        .profile-field-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }
        .profile-field {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .profile-field-full { grid-column: 1 / -1; }
        .profile-field span {
          font-family: var(--font-body);
          font-size: 12px;
          font-weight: 600;
          color: #44403C;
          letter-spacing: 0.2px;
        }
        .profile-field input,
        .profile-field textarea {
          padding: 10px 12px;
          border: 1.5px solid #E8E4DE;
          border-radius: 10px;
          background: #FAFAF9;
          font-family: var(--font-body);
          font-size: 14px;
          color: #1C1917;
          outline: none;
          transition: border-color 0.15s, background 0.15s, box-shadow 0.15s;
          resize: vertical;
        }
        .profile-field input:focus,
        .profile-field textarea:focus {
          border-color: #FF385C;
          background: #fff;
          box-shadow: 0 0 0 3px rgba(255, 56, 92, 0.12);
        }
        .profile-edit-actions {
          display: flex;
          justify-content: flex-end;
          gap: 8px;
          margin-top: 16px;
        }
        .profile-btn {
          padding: 10px 18px;
          border-radius: 100px;
          font-family: var(--font-body);
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.15s, color 0.15s, border-color 0.15s, transform 0.1s;
          border: 1.5px solid transparent;
        }
        .profile-btn:active { transform: scale(0.97); }
        .profile-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .profile-btn-ghost {
          background: #fff;
          color: #1C1917;
          border-color: #E8E4DE;
        }
        .profile-btn-ghost:hover { background: #F9F7F4; }
        .profile-btn-primary {
          background: #FF385C;
          color: #fff;
          border-color: #FF385C;
        }
        .profile-btn-primary:hover {
          background: #E31C5F;
          border-color: #E31C5F;
        }

        /* ── Info list ── */
        .profile-info h2 {
          font-family: var(--font-display);
          font-size: 16px;
          font-weight: 600;
          color: #1C1917;
          margin: 0 0 12px;
        }
        .profile-info-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }
        .profile-info-list li {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          padding: 12px;
          border: 1px solid #EFEAE3;
          border-radius: 12px;
          background: #FDFCFA;
        }
        .profile-info-icon {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          background: #FFF0F3;
          color: #FF385C;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .profile-info-label {
          font-family: var(--font-body);
          font-size: 11px;
          color: #A8A29E;
          margin: 0 0 2px;
          text-transform: uppercase;
          letter-spacing: 0.4px;
          font-weight: 600;
        }
        .profile-info-value {
          font-family: var(--font-body);
          font-size: 14px;
          font-weight: 600;
          color: #1C1917;
          margin: 0;
          word-break: break-word;
        }

        /* ── ID proof card ── */
        .profile-status-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 4px 10px;
          border-radius: 100px;
          font-family: var(--font-body);
          font-size: 11px;
          font-weight: 600;
        }
        .profile-status-badge.done {
          background: #ECFDF5;
          color: #15803D;
          border: 1px solid #BBF7D0;
        }
        .profile-status-badge.pending {
          background: #FEF3C7;
          color: #92400E;
          border: 1px solid #FCD34D;
        }
        .profile-id-upload {
          display: flex;
          gap: 14px;
          align-items: center;
          padding: 18px;
          border: 1.5px dashed #D6D3CE;
          border-radius: 14px;
          background: #FDFCFA;
          width: 100%;
          text-align: left;
          cursor: pointer;
          transition: border-color 0.2s, background 0.2s;
        }
        .profile-id-upload:hover {
          border-color: #FF385C;
          background: #FFF8F9;
        }
        .profile-id-upload-icon {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          background: #FFF0F3;
          color: #FF385C;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .profile-id-upload-title {
          font-family: var(--font-display);
          font-size: 15px;
          font-weight: 600;
          color: #1C1917;
          margin: 0 0 2px;
        }
        .profile-id-upload-sub {
          font-family: var(--font-body);
          font-size: 12px;
          color: #78716C;
          margin: 0;
        }
        .profile-id-uploaded {
          display: flex;
          gap: 14px;
          align-items: center;
          padding: 12px;
          background: #FDFCFA;
          border: 1px solid #EFEAE3;
          border-radius: 14px;
        }
        .profile-id-uploaded img {
          width: 88px;
          height: 60px;
          border-radius: 8px;
          object-fit: cover;
          flex-shrink: 0;
        }
        .profile-link-btn {
          background: none;
          border: none;
          padding: 0;
          margin-top: 4px;
          font-family: var(--font-body);
          font-size: 12px;
          font-weight: 600;
          color: #FF385C;
          cursor: pointer;
          text-decoration: underline;
          text-underline-offset: 3px;
        }

        /* ────────────────────────────────────────────── */
        /* ── Owner profile (editorial, minimal) ──────── */
        /* ────────────────────────────────────────────── */
        .own-main {
          background: #F9F7F4;
          padding-top: 0;
          padding-bottom: 0;
        }
        .own-profile {
          max-width: 1120px;
          margin: 0 auto;
          padding: 24px 36px 28px;
          position: relative;
          font-family: var(--font-body);
          color: #1C1917;
        }

        .own-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          font-family: var(--font-body);
          font-size: 10px;
          font-weight: 700;
          color: #FF385C;
          letter-spacing: 3px;
          text-transform: uppercase;
          margin: 0 0 12px;
        }
        .own-eyebrow-line {
          width: 24px;
          height: 1px;
          background-color: #FF385C;
        }
        .own-eyebrow-line.short { width: 16px; }

        .own-hero {
          position: relative;
          margin: 0;
          padding: 28px 40px;
          background: linear-gradient(130deg, #1C1917 0%, #FF385C 100%);
          animation: own-fade-up 0.8s cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        .own-hero-inner {
          position: relative;
          max-width: 1120px;
          margin: 0 auto;
        }
        .own-hero .own-eyebrow {
          color: rgba(255, 255, 255, 0.85);
        }
        .own-hero .own-eyebrow-line {
          background-color: rgba(255, 255, 255, 0.7);
        }
        .own-title {
          font-family: var(--font-display);
          font-size: clamp(26px, 3.4vw, 38px);
          font-weight: 600;
          color: #FFFBF5;
          letter-spacing: -0.03em;
          line-height: 1.05;
          margin: 0 0 10px;
          max-width: 760px;
        }
        .own-title em {
          font-style: italic;
          color: #FFD2DA;
          font-weight: 500;
          font-variation-settings: 'opsz' 144, 'SOFT' 80;
        }
        .own-sub {
          font-family: var(--font-body);
          font-size: 13px;
          color: rgba(255, 255, 255, 0.7);
          letter-spacing: 0.4px;
          margin: 0;
          line-height: 1.7;
        }
        .own-sub-sep {
          display: inline-block;
          margin: 0 10px;
          color: rgba(255, 255, 255, 0.35);
        }
        .own-edit-btn {
          position: absolute;
          top: 0;
          right: 0;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 9px 18px;
          background: rgba(255, 255, 255, 0.12);
          color: #FFFBF5;
          border: 1px solid rgba(255, 255, 255, 0.22);
          border-radius: 100px;
          font-family: var(--font-body);
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 2.4px;
          text-transform: uppercase;
          cursor: pointer;
          backdrop-filter: blur(6px);
          -webkit-backdrop-filter: blur(6px);
          transition: background 0.25s ease, border-color 0.25s ease, transform 0.15s ease;
        }
        .own-edit-btn:hover {
          background: rgba(255, 255, 255, 0.22);
          border-color: rgba(255, 255, 255, 0.38);
          transform: translateY(-1px);
        }
        .own-edit-btn:active { transform: translateY(0); }

        .own-grid {
          display: grid;
          grid-template-columns: 0.95fr 1.1fr;
          gap: 40px;
          animation: own-fade-up 0.85s cubic-bezier(0.22, 1, 0.36, 1) 0.1s both;
        }
        .own-col {
          display: flex;
          flex-direction: column;
          gap: 24px;
          min-width: 0;
        }

        /* Portrait */
        .own-portrait {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 12px;
        }
        .own-avatar {
          width: 124px;
          height: 124px;
          border-radius: 4px;
          background: linear-gradient(135deg, #FFE6EA 0%, #FFD2DA 60%, #FFC2CC 100%);
          color: #FF385C;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: var(--font-display);
          font-style: italic;
          font-size: 44px;
          font-weight: 500;
          letter-spacing: -0.02em;
          overflow: hidden;
          border: 1px solid #EFEAE3;
          filter: saturate(0.92);
          position: relative;
        }
        .own-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .own-link-btn {
          background: none;
          border: none;
          padding: 4px 0 3px;
          font-family: var(--font-body);
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 2.4px;
          text-transform: uppercase;
          color: #FF385C;
          cursor: pointer;
          border-bottom: 1px solid currentColor;
          transition: opacity 0.2s ease, color 0.2s ease;
        }
        .own-link-btn:hover { opacity: 0.65; }

        /* Section */
        .own-section-label {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          font-family: var(--font-body);
          font-size: 10px;
          font-weight: 700;
          color: #FF385C;
          letter-spacing: 3px;
          text-transform: uppercase;
          margin: 0 0 14px;
        }

        /* Info list */
        .own-info {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        .own-info li {
          display: grid;
          grid-template-columns: 28px 1fr;
          align-items: baseline;
          gap: 14px;
          padding: 10px 0;
          border-bottom: 1px solid #EFEAE3;
        }
        .own-info li:first-child { padding-top: 4px; }
        .own-info li:last-child { border-bottom: none; padding-bottom: 0; }
        .own-info-num {
          font-family: var(--font-display);
          font-style: italic;
          font-size: 13px;
          color: #FF385C;
          letter-spacing: 0.5px;
        }
        .own-info-key {
          font-family: var(--font-body);
          font-size: 9px;
          font-weight: 700;
          color: #A8A29E;
          letter-spacing: 2.2px;
          text-transform: uppercase;
          margin: 0 0 3px;
        }
        .own-info-val {
          font-family: var(--font-body);
          font-size: 14px;
          font-weight: 500;
          color: #1C1917;
          margin: 0;
          word-break: break-word;
          line-height: 1.35;
        }

        .own-bio {
          margin: 16px 0 0;
          padding: 0 0 0 24px;
          position: relative;
          font-family: var(--font-display);
          font-style: italic;
          font-size: 15px;
          color: #44403C;
          line-height: 1.5;
          letter-spacing: -0.005em;
        }
        .own-bio-mark {
          position: absolute;
          left: -2px;
          top: -10px;
          font-family: var(--font-display);
          font-size: 44px;
          color: #FF385C;
          line-height: 1;
          opacity: 0.35;
          font-style: italic;
        }

        /* Completion */
        .own-completion-row {
          display: flex;
          align-items: flex-start;
          gap: 22px;
          margin-bottom: 16px;
        }
        .own-completion-num {
          font-family: var(--font-display);
          font-size: 56px;
          font-weight: 600;
          color: #1C1917;
          line-height: 0.88;
          letter-spacing: -0.045em;
          display: inline-flex;
          align-items: flex-start;
        }
        .own-completion-num small {
          font-size: 20px;
          color: #FF385C;
          font-style: italic;
          font-weight: 500;
          margin: 4px 0 0 4px;
          letter-spacing: 0;
        }
        .own-completion-note {
          flex: 1;
          font-family: var(--font-body);
          font-size: 12px;
          color: #78716C;
          line-height: 1.55;
          margin: 0;
          padding-top: 6px;
        }
        .own-rule {
          height: 1px;
          background: #EFEAE3;
          margin: 14px 0;
        }
        .own-checks {
          list-style: none;
          margin: 0;
          padding: 0;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px 24px;
        }
        .own-checks li {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          font-family: var(--font-body);
          font-size: 12px;
          color: #A8A29E;
          letter-spacing: 0.1px;
        }
        .own-checks li.is-done { color: #1C1917; }
        .own-check-mark {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 14px;
          height: 14px;
          color: #15803D;
        }
        .own-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #D6D3CE;
          display: inline-block;
        }

        /* ID */
        .own-id-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 14px;
        }
        .own-id-head .own-section-label { margin-bottom: 0; }
        .own-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 5px 12px;
          border-radius: 100px;
          font-family: var(--font-body);
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 1.8px;
          text-transform: uppercase;
        }
        .own-pill.verified {
          color: #15803D;
          background: #ECFDF5;
          border: 1px solid #BBF7D0;
        }
        .own-pill.pending {
          color: #92400E;
          background: #FEF7E0;
          border: 1px solid #FCD34D;
        }
        .own-id-upload {
          display: flex;
          gap: 14px;
          align-items: center;
          padding: 14px 18px;
          border: 1px dashed #D6D3CE;
          border-radius: 4px;
          background: transparent;
          width: 100%;
          text-align: left;
          cursor: pointer;
          color: #1C1917;
          transition: border-color 0.3s ease, background 0.3s ease, color 0.3s ease;
        }
        .own-id-upload:hover {
          border-color: #FF385C;
          background: #FFF8F5;
          color: #FF385C;
        }
        .own-id-upload-icon {
          width: 34px;
          height: 34px;
          border-radius: 50%;
          background: #FFF0F3;
          color: #FF385C;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: background 0.3s ease;
        }
        .own-id-upload:hover .own-id-upload-icon {
          background: #FF385C;
          color: #fff;
        }
        .own-id-upload > div { flex: 1; min-width: 0; }
        .own-id-upload-title {
          font-family: var(--font-display);
          font-size: 15px;
          font-weight: 500;
          font-style: italic;
          color: #1C1917;
          margin: 0 0 2px;
          letter-spacing: -0.005em;
        }
        .own-id-upload-sub {
          font-family: var(--font-body);
          font-size: 10px;
          color: #78716C;
          margin: 0;
          letter-spacing: 2.4px;
          text-transform: uppercase;
          font-weight: 600;
        }
        .own-id-upload-arrow {
          font-family: var(--font-display);
          font-size: 18px;
          color: #FF385C;
          opacity: 0.55;
          transition: transform 0.3s ease, opacity 0.3s ease;
        }
        .own-id-upload:hover .own-id-upload-arrow {
          transform: translateX(4px);
          opacity: 1;
        }
        .own-id-uploaded {
          display: flex;
          gap: 14px;
          align-items: center;
          padding: 12px 14px;
          background: #FDFCFA;
          border: 1px solid #EFEAE3;
          border-radius: 4px;
        }
        .own-id-uploaded img {
          width: 80px;
          height: 56px;
          object-fit: cover;
          border-radius: 2px;
          flex-shrink: 0;
          filter: saturate(0.95);
        }

        /* Form */
        .own-form {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px 24px;
          margin-bottom: 20px;
        }
        .own-field {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .own-field-full { grid-column: 1 / -1; }
        .own-field > span {
          font-family: var(--font-body);
          font-size: 10px;
          font-weight: 700;
          color: #A8A29E;
          letter-spacing: 2.4px;
          text-transform: uppercase;
        }
        .own-field input,
        .own-field textarea {
          padding: 6px 0 8px;
          border: none;
          border-bottom: 1px solid #D6D3CE;
          background: transparent;
          font-family: var(--font-display);
          font-size: 17px;
          font-weight: 400;
          color: #1C1917;
          outline: none;
          resize: none;
          letter-spacing: -0.01em;
          transition: border-color 0.25s ease;
        }
        .own-field input::placeholder,
        .own-field textarea::placeholder {
          color: #C4BFB7;
          font-style: italic;
        }
        .own-field input:focus,
        .own-field textarea:focus {
          border-color: #FF385C;
        }
        .own-form-actions {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
        }
        .own-btn {
          padding: 10px 22px;
          border-radius: 100px;
          font-family: var(--font-body);
          font-size: 10px;
          font-weight: 700;
          cursor: pointer;
          letter-spacing: 2.4px;
          text-transform: uppercase;
          border: 1px solid transparent;
          transition: background 0.2s ease, color 0.2s ease, border-color 0.2s ease, transform 0.15s ease;
        }
        .own-btn:disabled { opacity: 0.4; cursor: not-allowed; }
        .own-btn:not(:disabled):active { transform: translateY(1px); }
        .own-btn-ghost {
          background: transparent;
          color: #1C1917;
          border-color: #D6D3CE;
        }
        .own-btn-ghost:hover:not(:disabled) { background: #F5F3F0; }
        .own-btn-primary {
          background: #1C1917;
          color: #FFFBF5;
          border-color: #1C1917;
        }
        .own-btn-primary:hover:not(:disabled) {
          background: #FF385C;
          border-color: #FF385C;
        }

        @keyframes own-fade-up {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* Owner — responsive */
        @media (max-width: 1024px) {
          .own-profile { padding: 28px 32px 32px; }
          .own-hero { padding: 28px 32px; }
          .own-grid { gap: 44px; }
        }
        @media (max-width: 900px) {
          .own-profile { padding: 24px 24px 36px; }
          .own-hero { padding: 22px 24px 24px; }
          .own-title { font-size: clamp(26px, 6vw, 36px); }
          .own-edit-btn {
            position: static;
            top: auto;
            right: auto;
            margin-top: 16px;
            display: inline-flex;
          }
          .own-grid {
            grid-template-columns: 1fr;
            gap: 40px;
          }
          .own-col { gap: 36px; }
          .own-avatar { width: 140px; height: 140px; font-size: 48px; }
          .own-completion-num { font-size: 60px; }
          .own-completion-num small { font-size: 22px; margin-top: 4px; }
          .own-checks { grid-template-columns: 1fr; gap: 10px; }
          .own-form { grid-template-columns: 1fr; gap: 22px; }
        }
        @media (max-width: 540px) {
          .own-profile { padding: 20px 18px 32px; }
          .own-hero { padding: 20px 18px 22px; }
          .own-title { font-size: clamp(22px, 7vw, 30px); }
          .own-sub { font-size: 12px; }
          .own-sub-sep { margin: 0 6px; }
          .own-avatar { width: 112px; height: 112px; font-size: 38px; }
          .own-completion-num { font-size: 48px; }
          .own-completion-num small { font-size: 18px; }
          .own-id-upload { padding: 16px; gap: 12px; }
          .own-id-upload-title { font-size: 15px; }
          .own-id-upload-arrow { display: none; }
          .own-id-uploaded { padding: 12px; gap: 12px; }
          .own-id-uploaded img { width: 80px; height: 60px; }
          .own-bio { font-size: 16px; padding-left: 22px; }
          .own-bio-mark { font-size: 44px; top: -10px; }
        }

        /* ── Mobile (≤640px) ── */
        @media (max-width: 640px) {
          .profile-main { padding-top: 60px; }
          .profile-hero { height: 220px; }
          .profile-shell { padding: 18px 12px 60px; gap: 12px; }
          .profile-card { padding: 16px; border-radius: 14px; }

          .profile-identity {
            flex-direction: column;
            text-align: center;
            align-items: center;
          }
          .profile-name-row { justify-content: center; }
          .profile-name-row h1 { font-size: 20px; }
          .profile-edit-btn { width: 100%; justify-content: center; }

          .profile-completion-percent { font-size: 20px; }

          .profile-info-list { grid-template-columns: 1fr; gap: 8px; }
          .profile-info-list li { padding: 10px; }

          .profile-field-grid { grid-template-columns: 1fr; }

          .profile-id-uploaded img { width: 64px; height: 48px; }
        }
      `}</style>
    </>
  );
}
