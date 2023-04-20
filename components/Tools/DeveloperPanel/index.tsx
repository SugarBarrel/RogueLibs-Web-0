import { useState } from "react";
import styles from "./index.module.scss";
import clsx from "clsx";
import { Sprite } from "@components/Common";
import MD5 from "crypto-js/md5";

const admin_password = "7f909caef5fbfdc2507d57d3cb5e805d";

export type DeveloperPanelProps = {};

export default function DeveloperPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [status, setStatus] = useState<"input" | "error" | "success">("input");

  function showError() {
    setStatus("error");
    setInput("");
    setTimeout(() => setStatus("input"), 2000);
  }
  function appendInput(num: number) {
    if (status === "input") {
      if (input.length >= 9) return showError();
      setInput(i => i + num);
    }
  }
  function clearInput() {
    if (status !== "success") {
      setStatus("input");
      setInput("");
    }
  }
  function submitInput() {
    if (status === "success" || !input) return;

    const password = MD5(input).toString();
    if (password !== admin_password) return showError();
    setStatus("success");
  }

  return (
    <div className={styles.panelWrapper}>
      <div className={clsx(styles.panel, isOpen && styles.isOpen)}>
        <div className={styles.toggle} onClick={() => setIsOpen(!isOpen)}>
          <Sprite className={styles.toggleArrow} src="/res/devPanelArrow.png" width={12} height={24} crisp />
        </div>
        <div className={styles.authLock}>
          <div className={styles.console}>
            {status === "error" ? (
              <span className={styles.consoleError}>{"ERROR"}</span>
            ) : status === "success" ? (
              <span className={styles.consoleSuccess}>{"SUCCESS!"}</span>
            ) : (
              <>
                {input}
                <span className={styles.consoleCursor}>_</span>
              </>
            )}
          </div>
          <div className={styles.keypad}>
            <div onMouseDown={() => appendInput(1)}>{"1"}</div>
            <div onMouseDown={() => appendInput(2)}>{"2"}</div>
            <div onMouseDown={() => appendInput(3)}>{"3"}</div>
            <div onMouseDown={() => appendInput(4)}>{"4"}</div>
            <div onMouseDown={() => appendInput(5)}>{"5"}</div>
            <div onMouseDown={() => appendInput(6)}>{"6"}</div>
            <div onMouseDown={() => appendInput(7)}>{"7"}</div>
            <div onMouseDown={() => appendInput(8)}>{"8"}</div>
            <div onMouseDown={() => appendInput(9)}>{"9"}</div>
            <div onMouseDown={() => clearInput()}>{"C"}</div>
            <div onMouseDown={() => appendInput(0)}>{"0"}</div>
            <div onMouseDown={() => submitInput()}>{"E"}</div>
            <span className={clsx(styles.keypadPadding, styles.keypadPaddingLeft)} />
            <span className={clsx(styles.keypadPadding, styles.keypadPaddingRight)} />
          </div>
        </div>
        <div style={{ display: "none" }}>
          <input type="checkbox" checked={false} onChange={() => {}} />
          <span style={{ marginLeft: "8px" }}>{"is_admin"}</span>
        </div>
        {/* <div style={{ height: "2rem", width: "10rem", backgroundColor: "var(--color-background)" }} /> */}
      </div>
    </div>
  );
}
