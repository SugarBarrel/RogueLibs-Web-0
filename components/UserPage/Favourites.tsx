import { Checkbox, IconType, MultiIcon } from "@components/Common";
import { useUserPageContext } from ".";
import { useState } from "react";
import { RestUser } from "@lib/API";
import { upsertUser } from "@ducks/users";
import { useRootDispatch } from "@ducks/index";
import styles from "./Favourites.module.scss";
import { DbUser } from "@lib/Database";

export default function UserPageFavourites() {
  const { user, mutateUser, canEdit } = useUserPageContext();

  const dispatch = useRootDispatch();
  const [savingPublicNuggets, setSavingPublicNuggets] = useState(false);

  function getCheckboxIcon(value: boolean) {
    const status: IconType = savingPublicNuggets ? "loading" : value ? "visibility" : "visibilityOff";
    return <MultiIcon types={["nugget", status]} size={16} />;
  }

  async function changePublicNuggets(newValue: boolean) {
    if (savingPublicNuggets) return;
    try {
      setSavingPublicNuggets(true);

      const diff: Partial<DbUser> = { id: user.id, public_nuggets: newValue };
      const response = await fetch(`${location.origin}/api/update_user`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(diff),
      });
      const newUser = (await response.json()) as RestUser;

      dispatch(upsertUser(newUser));
      mutateUser(r => Object.assign(r, newUser));
    } catch (error) {
      console.error(error);
    } finally {
      setSavingPublicNuggets(false);
    }
  }

  return (
    <div className={styles.wrapper}>
      {canEdit && (
        <div className={styles.publicNuggetsCheckbox}>
          <Checkbox
            checked={getCheckboxIcon}
            unchecked={getCheckboxIcon}
            value={user.public_nuggets}
            onChange={changePublicNuggets}
            disabled={savingPublicNuggets}
          >
            {user.public_nuggets ? "Everyone can see my nuggets" : "Only I can see my nuggets"}
          </Checkbox>
        </div>
      )}
    </div>
  );
}
