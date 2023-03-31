import { DbMod, DbModAuthor } from "@lib/Database";
import { RestMod, RestReleaseWithMod } from "@lib/API";
import { createAsyncEntityAdapter } from "@lib/AsyncEntityAdapter";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { fetchReleaseById, RootState, WithApi } from ".";
import { extract, extractAll } from "..";
import { upsertRelease, upsertReleases } from "./releases";

export type StoreMod = DbMod & { authors: DbModAuthor[] };

export const modsAdapter = createAsyncEntityAdapter<StoreMod>();

export const {
  selectIds: selectModIds,
  selectEntities: selectModEntities,
  selectAll: selectMods,
  selectById: selectModById,
} = modsAdapter.getSelectors((s: RootState) => s.mods);

export const fetchModById = createAsyncThunk<RestMod, WithApi<{ mod_id: number }>>(
  "mods/fetchById",
  ({ api, mod_id }) => api.fetchModById(mod_id),
  {
    condition: ({ mod_id }, { getState }): boolean => {
      const state = getState() as RootState;
      return selectModById(state, mod_id).status !== "pending";
    },
  },
);
export const setModNugget = createAsyncThunk<number, WithApi<{ mod_id: number; nugget: boolean }>>(
  "mods/setNugget",
  ({ api, mod_id, nugget }) => api.setNugget(mod_id, nugget),
);

export const modsSlice = createSlice({
  name: "mods",
  initialState: modsAdapter.getInitialState(),
  reducers: {
    upsertOne(state, { payload }: PayloadAction<RestMod>) {
      modsAdapter.upsertOne(state, payload);
    },
    upsertMany(state, { payload }: PayloadAction<RestMod[]>) {
      modsAdapter.upsertMany(state, payload);
    },
  },
  extraReducers: builder =>
    builder
      .addCase(fetchModById.pending, (state, { meta: { arg } }) => {
        modsAdapter.setPendingOne(state, arg.mod_id);
      })
      .addCase(fetchModById.rejected, (state, { meta: { arg }, error }) => {
        modsAdapter.setErrorOne(state, arg.mod_id, error);
      })
      .addCase(fetchModById.fulfilled, (state, { payload }) => {
        modsAdapter.upsertOne(state, payload);
      })

      .addCase(upsertRelease, (state, { payload }) => {
        if ("mod" in payload) {
          modsAdapter.upsertOne(state, extract(payload as RestReleaseWithMod, "mod"));
        }
      })
      .addCase(upsertReleases, (state, { payload }) => {
        if ("mod" in payload[0]) {
          modsAdapter.upsertMany(state, extractAll(payload as RestReleaseWithMod[], "mod"));
        }
      })

      .addCase(fetchReleaseById.fulfilled, (state, { payload }) => {
        modsAdapter.upsertOne(state, extract(payload, "mod"));
      })

      .addCase(setModNugget.fulfilled, (state, { meta: { arg }, payload }) => {
        modsAdapter.updateOne(state, arg.mod_id, m => (m.nugget_count = payload));
      }),
});

export const { upsertOne: upsertMod, upsertMany: upsertMods } = modsSlice.actions;

export default modsSlice.reducer;
