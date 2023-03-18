import { RogueLibsApi } from "@lib/API";
import { configureStore, ThunkAction, AnyAction, SerializedError, EntityId } from "@reduxjs/toolkit";
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

export type AsyncEntity<T> =
  | { id: EntityId; data?: null; status: "idle"; error?: null }
  | { id: EntityId; data?: null; status: "pending"; error?: null }
  | { id: EntityId; data: T; status: "success"; error?: null }
  | { id: EntityId; data?: null; status: "error"; error: SerializedError };

export type AsyncState = AsyncEntity<any>["status"];

export type ApiArgs<T1 = undefined, T2 = undefined, T3 = undefined> = T1 extends undefined
  ? T2 extends undefined
    ? T3 extends undefined
      ? [api: RogueLibsApi]
      : [api: RogueLibsApi, arg1: T1, arg2: T2, arg3: T3]
    : [api: RogueLibsApi, arg1: T1, arg2: T2]
  : [api: RogueLibsApi, arg: T1];

export const useRootDispatch: () => RootDispatch = useDispatch;
export const useRootSelector: TypedUseSelectorHook<RootState> = useSelector;
