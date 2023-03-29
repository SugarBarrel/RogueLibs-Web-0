import MainLayout from "@components/MainLayout";
import ReleasePage from "@components/ReleasePage";
import { useRootDispatch } from "@ducks/index";
import { upsertMod } from "@ducks/mods";
import { upsertReleases } from "@ducks/releases";
import { RestMod, RestRelease, RogueLibsApi } from "@lib/API";
import { PageProps } from "@lib/index";
import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { GetServerSideProps } from "next";
import { useMemo } from "react";

export interface ModPageProps extends PageProps {
  mod: RestMod;
  releases: RestRelease[];
}
export default function ModPageIndex({ mod, releases }: ModPageProps) {
  const dispatch = useRootDispatch();

  useMemo(() => {
    const clone = (v: any) => JSON.parse(JSON.stringify(v));
    dispatch(upsertMod(clone(mod)));
    dispatch(upsertReleases(clone(releases)));
  }, [mod, releases]);

  return (
    <MainLayout>
      <ReleasePage release={releases[0]} />
    </MainLayout>
  );
}

export const getServerSideProps: GetServerSideProps<ModPageProps> = async cxt => {
  const supabase = createServerSupabaseClient(cxt);
  const api = new RogueLibsApi(supabase);

  const initialSession = (await supabase.auth.getSession()).data.session;

  const { mod_slug } = cxt.query;
  const mod = await api.fetchModBySlug(mod_slug as string);
  const releases = await api.fetchReleasesByModId(mod.id);

  return {
    props: {
      initialSession,
      mod,
      releases,
      // initialState: {
      //   releases,
      //   mods: [mod],
      // },
    },
  };
};
