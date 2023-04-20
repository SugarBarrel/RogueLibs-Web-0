import NextLink from "next/link";
import styles from "./styles.module.scss";
import clsx, { ClassValue } from "clsx";

export type LinkProps = {
  href?: string;
  className?: string;
  style?: React.CSSProperties;
  underline?: boolean;
  title?: string;
  onClick?: React.MouseEventHandler;
  blank?: boolean;
  block?: boolean;
  tabIndex?: number;
};
function Link({
  children,
  href,
  className,
  style,
  underline = true,
  title,
  onClick,
  blank,
  block,
  tabIndex,
  ...props
}: React.PropsWithChildren<LinkProps>) {
  if (typeof children === "string" || typeof children === "number") {
    children = <span>{children}</span>;
  }

  if (blank === undefined) {
    blank = href?.startsWith("http");
  }

  className = clsx(styles.link, underline && styles.underline, block && styles.blockSpan, className);

  return href ? (
    <NextLink
      href={href}
      className={className}
      style={style}
      title={title}
      onClick={e => e.stopPropagation()}
      target={blank ? "_blank" : undefined}
      tabIndex={tabIndex}
      {...props}
    >
      {children}
    </NextLink>
  ) : (
    <span className={className} style={style} title={title} onClick={onClick} {...props}>
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
