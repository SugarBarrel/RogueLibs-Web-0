import { RogueLibsApi } from "@lib/API";
import { configureStore, ThunkAction, AnyAction } from "@reduxjs/toolkit";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import usersReducer from "./users";
import modsReducer from "./mods";
import releasesReducer from "./releases";

export const store = configureStore({
  reducer: {
    users: usersReducer,
    mods: modsReducer,
    releases: releasesReducer,
  },
});

export type RootDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type RootThunk<ReturnType = void> = ThunkAction<ReturnType, RootState, unknown, AnyAction>;

export type WithApi<Args extends object> = Args & { api: RogueLibsApi };

export const useRootDispatch: () => RootDispatch = useDispatch;
export const useRootSelector: TypedUseSelectorHook<RootState> = useSelector;

export { fetchUserById } from "./users";
export { fetchModById } from "./mods";
export { fetchReleaseById } from "./releases";
