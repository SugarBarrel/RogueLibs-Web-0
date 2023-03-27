import { Icon, Link } from "@components/Common";
import { useMod, useRelease } from "@lib/hooks";
import styles from "./styles.module.scss";

export type ReleaseCardProps = {
  id: number;
};
export default function ReleaseCard({ id }: ReleaseCardProps) {
  const [release] = useRelease(id);
  const [mod] = useMod(release?.mod_id);

  if (!release || !mod) {
    return <div className={styles.container} />;
  }

  const modLink = `/mods/${mod.slug ?? mod.id}`;
  const releaseLink = `${modLink}/${release.slug ?? release.id}`;

  return (
    <div className={styles.container}>
      <Link href={modLink}>
        <div className={styles.window}>
          <img className={styles.banner} src={release.banner_url ?? "/placeholder_10.png"} alt="" />
          <div className={styles.description}>{release.description}</div>
          <div className={styles.quickbar}>{"Download"}</div>
        </div>
      </Link>
      <div className={styles.details}>
        <div className={styles.title}>
          <Link href={modLink}>{release.title}</Link>
        </div>
      </div>
      <div className={styles.stats}>
        <div className={styles.stat}>
          <Icon type="nugget" size={16} />
          {2}
        </div>
        <div className={styles.stat}>
          <Icon type="eye" size={16} />
          {2}
        </div>
      </div>
    </div>
  );
}
