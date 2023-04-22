import { useUserPageContext } from ".";
import styles from "./Extra.module.scss";

export default function UserPageExtra() {
  const { user, mutateUser, original } = useUserPageContext();

  return <div className={styles.wrapper}></div>;
}
