import { createServerApi, createServiceServerApi } from "@lib/API";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const api = createServerApi({ req, res });
  const serviceApi = createServiceServerApi("SERVICE_ROLE_API");

  const session = await api.getSupabaseSession();
  if (!session?.user.id) {
    return res.status(403).json({ error: "You're not authorized to create mods." });
  }

  const modRes = await serviceApi.Supabase.from("mods").insert({ title: "New Mod", description: "" }).select();
  const mod_id = modRes.data![0].id as number;

  const newModAuthor = { mod_id, user_id: session.user.id, is_creator: true, can_edit: true, can_see: true };
  await serviceApi.Supabase.from("mod_authors").insert(newModAuthor).select();

  // ===== Return new mod

  const newMod = await serviceApi.fetchModById(mod_id);

  res.status(200).json(newMod);
}
