import { useReleasePageContext } from ".";
import styles from "./Body.module.scss";

export default function ReleasePageBody() {
  const { release } = useReleasePageContext();

  return (
    <div className={styles.body}>
      <div className={styles.description}>
        {release.description.split("\n").map((t, i) => {
          if (!t) return <br key={i} />;
          return <p key={i}>{t}</p>;
        })}
      </div>
      <details style={{ marginTop: "2rem" }}>
        <summary>Show/Hide JSON</summary>
        <div>
          <pre>
            <code>{JSON.stringify(release, null, 2)}</code>
          </pre>
        </div>
      </details>
    </div>
  );
}
