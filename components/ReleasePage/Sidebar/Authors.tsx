import { useUser } from "@lib/hooks";
import { useReleasePageContext } from "..";
import styles from "./Authors.module.scss";
import clsx from "clsx";

export default function ReleasePageAuthors() {
  const { release } = useReleasePageContext();
  const authors = release.authors.slice().sort((a, b) => a.order - b.order);

  return (
    <div className={styles.authors}>
      <label>{"Authors"}</label>
      {authors.map(author => (
        <Author user_id={author.user_id} credit={author.credit} key={author.user_id} />
      ))}
    </div>
  );
}

export type AuthorProps = {
  user_id: string | null | undefined;
  credit?: string | null;
  size?: number | null;
};
export function Author({ user_id, credit, size }: AuthorProps) {
  if (size == null) size = 48;
  const user = useUser(user_id)[0];

  return (
    <div className={styles.author}>
      <img className={styles.avatar} width={size} height={size} src={user?.avatar_url ?? undefined} />
      <div className={clsx(styles.userInfo, credit && styles.withCredits)}>
        <span className={styles.username}>{user?.username ?? "..."}</span>
        {credit && (
          <div className={styles.credits}>
            {credit.split("\n").map((line, i) => (
              <p key={i}>{line}</p>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
