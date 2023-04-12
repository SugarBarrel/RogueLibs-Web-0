import { Button, Icon, IconButton, Link } from "@components/Common";
import { useRootDispatch } from "@ducks/index";
import { setModNugget } from "@ducks/mods";
import { RestRelease, useApi } from "@lib/API";
import { useUser } from "@lib/hooks";
import { collectionDiff, primitiveDiff } from "@lib/index";
import { useSession as useSupabaseSession } from "@supabase/auth-helpers-react";
import { useMemo, useState } from "react";
import { Tooltip } from "react-tooltip";
import { useReleasePageContext } from ".";
import styles from "./Header.module.scss";
import clsx from "clsx";
import { useRouter } from "next/router";
import { upsertRelease } from "@ducks/releases";

export default function ReleasePageHeader() {
  const { release } = useReleasePageContext();
  const router = useRouter();

  function copyPermanentLink() {
    const isReleasePage = router.pathname.includes("[release_slug]");
    const permanentPath = isReleasePage ? `r/${release.id}` : `m/${release.mod_id}`;
    navigator.clipboard.writeText(`${location.origin}/${permanentPath}`);
  }

  return (
    <>
      <div className={styles.topBar}>
        <Breadcrumbs />
        <AuthoringControls />
      </div>
      <div className={styles.header}>
        <img className={styles.banner} src={release.banner_url ?? "/placeholder.png"} />
        <div className={styles.headerOverlay}>
          <span className={styles.title}>{release.title}</span>
          <div className={styles.titleButtons}>
            <IconButton data-tooltip-id="mod-link" onClick={copyPermanentLink}>
              <Icon type="link" size={32} alpha={0.5} />
            </IconButton>
            <Tooltip
              id="mod-link"
              place="bottom"
              offset={5}
              openOnClick
              clickable
              delayHide={3000}
              render={() => (
                <div>
                  <span>{"Copied permanent link!"}</span>
                </div>
              )}
            />
          </div>
        </div>
        <LeftQuickBar />
        <RightQuickBar />
      </div>
    </>
  );
}

export function Breadcrumbs() {
  const { original: release, mod } = useReleasePageContext();

  const homeLink = "/";
  const modLink = `/mods/${mod?.slug ?? release.mod_id}`;
  const releaseLink = `${modLink}/${release.slug ?? release.id}`;

  return (
    <div className={styles.breadcrumbs}>
      <Link className={styles.breadcrumb} href={homeLink}>
        Mods
      </Link>
      <span>{" > "}</span>
      <Link className={styles.breadcrumb} href={modLink}>
        {release.title}
      </Link>
      <span>{" > "}</span>
      <Link className={styles.breadcrumb} href={releaseLink}>
        {release.version ? "v" + release.version : release.slug ?? release.id}
      </Link>
    </div>
  );
}
export function AuthoringControls() {
  const { release, original, mutateRelease, isEditing, setIsEditing } = useReleasePageContext();

  const dispatch = useRootDispatch();
  const session = useSupabaseSession();
  const [myUser] = useUser(session?.user.id);

  const [savingChanges, setSavingChanges] = useState(false);

  const releaseChanges = useMemo(() => {
    return primitiveDiff(original, release);
  }, [original, release]);
  const filesChanges = useMemo(() => {
    return collectionDiff(original.files, release.files, "filename");
  }, [original.files, release.files]);
  const authorsChanges = useMemo(() => {
    return collectionDiff(original.authors, release.authors, "user_id");
  }, [original.authors, release.authors]);

  const hasChanges = !!releaseChanges || filesChanges.hasChanges || authorsChanges.hasChanges;

  async function toggleEditing() {
    if (savingChanges) return;

    try {
      if (hasChanges) {
        setSavingChanges(true);

        const diff = {
          id: release.id,
          ...releaseChanges,
          files: filesChanges.hasChanges ? filesChanges.diff : undefined,
          authors: authorsChanges.hasChanges ? authorsChanges.diff : undefined,
        };
        console.log(diff);

        const response = fetch(`${location.origin}/api/update_release`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(diff),
        });

        const newRelease = (await (await response).json()) as RestRelease;
        dispatch(upsertRelease(newRelease));
        mutateRelease(r => Object.assign(r, newRelease));
      }
      setIsEditing(v => !v);
    } catch (error) {
      console.error(error);
    } finally {
      setSavingChanges(false);
    }
  }
  function resetChanges() {
    mutateRelease(r => Object.assign(r, original));
  }

  const isAuthor = myUser && release.authors.find(a => a.user_id == myUser.id)?.can_edit;
  if (!isAuthor) return null;

  return (
    <div className={styles.authoringControls}>
      <Button onClick={toggleEditing} disabled={savingChanges}>
        <Icon type={savingChanges ? "loading" : isEditing ? "save" : "edit"} />
        {isEditing ? "Save" : "Edit"}
      </Button>
      {hasChanges && (
        <>
          <Button onClick={resetChanges} disabled={savingChanges}>
            <Icon type="cross" />
            {"Reset"}
          </Button>
          <div className={styles.unsavedChanges}>There are unsaved changes!</div>
        </>
      )}
    </div>
  );
}

