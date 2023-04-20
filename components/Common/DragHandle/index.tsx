import styles from "./index.module.scss";

export default function DragHandle({ ...props }) {
  return <div className={styles.dragHandle} {...props} />;
}
