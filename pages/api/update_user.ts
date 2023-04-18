import { createServerApi, createServiceServerApi, RestUser } from "@lib/API";
import type { NextApiRequest, NextApiResponse } from "next";
import { primitiveDiff } from "@lib/index";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const api = createServerApi({ req, res });
  const serviceApi = createServiceServerApi("SERVICE_ROLE_API");

  const user = req.body as Partial<RestUser>; // TODO: replace with a better type

  const [original, session] = await Promise.all([serviceApi.fetchUserById(user.id!), api.getSupabaseSession()]);

  const canEdit = original.uid === session?.user.id;
  if (!canEdit) {
    let denyAccess = true;

    if (session?.user) {
      const myUser = await api.fetchUserById(session.user.id);
      if (myUser.is_admin) denyAccess = false;
    }

    if (denyAccess) {
      return res.status(403).json({ error: "You're not authorized to edit this profile." });
    }
  }

  // ===== Can't edit these fields
  delete user.created_at;
  user.edited_at = new Date().toISOString();
  delete user.uid;
  delete user.is_admin;

  const userDiff = primitiveDiff(original, user);

  const promises: PromiseLike<any>[] = [];

  // ===== Create and await database requests

  if (userDiff) {
    promises.push(serviceApi.Supabase.from("users").update([userDiff]).eq("id", user.id).select());
  }

  const data = await Promise.all(promises);

  // ===== Return new user

  const newUser = await serviceApi.fetchUserById(user.id!);

  res.status(200).json(newUser);
}
