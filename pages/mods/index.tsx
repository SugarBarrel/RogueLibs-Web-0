import ReleaseCard from "@components/ReleaseCard";
import ReleaseCardSmall from "@components/ReleaseCardSmall";
import { Button, Icon, IconButton } from "@components/Common";
import { createServerApi, RestReleaseWithMod } from "@lib/API";
import { GSSPC, GSSPR, PageProps } from "@lib/index";
import { Head } from "@site/components/Common";
import MainLayout from "@site/components/MainLayout";
import styles from "./index.module.scss";
import { useState } from "react";

export interface HomePageProps extends PageProps {
  latestReleases: RestReleaseWithMod[];
}
export default function HomePage({ latestReleases }: HomePageProps) {
  const [current, setCurrent] = useState<ViewType>("card");
  return (
    <MainLayout>
      <Head path="/mods" title="RogueLibs Web" description="The mod-sharing platform." />
      {/* <div>RogueLibs website works!</div> */}
      <div className={styles.wrapper}>
        <div>
          {current === "card" ? (
            <div className={styles.cardContainer}>
              {latestReleases.map(release => {
                return <ReleaseCard release={release} key={release.id} />;
              })}
            </div>
          ) : current === "row" ? (
            <div className={styles.rowContainer}>
              {latestReleases.map(release => {
                return <ReleaseCard release={release} key={release.id} />;
              })}
            </div>
          ) : current === "card_small" ? (
            <div className={styles.cardSmallContainer}>
              {latestReleases.map(release => {
                return <ReleaseCardSmall release={release} key={release.id} />;
              })}
            </div>
          ) : (
            <div className={styles.rowSmallContainer}>
              {latestReleases.map(release => {
                return <ReleaseCardSmall release={release} key={release.id} />;
              })}
            </div>
          )}
        </div>
        <ToggleGroup value={current} onChange={setCurrent} />
      </div>
    </MainLayout>
  );
}

type ViewType = "row" | "card" | "card_small" | "row_small";

type ToggleGroupProps = {
  value: ViewType;
  onChange: (newValue: ViewType) => void;
};

export function ToggleGroup({ value, onChange }: ToggleGroupProps) {
  return (
    <div className={styles.buttons}>
      <IconButton type="view_row_small" size={16} onClick={() => onChange("row_small")} />
      <IconButton type="view_row" size={16} onClick={() => onChange("row")} />
      <IconButton type="view_card_small" size={16} onClick={() => onChange("card_small")} />
      <IconButton type="view_card" size={16} onClick={() => onChange("card")} />
    </div>
  );
}

export async function getServerSideProps(cxt: GSSPC): Promise<GSSPR<HomePageProps>> {
  const api = createServerApi(cxt);

  const [session, latestReleases] = await Promise.all([api.getSupabaseSession(), api.fetchLatestReleases(100, true)]);

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
