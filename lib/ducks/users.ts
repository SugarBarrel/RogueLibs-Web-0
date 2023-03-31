import { DbUser } from "@lib/Database";
import { RestUser } from "@lib/API";
import { createAsyncEntityAdapter } from "@lib/AsyncEntityAdapter";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { fetchModById, fetchReleaseById, RootState, WithApi } from ".";
import { extractAll } from "..";
import { setModNugget, upsertMod, upsertMods } from "./mods";
import { upsertRelease, upsertReleases } from "./releases";

export type StoreUser = DbUser & { nuggets?: { mod_id: number }[] };

export const usersAdapter = createAsyncEntityAdapter<StoreUser>();

export const {
  selectIds: selectUserIds,
  selectEntities: selectUserEntities,
  selectAll: selectUsers,
  selectById: selectUserById,
} = usersAdapter.getSelectors((s: RootState) => s.users);

export const fetchUserById = createAsyncThunk<RestUser, WithApi<{ user_id: string }>>(
  "users/fetchById",
  ({ api, user_id }) => api.fetchUserById(user_id),
  {
    condition: ({ user_id }, { getState }): boolean => {
      const state = getState() as RootState;
      return selectUserById(state, user_id).status !== "pending";
    },
  },
);

export const usersSlice = createSlice({
  name: "users",
  initialState: usersAdapter.getInitialState({
    current_user_id: null as string | null,
  }),
  reducers: {
    upsertOne(state, { payload }: PayloadAction<RestUser>) {
      usersAdapter.upsertOne(state, payload);
    },
    upsertMany(state, { payload }: PayloadAction<RestUser[]>) {
      usersAdapter.upsertMany(state, payload);
    },
    setCurrentUser(state, { payload }: PayloadAction<string | null>) {
      state.current_user_id = payload;
    },
  },
  extraReducers: builder =>
    builder
      .addCase(fetchUserById.pending, (state, { meta: { arg } }) => {
        usersAdapter.setPendingOne(state, arg.user_id);
      })
      .addCase(fetchUserById.rejected, (state, { meta: { arg }, error }) => {
        usersAdapter.setErrorOne(state, arg.user_id, error);
      })
      .addCase(fetchUserById.fulfilled, (state, { payload }) => {
        usersAdapter.upsertOne(state, payload);
      })

      .addCase(upsertMod, (state, { payload }) => {
        usersAdapter.upsertMany(state, extractAll(payload.authors, "user"));
      })
      .addCase(upsertMods, (state, { payload }) => {
        const authors = payload.flatMap(m => m.authors);
        usersAdapter.upsertMany(state, extractAll(authors, "user"));
      })
      .addCase(upsertRelease, (state, { payload }) => {
        usersAdapter.upsertMany(state, extractAll(payload.authors, "user"));
      })
      .addCase(upsertReleases, (state, { payload }) => {
        const authors = payload.flatMap(m => m.authors);
        usersAdapter.upsertMany(state, extractAll(authors, "user"));
      })

      .addCase(fetchModById.fulfilled, (state, { payload }) => {
        usersAdapter.upsertMany(state, extractAll(payload.authors, "user"));
      })
      .addCase(fetchReleaseById.fulfilled, (state, { payload }) => {
        usersAdapter.upsertMany(state, extractAll(payload.authors, "user"));
      })

      .addCase(setModNugget.fulfilled, (state, { meta: { arg } }) => {
        usersAdapter.updateOne(state, state.current_user_id!, user => {
          user.nuggets = user.nuggets?.filter(n => n.mod_id !== arg.mod_id) ?? [];
          if (arg.nugget) user.nuggets.push({ mod_id: arg.mod_id });
        });
      }),
});

export const { upsertOne: upsertUser, upsertMany: upsertUsers, setCurrentUser } = usersSlice.actions;

export default usersSlice.reducer;
