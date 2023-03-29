import { RogueLibsApi } from "@lib/API";
import { configureStore, ThunkAction, AnyAction } from "@reduxjs/toolkit";
import { TypedUseSelectorHook, useDispatch, useSelector, useStore } from "react-redux";
import usersReducer from "./users";
import modsReducer from "./mods";
import releasesReducer from "./releases";

export function makeStore() {
  return configureStore({
    reducer: {
      users: usersReducer,
      mods: modsReducer,
      releases: releasesReducer,
    },
  });
}

export type RootStore = ReturnType<typeof makeStore>;
export type RootDispatch = RootStore["dispatch"];
export type RootState = ReturnType<RootStore["getState"]>;
export type RootThunk<ReturnType = void> = ThunkAction<ReturnType, RootState, unknown, AnyAction>;

export type WithApi<Args extends object> = Args & { api: RogueLibsApi };

export const useRootStore: () => RootStore = useStore;
export const useRootDispatch: () => RootDispatch = useDispatch;
export const useRootSelector: TypedUseSelectorHook<RootState> = useSelector;

export { fetchUserById } from "./users";
export { fetchModById } from "./mods";
export { fetchReleaseById } from "./releases";
