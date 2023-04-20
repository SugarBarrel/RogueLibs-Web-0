import { ChangeEventHandler, KeyboardEventHandler, MouseEventHandler, useCallback, useRef } from "react";
import Icon from "../Icon";
import styles from "./index.module.scss";
import iconButtonStyles from "../IconButton/styles.module.scss";
import clsx from "clsx";

export type CheckboxProps = React.PropsWithChildren<{
  value: boolean;
  onChange?: (newValue: boolean) => void;
  children?: React.ReactNode;
}>;
export default function Checkbox({ value, onChange, children, ...props }: CheckboxProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const inputChange = useCallback<ChangeEventHandler<HTMLInputElement>>(e => onChange?.(e.target.checked), [onChange]);
  const inputKey = useCallback<KeyboardEventHandler>(e => e.key === "Enter" && onChange?.(!value), [value, onChange]);

  const otherClick = useCallback<MouseEventHandler>(() => {
    onChange?.(!value);
    inputRef.current?.focus();
  }, [value, onChange]);

  return (
    <div className={styles.wrapper} {...props}>
      <div className={clsx(iconButtonStyles.iconButton, styles.checkbox)} onClick={otherClick}>
        <input
          type="checkbox"
          ref={inputRef}
          className={styles.input}
          checked={value}
          onChange={inputChange}
          onKeyDown={inputKey}
        />
        <Icon type={value ? "check" : "cross"} className={styles.icon} />
      </div>
      {children && (
        <div className={styles.label} onClick={otherClick}>
          {children}
        </div>
      )}
    </div>
  );
}
