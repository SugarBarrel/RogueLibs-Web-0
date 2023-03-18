import { createEntityAdapter, createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { DbUser } from "@lib/Database";
import { ApiArgs, AsyncEntity, RootState, useRootDispatch, useRootSelector } from ".";
import { fetchModById } from "./mods";
import { fetchReleaseById } from "./releases";
import { useApi } from "@lib/API";
import { useEffect } from "react";

export const usersAdapter = createEntityAdapter<AsyncEntity<DbUser>>();

export const {
  selectById: selectUserById,
  selectEntities: selectUsers,
  selectIds: selectUserIds,
} = usersAdapter.getSelectors<RootState>(s => s.users);

export const fetchUserById = createAsyncThunk("users/fetchById", ([api, userId]: ApiArgs<string>) => {
  return api.fetchUserById(userId);
});

export const usersSlice = createSlice({
  name: "users",
  initialState: usersAdapter.getInitialState(),
  reducers: {},
  extraReducers: builder =>
    builder
      .addCase(fetchUserById.pending, (state, { meta }) => {
        usersAdapter.setOne(state, { id: meta.arg[1], status: "pending", data: null });
      })
      .addCase(fetchUserById.fulfilled, (state, { meta, payload }) => {
        usersAdapter.setOne(state, { id: meta.arg[1], status: "success", data: payload });
      })
      .addCase(fetchUserById.rejected, (state, { meta, error }) => {
        usersAdapter.setOne(state, { id: meta.arg[1], status: "error", error });
      })
      .addCase(fetchModById.fulfilled, (state, { payload }) => {
        payload.authors.forEach(author => {
          usersAdapter.setOne(state, { id: author.user.id, status: "success", data: author.user });
          delete (author as any).user;
        });
      })
      .addCase(fetchReleaseById.fulfilled, (state, { payload }) => {
        payload.authors.forEach(author => {
          usersAdapter.setOne(state, { id: author.user.id, status: "success", data: author.user });
          delete (author as any).user;
        });
      }),
});

export default usersSlice.reducer;

export function useUser(userId: string | null | undefined) {
  const api = useApi()!;
  const dispatch = useRootDispatch();
  const data = useRootSelector(s => selectUserById(s, userId!)) || { id: userId!, status: "idle" };

  useEffect(() => {
    if (data.status === "idle" && userId) {
      dispatch(fetchUserById([api, userId]));
    }
  }, [data]);

  return [data.data ?? null, data.status, data.error ?? null] as const;
}
