import type { AppProps } from "next/app";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import { AnimatePresence } from "framer-motion";
import { Fraunces, DM_Sans } from "next/font/google";
import { initParse } from "@/lib/parseConfig";
import { useAuthStore } from "@/store/useAuthStore";
import SplashScreen from "@/components/common/SplashScreen";
import "@/styles/globals.css";

initParse();

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const queryClient = new QueryClient();

export default function App({ Component, pageProps }: AppProps) {
  const restoreSession = useAuthStore((s) => s.restoreSession);
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [showSplash, setShowSplash] = useState(true);

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
    <main className={`${fraunces.variable} ${dmSans.variable}`}>
      <QueryClientProvider client={queryClient}>
        <AnimatePresence mode="wait">
          {mounted && showSplash && (
            <SplashScreen key="splash" onComplete={() => setShowSplash(false)} />
          )}
        </AnimatePresence>
        {mounted ? <Component {...pageProps} /> : null}
        <Toaster
          position="top-right"
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
