import clsx from "clsx";
import Icon, { IconProps } from "../Icon";
import styles from "./styles.module.scss";

type BaseProps = {
  className?: string;
  style?: React.CSSProperties;
  disabled?: boolean | "fake";
  onClick?: React.MouseEventHandler;
};
type ChildlessIconButtonProps = BaseProps & IconProps;
type ChildfulIconButtonProps = React.PropsWithChildren<BaseProps>;

export type IconButtonProps = ChildlessIconButtonProps | ChildfulIconButtonProps;

export default function IconButton({ className, style, disabled, onClick, ...props }: IconButtonProps) {
  const children = (props as ChildfulIconButtonProps).children;
  const childless = props as ChildlessIconButtonProps;

  const extraProps = {} as any;
  if ("data-tooltip-id" in props) {
    extraProps["data-tooltip-id"] = props["data-tooltip-id"];
    delete props["data-tooltip-id"];
  }

  className = clsx(styles.iconButton, disabled === "fake" && styles.disabled, className);

  return (
    <button className={className} style={style} disabled={disabled === true} onClick={onClick} {...extraProps}>
      {children || <Icon alpha={childless.alpha ?? 0.5} {...childless} />}
    </button>
  );
}
