import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import PGCard from "@/components/common/PGCard";
import { useAuthStore } from "@/store/useAuthStore";
import { getAllPGsWithOverrides } from "@/lib/dummyPGAdmin";
import { getWishlist } from "@/lib/dummyWishlist";
import { PG } from "@/types/pg";
import { HiArrowLeft, HiOutlineHeart } from "react-icons/hi";

function cheapest(pg: PG): number | undefined {
  const vals = Object.values(pg.sharingPrices).filter((v): v is number => typeof v === "number");
  if (vals.length === 0) return pg.monthlyPrice || undefined;
  return Math.min(...vals);
}

export default function WishlistPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const hydrated = useAuthStore((s) => s.hydrated);
  const [pgs, setPgs] = useState<PG[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!hydrated) return;
    if (!user) { router.replace("/"); return; }
    const refresh = () => {
      const ids = new Set(getWishlist(user.objectId));
      setPgs(getAllPGsWithOverrides().filter((pg) => ids.has(pg.objectId)));
      setReady(true);
    };
    refresh();
    window.addEventListener("roomsy:wishlist", refresh);
    return () => window.removeEventListener("roomsy:wishlist", refresh);
  }, [user]);

  if (!user) return null;

  return (
    <>
      <Head><title>My Wishlist — Roomsy</title></Head>
      <Navbar />

      <main className="wl-main">
        <div className="wl-shell">
          <Link href="/pgs" className="wl-back" aria-label="Back to browse PGs">
            <HiArrowLeft size={18} />
          </Link>
          <h1 className="wl-title">My Wishlist</h1>
          <p className="wl-sub">
            {!ready
              ? "Loading…"
              : pgs.length === 0
                ? "Save properties you love and they'll appear here."
                : `${pgs.length} saved propert${pgs.length === 1 ? "y" : "ies"}`}
          </p>

          {ready && pgs.length === 0 ? (
            <div className="wl-empty">
              <div className="wl-empty-icon">
                <HiOutlineHeart size={36} />
              </div>
              <h2>No saved properties yet</h2>
              <p>Tap the heart on any PG to save it here for later.</p>
              <Link href="/pgs" className="wl-cta">Browse PGs</Link>
            </div>
          ) : (
            <div className="wl-grid">
              {pgs.map((pg) => (
                <PGCard key={pg.objectId} pg={pg} fromPrice={cheapest(pg)} />
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />

      <style jsx>{`
        .wl-main {
          min-height: 100vh;
          background: #F9F7F4;
          padding-top: 72px;
        }
        .wl-shell {
          max-width: 1180px;
          margin: 0 auto;
          padding: 36px 24px 80px;
        }
        .wl-back {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-family: var(--font-body);
          font-size: 13px;
          color: #78716C;
          text-decoration: none;
          margin-bottom: 14px;
        }
        .wl-back:hover { color: #1C1917; }
        .wl-title {
          font-family: var(--font-display);
          font-size: clamp(24px, 4vw, 32px);
          font-weight: 600;
          color: #1C1917;
          letter-spacing: -0.5px;
          margin: 0 0 6px;
        }
        .wl-sub {
          font-family: var(--font-body);
          font-size: 14px;
          color: #78716C;
          margin: 0 0 28px;
        }
        .wl-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
          gap: 20px;
        }
        .wl-empty {
          background: #fff;
          border: 1px solid #E8E4DE;
          border-radius: 20px;
          padding: 64px 24px;
          text-align: center;
          box-shadow: 0 1px 3px rgba(28,25,23,0.04);
        }
        .wl-empty-icon {
          width: 72px;
          height: 72px;
          border-radius: 50%;
          background: #FFF0F3;
          color: #FF385C;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 18px;
        }
        .wl-empty h2 {
          font-family: var(--font-display);
          font-size: 20px;
          font-weight: 600;
          color: #1C1917;
          margin: 0 0 6px;
        }
        .wl-empty p {
          font-family: var(--font-body);
          font-size: 14px;
          color: #78716C;
          margin: 0 0 22px;
        }
        .wl-cta {
          display: inline-block;
          font-family: var(--font-body);
          font-size: 14px;
          font-weight: 600;
          color: #fff;
          background: #FF385C;
          padding: 12px 28px;
          border-radius: 100px;
          text-decoration: none;
          transition: background 0.15s;
        }
        .wl-cta:hover { background: #E31C5F; }

        @media (max-width: 640px) {
          .wl-main { padding-top: 60px; }
          .wl-shell { padding: 20px 14px 60px; }
          .wl-grid {
            grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
            gap: 12px;
          }
          .wl-empty {
            padding: 48px 18px;
            border-radius: 16px;
          }
        }
      `}</style>
    </>
  );
}
