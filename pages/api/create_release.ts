import { createServerApi, createServiceServerApi } from "@lib/API";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const api = createServerApi({ req, res });
  const serviceApi = createServiceServerApi("SERVICE_ROLE_API");
  const body = req.body as { mod_id: number };

  const session = await api.getSupabaseSession();
  if (!session?.user.id) {
    return res.status(403).json({ error: "You're not authorized to create releases of this mod." });
  }
  const [original, myUser] = await Promise.all([
    serviceApi.fetchModById(body.mod_id).catch(() => null),
    session?.user.id ? api.fetchUserById(session.user.id).catch(() => null) : null,
  ]);

  const myAuthor = original?.authors.find(a => a.user_id === myUser?.id);
  if (!original || !myUser || !(myAuthor?.can_edit || myUser?.is_admin)) {
    return res.status(403).json({ error: "You're not authorized to edit this mod." });
  }

  const releaseRes = await serviceApi.Supabase.from("releases")
    .insert({ mod_id: body.mod_id, title: "New Release", description: "" })
    .select();
  const release_id = releaseRes.data![0].id as number;

  const authorsRes = await serviceApi.Supabase.from("release_authors")
    .insert(
      original.authors.map(a => {
        return {
          release_id,
          user_id: a.user_id,
          is_creator: a.is_creator,
          can_edit: a.can_edit,
          can_see: a.can_see,
        };
      }),
    )
    .select();

  // ===== Return new mod

  const newRelease = await serviceApi.fetchReleaseById(release_id);

  res.status(200).json(newRelease);
}
