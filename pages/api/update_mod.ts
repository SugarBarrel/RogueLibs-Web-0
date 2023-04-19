import { createServerApi, createServiceServerApi, RestMod } from "@lib/API";
import type { NextApiRequest, NextApiResponse } from "next";
import { collectionDiff, primitiveDiff } from "@lib/index";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const api = createServerApi({ req, res });
  const serviceApi = createServiceServerApi("SERVICE_ROLE_API");

  const mod = req.body as Partial<RestMod>; // TODO: replace with a better type

  const [original, session] = await Promise.all([serviceApi.fetchModById(mod.id!), api.getSupabaseSession()]);

  const myAuthor = original.authors.find(a => a.user_id === session?.user.id);
  if (!myAuthor || !myAuthor.can_edit) {
    let denyAccess = true;

    if (session?.user) {
      const myUser = await api.fetchUserById(session.user.id);
      if (myUser.is_admin) denyAccess = false;
    }

    if (denyAccess) {
      return res.status(403).json({ error: "You're not authorized to edit this mod." });
    }
  }

  // ===== Can't edit these fields
  delete mod.created_at;
  mod.edited_at = new Date().toISOString();

  const modDiff = primitiveDiff(original, mod);
  const authorsDiff = collectionDiff(original.authors, mod.authors!, "user_id");

  // ===== Validate mod authors changes

  if (authorsDiff.hasChanges) {
    if (!myAuthor || myAuthor.is_creator) {
      let creatorCount = 1;

      // TODO: Security Vulnerability: { is_creator: "true" }
      if (authorsDiff.removed.some(a => a.is_creator)) creatorCount--;
      if (authorsDiff.updated.some(a => a.is_creator === false)) creatorCount--;
      creatorCount += authorsDiff.updated.filter(a => a.is_creator === true).length;
      creatorCount += authorsDiff.added.filter(a => a.is_creator).length;

      if (creatorCount !== 1) {
        return res.status(400).json({ error: "There must be exactly one owner of the mod." });
      }
    } else {
      for (const diff of authorsDiff.removed) {
        if (diff.is_creator || diff.can_edit) {
          if (diff.user_id === myAuthor.user_id) continue;
          return res.status(403).json({ error: "You can't grant or revoke creator or editor permissions." });
        }
      }
      for (const diff of authorsDiff.updated) {
        if (diff.is_creator !== undefined || diff.can_edit !== undefined) {
          if (diff.user_id === myAuthor.user_id && !diff.is_creator && !diff.can_edit) continue;
          return res.status(403).json({ error: "You can't grant or revoke creator or editor permissions." });
        }
      }
      for (const diff of authorsDiff.added) {
        if (diff.is_creator || diff.can_edit) {
          return res.status(403).json({ error: "You can't grant or revoke creator or editor permissions." });
        }
      }
    }
  }

  const promises: PromiseLike<any>[] = [];

  // ===== Create and await database requests

  if (modDiff) {
    promises.push(serviceApi.Supabase.from("mods").update([modDiff]).eq("id", mod.id).select());
  }

  if (authorsDiff.removed.length) {
    const removedAuthors = authorsDiff.removed.map(r => r.user_id);
    promises.push(serviceApi.Supabase.from("mod_authors").delete().eq("mod_id", mod.id).in("user_id", removedAuthors));
  }
  if (authorsDiff.added.length) {
    authorsDiff.added.forEach(author => (author.mod_id = mod.id!));
    promises.push(serviceApi.Supabase.from("mod_authors").insert(authorsDiff.added, { defaultToNull: false }));
  }
  if (authorsDiff.updated.length) {
    authorsDiff.updated.forEach(author => (author.mod_id = mod.id));
    promises.push(
      ...authorsDiff.updated.map(author => {
        return serviceApi.Supabase.from("mod_authors")
          .update(author)
          .eq("mod_id", mod.id)
          .eq("user_id", author.user_id);
      }),
    );
  }

  const data = await Promise.all(promises);

  // ===== Return new mod

  const newMod = await serviceApi.fetchModById(mod.id!);

  res.status(200).json(newMod);
}
