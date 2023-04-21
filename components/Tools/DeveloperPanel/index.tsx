import { useState } from "react";
import { Sprite } from "@components/Common";
import MD5 from "crypto-js/md5";
import styles from "./index.module.scss";
import clsx from "clsx";

export type DeveloperPanelProps = {};

export default function DeveloperPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [unlocked, setUnlocked] = useState(false);

  function onUnlock() {
    setUnlocked(true);
    setTimeout(() => setIsOpen(false), 2000);
  }

  return (
    <div className={styles.panelWrapper}>
      <div className={clsx(styles.panel, isOpen && styles.isOpen)}>
        <div className={styles.toggle} onClick={() => setIsOpen(!isOpen)}>
          <Sprite className={styles.toggleArrow} src="/res/devPanelArrow.png" width={12} height={24} crisp />
        </div>
        <KeypadLock unlocked={unlocked} onUnlock={onUnlock} />
        <div style={{ display: "none" }}>
          <input type="checkbox" checked={false} onChange={() => {}} />
          <span style={{ marginLeft: "8px" }}>{"is_admin"}</span>
        </div>
        {/* <div style={{ height: "2rem", width: "10rem", backgroundColor: "var(--color-background)" }} /> */}
      </div>
    </div>
  );
}

export type KeypadLockProps = {
  unlocked: boolean;
  onUnlock: () => void;
};
export function KeypadLock({ unlocked, onUnlock }: KeypadLockProps) {
  const [input, setInput] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  function showError(msg: string) {
    setInput("");
    setErrorMessage(msg);
    setTimeout(() => setErrorMessage(null), 2000);
  }
  function appendInput(digit: number) {
    if (unlocked || errorMessage) return;
    if (input === "214748364" && digit === 8) return showError("OVERFLOW ERROR");
    if (input.length >= 9) return showError("ERROR");
    setInput(i => i + digit);
  }
  function clearInput() {
    if (unlocked || !(input || errorMessage)) return;
    setInput("");
    setErrorMessage(null);
  }
  function submitInput() {
    if (unlocked || !input) return;
    if (input === "69") return showError("NICE!");
    if (input === "1337") return showError("LEET!");
    if (input === "80085" || input === "5318008") return showError("REALLY?");
    if (MD5(input).toString() !== "7f909caef5fbfdc2507d57d3cb5e805d") return showError("ERROR");
    clearInput();
    onUnlock();
  }

  function KeypadKey({ digit }: { digit: number }) {
    return (
      <div onMouseDown={() => appendInput(digit)}>
        <span className={clsx(digit === 1 && styles.offset)}>{digit}</span>
      </div>
    );
  }

  return (
    <div className={styles.authLock}>
      <div className={styles.console}>
        {unlocked ? (
          <span className={styles.consoleSuccess}>{"SUCCESS!"}</span>
        ) : errorMessage ? (
          <span className={styles.consoleError}>{errorMessage}</span>
        ) : (
          <>
            {input}
            <span className={styles.consoleCursor}>_</span>
          </>
        )}
      </div>
      <div className={styles.keypad}>
        <KeypadKey digit={1} />
        <KeypadKey digit={2} />
        <KeypadKey digit={3} />
        <KeypadKey digit={4} />
        <KeypadKey digit={5} />
        <KeypadKey digit={6} />
        <KeypadKey digit={7} />
        <KeypadKey digit={8} />
        <KeypadKey digit={9} />
        <div onMouseDown={() => clearInput()}>
          <span>{"C"}</span>
        </div>
        <KeypadKey digit={0} />
        <div onMouseDown={() => submitInput()}>
          <span>{"E"}</span>
        </div>
        <span className={clsx(styles.keypadPadding, styles.keypadPaddingLeft)} />
        <span className={clsx(styles.keypadPadding, styles.keypadPaddingRight)} />
      </div>
    </div>
  );
}
