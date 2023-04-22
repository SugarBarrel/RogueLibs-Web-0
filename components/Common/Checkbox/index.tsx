import { ChangeEventHandler, KeyboardEventHandler, MouseEventHandler, useCallback, useRef } from "react";
import Icon from "../Icon";
import styles from "./index.module.scss";
import iconButtonStyles from "../IconButton/styles.module.scss";
import clsx from "clsx";

export type CheckboxProps = React.PropsWithChildren<{
  value: boolean;
  onChange?: (newValue: boolean) => void;
  children?: React.ReactNode;
  checked?: React.ReactNode | ((value: true) => React.ReactNode);
  unchecked?: React.ReactNode | ((value: false) => React.ReactNode);
  disabled?: boolean;
}>;
export default function Checkbox({ value, onChange, children, checked, unchecked, disabled, ...props }: CheckboxProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const inputChange = useCallback<ChangeEventHandler<HTMLInputElement>>(
    e => !disabled && onChange?.(e.target.checked),
    [onChange],
  );
  const inputKey = useCallback<KeyboardEventHandler>(
    e => !disabled && e.key === "Enter" && onChange?.(!value),
    [value, onChange],
  );
  const otherClick = useCallback<MouseEventHandler>(
    () => !disabled && (onChange?.(!value), inputRef.current?.focus()),
    [value, onChange],
  );

  return (
    <div className={clsx(styles.wrapper, disabled && styles.disabled)} {...props}>
      <div
        className={clsx(iconButtonStyles.iconButton, styles.checkbox, disabled && iconButtonStyles.disabled)}
        onClick={otherClick}
      >
        <input
          type="checkbox"
          ref={inputRef}
          className={styles.input}
          checked={value}
          onChange={inputChange}
          onKeyDown={inputKey}
          disabled={disabled}
        />
        {value ? (
          checked !== undefined ? (
            <span className={styles.icon}>{typeof checked === "function" ? checked(true) : checked}</span>
          ) : (
            <Icon type="checkSmall" className={styles.icon} size={16} />
          )
        ) : unchecked !== undefined ? (
          <span className={styles.icon}>{typeof unchecked === "function" ? unchecked(false) : unchecked}</span>
        ) : (
          <Icon type="crossSmall" className={styles.icon} size={16} />
        )}
      </div>
      {children && (
        <div className={styles.label} onClick={otherClick}>
          {children}
        </div>
      )}
    </div>
  );
}
