import { useUserPageContext } from ".";
import styles from "./Details.module.scss";

export default function UserPageDetails() {
  const { user } = useUserPageContext();

  return (
    <div className={styles.wrapper}>
      <div className={styles.section}>
        {user.username}
      </div>
      <div className={styles.section}></div>
      <div className={styles.section}></div>
    </div>
  );
}
