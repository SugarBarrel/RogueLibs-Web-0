import styles from "./styles.module.scss";
import clsx from "clsx";

type HTMLButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement>;
export type ButtonProps = Omit<HTMLButtonProps, "type"> & {};
export default function Button({ className, ...props }: React.PropsWithChildren<ButtonProps>) {
  return <button className={clsx(styles.button, className)} {...props} />;
}
