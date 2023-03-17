import styles from "./styles.module.scss";
import clsx from "clsx";

type HTMLButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement>;
export type ButtonProps = Omit<HTMLButtonProps, "type"> & {
  type?: "normal" | "icon";
  size?: "small" | "medium" | "large";
};
export default function Button({ className, type, size, ...props }: React.PropsWithChildren<ButtonProps>) {
  return <button className={clsx(styles.button, styles[type ?? "normal"], styles[size ?? "small"], className)} {...props} />;
}
