import { fetchModById, selectModById } from "@ducks/mods";
import { fetchReleaseById, selectReleaseById } from "@ducks/releases";
import { fetchUserById, selectUserById } from "@ducks/users";
import { Selector } from "@reduxjs/toolkit";
import { DependencyList, useCallback, useEffect, useRef, useState } from "react";
import { RogueLibsApi, useApi } from "./API";
import { AsyncEntity, AsyncEntityArr } from "./AsyncEntityAdapter";
import { RootState, useRootDispatch, useRootSelector } from "./ducks";
import { produce, Draft } from "immer";
import lodashThrottle from "lodash/throttle";

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

export type ImmerStateRecipe<T> = (draft: Draft<T>) => T | undefined;
export type ImmerStateSetter<T> = (recipe: ImmerStateRecipe<T>) => void;

export function useImmerState<T>(defaultState: T | (() => T)) {
  const [state, setState] = useState<T>(defaultState);

  const mutateState = useCallback((recipe: (draft: Draft<T>) => void) => {
    setState(current => produce(current, recipe));
  }, []);

  return [state, mutateState] as [T, ImmerStateSetter<T>];
}

export function useImmerSlice<T, Key extends keyof T>(setter: ImmerStateSetter<T>, key: Key): ImmerStateSetter<T[Key]> {
  return useCallback(
    subRecipe =>
      setter(objDraft => {
        const valueDraft = (objDraft as T)[key] as Draft<T[Key]>;
        const recipeResult = subRecipe(valueDraft);
        if (recipeResult !== undefined) {
          (objDraft as T)[key] = recipeResult;
        }
        return void 0;
      }),
    [setter],
  );
}

export function useLocation(): Location | null {
  const [location, setLocation] = useState<Location | null>(null);
  useEffect(() => setLocation(window.location), []);
  return location;
}

export function useThrottle<Func extends Function>(cb: Func, dependencies: [delay: number, ...deps: DependencyList]) {
  const cbRef = useRef(cb);
  const [delay, ...deps] = dependencies;

  const throttledCb = useCallback(
    lodashThrottle((...args) => cbRef.current(...args), delay, { leading: true, trailing: true }),
    [delay],
  );
  useEffect(() => void (cbRef.current = cb));
  useEffect(throttledCb, [throttledCb, ...deps]);
}
