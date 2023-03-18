import { createEntityAdapter, createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { DbMod } from "@lib/Database";
import { ApiArgs, AsyncEntity } from ".";

export const modsAdapter = createEntityAdapter<AsyncEntity<DbMod>>();

export const fetchModById = createAsyncThunk("mods/fetchById", ([api, modId]: ApiArgs<number>) => {
  return api.fetchModById(modId);
});

export const modsSlice = createSlice({
  name: "mods",
  initialState: modsAdapter.getInitialState(),
  reducers: {},
  extraReducers: builder =>
    builder
      .addCase(fetchModById.pending, (state, { meta }) => {
        modsAdapter.setOne(state, { id: meta.arg[1], status: "pending", data: null });
      })
      .addCase(fetchModById.fulfilled, (state, { meta, payload }) => {
        modsAdapter.setOne(state, { id: meta.arg[1], status: "success", data: payload });
      })
      .addCase(fetchModById.rejected, (state, { meta, error }) => {
        modsAdapter.setOne(state, { id: meta.arg[1], status: "error", error });
      }),
});

export default modsSlice.reducer;
