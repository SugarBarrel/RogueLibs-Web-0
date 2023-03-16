import { UrlObject } from "url";
import NextLink from "next/link";
import styles from "./styles.module.scss";
import clsx, { ClassValue } from "clsx";

export type LinkProps = {
  href?: string | UrlObject;
  className?: string;
  underline?: boolean;
  title?: string;
  onClick?: React.MouseEventHandler;
};
function Link({ children, href, className, underline = true, title, onClick }: React.PropsWithChildren<LinkProps>) {
  if (typeof children === "string") children = <span>{children}</span>;

  return href ? (
    <NextLink
      href={href}
      className={clsx(styles.link, underline && styles.underline, className)}
      title={title}
      onClick={e => e.stopPropagation()}
    >
      {children}
    </NextLink>
  ) : (
    <span className={clsx(styles.link, underline && styles.underline, className)} title={title} onClick={onClick}>
      {children}
    </span>
  );
}
namespace Link {
  export function GetStyle(underline = true, ...classNames: ClassValue[]) {
    return clsx(styles.link, underline && styles.underline, ...classNames);
  }
}
export default Link;
