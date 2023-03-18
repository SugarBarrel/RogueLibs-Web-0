import { createEntityAdapter, createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { DbRelease } from "@lib/Database";
import { ApiArgs, AsyncEntity, RootState, useRootDispatch, useRootSelector } from ".";
import { useApi } from "@lib/API";
import { useEffect } from "react";

export const releasesAdapter = createEntityAdapter<AsyncEntity<DbRelease>>();

export const {
  selectById: selectReleaseById,
  selectEntities: selectReleases,
  selectIds: selectReleaseIds,
} = releasesAdapter.getSelectors<RootState>(s => s.releases);

export const fetchReleaseById = createAsyncThunk("releases/fetchById", ([api, releaseId]: ApiArgs<number>) => {
  return api.fetchReleaseById(releaseId);
});

export const releasesSlice = createSlice({
  name: "releases",
  initialState: releasesAdapter.getInitialState(),
  reducers: {},
  extraReducers: builder =>
    builder
      .addCase(fetchReleaseById.pending, (state, { meta }) => {
        releasesAdapter.setOne(state, { id: meta.arg[1], status: "pending", data: null });
      })
      .addCase(fetchReleaseById.fulfilled, (state, { meta, payload }) => {
        releasesAdapter.setOne(state, { id: meta.arg[1], status: "success", data: payload });
      })
      .addCase(fetchReleaseById.rejected, (state, { meta, error }) => {
        releasesAdapter.setOne(state, { id: meta.arg[1], status: "error", error });
      }),
});

export default releasesSlice.reducer;

export function useRelease(releaseId: number | null | undefined) {
  const api = useApi()!;
  const dispatch = useRootDispatch();
  const data = useRootSelector(s => selectReleaseById(s, releaseId!)) || { id: releaseId!, status: "idle" };

  useEffect(() => {
    if (data.status === "idle" && releaseId) {
      dispatch(fetchReleaseById([api, releaseId]));
    }
  }, [data]);

  return [data.data ?? null, data.status, data.error ?? null] as const;
}
