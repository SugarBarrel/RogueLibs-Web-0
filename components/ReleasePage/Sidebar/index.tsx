import styles from "./index.module.scss";
import ReleasePageDownload from "./Download";
import ReleasePageAuthors from "./Authors";

export default function ReleasePageSidebar() {
  return (
    <div className={styles.sidebar}>
      <ReleasePageDownload />
      <ReleasePageAuthors />
    </div>
  );
}
