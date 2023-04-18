import { IconButton, Sprite, TextInput } from "@components/Common";
import Separator from "@components/Common/Separator";
import { BadgeContext, badgeDescriptions, badgeNames } from "@ducks/badges";
import { useRootDispatch } from "@ducks/index";
import { upsertUser } from "@ducks/users";
import { RestUser, useApi } from "@lib/API";
import { useUser } from "@lib/hooks";
import { useSupabaseSession } from "@lib/index";
import { useState } from "react";
import { Tooltip } from "react-tooltip";
import { useUserPageContext } from ".";
import styles from "./Details.module.scss";

export default function UserPageDetails() {
  return (
    <div className={styles.wrapper}>
      <div className={styles.section}>
        <UsernameSection />
      </div>
      <div className={styles.section}>
        <BadgesSection />
      </div>
      <div className={styles.section}>
        <MiscellaneousSection />
      </div>
    </div>
  );
}

function UsernameSection() {
  const { user, original, mutateUser } = useUserPageContext();

  const session = useSupabaseSession();
  const myUser = useUser(session?.user.id)[0];
  const canEdit = user.uid === myUser?.uid || myUser?.is_admin;

  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const changedUsername = user.username !== original.username;

  const api = useApi();
  const dispatch = useRootDispatch();
  const [savingUsername, setSavingUsername] = useState(false);

  function editUsername(e: React.MouseEvent) {
    setIsEditingUsername(true);
    e.stopPropagation();
  }
  function resetUsername() {
    setIsEditingUsername(false);
    mutateUser(u => (u.username = original.username));
  }
  async function saveUsername() {
    if (savingUsername || user.username.length < 1 || user.username.length > 64) return;
    try {
      setSavingUsername(true);

      const diff = { id: user.id, username: user.username };
      const response = await fetch(`${location.origin}/api/update_user`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(diff),
      });
      const newUser = (await response.json()) as RestUser;

      dispatch(upsertUser(newUser));
      mutateUser(r => Object.assign(r, newUser));
      setIsEditingUsername(false);
    } catch (error) {
      console.error(error);
    } finally {
      setSavingUsername(false);
    }
  }

  return (
    <>
      <div className={styles.usernameContainer} data-tooltip-id="username">
        <div className={styles.username}>{user.username}</div>
        {canEdit && !isEditingUsername && <IconButton type="edit" size={16} onClick={editUsername} />}
      </div>

      <Tooltip
        id="username"
        isOpen={isEditingUsername}
        setIsOpen={v => v || resetUsername()}
        openOnClick
        clickable
        place="bottom"
        render={() => (
          <div className={styles.usernameInput}>
            <TextInput
              value={user.username}
              onChange={v => mutateUser(u => (u.username = v))}
              error={(() => {
                if (user.username.length < 1) return "The username must not be empty.";
                if (user.username.length > 64) return "The username must not exceed 64 characters.";
                return null;
              })()}
            />
            <IconButton
              type={savingUsername ? "loading" : "save"}
              size={32}
              disabled={savingUsername || !changedUsername}
              onClick={saveUsername}
            />
          </div>
        )}
      />
    </>
  );
}

function BadgesSection() {
  const { user, original, mutateUser } = useUserPageContext();
  const session = useSupabaseSession();

  const badgeContext = new BadgeContext(user.uid === session?.user.id);

  return (
    <>
      <label>{"Badges"}</label>
      <Separator full />
      <div className={styles.badgesContainer}>
        {user.badges?.map(({ badge_name }) => {
          return (
            <div key={badge_name}>
              <IconButton data-tooltip-id={badge_name} disabled="fake">
                <Sprite src={`/badges/${badge_name}.png`} size={32} alpha={1} crisp />
              </IconButton>
              <Tooltip
                id={badge_name}
                delayShow={100}
                place="bottom"
                style={{ ["--rt-opacity" as string]: 1 }}
                render={() => (
                  <div className={styles.badgeInfo}>
                    <span className={styles.badgeTitle}>{badgeNames[badge_name]?.()}</span>
                    <Separator primary />
                    <Sprite src={`/badges/${badge_name}.png`} size={128} alpha={1} crisp />
                    <Separator primary />
                    <div className={styles.badgeDescription}>{badgeDescriptions[badge_name]?.(badgeContext)}</div>
                  </div>
                )}
              />
            </div>
          );
        })}
      </div>
    </>
  );
}

function MiscellaneousSection() {
  return (
    <>
      <label>{"Miscellaneous"}</label>
    </>
  );
}
