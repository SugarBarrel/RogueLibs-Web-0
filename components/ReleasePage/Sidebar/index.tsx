import styles from "./index.module.scss";
import ReleasePageDownload from "./Download";
import ReleasePageAuthors from "./Authors";
import ReleasePageDetails from "./Details";

export default function ReleasePageSidebar() {
  return (
    <div className={styles.sidebar}>
      <ReleasePageDetails />
      <ReleasePageDownload />
      <ReleasePageAuthors />
    </div>
  );
}
