import { StoreRelease } from "@ducks/releases";
import styles from "./index.module.scss";
import clsx from "clsx";
import { Icon, Link } from "@components/Common";
import { useMod } from "@lib/hooks";

export type ReleasesListProps = {
  releases: StoreRelease[];
  blank?: boolean;
};
export default function ReleasesList({ releases, blank }: ReleasesListProps) {
  return (
    <div className={styles.container}>
      {releases.map(release => (
        <ReleaseItem release={release} blank={blank} key={release.id} />
      ))}
    </div>
  );
}

export type ReleaseItemProps = {
  release: StoreRelease;
  blank?: boolean;
};
export function ReleaseItem({ release, blank }: ReleaseItemProps) {
  const mod = useMod(release.mod_id)[0];
  const version = release.version ? "v" + release.version : "ID " + release.id;
  const releaseLink = mod ? `/mods/${mod.slug ?? mod.id}/${release.slug ?? release.id}` : undefined;

  return (
    <Link href={releaseLink} underline={false} blank={blank}>
      <div className={styles.release}>
        <div className={clsx(styles.info, styles.slug)}>
          {!release.is_public && <Icon type="visibilityOff" size={32} />}
          <span>{"/" + (release.slug ?? release.id)}</span>
        </div>
        <div className={clsx(styles.info, styles.banner)}>
          <img src={release.banner_url ?? "/placeholder-10.png"} alt="" />
        </div>
        <div className={clsx(styles.info, styles.general)}>
          <span>
            {release.title} ({version})
          </span>
          <div className={styles.description}>{release.description}</div>
        </div>
        <div className={clsx(styles.info, styles.metadata)}>
          <span>
            {release.files.length} {release.files.length !== 1 ? "files" : "file"}
          </span>
          <span>
            {release.authors.length} {release.authors.length !== 1 ? "authors" : "author"}
          </span>
        </div>
      </div>
    </Link>
  );
}
