import { DbRelease, DbReleaseAuthor, DbReleaseDependency, DbReleaseFile } from "@lib/Database";
import { RestRelease, RestReleaseWithMod } from "@lib/API";
import { createAsyncEntityAdapter } from "@lib/AsyncEntityAdapter";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState, WithApi } from ".";

export type StoreRelease = DbRelease & {
  authors: DbReleaseAuthor[];
  files: DbReleaseFile[];
  dependencies: DbReleaseDependency[];
};

export const releasesAdapter = createAsyncEntityAdapter<StoreRelease>();

export const {
  selectIds: selectReleaseIds,
  selectEntities: selectReleaseEntities,
  selectAll: selectReleases,
  selectById: selectReleaseById,
} = releasesAdapter.getSelectors((s: RootState) => s.releases);

export const fetchReleaseById = createAsyncThunk<RestReleaseWithMod, WithApi<{ release_id: number }>>(
  "releases/fetchById",
  ({ api, release_id }) => api.fetchReleaseById(release_id),
  {
    condition: ({ release_id }, { getState }): boolean => {
      const state = getState() as RootState;
      return selectReleaseById(state, release_id).status !== "pending";
    },
  },
);

export const releasesSlice = createSlice({
  name: "releases",
  initialState: releasesAdapter.getInitialState(),
  reducers: {
    upsertOne(state, { payload }: PayloadAction<RestRelease>) {
      releasesAdapter.upsertOne(state, payload);
    },
    upsertMany(state, { payload }: PayloadAction<RestRelease[]>) {
      releasesAdapter.upsertMany(state, payload);
    },
  },
  extraReducers: builder =>
    builder
      .addCase(fetchReleaseById.pending, (state, { meta: { arg } }) => {
        releasesAdapter.setPendingOne(state, arg.release_id);
      })
      .addCase(fetchReleaseById.rejected, (state, { meta: { arg }, error }) => {
        releasesAdapter.setErrorOne(state, arg.release_id, error);
      })
      .addCase(fetchReleaseById.fulfilled, (state, { payload }) => {
        releasesAdapter.upsertOne(state, payload);
      }),
});

export const { upsertOne: upsertRelease, upsertMany: upsertReleases } = releasesSlice.actions;

export default releasesSlice.reducer;
