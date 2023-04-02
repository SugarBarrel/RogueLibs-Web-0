import clsx from "clsx";
import styles from "./styles.module.scss";

type HTMLButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement>;
export type IconButtonProps = Omit<HTMLButtonProps, "type"> & {};
export default function IconButton({ className, ...props }: React.PropsWithChildren<IconButtonProps>) {
  return <button className={clsx(styles.iconButton, className)} {...props} />;
}
