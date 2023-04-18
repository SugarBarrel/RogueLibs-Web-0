import { createBrowserSupabaseClient, createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { SessionContextProvider as SupabaseProvider } from "@supabase/auth-helpers-react";
import { createClient, Session as SupabaseSession, SupabaseClient } from "@supabase/supabase-js";
import { PostgrestFilterBuilder } from "@supabase/postgrest-js";
import { createContext, useContext, useMemo, useState } from "react";
import { DbMod, DbModAuthor, DbRelease, DbReleaseAuthor, DbReleaseDependency, DbReleaseFile, DbUser } from "./Database";
import { GetServerSidePropsContext, NextApiRequest, NextApiResponse } from "next";
import { BadgeName } from "@ducks/badges";

const ApiContext = createContext<RogueLibsApi | null>(null);

export type ApiProviderProps = {
  initialSession: SupabaseSession;
};
export function ApiProvider({ initialSession, children }: React.PropsWithChildren<ApiProviderProps>) {
  const [supabaseClient] = useState(() => createBrowserSupabaseClient());
  const api = useMemo(() => new RogueLibsApi(supabaseClient), [supabaseClient]);

  return (
    <SupabaseProvider supabaseClient={supabaseClient} initialSession={initialSession}>
      <ApiContext.Provider value={api}>{children}</ApiContext.Provider>
    </SupabaseProvider>
  );
}

export function useApi() {
  return useContext(ApiContext)!;
}
export function createServerApi(cxt: GetServerSidePropsContext | { req: NextApiRequest; res: NextApiResponse }) {
  const supabase = createServerSupabaseClient(cxt);
  return new RogueLibsApi(supabase);
}
export function createServiceServerApi(service: "SERVICE_ROLE_API") {
  if (service !== "SERVICE_ROLE_API") return null!;
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_KEY!);
  return new RogueLibsApi(supabase);
}

const selectUser = `
  *,
  nuggets: mod_nuggets(mod_id),
  badges: user_badges(badge_name)
`;
const selectMod = `
  *,
  authors: mod_authors(*, user: users(${selectUser}))
`;
const selectRelease = `
  *,
  authors: release_authors(*, user: users(${selectUser})),
  files: release_files(*),
  dependencies: release_dependencies(*, mod: mods(*))
`;
const selectReleaseWithMod = `
  ${selectRelease},
  mod: mods!releases_mod_id_fkey!inner(${selectMod})
`;

export type RestUser = DbUser & { nuggets: { mod_id: number }[]; badges: { badge_name: BadgeName }[] };
export type RestMod = DbMod & { authors: RestModAuthor[] };
export type RestModAuthor = DbModAuthor & { user: RestUser };

export type RestRelease = DbRelease & {
  authors: RestReleaseAuthor[];
  files: RestReleaseFile[];
  dependencies: RestReleaseDependency[];
};
export type RestReleaseWithMod = RestRelease & { mod: RestMod };
export type RestReleaseAuthor = DbReleaseAuthor & { user: RestUser };
export type RestReleaseFile = DbReleaseFile;
export type RestReleaseDependency = DbReleaseDependency;

export type UserSearchResult = DbUser & { similarity: number };

export class RogueLibsApi {
  public constructor(public readonly Supabase: SupabaseClient) {}

  private selectOne<Row extends Record<string, unknown>, Return extends Row>(
    tableName: string,
    select: string,
    filter: (builder: PostgrestFilterBuilder<any, Row, Return[]>) => void,
  ) {
    const builder = this.Supabase.from(tableName).select<any, Return>(select);
    filter(builder);
    return builder
      .limit(1)
      .single()
      .throwOnError()
      .then(res => res.data!) as Promise<Return>;
  }
  private selectMany<Row extends Record<string, unknown>, Return extends Row>(
    tableName: string,
    select: string,
    filter: (builder: PostgrestFilterBuilder<any, Row, Return[]>) => void,
    limit?: number | [start: number, end: number],
  ) {
    const builder = this.Supabase.from(tableName).select<any, Return>(select);
    filter(builder);
    if (typeof limit === "number") {
      builder.limit(limit);
    } else if (Array.isArray(limit)) {
      builder.range(...limit);
    }
    return builder.throwOnError().then(res => res.data) as Promise<Return[]>;
  }
  private rpc<Return>(functionName: string, args: object, abort?: AbortSignal) {
    const builder = this.Supabase.rpc(functionName, args);
    if (abort) builder.abortSignal(abort);
    return builder.throwOnError().then(res => res.data) as Promise<Return>;
  }

