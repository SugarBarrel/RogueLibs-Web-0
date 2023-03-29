import { useState } from "react";
import { Button, Icon } from "@components/Common";
import { triggerDownload, useApi } from "@lib/API";
import { useReleasePageContext } from "..";
import styles from "./Download.module.scss";

export default function ReleasePageDownload() {
  const { release } = useReleasePageContext();
  const api = useApi();

  const [loadingFile, setLoadingFile] = useState<string | null>(null);

  const files = release.files.slice().sort((a, b) => a.order - b.order);

  async function download(filename: string) {
    setLoadingFile(filename);
    const blob = await api.downloadReleaseFile(`${release.mod_id}.${release.id}.${filename}`);
    triggerDownload(document, blob!, filename);
    setTimeout(() => setLoadingFile(null), 500);
  }

  return (
    <div className={styles.container}>
      <label>{files.length === 1 ? "Download" : "Downloads"}</label>
      {files.map(f => {
        const loading = loadingFile == f.filename;
        let title = f.title || f.filename;

        const className =
          f.type === 0
            ? styles.downloadMain
            : f.type === 1
            ? styles.downloadDocumentation
            : f.type === 2
            ? styles.downloadText
            : "";

        return (
          <div key={f.filename} className={styles.download}>
            <Button className={className} onClick={() => download(f.filename)}>
              <Icon type={loading ? "loading" : "download"} size={24} />
              {title}
            </Button>
            {f.tooltip && <div className={styles.tooltip}>{f.tooltip}</div>}
          </div>
        );
      })}
    </div>
  );
}
