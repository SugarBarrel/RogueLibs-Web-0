import { Button, Icon, IconButton, Popup, TextArea, TextInput, Tooltip } from "@components/Common";
import { useLocation } from "@lib/hooks";
import { useCallback, useId, useState } from "react";
import { useModPageContext } from ".";
import styles from "./Body.module.scss";
import { DbMod } from "@lib/Database";
import { Filter } from "@lib/index";
import ReleasesList from "@components/Editor/ReleasesList";
import { RestRelease } from "@lib/API";
import { useRouter } from "next/router";

export default function ModPageBody() {
  const { isEditing } = useModPageContext();

  return (
    <div className={styles.body}>
      <ModDescription />
      {isEditing && <ModMetadataEditor />}
      {!isEditing && <ModReleasesList />}
      <ModJsonView />
    </div>
  );
}

export function ModMetadataEditor() {
  const location = useLocation();

  return (
    <div className={styles.metadataWrapper}>
      <MetadataField
        prop="title"
        label="Mod Title"
        preProcess={title => title.trimStart()}
        validate={title => {
          if (title.length < 1) return "The mod title must not be empty!";
          if (title.length > 50) return "The mod title must not exceed 50 characters!";
        }}
      />
      <MetadataField
        prop="guid"
        label="Mod GUID"
        preProcess={guid => guid.trimStart()}
        validate={guid => {
          if (guid.length < 1) return "The mod GUID must not be empty!";
          if (guid.length > 255) return "The mod GUID must not exceed 255 characters!";
        }}
      />
      <MetadataField
        prop="slug"
        label="Mod URL slug"
        prefix={`${location?.origin}/mods/`}
        preProcess={slug => slug.replace(" ", "-").trimStart()}
        validate={slug => {
          if (slug.length > 32) return "The mod slug must not exceed 32 characters!";
          if (!/^[a-z0-9._-]+$/i.test(slug)) {
            return "The mod slug must only contain [a-zA-Z0-9._-] characters.";
          }
          if (/^\d+$/.test(slug)) return "The mod slug must not be numeric!";
        }}
      />
    </div>
  );
}
export function ModReleasesList() {
  const { mod, releases, hasChanges } = useModPageContext();
  const popupState = useState(false);
  const id = useId();
  const [creating, setCreating] = useState(false);
  const router = useRouter();

  async function createRelease() {
    if (creating) return;
    try {
      setCreating(true);

      const response = await fetch(`${location.origin}/api/create_release`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mod_id: mod.id }),
      });

      const newRelease = (await response.json()) as RestRelease;
      router.push(`/mods/${mod.slug ?? mod.id}/${newRelease.slug ?? newRelease.id}`);
    } catch (error) {
      console.error(error);
    } finally {
      setCreating(false);
    }
  }

  return (
    <>
      <ReleasesList releases={releases} blank={hasChanges} />
      <Button data-tooltip-id={id} className={styles.createReleaseButton} onClick={() => popupState[1](true)}>
        <Icon type="add" />
        {"Create a new release"}
      </Button>
      <Popup id={id} open={popupState} place="bottom">
        {() => (
          <div className={styles.createReleasePopup}>
            {"Are you sure you want to create a new release?"}
            <Button onClick={createRelease}>
              <Icon type="add" />
              {"Yes, I'm sure"}
            </Button>
          </div>
        )}
      </Popup>
    </>
  );
}

export type MetadataFieldProps = {
  prop: keyof Filter<DbMod, string | null>;
  label: React.ReactNode;
  prefix?: string | ((value: string | null) => string | null);
  placeholder?: string;
  preProcess?: (newValue: string) => string | null;
  validate?: (newValue: string) => string | null | void;
};
export function MetadataField({ prop, label, prefix, placeholder, preProcess, validate }: MetadataFieldProps) {
  const { mod, original, mutateMod } = useModPageContext();
  const id = useId();

  const onChangeValue = useCallback(
    (newValue: string | null) => {
      if (newValue != null && preProcess) newValue = preProcess(newValue);
      mutateMod(mod => void (mod[prop] = newValue || null!));
    },
    [mutateMod],
  );
  const undoValue = useCallback(() => onChangeValue(original[prop]), [onChangeValue, original]);

  const value = mod[prop];

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
        prefix={typeof prefix === "function" ? prefix(mod[prop]) : prefix}
        placeholder={placeholder}
        error={validate ? (value !== null ? validate(value) || null : null) : undefined}
      />
    </div>
  );
}

export function ModDescription() {
  const { mod, mutateMod, isEditing } = useModPageContext();

  if (isEditing) {
    return (
      <div>
        <label>{"Description"}</label>
        <TextArea
          className={styles.descriptionInput}
          value={mod.description}
          onChange={v => mutateMod(r => void (r.description = v))}
          height={15}
          error={(() => {
            if (mod.description.length > 4000) return "The mod description must not exceed 4000 characters!";
            return null;
          })()}
        />
      </div>
    );
  }

  return (
    <div className={styles.description}>
      {mod.description.split("\n").map((t, i) => {
        return <p key={i}>{t}</p>;
      })}
    </div>
  );
}
export function ModJsonView() {
  const { mod } = useModPageContext();

  return (
    <details className={styles.jsonView}>
      <summary>{"Show/Hide JSON"}</summary>
      <div className={styles.jsonViewBox}>
        <pre>
          <code>{JSON.stringify(mod, null, 2)}</code>
        </pre>
      </div>
    </details>
  );
}
