import { createBrowserSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { SessionContextProvider as SupabaseProvider } from "@supabase/auth-helpers-react";
import { Session as SupabaseSession, SupabaseClient } from "@supabase/supabase-js";
import { PostgrestFilterBuilder } from "@supabase/postgrest-js";
import { createContext, useContext, useMemo, useState } from "react";
import { DbMod, DbModAuthor, DbRelease, DbReleaseAuthor, DbReleaseFile, DbUser } from "./Database";

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

const selectUser = "*";
const selectMod = "*, authors: mod_authors(*, user: users(*))";
const selectRelease = "*, authors: release_authors(*, user: users(*)), files: release_files(*)";
const selectReleaseWithMod = `${selectRelease}, mod: mods!inner(${selectMod})`;

export type RestUser = DbUser;
export type RestMod = DbMod & { authors: RestModAuthor[] };
export type RestModAuthor = DbModAuthor & { user: RestUser };

export type RestRelease = DbRelease & { authors: RestReleaseAuthor[]; files: RestReleaseFile[] };
export type RestReleaseWithMod = RestRelease & { mod: RestMod };
export type RestReleaseAuthor = DbReleaseAuthor & { user: RestUser };
export type RestReleaseFile = DbReleaseFile;

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

  public fetchUserById(id: string) {
    return this.selectOne<DbUser, RestUser>("users", selectUser, b => b.eq("id", id));
  }
  public fetchModById(id: number) {
    return this.selectOne<DbMod, RestMod>("mods", selectMod, b => b.eq("id", id));
  }
  public fetchModBySlug(slug: string) {
    if (!Number.isNaN(+slug)) return this.fetchModById(+slug);
    return this.selectOne<DbMod, RestMod>("mods", selectMod, b => b.eq("slug", slug));
  }

  public fetchReleaseById(id: number, withMod: boolean): Promise<RestRelease>;
  public fetchReleaseById(id: number, withMod?: true): Promise<RestReleaseWithMod>;
  public fetchReleaseById(id: number, withMod = true): Promise<RestRelease> {
    const select = withMod ? selectReleaseWithMod : selectRelease;
    return this.selectOne<DbRelease, RestRelease>("releases", select, b => b.eq("id", id));
  }

  public fetchReleaseBySlug(mod_slug: string, slug: string, withMod: boolean): Promise<RestRelease>;
  public fetchReleaseBySlug(mod_slug: string, slug: string, withMod?: true): Promise<RestReleaseWithMod>;
  public fetchReleaseBySlug(mod_slug: string, slug: string, withMod = true) {
    if (!Number.isNaN(+slug)) return this.fetchReleaseById(+slug, withMod);
    const select = withMod ? selectReleaseWithMod : selectRelease;
    return this.selectOne<DbRelease, RestRelease>("releases", select, b => {
      return b.eq(Number.isNaN(+mod_slug) ? "mod.slug" : "mod_id", mod_slug).eq("slug", slug);
    });
  }

  public fetchLatestReleases(count: number): Promise<RestReleaseWithMod[]> {
    return this.selectMany<DbRelease, RestReleaseWithMod>("latest_releases", selectReleaseWithMod, b => b, count);
  }
  public fetchReleasesByModId(mod_id: number) {
    return this.selectMany<DbRelease, RestRelease>("releases", selectRelease, b => b.eq("mod_id", mod_id));
  }
  public fetchReleasesByModSlug(mod_slug: string) {
    if (!Number.isNaN(+mod_slug)) return this.fetchReleasesByModId(+mod_slug);
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
