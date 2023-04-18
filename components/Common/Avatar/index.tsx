import Link from "../Link";
import styles from "./index.module.scss";

export type AvatarProps = {
  src: string | null | undefined;
  size?: string | number;
  href?: string;
  blank?: boolean;
};
export default function Avatar({ src, size, href, blank, children, ...props }: React.PropsWithChildren<AvatarProps>) {
  size ??= 64;

  const avatar = (
    <div className={styles.wrapper} style={{ width: size }} {...props}>
      <img className={styles.avatar} src={src ?? undefined} width={size} alt="" />
      {children && <div className={styles.overlay}>{children}</div>}
      {(!!children || href) && <div className={styles.overlayBackdrop} />}
    </div>
  );

  return href ? (
    <Link href={href} blank={blank} className={styles.linkWrapper} style={{ width: size }} underline={false}>
      {avatar}
    </Link>
  ) : (
    avatar
  );
}
