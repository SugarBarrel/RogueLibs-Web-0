import clsx from "clsx";
import styles from "./index.module.scss";

export type SeparatorProps = {
  vertical?: boolean;
  primary?: boolean;
  thin?: boolean;
  bold?: boolean;
  full?: boolean;
};
export default function Separator({ primary, thin, bold, full, vertical, ...props }: SeparatorProps) {
  return (
    <div
      className={clsx(
        styles.separator,
        primary && styles.primary,
        thin && styles.thin,
        bold && styles.bold,
        full && styles.full,
        vertical ? styles.vertical : styles.horizontal,
      )}
      {...props}
    />
  );
}
