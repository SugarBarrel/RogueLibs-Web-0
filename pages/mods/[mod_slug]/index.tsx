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
  const release = releases[0] as RestRelease | undefined;

  return (
    <MainLayout>
      <Head
        path={`/mods/${mod.slug ?? mod.id}`}
        title={mod.title}
        description={mod.description}
        image={release?.banner_url}
        noindex={!mod.is_public}
        type="article"
      />
      {release ? (
        <ReleasePage key={mod.id} release={release} />
      ) : (
        <div>{"You can't see any of this mod's releases :("}</div>
      )}
    </MainLayout>
  );
}

export async function getServerSideProps(cxt: GSSPC<{ mod_slug: string }>): Promise<GSSPR<ModPageProps>> {
  const api = createServerApi(cxt);

  const { mod_slug } = cxt.params!;

  const [session, mod, releases] = await Promise.all([
    api.getSupabaseSession(),
    api.fetchModBySlug(mod_slug).catch(() => null),
    api.fetchReleasesByModSlug(mod_slug).catch(() => []),
  ]);

  if (!mod) return { notFound: true };

  if (mod.slug !== null && mod.slug !== mod_slug) {
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
