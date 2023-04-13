import clsx from "clsx";
import { ChangeEventHandler, MouseEventHandler, useCallback, useRef } from "react";
import styles from "./index.module.scss";

export type TextInputProps = {
  value: string | null | undefined;
  placeholder?: string | null | undefined;
  onChange?: (newValue: string) => void;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  autoTrimEnd?: boolean;
  error?: boolean | string | null | undefined;
};
export default function TextInput({
  value,
  placeholder,
  onChange,
  prefix,
  suffix,
  autoTrimEnd,
  error,
}: TextInputProps) {
  const inputOnChange = useCallback<ChangeEventHandler<HTMLInputElement>>(e => onChange?.(e.target.value), [onChange]);

  const inputOnBlur = useCallback<ChangeEventHandler<HTMLInputElement>>(
    e => {
      if (autoTrimEnd === false) return;
      const value = e.target.value;
      const trimmed = value.trimEnd();
      trimmed.length !== value.length && onChange?.(trimmed);
    },
    [autoTrimEnd, onChange],
  );

  const inputRef = useRef<HTMLInputElement>(null);

  const containerOnClick = useCallback<MouseEventHandler>(e => {
    if (e.target === inputRef.current) return;
    e.preventDefault();
    inputRef.current?.focus();
  }, []);

  return (
    <div className={styles.wrapper}>
      <div className={clsx(styles.container, !!error && styles.error)} onClick={containerOnClick}>
        {prefix && <span className={styles.prefix}>{prefix}</span>}
        <input
          ref={inputRef}
          className={styles.input}
          value={value ?? ""}
          placeholder={placeholder ?? ""}
          onChange={inputOnChange}
          onBlur={inputOnBlur}
        />
        {suffix && <span className={styles.suffix}>{suffix}</span>}
      </div>
      {error !== undefined && <div className={styles.errorField}>{error}</div>}
    </div>
  );
}
