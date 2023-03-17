export type DbUser = {
  id: string; // PK, FK: auth.users
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
};
export type DbModAuthor = {
  mod_id: number; // FK: DbMod
  user_id: number; // FK: DbUser
  is_creator: boolean; // = false
  can_see: boolean; // = true
  can_edit: boolean; // = false
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
  release_id: number; // FK: DbRelease
  user_id: number; // FK: DbUser
  is_creator: boolean; // = false
  can_see: boolean; // = true
  can_edit: boolean; // = false
};
