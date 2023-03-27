import { createDraftSafeSelector, SerializedError } from "@reduxjs/toolkit";

export type EntityId = string | number;
export interface Dictionary<T> {
  [id: EntityId]: T | undefined;
}
export type IdSelector<T> = (entity: T) => EntityId;

export type AsyncEntity<T> =
  | { status: "idle"; data?: undefined; error?: undefined }
  | { status: "pending"; data?: undefined; error?: undefined }
  | { status: "success"; data: T; error?: undefined }
  | { status: "error"; data?: undefined; error: SerializedError };

export type AsyncEntityArr<T> =
  | [data: undefined, status: "idle", error: undefined]
  | [data: undefined, status: "pending", error: undefined]
  | [data: T, status: "success", error: undefined]
  | [data: undefined, status: "error", error: SerializedError];

export const idleEntity: AsyncEntity<any> = { status: "idle" };

export interface AsyncEntityState<T> {
  ids: EntityId[];
  entities: Dictionary<AsyncEntity<T>>;
}

export interface AsyncEntityAdapter<T> {
  upsertOne(state: AsyncEntityState<T>, entity: T): void;
  upsertMany(state: AsyncEntityState<T>, entities: readonly T[]): void;

  setPendingOne(state: AsyncEntityState<T>, key: EntityId): void;
  setPendingMany(state: AsyncEntityState<T>, keys: readonly EntityId[]): void;

  setErrorOne(state: AsyncEntityState<T>, key: EntityId, error: SerializedError): void;
  setErrorMany(state: AsyncEntityState<T>, keys: readonly EntityId[], error: SerializedError): void;

  getInitialState(): AsyncEntityState<T>;
  getInitialState<ExtraState extends object>(extra: ExtraState): AsyncEntityState<T> & ExtraState;

  getSelectors(): AsyncEntitySelectors<T, AsyncEntityState<T>>;
  getSelectors<S>(selectState: (state: S) => AsyncEntityState<T>): AsyncEntitySelectors<T, S>;
}

export type AsyncEntityAdapterOptions<T> = T extends { id: EntityId }
  ? { selectId?: IdSelector<T> }
  : { selectId: IdSelector<T> };

export function createAsyncEntityAdapter<T>(options: AsyncEntityAdapterOptions<T>): AsyncEntityAdapter<T>;
export function createAsyncEntityAdapter<T extends { id: EntityId }>(
  options?: AsyncEntityAdapterOptions<T>,
): AsyncEntityAdapter<T>;

export function createAsyncEntityAdapter<T>(options?: AsyncEntityAdapterOptions<T>): AsyncEntityAdapter<T> {
  const selectId = options?.selectId ?? (entity => entity.id);

  function resortIds(state: AsyncEntityState<T>) {
    const sorted = state.ids.slice().sort();
    for (let i = 0; i < sorted.length; i++) {
      if (sorted[i] !== state.ids[i]) {
        state.ids = sorted;
        return;
      }
    }
  }
  function refilterIds(state: AsyncEntityState<T>) {
    const filtered = state.ids.filter(id => id in state.entities);
    if (filtered.length !== state.ids.length) {
      state.ids = filtered;
    }
  }

  function upsertOne(state: AsyncEntityState<T>, entity: T) {
    if (!entity) return;
    const key = selectId(entity);
    if (!(key in state.entities)) {
      state.ids.push(key);
      resortIds(state);
    }
    state.entities[key] = { status: "success", data: entity };
  }
  function upsertMany(state: AsyncEntityState<T>, entities: readonly T[]) {
    let didAppendIds = false;

    for (const entity of entities) {
      if (!entity) continue;
      const key = selectId(entity);
      if (!(key in state.entities)) {
        state.ids.push(key);
        didAppendIds = true;
      }
      state.entities[key] = { status: "success", data: entity };
    }
    if (didAppendIds) {
      resortIds(state);
    }
  }

  function setPendingOne(state: AsyncEntityState<T>, key: EntityId) {
    if (!(key in state.entities)) {
      state.ids.push(key);
      resortIds(state);
    }
    state.entities[key] = { status: "pending" };
  }
  function setPendingMany(state: AsyncEntityState<T>, keys: readonly EntityId[]) {
    let didAppendIds = false;

    for (const key of keys) {
      if (!(key in state.entities)) {
        state.ids.push(key);
        didAppendIds = true;
      }
      state.entities[key] = { status: "pending" };
    }
    if (didAppendIds) {
      resortIds(state);
    }
  }

  function setErrorOne(state: AsyncEntityState<T>, key: EntityId, error: SerializedError) {
    if (!(key in state.entities)) {
      state.ids.push(key);
      resortIds(state);
    }
    state.entities[key] = { status: "error", error };
  }
  function setErrorMany(state: AsyncEntityState<T>, keys: readonly EntityId[], error: SerializedError) {
    let didAppendIds = false;

    for (const key of keys) {
      if (!(key in state.entities)) {
        state.ids.push(key);
        didAppendIds = true;
      }
      state.entities[key] = { status: "error", error };
    }
    if (didAppendIds) {
      resortIds(state);
    }
  }

  function getInitialState(): AsyncEntityState<T>;
  function getInitialState<ExtraState extends object>(extra: ExtraState): AsyncEntityState<T> & ExtraState;
  function getInitialState(extra?: object) {
    return Object.assign({ ids: [], entities: {} }, extra);
  }

  function getSelectors(): AsyncEntitySelectors<T, AsyncEntityState<T>>;
  function getSelectors<S>(selectState: (state: S) => AsyncEntityState<T>): AsyncEntitySelectors<T, S>;
  function getSelectors<S>(selectState?: (state: S) => AsyncEntityState<T>): AsyncEntitySelectors<T, any> {
    const selectIds = (state: AsyncEntityState<T>) => state.ids;
    const selectEntities = (state: AsyncEntityState<T>) => state.entities;

    const selectAll = createDraftSafeSelector(selectIds, selectEntities, (ids, entities) =>
      ids.map(id => entities[id]!),
    );

    const selectId = (_: unknown, id: EntityId) => id;
    const selectById = (entities: Dictionary<AsyncEntity<T>>, id: EntityId | null | undefined) => {
      return entities[id!] ?? idleEntity;
    };

    if (!selectState) {
      return {
        selectIds,
        selectEntities,
        selectAll,
        selectById: createDraftSafeSelector(selectEntities, selectId, selectById),
      };
    }

    const selectGlobalizedEntities = createDraftSafeSelector(selectState, selectEntities);

    return {
      selectIds: createDraftSafeSelector(selectState, selectIds),
      selectEntities: selectGlobalizedEntities,
      selectAll: createDraftSafeSelector(selectState, selectAll),
      selectById: createDraftSafeSelector(selectGlobalizedEntities, selectId, selectById),
    };
  }

  return {
    upsertOne,
    upsertMany,

    setPendingOne,
    setPendingMany,

    setErrorOne,
    setErrorMany,

    getInitialState,
    getSelectors,
  };
}

export interface AsyncEntitySelectors<T, State> {
  selectIds(state: State): EntityId[];
  selectEntities(state: State): Dictionary<AsyncEntity<T>>;
  selectAll(state: State): AsyncEntity<T>[];
  selectById(state: State, key: EntityId | null | undefined): AsyncEntity<T>;
}
