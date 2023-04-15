import clsx from "clsx";
import Icon, { IconProps } from "../Icon";
import styles from "./styles.module.scss";

type BaseProps = {
  className?: string;
  style?: React.CSSProperties;
  disabled?: boolean;
};
type ChildlessIconButtonProps = BaseProps & IconProps;
type ChildfulIconButtonProps = React.PropsWithChildren<BaseProps>;

export type IconButtonProps = ChildlessIconButtonProps | ChildfulIconButtonProps;

export default function IconButton({ className, style, disabled, ...props }: IconButtonProps) {
  const children = (props as ChildfulIconButtonProps).children;
  const childless = props as ChildlessIconButtonProps;

  return (
    <button className={clsx(styles.iconButton, className)} style={style} disabled={disabled}>
      {children || <Icon alpha={childless.alpha ?? 0.5} {...childless} />}
    </button>
  );
}
