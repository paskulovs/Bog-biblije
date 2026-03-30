import type { AppProps } from "next/app";
import { useRouter } from "next/router";
import CmsLayout from "../components/CmsLayout";
import "../styles/globals.css";

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const isCmsRoute = router.pathname.startsWith("/cms");

  if (isCmsRoute) {
    return (
      <CmsLayout>
        <Component {...pageProps} />
      </CmsLayout>
    );
  }

  return <Component {...pageProps} />;
}
