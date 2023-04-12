import NextLink from "next/link";
import styles from "./styles.module.scss";
import clsx, { ClassValue } from "clsx";

export type LinkProps = {
  href?: string;
  className?: string;
  underline?: boolean;
  title?: string;
  onClick?: React.MouseEventHandler;
  blank?: boolean;
};
function Link({ children, href, className, underline = true, title, onClick, blank }: React.PropsWithChildren<LinkProps>) {
  if (typeof children === "string") children = <span>{children}</span>;

  if (blank === undefined) {
    blank = href?.startsWith("http");
  }

  return href ? (
    <NextLink
      href={href}
      className={clsx(styles.link, underline && styles.underline, className)}
      title={title}
      onClick={e => e.stopPropagation()}
      target={blank ? "_blank" : undefined}
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
