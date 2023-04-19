import { AuthorsList, DownloadsList } from "@components/Editor";
import { ImmerStateSetter, useImmerSlice } from "@lib/hooks";
import { useReleasePageContext } from ".";
import styles from "./Sidebar.module.scss";
import { DbModAuthor, DbReleaseAuthor } from "@lib/Database";

export default function ReleasePageSidebar() {
  const { release, mutateRelease, isEditing, hasChanges } = useReleasePageContext();

  const mutateFiles = useImmerSlice(mutateRelease, "files");
  const mutateAuthors = useImmerSlice(mutateRelease, "authors") as ImmerStateSetter<(DbReleaseAuthor | DbModAuthor)[]>;

  return (
    <div className={styles.sidebar}>
      <div>{`The release is ${release.is_public ? "public" : "private"}`}</div>

      <div className={styles.container}>
        <label>{release.files.length === 1 ? "Download" : "Downloads"}</label>
        <DownloadsList files={release.files} mutateFiles={mutateFiles} isEditing={isEditing} hasChanges={hasChanges} />
      </div>

      <div className={styles.container}>
        <label>{release.authors.length === 1 ? "Author" : "Authors"}</label>
        <AuthorsList
          authors={release.authors}
          mutateAuthors={mutateAuthors}
          isEditing={isEditing}
          hasChanges={hasChanges}
          entity={release}
        />
      </div>
    </div>
  );
}
