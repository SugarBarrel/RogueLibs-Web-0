import styles from "./styles.module.scss";
import clsx from "clsx";

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  size?: "small" | "medium" | "large";
};
export default function Button({ className, size, ...props }: React.PropsWithChildren<ButtonProps>) {
  return <button className={clsx(styles.button, styles[size ?? "small"], className)} {...props} />;
}
