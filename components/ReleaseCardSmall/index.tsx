import { Button, Icon, Link } from "@components/Common";
import { RestReleaseWithMod, triggerDownload, useApi } from "@lib/API";
import { DbReleaseFile } from "@lib/Database";
import { useState } from "react";
import styles from "./styles.module.scss";
import { useMod } from "@lib/hooks";

export type ReleaseCardProps = {
  release: RestReleaseWithMod;
};
export default function ReleaseCard({ release }: ReleaseCardProps) {
  const mod = useMod(release.mod_id)[0];
  const modLink = mod ? `/mods/${mod.slug ?? mod.id}` : undefined;

  const api = useApi();
  const [downloading, setDownloading] = useState(false);

  async function download(file: DbReleaseFile) {
    try {
      setDownloading(true);
      const blob = await api.downloadReleaseFile(`${release.id}.${file.filename}`);
      triggerDownload(document, blob!, file.filename);
    } catch (error) {
      console.error(error);
    } finally {
      setTimeout(() => setDownloading(false), 500);
    }
  }

  const singleImportantFile = release.files.filter(f => f.type <= 3).length === 1;
  const mainFile = singleImportantFile && release.files.find(f => f.type <= 3);

  return (
    <div className={styles.container}>
      <Link href={modLink} tabIndex={-1}>
        <div className={styles.window}>
          <img className={styles.banner} src={release.banner_url ?? "/placeholder-10.png"} alt="" />
          <div className={styles.quickbar}>
            {mainFile && (
              <Button className={styles.quickDownload} onClick={e => (e.preventDefault(), download(mainFile))}>
                {"Download"}
              </Button>
            )}
          </div>
        </div>
      </Link>
      <div className={styles.details}>
        <div className={styles.title}>
          <Link href={modLink}>{release.title}</Link>
        </div>
      </div>
    </div>
  );
}