export function LeftQuickBar() {
  const { mod } = useReleasePageContext();

  return (
    <div className={styles.leftQuickbar}>
      {mod?.guid && (
        <>
          <pre className={styles.guid}>
            <span className={styles.guidLabel}>{"GUID: "}</span>
            <span
              data-tooltip-id="mod-guid"
              className={styles.guidValue}
              onClick={() => navigator.clipboard.writeText(mod.guid!)}
            >
              {mod.guid}
              <Icon type="copy" size={16} alpha={0.75} />
            </span>
          </pre>
          <Tooltip
            id="mod-guid"
            place="right"
            openOnClick={true}
            clickable={true}
            render={() => {
              const csharpString = `"${mod.guid}"`;
              const dependencyAttr = `[BepInDependency("${mod.guid}")]`;
              return (
                <div className={styles.copyGuidTooltip}>
                  <span>{"Copied!"}</span>
                  <Button data-tooltip-id="mod-guid-2" onClick={() => navigator.clipboard.writeText(csharpString)}>
                    {"Copy as C# string"}
                  </Button>
                  <Button data-tooltip-id="mod-guid-2" onClick={() => navigator.clipboard.writeText(dependencyAttr)}>
                    {"Copy as BepInDependency attribute"}
                  </Button>
                  <Tooltip id="mod-guid-2" place="right" openOnClick={true} content="Copied!" delayHide={3000} />
                </div>
              );
            }}
          />
        </>
      )}
    </div>
  );
}
export function RightQuickBar() {
  const { release, mod } = useReleasePageContext();

  const api = useApi();
  const dispatch = useRootDispatch();
  const session = useSupabaseSession();

  const [myUser] = useUser(session?.user.id);
  const myNugget = myUser?.nuggets?.some(n => n.mod_id === release.mod_id);
  const [nuggetting, setNuggetting] = useState(false);

  async function toggleNugget() {
    if (!myUser) return;
    try {
      setNuggetting(true);
      await dispatch(setModNugget({ api, mod_id: release.mod_id, nugget: !myNugget }));
    } catch (error) {
      console.error(error);
    } finally {
      setNuggetting(false);
    }
  }

  return (
    <div className={styles.rightQuickbar}>
      <Button
        data-tooltip-id="mod-nugget"
        className={clsx(styles.nuggetButton, myNugget && styles.setNugget)}
        disabled={nuggetting}
        onClick={toggleNugget}
      >
        <Icon type={mod == null || nuggetting ? "loading" : "nugget"} />
        <span>{mod?.nugget_count ?? "..."}</span>
      </Button>
      {!myUser && (
        <Tooltip
          id="mod-nugget"
          place="left"
          openOnClick={true}
          variant="error"
          content="You must sign in to rate mods!"
          delayHide={3000}
        />
      )}
    </div>
  );
}
