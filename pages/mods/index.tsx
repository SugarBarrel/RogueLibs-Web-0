import ReleaseCard from "@components/ReleaseCard";
import { createServerApi, RestReleaseWithMod } from "@lib/API";
import { GSSPC, GSSPR, PageProps } from "@lib/index";
import { Head } from "@site/components/Common";
import MainLayout from "@site/components/MainLayout";
import styles from "./index.module.scss";

export interface HomePageProps extends PageProps {
  latestReleases: RestReleaseWithMod[];
}
export default function HomePage({ latestReleases }: HomePageProps) {
  return (
    <MainLayout>
      <Head path="/mods" title="RogueLibs Web" description="The mod-sharing platform." />
      {/* <div>RogueLibs website works!</div> */}
      <div className={styles.wrapper}>
        {latestReleases.map(release => {
          return <ReleaseCard release={release} key={release.id} />;
        })}
      </div>
    </MainLayout>
  );
}

export async function getServerSideProps(cxt: GSSPC): Promise<GSSPR<HomePageProps>> {
  const api = createServerApi(cxt);

  const [session, latestReleases] = await Promise.all([api.getSupabaseSession(), api.fetchLatestReleases(50)]);

  return {
    props: {
      latestReleases,
      initialState: {
        session,
        releases: latestReleases,
      },
    },
  };
}