  public async getSupabaseSession() {
    return (await this.Supabase.auth.getSession()).data.session;
  }

  public fetchUserById(id: string) {
    return this.selectOne<DbUser, RestUser>("users", selectUser, b => b.eq("id", id));
  }
  public fetchUserBySlug(user_slug: string) {
    if (/^[\da-f]{8}-([\da-f]{4}-){3}[\da-f]{12}$/i.test(user_slug)) {
      return this.fetchUserById(user_slug);
    }
    return this.selectOne<DbUser, RestUser>("users", selectUser, b => b.eq("slug", user_slug));
  }
  public searchUsers(term: string, max_count: number, abort?: AbortSignal) {
    return this.rpc<UserSearchResult[]>("search_users", { _term: term, _limit: max_count }, abort);
  }

  public fetchModById(id: number) {
    return this.selectOne<DbMod, RestMod>("mods", selectMod, b => b.eq("id", id));
  }
  public fetchModBySlug(slug: string) {
    if (/^\d+$/.test(slug)) return this.fetchModById(+slug);
    return this.selectOne<DbMod, RestMod>("mods", selectMod, b => b.eq("slug", slug));
  }

  public setNugget(mod_id: number, nugget: boolean) {
    return this.rpc<number>("set_mod_nugget", { _mod_id: mod_id, _nugget: nugget });
  }

  public fetchReleaseById(id: number, withMod: boolean): Promise<RestRelease>;
  public fetchReleaseById(id: number, withMod?: true): Promise<RestReleaseWithMod>;
  public fetchReleaseById(id: number, withMod = true): Promise<RestRelease> {
    const select = withMod ? selectReleaseWithMod : selectRelease;
    return this.selectOne<DbRelease, RestRelease>("releases", select, b => b.eq("id", id));
  }

  public fetchReleaseBySlug(mod_slug: string, slug: string) {
    if (/^\d+$/.test(slug)) return this.fetchReleaseById(+slug, true);
    return this.selectOne<DbRelease, RestReleaseWithMod>("releases", selectReleaseWithMod, b => {
      return b.eq(/^\d+$/.test(mod_slug) ? "mod_id" : "mod.slug", mod_slug).eq("slug", slug);
    });
  }

  public fetchLatestReleases(count: number): Promise<RestReleaseWithMod[]> {
    return this.selectMany<DbRelease, RestReleaseWithMod>("latest_releases", selectReleaseWithMod, b => b, count);
  }
  public fetchReleasesByModId(mod_id: number) {
    return this.selectMany<DbRelease, RestRelease>("releases", selectRelease, b => b.eq("mod_id", mod_id));
  }
  public fetchReleasesByModSlug(mod_slug: string) {
    if (/^\d+$/.test(mod_slug)) return this.fetchReleasesByModId(+mod_slug);
    return this.selectMany<DbRelease, RestRelease>("releases", selectReleaseWithMod, b => b.eq("mod.slug", mod_slug));
  }

  // public getReleaseFileDownloadUrl(filename: string) {
  //   return this.Supabase.storage.from("release-files").getPublicUrl(filename).data.publicUrl;
  // }
  public async downloadReleaseFile(filename: string) {
    const res = await this.Supabase.storage.from("public/release-files").download(filename);
    return res.data;
  }
}

export function triggerDownload(document: Document, data: Blob | string, filename: string) {
  const url = typeof data === "string" ? data : URL.createObjectURL(data);

  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  link.target = "_blank";

  document.body.appendChild(link);
  link.click();
  link.parentNode!.removeChild(link);
}
