import { Head } from "@components/Common";
import MainLayout from "@components/MainLayout";
import ReleasePage from "@components/ReleasePage";
import { createServerApi, RestMod, RestRelease } from "@lib/API";
import { GSSPC, GSSPR, PageProps } from "@lib/index";

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

export async function getServerSideProps(cxt: GSSPC<{ mod_slug: string }>): Promise<GSSPR<ModPageProps>> {
  const api = createServerApi(cxt);

  const { mod_slug } = cxt.params!;

  const [session, mod, releases] = await Promise.all([
    api.getSupabaseSession(),
    api.fetchModBySlug(mod_slug),
    api.fetchReleasesByModSlug(mod_slug),
  ]);

  if (mod.slug && !Number.isNaN(+mod_slug)) {
    return {
      redirect: { destination: `/mods/${mod.slug}`, permanent: false },
    };
  }

  return {
    props: {
      mod,
      releases,
      initialState: {
        session,
        releases,
        mods: [mod],
      },
    },
  };
}
