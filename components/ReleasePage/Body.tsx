import { IconButton, Link, TextArea, TextInput } from "@components/Common";
import { useLocation } from "@lib/hooks";
import lodashTrimStart from "lodash/trimStart";
import { useCallback } from "react";
import { useReleasePageContext } from ".";
import styles from "./Body.module.scss";
import parseSemVer from "semver/functions/parse";

export default function ReleasePageBody() {
  return (
    <div className={styles.body}>
      <ReleaseDescription />
      <ReleaseMetadataEditor />
      <ReleaseJsonView />
    </div>
  );
}

export function ReleaseMetadataEditor() {
  const { release, original, mutateRelease, isEditing, mod } = useReleasePageContext();

  const onChangeSlug = useCallback((newValue: string) => {
    newValue = newValue.replace(" ", "-").trimStart();
    mutateRelease(release => (release.slug = newValue || null));
  }, []);
  const onChangeTitle = useCallback((newTitle: string) => {
    newTitle = newTitle.trimStart();
    mutateRelease(release => (release.title = newTitle));
  }, []);
  const onChangeVersion = useCallback((newVersion: string) => {
    newVersion = lodashTrimStart(newVersion.trimStart(), "vV");
    mutateRelease(release => (release.version = newVersion || null));
  }, []);
  const onChangeBannerUrl = useCallback((newBannerUrl: string) => {
    mutateRelease(release => (release.banner_url = newBannerUrl || null));
  }, []);

  const location = useLocation();

  if (!isEditing || !mod) return null;

  return (
    <div className={styles.metadataWrapper}>
      <div className={styles.metadataField}>
        <div className={styles.metadataHeader}>
          <label>{"Release Title"}</label>
          {release.title !== original.title && (
            <IconButton type="edit" size={16} onClick={() => mutateRelease(r => (r.title = original.title))} />
          )}
        </div>
        <TextInput
          value={release.title}
          onChange={onChangeTitle}
          error={(() => {
            if (release.title.length < 1) return "The release title must not be empty!";
            if (release.title.length > 50) return "The release title must not exceed 50 characters!";
            return null;
          })()}
        />
      </div>
      <div className={styles.metadataField}>
        <div className={styles.metadataHeader}>
          <label>{"Release Banner URL"}</label>
          {release.banner_url !== original.banner_url && (
            <IconButton
              type="edit"
              size={16}
              onClick={() => mutateRelease(r => (r.banner_url = original.banner_url))}
            />
          )}
        </div>
        <TextInput
          value={release.banner_url}
          onChange={onChangeBannerUrl}
          placeholder={"https://roguelibs.com/placeholder.png"}
          error={release.banner_url?.length! > 255 ? "The release banner URL must not exceed 255 characters!" : null}
        />
      </div>
      <div className={styles.metadataField}>
        <div className={styles.metadataHeader}>
          <label>
            {"Release Version "}
            <span className={styles.metadataHeaderNote}>
              {"("}
              <Link href="https://semver.org/spec/v2.0.0.html">{"SemVer 2.0.0"}</Link>
              {")"}
            </span>
          </label>
          {release.version !== original.version && (
            <IconButton type="edit" size={16} onClick={() => mutateRelease(r => (r.version = original.version))} />
          )}
        </div>
        <TextInput
          value={release.version}
          onChange={onChangeVersion}
          prefix={release.version ? "v" : ""}
          placeholder={"No version"}
          error={(() => {
            if (release.version?.length! > 32) {
              return "The release version must not exceed 32 characters!";
            }
            if (release.version != null && !parseSemVer(release.version)) {
              return "The release version must be a valid semantic version!";
            }
            return null;
          })()}
        />
      </div>
      <div className={styles.metadataField}>
        <div className={styles.metadataHeader}>
          <label>{"URL slug"}</label>
          {release.slug !== original.slug && (
            <IconButton type="edit" size={16} onClick={() => mutateRelease(r => (r.slug = original.slug))} />
          )}
        </div>
        <TextInput
          value={release.slug}
          onChange={onChangeSlug}
          prefix={`${location?.origin}/mods/${mod.slug ?? mod.id}/`}
          placeholder={"" + release.id}
          error={(() => {
            if (release.slug != null) {
              if (release.slug.length > 32) return "The release slug must not exceed 32 characters!";
              if (!/^[a-z0-9\\._-]+$/i.test(release.slug)) {
                return "The release slug must only contain [a-zA-Z0-9\\._-] characters.";
              }
              if (/^\d+$/.test(release.slug)) return "The release slug must not be numeric!";
            }
            return null;
          })()}
        />
      </div>
    </div>
  );
}

export function ReleaseDescription() {
  const { release, mutateRelease, isEditing } = useReleasePageContext();

  if (isEditing) {
    return (
      <div>
        <label>{"Description"}</label>
        <TextArea
          className={styles.descriptionInput}
          value={release.description}
          onChange={v => mutateRelease(r => (r.description = v))}
          height={15}
          error={(() => {
            if (release.description.length > 4000) return "The release description must not exceed 4000 characters!";
            return null;
          })()}
        />
      </div>
    );
  }

  return (
    <div className={styles.description}>
      {release.description.split("\n").map((t, i) => {
        return <p key={i}>{t}</p>;
      })}
    </div>
  );
}
export function ReleaseJsonView() {
  const { release } = useReleasePageContext();

  return (
    <details className={styles.jsonView}>
      <summary>Show/Hide JSON</summary>
      <div className={styles.jsonViewBox}>
        <pre>
          <code>{JSON.stringify(release, null, 2)}</code>
        </pre>
      </div>
    </details>
  );
}
