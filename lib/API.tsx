import { createBrowserSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { SessionContextProvider as SupabaseContextProvider } from "@supabase/auth-helpers-react";
import { Session as SupabaseSession, SupabaseClient } from "@supabase/supabase-js";
import { PostgrestFilterBuilder } from "@supabase/postgrest-js";
import { createContext, useContext, useEffect, useState } from "react";
import { DbMod, DbModAuthor, DbRelease, DbReleaseAuthor, DbUser } from "./Database";

const ApiContext = createContext<RogueLibsApi | null>(null);

export type RogueLibsProviderProps = {
  initialSession: SupabaseSession;
};
export function RogueLibsProvider({ initialSession, children }: React.PropsWithChildren<RogueLibsProviderProps>) {
  const [supabaseClient] = useState(() => createBrowserSupabaseClient());
  const [api, setApi] = useState<RogueLibsApi | null>(null);

  useEffect(() => {
    setApi(new RogueLibsApi(supabaseClient));
  }, [supabaseClient]);

  return (
    <SupabaseContextProvider supabaseClient={supabaseClient} initialSession={initialSession}>
      <ApiContext.Provider value={api}>{children}</ApiContext.Provider>
    </SupabaseContextProvider>
  );
}

export function useApi() {
  return useContext(ApiContext);
}

export type RestUser = DbUser;
export type RestModAuthor = DbModAuthor & { user: RestUser };
export type RestMod = DbMod & { authors: RestModAuthor[] };
export type RestReleaseAuthor = DbReleaseAuthor & { user: RestUser };
export type RestRelease = DbRelease & { authors: RestReleaseAuthor[] };

const selectUser = "*";
const selectMod = "*, authors: mod_authors(*, user: users(*))";
const selectRelease = "*, authors: release_authors(*, user: users(*))";

export class RogueLibsApi {
  constructor(public readonly Supabase: SupabaseClient) {}

  private selectOne<TRow extends Record<string, unknown>, TReturn = TRow>(
    tableName: string,
    select: string,
    filter: (builder: PostgrestFilterBuilder<any, TRow, TReturn[]>) => void,
  ) {
    const builder = this.Supabase.from(tableName).select<any, TReturn>(select);
    filter(builder); // eslint-disable-next-line prettier/prettier
    return builder.limit(1).single().throwOnError().then(res => res.data!) as Promise<TReturn>;
  }
  private selectMany<TRow extends Record<string, unknown>, TReturn = TRow>(
    tableName: string,
    select: string,
    filter: (builder: PostgrestFilterBuilder<any, TRow, TReturn[]>) => void,
  ) {
    const builder = this.Supabase.from(tableName).select<any, TReturn>(select);
    filter(builder); // eslint-disable-next-line prettier/prettier
    return builder.throwOnError().then(res => res.data!) as Promise<TReturn[]>;
  }

  public fetchUserById(id: string) {
    return this.selectOne<DbUser, RestUser>("users", selectUser, b => b.eq("id", id));
  }
  public fetchModById(id: number) {
    return this.selectOne<DbMod, RestMod>("mods", selectMod, b => b.eq("id", id));
  }
  public fetchReleaseById(id: number) {
    return this.selectOne<DbRelease, RestRelease>("releases", selectRelease, b => b.eq("id", id));
  }
}
