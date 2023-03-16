import "normalize.css";
import "@styles/global.scss";
import type { AppProps } from "next/app";
import { SupabaseProvider } from "@components/SupabaseProvider";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <SupabaseProvider initialSession={pageProps.initialSession}>
      <Component {...pageProps} />
    </SupabaseProvider>
  );
}
