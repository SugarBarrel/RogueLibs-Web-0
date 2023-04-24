import { Button, Checkbox, Icon, Tooltip } from "@components/Common";
import { AuthorsList, DownloadsList } from "@components/Editor";
import { ImmerStateSetter, useImmerSlice } from "@lib/hooks";
import { DbModAuthor, DbReleaseAuthor, DbReleaseFile, DbReleaseFileType } from "@lib/Database";
import { useReleasePageContext } from ".";
import styles from "./Sidebar.module.scss";
import { ChangeEvent, useId, useRef, useState } from "react";
import { RestRelease, useApi } from "@lib/API";
import { useRootDispatch } from "@ducks/index";
import { upsertRelease } from "@ducks/releases";

export default function ReleasePageSidebar() {
  const { release, mutateRelease, isEditing, hasChanges } = useReleasePageContext();

  const mutateFiles = useImmerSlice(mutateRelease, "files");
  const mutateAuthors = useImmerSlice(mutateRelease, "authors") as ImmerStateSetter<(DbReleaseAuthor | DbModAuthor)[]>;

  return (
    <div className={styles.sidebar}>
      <div>
        {isEditing && (
          <Checkbox
            value={release.is_public}
            onChange={v => mutateRelease(r => void (r.is_public = v))}
            checked={() => <Icon type="visibility" />}
            unchecked={() => <Icon type="visibilityOff" />}
          >
            {`${release.is_public ? "Public" : "Private"} release`}
          </Checkbox>
        )}
      </div>

      <div className={styles.container}>
        <label>{release.files.length === 1 ? "Download" : "Downloads"}</label>
        <DownloadsList files={release.files} mutateFiles={mutateFiles} isEditing={isEditing} hasChanges={hasChanges} />
        {isEditing && <UploadFile />}
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

export function UploadFile() {
  const { release, mutateRelease, hasChanges, setIsEditing } = useReleasePageContext();

  const dispatch = useRootDispatch();
  const [uploading, setUploading] = useState(false);
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const api = useApi();

  async function uploadFile(e: ChangeEvent<HTMLInputElement>) {
    if (uploading) return;
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const newFile: DbReleaseFile = {
        release_id: release!.id,
        filename: file.name,
        order: Math.max(-1, ...release.files.map(a => a.order)) + 1,
        type:
          {
            dll: DbReleaseFileType.Plugin,
            spritepack: DbReleaseFileType.SpritePack,
            xml: DbReleaseFileType.Documentation,
          }[file.name.split(".").pop()!] ?? DbReleaseFileType.Extra,
        title: null,
        tooltip: null,
      };

      const diff = {
        id: release.id,
        files: release.files.map(f => ({ filename: f.filename })).concat([newFile]),
      };

      const response = await fetch(`${location.origin}/api/update_release`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(diff),
      });
      const newRelease = (await response.json()) as RestRelease;

      const path = `${release.id}.${newFile.filename}`;
      await api.Supabase.storage.from("release-files").upload(path, file);

      dispatch(upsertRelease(newRelease));
      mutateRelease(r => Object.assign(r, newRelease));
    } catch (error) {
      console.error(error);
    } finally {
      setUploading(false);
    }
  }

  return (
    <>
      <Button onClick={() => inputRef.current!.click()}>
        <Icon type={uploading ? "loading" : "upload"} />
        {"Upload file"}
      </Button>
      <input
        style={{ visibility: "hidden", position: "absolute", width: 0, height: 0 }}
        ref={inputRef}
        type="file"
        onChange={uploadFile}
        disabled={hasChanges}
      />
      {hasChanges && <Tooltip id={id}>{"First save your changes, then you'll be able to upload new files."}</Tooltip>}
    </>
  );
}
