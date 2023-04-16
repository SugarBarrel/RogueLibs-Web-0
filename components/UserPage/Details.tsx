import { IconButton, TextInput } from "@components/Common";
import { useRootDispatch } from "@ducks/index";
import { upsertUser } from "@ducks/users";
import { RestUser, useApi } from "@lib/API";
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
  const isMe = user.uid === session?.user.id;

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
      await api.Supabase.from("users").update(diff).eq("id", user.id).single().throwOnError();
      const newUser = { ...original, ...diff } as RestUser;

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
        {isMe && !isEditingUsername && <IconButton type="edit" size={16} onClick={editUsername} />}
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
  return <></>;
}
function MiscellaneousSection() {
  return <></>;
}
