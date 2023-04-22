import { Head } from "@components/Common";
import MainLayout from "@components/MainLayout";
import ReleasePage from "@components/ReleasePage";
import { createServerApi, RestReleaseWithMod } from "@lib/API";
import { useMod } from "@lib/hooks";
import { GSSPC, GSSPR, PageProps } from "@lib/index";

export interface ReleasePageProps extends PageProps {
  release: RestReleaseWithMod;
}
export default function ReleasePageIndex({ release }: ReleasePageProps) {
  const mod = useMod(release.mod_id)[0]!;

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
      <ReleasePage key={release.id} release={release} />
    </MainLayout>
  );
}

export async function getServerSideProps(
  cxt: GSSPC<{ mod_slug: string; release_slug: string }>,
): Promise<GSSPR<ReleasePageProps>> {
  const api = createServerApi(cxt);

  const { mod_slug, release_slug } = cxt.params!;

  const [session, release] = await Promise.all([
    api.getSupabaseSession(),
    api.fetchReleaseBySlug(mod_slug, release_slug).catch(() => null),
  ]);

  if (!release) return { notFound: true };

  if (
    (release.mod.slug !== null && release.mod.slug !== mod_slug) ||
    (release.slug !== null && release.slug !== release_slug)
  ) {
    return {
      redirect: {
        destination: `/mods/${release.mod.slug ?? release.mod_id}/${release.slug ?? release.id}`,
        permanent: false,
      },
    };
  }

  return {
    props: {
      release,
      initialState: {
        session,
        releases: [release],
      },
    },
  };
}
