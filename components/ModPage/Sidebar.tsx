import { Checkbox, Icon } from "@components/Common";
import { AuthorsList, DownloadsList } from "@components/Editor";
import { ImmerStateSetter, useImmerSlice } from "@lib/hooks";
import { DbModAuthor, DbReleaseAuthor } from "@lib/Database";
import { useModPageContext } from ".";
import styles from "./Sidebar.module.scss";

export default function ReleasePageSidebar() {
  const { mod, mutateMod, releases, isEditing, hasChanges } = useModPageContext();

  const mutateAuthors = useImmerSlice(mutateMod, "authors") as ImmerStateSetter<(DbReleaseAuthor | DbModAuthor)[]>;

  return (
    <div className={styles.sidebar}>
      <div>
        {isEditing && (
          <Checkbox
            value={mod.is_public}
            onChange={v => mutateMod(m => void (m.is_public = v))}
            checked={() => <Icon type="visibility" />}
            unchecked={() => <Icon type="visibilityOff" />}
          >
            {`${mod.is_public ? "Public" : "Private"} mod`}
          </Checkbox>
        )}
      </div>

      {!isEditing && releases[0] && (
        <div className={styles.container}>
          <label>{releases[0].files.length === 1 ? "Latest Download" : "Latest Downloads"}</label>
          <DownloadsList files={releases[0].files} />
        </div>
      )}

      <div className={styles.container}>
        <label>{mod.authors.length === 1 ? "Author" : "Authors"}</label>
        <AuthorsList
          authors={mod.authors}
          mutateAuthors={mutateAuthors}
          isEditing={isEditing}
          hasChanges={hasChanges}
          entity={mod}
        />
      </div>
    </div>
  );
}
