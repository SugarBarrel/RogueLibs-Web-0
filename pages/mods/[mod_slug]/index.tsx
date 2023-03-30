import { Head } from "@components/Common";
import MainLayout from "@components/MainLayout";
import ReleasePage from "@components/ReleasePage";
import { RestMod, RestRelease, RogueLibsApi } from "@lib/API";
import { PageProps } from "@lib/index";
import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { GetServerSideProps } from "next";

export interface ModPageProps extends PageProps {
  mod: RestMod;
  releases: RestRelease[];
}
export default function ModPageIndex({ mod, releases }: ModPageProps) {
  const release = releases[0];

  return (
    <MainLayout>
      <Head
        path={`/mods/${mod.slug ?? mod.id}/${release.slug ?? release.id}`}
        title={release.title}
        description={release.description}
        image={release.banner_url}
        noindex={!mod.is_public || !release.is_public}
        type="article"
      />
      <ReleasePage release={release} />
    </MainLayout>
  );
}

export const getServerSideProps: GetServerSideProps<ModPageProps> = async cxt => {
  const supabase = createServerSupabaseClient(cxt);
  const api = new RogueLibsApi(supabase);

  const mod_slug = cxt.query.mod_slug as string;

  const [initialSession, mod, releases] = await Promise.all([
    supabase.auth.getSession().then(res => res.data.session),
    api.fetchModBySlug(mod_slug),
    api.fetchReleasesByModSlug(mod_slug),
  ]);

  return {
    props: {
      initialSession,
      mod,
      releases,
      initialState: {
        releases,
        mods: [mod],
      },
    },
  };
};
