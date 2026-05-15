import { useEffect, useState, useRef } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import { useAuthStore } from "@/store/useAuthStore";
import { updateCurrentUser } from "@/lib/authService";
import { AdminSidebar, LogoutModal } from "@/pages/admin/dashboard";
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
          <main className="profile-main profile-main-admin" style={{ flex: 1, overflowX: "hidden" }}>
            {profileBody}
          </main>
        </div>
      ) : isCustomer ? (
        <div className="pg-layout" style={{ minHeight: "100vh", backgroundColor: "#F9F7F4" }}>
          <CustomerSidebar active="/profile" />
          <main className="profile-main profile-main-admin" style={{ flex: 1, overflowX: "hidden" }}>
            {profileBody}
          </main>
          <Footer />
        </div>
      ) : (
        <>
          <Navbar />
          <main className="profile-main">
            {profileBody}
          </main>
        </>
      )}

      {!isPlatformAdmin && !isCustomer && <Footer />}

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
