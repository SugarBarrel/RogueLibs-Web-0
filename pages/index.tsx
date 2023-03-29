import ReleaseCard from "@components/ReleaseCard";
import { useRootDispatch } from "@ducks/index";
import { upsertReleases } from "@ducks/releases";
import { RestReleaseWithMod, RogueLibsApi } from "@lib/API";
import { PageProps } from "@lib/index";
import { Head } from "@site/components/Common";
import MainLayout from "@site/components/MainLayout";
import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { GetServerSideProps } from "next";
import { useEffect } from "react";

export interface HomePageProps extends PageProps {
  latestReleases: RestReleaseWithMod[];
}
export default function HomePage({ latestReleases }: HomePageProps) {
  const dispatch = useRootDispatch();

  useEffect(() => {
    dispatch(upsertReleases(latestReleases));
  }, [latestReleases]);

  return (
    <MainLayout>
      <Head path="/" title="RogueLibs Web" description="The mod-sharing platform." />
      <div>RogueLibs website works!</div>
      <div style={{ display: "flex" }}>
        {latestReleases.map(release => {
          return <ReleaseCard release={release} key={release.id} />;
        })}
      </div>
    </MainLayout>
  );
}

export const getServerSideProps: GetServerSideProps<HomePageProps> = async cxt => {
  const supabase = createServerSupabaseClient(cxt);
  const api = new RogueLibsApi(supabase);

  const initialSession = (await supabase.auth.getSession()).data.session;
  const latestReleases = await api.fetchLatestReleases(20);

  return {
    props: {
      initialSession,
      latestReleases,
    },
  };
};
