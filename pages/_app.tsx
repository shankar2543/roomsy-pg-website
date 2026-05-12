import type { AppProps } from "next/app";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import { Quicksand } from "next/font/google";
import { initParse } from "@/lib/parseConfig";
import { useAuthStore } from "@/store/useAuthStore";
import "@/styles/globals.css";

const SITE_URL  = "https://pg-website-gamma.vercel.app";
const SITE_NAME = "Roomsy";
const SITE_DESC = "Find verified PGs (Paying Guest accommodations) across India. Compare prices, view photos, check amenities, and book daily or monthly stays — all in one place.";
const OG_IMAGE  = `${SITE_URL}/apple-touch-icon.png`;

initParse();

const quicksandDisplay = Quicksand({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const quicksandBody = Quicksand({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const queryClient = new QueryClient();

export default function App({ Component, pageProps }: AppProps) {
  const restoreSession = useAuthStore((s) => s.restoreSession);
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    restoreSession();
    const handler = () => restoreSession();
    router.events.on("routeChangeComplete", handler);
    const onFocus = () => restoreSession();
    window.addEventListener("focus", onFocus);
    window.addEventListener("storage", onFocus);
    return () => {
      router.events.off("routeChangeComplete", handler);
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("storage", onFocus);
    };
  }, [restoreSession, router.events]);

  return (
    <main className={`${quicksandDisplay.variable} ${quicksandBody.variable}`}>
      <Head>
        {/* Primary */}
        <title>{`${SITE_NAME} — Find Verified PGs Across India`}</title>
        <meta name="description" content={SITE_DESC} />
        <meta name="keywords" content="PG, paying guest, hostel, accommodation, hyderabad, bengaluru, chennai, mumbai, india, room rental, pg booking, monthly stay" />
        <meta name="author" content="Roomsy" />
        <meta name="theme-color" content="#FF385C" />
        <link rel="canonical" href={SITE_URL} />

        {/* OpenGraph (Facebook · WhatsApp · LinkedIn · Slack) */}
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content={SITE_NAME} />
        <meta property="og:title" content={`${SITE_NAME} — Find Verified PGs Across India`} />
        <meta property="og:description" content={SITE_DESC} />
        <meta property="og:url" content={SITE_URL} />
        <meta property="og:image" content={OG_IMAGE} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content="Roomsy — Find Verified PGs Across India" />
        <meta property="og:locale" content="en_IN" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${SITE_NAME} — Find Verified PGs Across India`} />
        <meta name="twitter:description" content={SITE_DESC} />
        <meta name="twitter:image" content={OG_IMAGE} />
        <meta name="twitter:image:alt" content="Roomsy — Find Verified PGs Across India" />

        {/* Mobile / PWA */}
        <meta name="apple-mobile-web-app-title" content={SITE_NAME} />
        <meta name="application-name" content={SITE_NAME} />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />

        {/* Robots */}
        <meta name="robots" content="index, follow, max-image-preview:large" />
      </Head>
      <QueryClientProvider client={queryClient}>
        {mounted ? <Component {...pageProps} /> : null}
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              fontFamily: "var(--font-body)",
              fontSize: "14px",
              borderRadius: "10px",
              border: "1px solid #E8E4DE",
              boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
            },
          }}
        />
      </QueryClientProvider>
    </main>
  );
}
