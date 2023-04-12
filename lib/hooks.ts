import { fetchModById, selectModById } from "@ducks/mods";
import { fetchReleaseById, selectReleaseById } from "@ducks/releases";
import { fetchUserById, selectUserById } from "@ducks/users";
import { Selector } from "@reduxjs/toolkit";
import { DependencyList, useCallback, useEffect, useState } from "react";
import { RogueLibsApi, useApi } from "./API";
import { AsyncEntity, AsyncEntityArr } from "./AsyncEntityAdapter";
import { RootState, useRootDispatch, useRootSelector } from "./ducks";
import { produce, Draft } from "immer";

export function useDispatchEntity<T>(
  selector: Selector<RootState, AsyncEntity<T>>,
  actionCreator: (api: RogueLibsApi) => any,
  deps: DependencyList,
) {
  const api = useApi();
  const dispatch = useRootDispatch();
  const entity = useRootSelector(selector);

  useEffect(() => {
    if (entity.status === "idle") {
      // TODO: remove timeout?
      const timeout = setTimeout(() => {
        const action = actionCreator(api);
        if (action) dispatch(action);
      });
      return () => clearTimeout(timeout);
    }
  }, [entity, ...deps]);

  return [entity.data, entity.status, entity.error] as AsyncEntityArr<T>;
}

export function useUser(user_id: string | null | undefined) {
  return useDispatchEntity(
    s => selectUserById(s, user_id),
    api => user_id && fetchUserById({ api, user_id }),
    [user_id],
  );
}
export function useMod(mod_id: number | null | undefined) {
  return useDispatchEntity(
    s => selectModById(s, mod_id),
    api => mod_id && fetchModById({ api, mod_id }),
    [mod_id],
  );
}
export function useRelease(release_id: number | null | undefined) {
  return useDispatchEntity(
    s => selectReleaseById(s, release_id),
    api => release_id && fetchReleaseById({ api, release_id }),
    [release_id],
  );
}

export type ImmerStateSetter<T> = (recipe: (draft: Draft<T>) => void) => void;
export function useImmerState<T>(defaultState: T | (() => T)) {
  const [state, setState] = useState<T>(defaultState);

  const mutateState = useCallback((recipe: (draft: Draft<T>) => void) => {
    setState(current => produce(current, draft => void recipe(draft)));
  }, []);

  return [state, mutateState] as [T, ImmerStateSetter<T>];
}

export function useLocation(): Location | null {
  const [location, setLocation] = useState<Location | null>(null);
  useEffect(() => setLocation(window.location), []);
  return location;
}
