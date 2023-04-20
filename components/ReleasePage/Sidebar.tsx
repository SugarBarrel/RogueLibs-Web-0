import { Checkbox } from "@components/Common";
import { AuthorsList, DownloadsList } from "@components/Editor";
import { ImmerStateSetter, useImmerSlice } from "@lib/hooks";
import { DbModAuthor, DbReleaseAuthor } from "@lib/Database";
import { useReleasePageContext } from ".";
import styles from "./Sidebar.module.scss";

export default function ReleasePageSidebar() {
  const { release, mutateRelease, isEditing, hasChanges } = useReleasePageContext();

  const mutateFiles = useImmerSlice(mutateRelease, "files");
  const mutateAuthors = useImmerSlice(mutateRelease, "authors") as ImmerStateSetter<(DbReleaseAuthor | DbModAuthor)[]>;

  return (
    <div className={styles.sidebar}>
      <div>
        {isEditing && (
          <Checkbox value={release.is_public} onChange={v => mutateRelease(r => void (r.is_public = v))}>
            {`${release.is_public ? "Public" : "Private"} release`}
          </Checkbox>
        )}
      </div>

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
