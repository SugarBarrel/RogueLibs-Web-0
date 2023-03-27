import "normalize.css";
import "@styles/global.scss";
import type { AppProps } from "next/app";
import { ApiProvider } from "@lib/API";
import { Provider as ReduxStoreProvider } from "react-redux";
import { store } from "@ducks/index";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ReduxStoreProvider store={store}>
      <ApiProvider initialSession={pageProps.initialSession}>
        <Component {...pageProps} />
      </ApiProvider>
    </ReduxStoreProvider>
  );
}
