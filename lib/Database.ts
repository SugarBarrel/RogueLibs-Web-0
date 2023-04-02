export type Database = {
  // Tables
  users: DbUser[];
  mods: DbMod[];
  releases: DbRelease[];
  mod_authors: DbModAuthor[];
  mod_nuggets: DbModNugget[];
  release_authors: DbReleaseAuthor[];
  release_files: DbReleaseFile[];
  release_dependencies: DbReleaseDependency[];

  // Views
  latest_releases: DbRelease[];
};
export default Database;

export type DbUser = {
  id: string; // PK
  uid: string; // FK: auth.users
  created_at: string; // = now()
  edited_at: string | null; // = null
  username: string;
  discord_id: string | null; // = null
  avatar_url: string | null; // = null
};

export type DbMod = {
  id: number; // PK
  created_at: string; // = now()
  edited_at: string | null; // = null
  guid: string | null; // = null
  slug: string | null; // = null
  is_public: boolean; // = false
  is_verified: boolean; // = false
  title: string;
  description: string;
  nugget_count: number; // = 0
};
export type DbModAuthor = {
  mod_id: number; // PK, FK: DbMod
  user_id: string; // PK, FK: DbUser
  is_creator: boolean; // = false
  can_see: boolean; // = true
  can_edit: boolean; // = false
  credit: string | null; // = null
  order: number; // = 0
};
export type DbModNugget = {
  mod_id: number; // PK, FK: DbMod
  user_id: number; // PK, FK: DbUser
};

export type DbRelease = {
  id: number; // PK
  mod_id: number; // FK: DbMod
  created_at: string; // = now()
  edited_at: string | null; // = null
  version: string | null; // = null
  slug: string | null; // = null
  is_public: boolean; // = false
  title: string;
  description: string;
  banner_url: string | null; // = null
};
export type DbReleaseAuthor = {
  release_id: number; // PK, FK: DbRelease
  user_id: string; // PK, FK: DbUser
  is_creator: boolean; // = false
  can_see: boolean; // = true
  can_edit: boolean; // = false
  credit: string | null; // = null
  order: number; // = 0
};
export type DbReleaseFile = {
  release_id: number; // PK, FK: DbRelease
  filename: string; // PK
  type: DbReleaseFileType; // = Unknown
  order: number; // = 0
  title: string | null; // = null
  tooltip: string | null; // = null
};
export enum DbReleaseFileType {
  Unknown,
  Plugin,
  Patcher,
  Extra,
}
export type DbReleaseDependency = {
  release_id: number; // PK, FK: DbRelease
  dependency_id: number; // PK, FK: DbMod
  version: string | null; // = null
};
