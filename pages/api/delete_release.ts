import { createServerApi, createServiceServerApi } from "@lib/API";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const api = createServerApi({ req, res });
  const serviceApi = createServiceServerApi("SERVICE_ROLE_API");

  const body = req.body as { release_id: number };

  const session = await api.getSupabaseSession();
  const [original, myUser] = await Promise.all([
    serviceApi.fetchReleaseById(body.release_id!).catch(() => null),
    session?.user.id ? api.fetchUserById(session.user.id).catch(() => null) : null,
  ]);

  const myAuthor = original?.authors.find(a => a.user_id === myUser?.id);
  if (!original || !(myAuthor?.can_edit || myUser?.is_admin)) {
    return res.status(403).json({ error: "You're not authorized to delete this release." });
  }

  await serviceApi.Supabase.from("releases").delete().eq("id", body.release_id);

  res.status(200).json({ success: "Release deleted" });
}
