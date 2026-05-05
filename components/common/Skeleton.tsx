"use client";
import React from "react";

type SkeletonProps = {
  width?: number | string;
  height?: number | string;
  radius?: number | string;
  circle?: boolean;
  className?: string;
  style?: React.CSSProperties;
};

export function Skeleton({
  width = "100%",
  height = 14,
  radius = 6,
  circle = false,
  className,
  style,
}: SkeletonProps) {
  return (
    <span
      className={`roomsy-skeleton ${className ?? ""}`}
      style={{
        display: "block",
        width,
        height: circle ? width : height,
        borderRadius: circle ? "50%" : radius,
        ...style,
      }}
    />
  );
}

// ── PG card skeleton: matches PGListCard's layout (image + body) ──
export function PGCardSkeleton() {
  return (
    <div className="roomsy-skeleton-card pg-list-card-skeleton">
      <div className="pg-card-img-skeleton">
        <Skeleton width="100%" height={180} radius={0} />
      </div>
      <div className="pg-card-body-skeleton">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
            <Skeleton width="65%" height={20} />
            <Skeleton width="45%" height={12} />
          </div>
          <Skeleton width={32} height={32} circle className="hide-on-mobile-skel" />
        </div>
        <div style={{ display: "flex", gap: 6, marginTop: 14 }} className="hide-on-mobile-skel">
          <Skeleton width={60} height={20} radius={100} />
          <Skeleton width={56} height={20} radius={100} />
          <Skeleton width={56} height={20} radius={100} />
        </div>
        <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 6 }} className="hide-on-mobile-skel">
          <Skeleton width="100%" height={10} />
          <Skeleton width="92%" height={10} />
        </div>
        <div style={{ marginTop: 16, display: "flex", gap: 8, flexWrap: "wrap" }} className="hide-on-mobile-skel">
          <Skeleton width={88} height={32} radius={8} />
          <Skeleton width={88} height={32} radius={8} />
          <Skeleton width={88} height={32} radius={8} />
        </div>
      </div>

      <style>{`
        .roomsy-skeleton {
          background: linear-gradient(
            90deg,
            #ECE7E0 0%,
            #F5F1EB 40%,
            #ECE7E0 80%
          );
          background-size: 200% 100%;
          animation: roomsy-shimmer 1.4s ease-in-out infinite;
        }
        @keyframes roomsy-shimmer {
          0%   { background-position: 100% 0; }
          100% { background-position: -100% 0; }
        }
        .roomsy-skeleton-card {
          background: #fff;
          border: 1px solid #E8E4DE;
          border-radius: 16px;
          overflow: hidden;
          display: flex;
        }
        .pg-list-card-skeleton .pg-card-img-skeleton {
          width: 260px;
          flex-shrink: 0;
        }
        .pg-list-card-skeleton .pg-card-body-skeleton {
          flex: 1;
          padding: 18px 20px;
        }
        @media (max-width: 768px) {
          .pg-list-card-skeleton {
            flex-direction: column;
          }
          .pg-list-card-skeleton .pg-card-img-skeleton {
            width: 100%;
          }
          .hide-on-mobile-skel {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}

// ── Generic booking row skeleton ──
export function BookingRowSkeleton() {
  return (
    <div style={{
      background: "#fff",
      border: "1px solid #E8E4DE",
      borderRadius: 14,
      padding: 14,
      display: "flex",
      gap: 14,
      alignItems: "center",
    }} className="bk-card-skeleton">
      <Skeleton width={120} height={84} radius={10} className="bk-img-skel" />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8, minWidth: 0 }}>
        <Skeleton width="50%" height={18} />
        <Skeleton width="35%" height={12} />
        <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
          <Skeleton width={70} height={20} radius={100} />
          <Skeleton width={90} height={20} radius={100} />
        </div>
      </div>
      <Skeleton width={90} height={36} radius={100} className="hide-on-mobile-skel" />

      <style>{`
        @media (max-width: 640px) {
          .bk-card-skeleton {
            flex-direction: column !important;
            align-items: stretch !important;
          }
          .bk-card-skeleton .bk-img-skel {
            width: 100% !important;
            height: 140px !important;
          }
        }
      `}</style>
    </div>
  );
}

// ── PG detail page skeleton ──
export function PGDetailSkeleton() {
  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "24px 20px 64px" }}>
      <Skeleton width="40%" height={28} />
      <div style={{ marginTop: 8 }}>
        <Skeleton width="25%" height={14} />
      </div>

      <div style={{
        display: "grid",
        gridTemplateColumns: "2fr 1fr",
        gap: 8,
        marginTop: 20,
      }} className="pg-detail-gallery-skel">
        <Skeleton height={360} radius={14} />
        <div style={{ display: "grid", gridTemplateRows: "1fr 1fr", gap: 8 }}>
          <Skeleton height={176} radius={14} />
          <Skeleton height={176} radius={14} />
        </div>
      </div>

      <div style={{
        display: "grid",
        gridTemplateColumns: "1.6fr 1fr",
        gap: 24,
        marginTop: 28,
      }} className="pg-detail-body-skel">
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Skeleton width="55%" height={22} />
          <Skeleton width="100%" height={12} />
          <Skeleton width="96%" height={12} />
          <Skeleton width="88%" height={12} />
          <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} width={84} height={28} radius={100} />
            ))}
          </div>
        </div>
        <div style={{
          background: "#fff",
          border: "1px solid #E8E4DE",
          borderRadius: 14,
          padding: 18,
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}>
          <Skeleton width="60%" height={18} />
          <Skeleton width="45%" height={26} />
          <Skeleton width="100%" height={42} radius={100} />
          <Skeleton width="100%" height={42} radius={100} />
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .pg-detail-gallery-skel,
          .pg-detail-body-skel {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}

// ── Hero / featured card skeleton (for landing page sections) ──
export function FeaturedCardSkeleton() {
  return (
    <div style={{
      background: "#fff",
      border: "1px solid #E8E4DE",
      borderRadius: 14,
      overflow: "hidden",
    }}>
      <Skeleton width="100%" height={170} radius={0} />
      <div style={{ padding: 14, display: "flex", flexDirection: "column", gap: 8 }}>
        <Skeleton width="70%" height={16} />
        <Skeleton width="40%" height={12} />
        <Skeleton width="55%" height={20} radius={6} style={{ marginTop: 4 }} />
      </div>
    </div>
  );
}

// ── Helper hook to mimic an initial load (drop in until real queries are wired) ──
import { useEffect, useState } from "react";

export function useInitialLoading(ms = 500) {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), ms);
    return () => clearTimeout(t);
  }, [ms]);
  return loading;
}
