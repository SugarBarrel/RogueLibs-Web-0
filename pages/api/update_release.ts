import { createServerApi, createServiceServerApi, RestRelease } from "@lib/API";
import type { NextApiRequest, NextApiResponse } from "next";
import { collectionDiff, primitiveDiff } from "@lib/index";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const api = createServerApi({ req, res });
  const serviceApi = createServiceServerApi("SERVICE_ROLE_API");

  const release = req.body as Partial<RestRelease>; // TODO: replace with a better type

  const [original, session] = await Promise.all([serviceApi.fetchReleaseById(release.id!), api.getSupabaseSession()]);

  const myAuthor = original.authors.find(a => a.user_id === session?.user.id);
  if (!myAuthor || !myAuthor.can_edit) {
    let denyAccess = true;

    if (session?.user) {
      const myUser = await api.fetchUserById(session.user.id);
      if (myUser.is_admin) denyAccess = false;
    }

    if (denyAccess) {
      return res.status(403).json({ error: "You're not authorized to edit this release." });
    }
  }

  // ===== Can't edit these fields
  delete release.created_at;
  release.edited_at = new Date().toISOString();
  delete release.mod_id;

  const releaseDiff = primitiveDiff(original, release);
  const filesDiff = collectionDiff(original.files, release.files!, "filename");
  const authorsDiff = collectionDiff(original.authors, release.authors!, "user_id");

  // ===== Validate release authors changes

  if (authorsDiff.hasChanges) {
    if (!myAuthor || myAuthor.is_creator) {
      let creatorCount = 1;

      // TODO: Security Vulnerability: { is_creator: "true" }
      if (authorsDiff.removed.some(a => a.is_creator)) creatorCount--;
      if (authorsDiff.updated.some(a => a.is_creator === false)) creatorCount--;
      creatorCount += authorsDiff.updated.filter(a => a.is_creator === true).length;
      creatorCount += authorsDiff.added.filter(a => a.is_creator).length;

      if (creatorCount !== 1) {
        return res.status(400).json({ error: "There must be exactly one owner of the release." });
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

  if (releaseDiff) {
    promises.push(serviceApi.Supabase.from("releases").update([releaseDiff]).eq("id", release.id).select());
  }

  if (filesDiff.removed.length) {
    const removedFiles = filesDiff.removed.map(r => r.filename);
    promises.push(
      serviceApi.Supabase.from("release_files").delete().eq("release_id", release.id).in("filename", removedFiles),
    );
  }
  const upsertedFiles = filesDiff.updated.concat(filesDiff.added);
  if (upsertedFiles.length) {
    upsertedFiles.forEach(file => (file.release_id = release.id));
    promises.push(serviceApi.Supabase.from("release_files").upsert(upsertedFiles));
  }

  if (authorsDiff.removed.length) {
    const removedAuthors = authorsDiff.removed.map(r => r.user_id);
    promises.push(
      serviceApi.Supabase.from("release_authors").delete().eq("release_id", release.id).in("user_id", removedAuthors),
    );
  }
  const upsertedAuthors = authorsDiff.updated.concat(authorsDiff.added);
  if (upsertedAuthors.length) {
    upsertedAuthors.forEach(author => (author.release_id = release.id));
    promises.push(serviceApi.Supabase.from("release_authors").upsert(upsertedAuthors));
  }

  const data = await Promise.all(promises);

  // ===== Return new release

  const newRelease = await serviceApi.fetchReleaseById(release.id!);

  res.status(200).json(newRelease);
}
