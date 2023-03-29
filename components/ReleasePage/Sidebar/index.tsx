import styles from "./index.module.scss";
import ReleasePageDownload from "./Download";
import ReleasePageAuthors from "./Authors";
import ReleasePageAuthoring from "./Authoring";

export default function ReleasePageSidebar() {
  return (
    <div className={styles.sidebar}>
      <ReleasePageDownload />
      <ReleasePageAuthors />
      <ReleasePageAuthoring />
    </div>
  );
}
