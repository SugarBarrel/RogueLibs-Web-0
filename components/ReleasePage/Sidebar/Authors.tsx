import { StoreUser } from "@ducks/users";
import { useUser } from "@lib/hooks";
import { useReleasePageContext } from "..";
import styles from "./Authors.module.scss";

export default function ReleasePageAuthors() {
  const { release } = useReleasePageContext();
  const authors = release.authors.slice().sort((a, b) => a.order - b.order);

  return (
    <div className={styles.authors}>
      <label>{"Authors"}</label>
      {authors.map(author => (
        <Author user_id={author.user_id} key={author.user_id} />
      ))}
    </div>
  );
}

type AuthorProps = {
  user_id: string | null | undefined;
};
function Author({ user_id }: AuthorProps) {
  const user = useUser(user_id)[0] ?? ({} as StoreUser);

  return (
    <div className={styles.author}>
      <img src={user.avatar_url ?? undefined} />
      <span>{user.username}</span>
    </div>
  );
}
