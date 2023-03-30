import "normalize.css";
import "@styles/global.scss";
import "react-tooltip/dist/react-tooltip.css";
import type { AppProps } from "next/app";
import { ApiProvider } from "@lib/API";
import { Provider as ReduxStoreProvider } from "react-redux";
import { makeStore, RootStore } from "@ducks/index";
import { useState, useMemo, useEffect } from "react";
import { PageProps } from "@lib/index";
import { upsertMods } from "@ducks/mods";
import { upsertUsers } from "@ducks/users";
import { upsertReleases } from "@ducks/releases";

export default function App({ Component, pageProps }: AppProps) {
  const [store] = useState(() => makeStore());

  useMemo(() => initializeStore(store, pageProps, true), [pageProps]);
  useEffect(() => initializeStore(store, pageProps), [pageProps]);

  return (
    <ReduxStoreProvider store={store}>
      <ApiProvider initialSession={pageProps.initialSession}>
        <Component {...pageProps} />
      </ApiProvider>
    </ReduxStoreProvider>
  );
}

const didHydrateKey = "__APP_ROOT_STORE_HYDRATED" as const;

function initializeStore(store: RootStore, props: PageProps, immediate?: boolean) {
  const didHydrate = didHydrateKey in store;

  // Only the first useMemo hydrates the store.
  // The first useEffect sets [didHydrateKey] and returns.
  // The subsequent hydrations are handled from useEffect.
  if (immediate) {
    if (didHydrate) return;
  } else if (!didHydrate) {
    Object.assign(store, { [didHydrateKey]: true });
    return;
  }

  const initialState = props.initialState;
  if (initialState) {
    const state = clone(initialState);
    console.info("HYDRATE", clone(state), Boolean(immediate));
    const dispatch = store.dispatch;

    state.users && dispatch(upsertUsers(state.users));
    state.mods && dispatch(upsertMods(state.mods));
    state.releases && dispatch(upsertReleases(state.releases));
  }
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}
