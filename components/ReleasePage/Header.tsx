import { Link } from "@components/Common";
import { useMod } from "@lib/hooks";
import { Tooltip } from "react-tooltip";
import { useReleasePageContext } from ".";
import styles from "./Header.module.scss";

export default function ReleasePageHeader() {
  const { release } = useReleasePageContext();
  const mod = useMod(release?.mod_id)[0]!; // TODO: add loading indicator

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
        <div className={styles.rightQuickbar}>{"Nuggets"}</div>
      </div>
    </>
  );
}
