import { Link } from "@components/Common";
import { useUser as useSupabaseUser } from "@supabase/auth-helpers-react";
import { useReleasePageContext } from "..";
import styles from './Authoring.module.scss';

export default function ReleasePageAuthoring() {
  const { release } = useReleasePageContext();
  const me = useSupabaseUser();

  const isAuthor = me?.id && release.authors.some(a => a.user_id == me.id && a.can_edit);

  return (
    <>
      {isAuthor && (
        <div className={styles.authoring}>
          <Link href={`/mods/${release.mod_id}/${release.id}/edit`}>
            {"EDIT"}
          </Link>
          <span>{"???"}</span>
          <span>{"DELETE"}</span>
        </div>
      )}
    </>
  );
}
