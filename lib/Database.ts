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
  slug: string | null; // = null { length [3;32]; regex /^[a-z0-9\._-]+$/i; doesn't match UUID pattern }
  created_at: string; // = now()
  edited_at: string | null; // = null
  username: string; // { length [1;64] }
  discord_id: string | null; // = null { regex /^\d{1,20}$/ }
  avatar_url: string | null; // = null { length [1;255] }
};

export type DbMod = {
  id: number; // PK
  created_at: string; // = now()
  edited_at: string | null; // = null
  guid: string | null; // = null { length [1;255] }
  slug: string | null; // = null { length [3;32]; regex /^[a-z0-9\._-]+$/i; doesn't match regex /^\d+$/ }
  is_public: boolean; // = false
  is_verified: boolean; // = false
  title: string; // { length [1;50] }
  description: string; // { length [0;4000] }
  nugget_count: number; // = 0
};
export type DbModAuthor = {
  mod_id: number; // PK, FK: DbMod
  user_id: string; // PK, FK: DbUser
  is_creator: boolean; // = false
  can_see: boolean; // = true
  can_edit: boolean; // = false
  credit: string | null; // = null { length [1;128] }
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
  version: string | null; // = null { length [1;32]; regex semver }
  slug: string | null; // = null { length [1;32]; regex /^[a-z0-9\._-]+$/i; doesn't match regex /^\d+$/ }
  is_public: boolean; // = false
  title: string; // { length [1;50] }
  description: string; // { length [0;4000] }
  banner_url: string | null; // = null { length [1;255] }
};
export type DbReleaseAuthor = {
  release_id: number; // PK, FK: DbRelease
  user_id: string; // PK, FK: DbUser
  is_creator: boolean; // = false
  can_see: boolean; // = true
  can_edit: boolean; // = false
  credit: string | null; // = null { length [1;128] }
  order: number; // = 0
};
export type DbReleaseFile = {
  release_id: number; // PK, FK: DbRelease
  filename: string; // PK { length [1;64] }
  type: DbReleaseFileType; // = 0 = Unknown { one of the DbReleaseFileType values }
  order: number; // = 0
  title: string | null; // = null { length [1;64] }
  tooltip: string | null; // = null { length [1;128] }
};
export enum DbReleaseFileType {
  // don't forget to update column constraints when adding/removing values!
  Unknown,
  Plugin,
  PatcherPlugin,
  CorePlugin,
  SpritePack,
  Documentation,
  Extra,
}

export type DbReleaseDependency = {
  release_id: number; // PK, FK: DbRelease
  dependency_id: number; // PK, FK: DbMod
  version: string | null; // = null { length [1;32] }
};
