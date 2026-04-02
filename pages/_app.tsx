import type { AppProps } from "next/app";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import CmsLayout from "../components/CmsLayout";
import "../styles/globals.css";

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const [isRouteLoading, setIsRouteLoading] = useState(false);
  const isCmsRoute = router.pathname.startsWith("/cms");

  useEffect(() => {
    const handleRouteStart = (url: string, { shallow }: { shallow: boolean }) => {
      if (shallow || url === router.asPath) {
        return;
      }

      setIsRouteLoading(true);
    };

    const handleRouteDone = () => {
      setIsRouteLoading(false);
    };

    router.events.on("routeChangeStart", handleRouteStart);
    router.events.on("routeChangeComplete", handleRouteDone);
    router.events.on("routeChangeError", handleRouteDone);

    return () => {
      router.events.off("routeChangeStart", handleRouteStart);
      router.events.off("routeChangeComplete", handleRouteDone);
      router.events.off("routeChangeError", handleRouteDone);
    };
  }, [router]);

  const content = isCmsRoute ? (
    <CmsLayout>
      <Component {...pageProps} />
    </CmsLayout>
  ) : (
    <Component {...pageProps} />
  );

  return (
    <>
      {content}
      <div
        className={`route-loader ${isRouteLoading ? "is-visible" : ""}`}
        role="status"
        aria-live="polite"
        aria-hidden={!isRouteLoading}
      >
        <div className="route-loader-backdrop"></div>
        <div className="route-loader-panel">
          <div className="route-loader-spinner" aria-hidden="true">
            <span></span>
            <span></span>
            <span></span>
          </div>
          <p className="route-loader-text">Učitavanje stranice...</p>
        </div>
      </div>
    </>
  );
}
