import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";
import { HiStar, HiHeart, HiOutlineHeart, HiLocationMarker } from "react-icons/hi";
import toast from "react-hot-toast";
import { PG } from "@/types/pg";
import { useAuthStore } from "@/store/useAuthStore";
import { isWishlisted, toggleWishlist, loadWishlist } from "@/lib/wishlistService";

interface PGCardProps {
  pg: PG;
  fromPrice?: number;
}

export default function PGCard({ pg, fromPrice }: PGCardProps) {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const [liked, setLiked] = useState(false);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    if (!user) { setLiked(false); return; }
    const sync = () => setLiked(isWishlisted(user.objectId, pg.objectId));
    loadWishlist(user.objectId).then(sync).catch(() => {});
    window.addEventListener("roomsy:wishlist", sync);
    return () => window.removeEventListener("roomsy:wishlist", sync);
  }, [user, pg.objectId]);

  async function handleToggle(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      toast.error("Please log in to save properties");
      router.push("/auth/login");
      return;
    }
    try {
      const nowLiked = await toggleWishlist(user.objectId, pg.objectId);
      setLiked(nowLiked);
      toast.success(nowLiked ? "Saved to wishlist" : "Removed from wishlist");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update wishlist");
    }
  }

  const photo = !imgError && pg.photos?.[0] ? pg.photos[0] : null;

  return (
    <Link href={`/pgs/${pg.objectId}`} style={{ textDecoration: "none", display: "block" }}>
      <article
        style={{
          backgroundColor: "#fff",
          borderRadius: "16px",
          overflow: "hidden",
          border: "1px solid #E8E4DE",
          boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
          transition: "box-shadow 0.25s ease, transform 0.25s ease",
          cursor: "pointer",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.boxShadow = "0 8px 32px rgba(0,0,0,0.1)";
          e.currentTarget.style.transform = "translateY(-2px)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.06)";
          e.currentTarget.style.transform = "translateY(0)";
        }}
      >
        {/* Image */}
        <div style={{ position: "relative", aspectRatio: "4/3", backgroundColor: "#F0EDE8" }}>
          {photo ? (
            <Image
              src={photo}
              alt={pg.name}
              fill
              style={{ objectFit: "cover" }}
              onError={() => setImgError(true)}
            />
          ) : (
            <div
              style={{
                width: "100%",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span style={{ fontFamily: "var(--font-display)", fontSize: "40px", color: "#E8E4DE" }}>
                R
              </span>
            </div>
          )}

          {/* Wishlist button */}
          <button
            onClick={handleToggle}
            aria-label={liked ? "Remove from wishlist" : "Save to wishlist"}
            style={{
              position: "absolute",
              top: "12px",
              right: "12px",
              backgroundColor: "rgba(255,255,255,0.9)",
              border: "none",
              borderRadius: "50%",
              width: "34px",
              height: "34px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              boxShadow: "0 1px 4px rgba(0,0,0,0.12)",
              transition: "transform 0.15s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.1)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
          >
            {liked ? (
              <HiHeart size={16} color="#FF385C" />
            ) : (
              <HiOutlineHeart size={16} color="#78716C" />
            )}
          </button>

          {/* Approved badge */}
          {pg.isApproved && (
            <div
              style={{
                position: "absolute",
                top: "12px",
                left: "12px",
                backgroundColor: "rgba(255,255,255,0.92)",
                borderRadius: "100px",
                padding: "3px 10px",
                display: "flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              <div
                style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "#15803D" }}
              />
              <span
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "11px",
                  fontWeight: "500",
                  color: "#15803D",
                }}
              >
                Verified
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div style={{ padding: "16px" }}>
          {/* Location */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
              marginBottom: "6px",
            }}
          >
            <HiLocationMarker size={12} color="#FF385C" />
            <span
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "12px",
                color: "#78716C",
                fontWeight: "400",
              }}
            >
              {pg.area}
            </span>
          </div>

          {/* Name */}
          <h3
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "17px",
              fontWeight: "600",
              color: "#1C1917",
              marginBottom: "8px",
              lineHeight: "1.3",
              letterSpacing: "-0.2px",
              overflow: "hidden",
              display: "-webkit-box",
              WebkitLineClamp: 1,
              WebkitBoxOrient: "vertical",
            }}
          >
            {pg.name}
          </h3>

          {/* Amenities */}
          {pg.amenities?.length > 0 && (
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "6px",
                marginBottom: "12px",
              }}
            >
              {pg.amenities.slice(0, 3).map((amenity) => (
                <span
                  key={amenity}
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "11px",
                    color: "#78716C",
                    backgroundColor: "#F9F7F4",
                    border: "1px solid #E8E4DE",
                    borderRadius: "100px",
                    padding: "2px 10px",
                  }}
                >
                  {amenity}
                </span>
              ))}
              {pg.amenities.length > 3 && (
                <span
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "11px",
                    color: "#FF385C",
                    padding: "2px 4px",
                  }}
                >
                  +{pg.amenities.length - 3} more
                </span>
              )}
            </div>
          )}

          {/* Footer */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            {/* Price */}
            <div>
              {fromPrice ? (
                <div style={{ display: "flex", alignItems: "baseline", gap: "3px" }}>
                  <span
                    style={{
                      fontFamily: "var(--font-body)",
                      fontSize: "11px",
                      color: "#78716C",
                    }}
                  >
                    from
                  </span>
                  <span
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: "18px",
                      fontWeight: "600",
                      color: "#1C1917",
                      letterSpacing: "-0.3px",
                    }}
                  >
                    ₹{fromPrice.toLocaleString()}
                  </span>
                  <span
                    style={{
                      fontFamily: "var(--font-body)",
                      fontSize: "11px",
                      color: "#78716C",
                    }}
                  >
                    /mo
                  </span>
                </div>
              ) : (
                <span style={{ fontFamily: "var(--font-body)", fontSize: "13px", color: "#78716C" }}>
                  Contact for price
                </span>
              )}
            </div>

            {/* Rating */}
            {pg.rating > 0 && (
              <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <HiStar size={14} color="#FF385C" />
                <span
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "13px",
                    fontWeight: "500",
                    color: "#1C1917",
                  }}
                >
                  {pg.rating.toFixed(1)}
                </span>
              </div>
            )}
          </div>
        </div>
      </article>
    </Link>
  );
}
