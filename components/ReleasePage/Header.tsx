import { Button, Icon, Link } from "@components/Common";
import { useRootDispatch } from "@ducks/index";
import { setModNugget } from "@ducks/mods";
import { useApi } from "@lib/API";
import { useMod, useUser } from "@lib/hooks";
import { useSession as useSupabaseSession } from "@supabase/auth-helpers-react";
import clsx from "clsx";
import { useState } from "react";
import { Tooltip } from "react-tooltip";
import { useReleasePageContext } from ".";
import styles from "./Header.module.scss";

export default function ReleasePageHeader() {
  const { release } = useReleasePageContext();
  const mod = useMod(release?.mod_id)[0]!; // TODO: add loading indicator

  const api = useApi();
  const dispatch = useRootDispatch();
  const session = useSupabaseSession();
  const [user] = useUser(session?.user.id);

  const myNugget = user?.nuggets?.some(n => n.mod_id === mod.id);
  const [nuggetting, setNuggetting] = useState(false);

  async function toggleNugget() {
    if (!user) return;
    try {
      setNuggetting(true);
      await dispatch(setModNugget({ api, mod_id: mod.id, nugget: !myNugget }));
    } catch (error) {
      console.error(error);
    } finally {
      setNuggetting(false);
    }
  }

  return (
    <>
      <div className={styles.breadcrumbs}>
        <Link className={styles.breadcrumb} href={`/`}>
          Mods
        </Link>
        <span>{" > "}</span>
        <Link className={styles.breadcrumb} href={`/mods/${mod.slug ?? mod.id}`}>
          {release.title}
        </Link>
        <span>{" > "}</span>
        <Link className={styles.breadcrumb} href={`/mods/${mod.slug ?? mod.id}/${release.slug ?? release.id}`}>
          {release.version ? "v" + release.version : release.slug ?? release.id}
        </Link>
      </div>
      <div className={styles.header}>
        <img className={styles.banner} src={release.banner_url ?? "/placeholder.png"} />
        <div className={styles.title}>{release.title}</div>
        <div className={styles.leftQuickbar}>
          {mod.guid && (
            <pre className={styles.guid}>
              <span className={styles.guidLabel}>{"GUID: "}</span>
              <span
                data-tooltip-id="mod-guid"
                className={styles.guidValue}
                onClick={() => navigator.clipboard.writeText(mod.guid!)}
              >
                {mod.guid}
              </span>
            </pre>
          )}
          <Tooltip id="mod-guid" place="right" openOnClick={true} content="Copied!" delayHide={3000} />
        </div>
        <div className={styles.rightQuickbar}>
          <Button
            data-tooltip-id="mod-nugget"
            className={clsx(styles.nuggetButton, myNugget && styles.setNugget)}
            disabled={nuggetting}
            onClick={toggleNugget}
          >
            <Icon type={nuggetting ? "loading" : "nugget"} />
            <span>{mod.nugget_count}</span>
          </Button>
          {!user && (
            <Tooltip
              id="mod-nugget"
              place="left"
              openOnClick={true}
              variant="error"
              content="You must sign in to rate mods!"
              delayHide={3000}
            />
          )}
        </div>
      </div>
    </>
  );
}
