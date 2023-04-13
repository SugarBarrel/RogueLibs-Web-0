import { Icon, IconButton, Link } from "@components/Common";
import TextInput from "@components/Common/TextInput";
import { useLocation } from "@lib/hooks";
import lodashTrimStart from "lodash/trimStart";
import { useCallback } from "react";
import { useReleasePageContext } from ".";
import styles from "./Body.module.scss";
import parseSemVer from "semver/functions/parse";

export default function ReleasePageBody() {
  return (
    <div className={styles.body}>
      <ReleaseMetadataEditor />
      <ReleaseDescription />
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
            <IconButton onClick={() => mutateRelease(r => (r.title = original.title))}>
              <Icon type="edit" alpha={0.5} size={16} />
            </IconButton>
          )}
        </div>
        <TextInput
          value={release.title}
          onChange={onChangeTitle}
          error={release.title.length > 50 ? "The release title must not exceed 50 characters!" : null}
        />
      </div>
      <div className={styles.metadataField}>
        <div className={styles.metadataHeader}>
          <label>{"Release Banner URL"}</label>
          {release.banner_url !== original.banner_url && (
            <IconButton onClick={() => mutateRelease(r => (r.banner_url = original.banner_url))}>
              <Icon type="edit" alpha={0.5} size={16} />
            </IconButton>
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
            <IconButton onClick={() => mutateRelease(r => (r.version = original.version))}>
              <Icon type="edit" alpha={0.5} size={16} />
            </IconButton>
          )}
        </div>
        <TextInput
          value={release.version}
          onChange={onChangeVersion}
          prefix={release.version ? "v" : ""}
          placeholder={"No version"}
          error={(() => {
            if (release.version?.length! > 20) {
              return "The release version must not exceed 20 characters!";
            }
            if (release.version != null && !parseSemVer(release.version)) {
              return "The release version is not a valid semantic version!";
            }
            return null;
          })()}
        />
      </div>
      <div className={styles.metadataField}>
        <div className={styles.metadataHeader}>
          <label>{"URL slug"}</label>
          {release.slug !== original.slug && (
            <IconButton onClick={() => mutateRelease(r => (r.slug = original.slug))}>
              <Icon type="edit" alpha={0.5} size={16} />
            </IconButton>
          )}
        </div>
        <TextInput
          value={release.slug}
          onChange={onChangeSlug}
          prefix={`${location?.origin}/mods/${mod.slug ?? mod.id}/`}
          placeholder={"" + release.id}
          error={(() => {
            if (release.slug != null) {
              if (release.slug.length > 20) return "The release slug must not exceed 20 characters!";
              if (!Number.isNaN(parseInt(release.slug))) return "The release slug must not be numeric!";
            }
            return null;
          })()}
        />
      </div>
    </div>
  );
}

export function ReleaseDescription() {
  const { release } = useReleasePageContext();

  return (
    <div className={styles.description}>
      {release.description.split("\n").map((t, i) => {
        if (!t) return <br key={i} />;
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
