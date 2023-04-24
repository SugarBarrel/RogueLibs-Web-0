import { Button, Icon, IconButton, Link, Popup, TextArea, TextInput, Tooltip } from "@components/Common";
import { useLocation } from "@lib/hooks";
import lodashTrimStart from "lodash/trimStart";
import { useCallback, useId, useState } from "react";
import { useReleasePageContext } from ".";
import styles from "./Body.module.scss";
import parseSemVer from "semver/functions/parse";
import { DbRelease } from "@lib/Database";
import { Filter } from "@lib/index";
import { useRouter } from "next/router";

export default function ReleasePageBody() {
  const { isEditing } = useReleasePageContext();

  return (
    <div className={styles.body}>
      <ReleaseDescription />
      {isEditing && <ReleaseMetadataEditor />}
      {isEditing && <DeleteReleaseButton />}
      <ReleaseJsonView />
    </div>
  );
}

export function ReleaseMetadataEditor() {
  const { mod } = useReleasePageContext();
  const location = useLocation();

  return (
    <div className={styles.metadataWrapper}>
      <MetadataField
        prop="title"
        label="Release Title"
        preProcess={title => title.trimStart()}
        validate={title => {
          if (title.length < 1) return "The release title must not be empty!";
          if (title.length > 50) return "The release title must not exceed 50 characters!";
        }}
      />
      <MetadataField
        prop="banner_url"
        label="Release Banner URL"
        placeholder="https://roguelibs.com/placeholder.png"
        validate={banner_url => {
          if (banner_url.length > 255) return "The release banner URL must not exceed 255 characters!";
        }}
      />
      <MetadataField
        prop="version"
        label={
          <>
            {"Release Version "}
            <span className={styles.metadataHeaderNote}>
              {"("}
              <Link href="https://semver.org/spec/v2.0.0.html">{"SemVer 2.0.0"}</Link>
              {")"}
            </span>
          </>
        }
        prefix={version => (version ? "v" : null)}
        placeholder="No version"
        preProcess={version => lodashTrimStart(version.trimStart(), "vV")}
        validate={version => {
          if (version.length > 32) {
            return "The release version must not exceed 32 characters!";
          }
          if (version != null && !parseSemVer(version)) {
            return "The release version must be a valid semantic version!";
          }
        }}
      />
      <MetadataField
        prop="slug"
        label="Release URL slug"
        prefix={`${location?.origin}/mods/${mod?.slug ?? mod?.id}/`}
        preProcess={slug => slug.replace(" ", "-").trimStart()}
        validate={slug => {
          if (slug.length > 32) return "The release slug must not exceed 32 characters!";
          if (!/^[a-z0-9._-]+$/i.test(slug)) {
            return "The release slug must only contain [a-zA-Z0-9._-] characters.";
          }
          if (/^\d+$/.test(slug)) return "The release slug must not be numeric!";
        }}
      />
    </div>
  );
}

export type MetadataFieldProps = {
  prop: keyof Filter<DbRelease, string | null>;
  label: React.ReactNode;
  prefix?: string | ((value: string | null) => string | null);
  placeholder?: string;
  preProcess?: (newValue: string) => string | null;
  validate?: (newValue: string) => string | null | void;
};
export function MetadataField({ prop, label, prefix, placeholder, preProcess, validate }: MetadataFieldProps) {
  const { release, original, mutateRelease } = useReleasePageContext();
  const id = useId();

  const onChangeValue = useCallback(
    (newValue: string | null) => {
      if (newValue != null && preProcess) newValue = preProcess(newValue);
      mutateRelease(release => void (release[prop] = newValue || null!));
    },
    [mutateRelease],
  );
  const undoValue = useCallback(() => onChangeValue(original[prop]), [onChangeValue, original]);

  const value = release[prop];

  return (
    <div className={styles.metadataField}>
      <div className={styles.metadataHeader}>
        <label>{label}</label>
        {value !== original[prop] && (
          <IconButton data-tooltip-id={id} type="undo" size={16} alpha={1} onClick={undoValue} />
        )}
        <Tooltip id={id} place="right" content="Undo" />
      </div>
      <TextInput
        value={value}
        onChange={onChangeValue}
        prefix={typeof prefix === "function" ? prefix(release[prop]) : prefix}
        placeholder={placeholder}
        error={validate ? (value !== null ? validate(value) || null : null) : undefined}
      />
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
          onChange={v => mutateRelease(r => void (r.description = v))}
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
      <summary>{"Show/Hide JSON"}</summary>
      <div className={styles.jsonViewBox}>
        <pre>
          <code>{JSON.stringify(release, null, 2)}</code>
        </pre>
      </div>
    </details>
  );
}

export function DeleteReleaseButton() {
  const { release, mod } = useReleasePageContext();
  const popupState = useState(false);
  const id = useId();
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();

  async function deleteRelease() {
    if (deleting) return;
    try {
      setDeleting(true);

      const response = await fetch(`${location.origin}/api/delete_release`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ release_id: release.id }),
      });

      await response.json();
      router.push(`/mods/${mod!.slug ?? mod!.id}`);
    } catch (error) {
      console.error(error);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <Button data-tooltip-id={id} className={styles.deleteReleaseButton} onClick={() => popupState[1](true)}>
        <Icon type="cross" />
        {"Delete this release"}
      </Button>
      <Popup id={id} open={popupState} place="bottom">
        {() => (
          <div className={styles.deleteReleasePopup}>
            {"Are you sure you want to delete this release?"}
            <Button onClick={deleteRelease}>
              <Icon type="cross" />
              {"Yes, I'm sure"}
            </Button>
          </div>
        )}
      </Popup>
    </>
  );
}
