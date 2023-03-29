import "normalize.css";
import "@styles/global.scss";
import type { AppProps } from "next/app";
import { ApiProvider } from "@lib/API";
import { Provider as ReduxStoreProvider } from "react-redux";
import { makeStore } from "@ducks/index";
import { useState } from "react";

export default function App({ Component, pageProps }: AppProps) {
  const [store] = useState(() => makeStore());

  return (
    <ReduxStoreProvider store={store}>
      <ApiProvider initialSession={pageProps.initialSession}>
        <Component {...pageProps} />
      </ApiProvider>
    </ReduxStoreProvider>
  );
}
