import { StoreUser } from "@ducks/users";
import { ImmerStateSetter, useImmerState, useUser } from "@lib/hooks";
import { createContext, Dispatch, SetStateAction, useContext, useMemo, useState } from "react";
import UserPageAvatar from "./Avatar";
import UserPageDetails from "./Details";
import UserPageExtra from "./Extra";
import UserPageFavourites from "./Favourites";
import styles from "./index.module.scss";
import UserPageMods from "./Mods";

export type UserPageContext = {
  user: StoreUser;
  original: StoreUser;
  mutateUser: ImmerStateSetter<StoreUser>;
  isEditing: boolean;
  setIsEditing: Dispatch<SetStateAction<boolean>>;
};
const UserPageContext = createContext<UserPageContext>(null!);
export function useUserPageContext() {
  return useContext(UserPageContext);
}

export type UserPageProps = {
  user: StoreUser;
};
export default function UserPage({ user: initial }: UserPageProps) {
  const [user, mutateUser] = useImmerState(initial);
  const original = useUser(initial.id)[0] ?? initial;
  const [isEditing, setIsEditing] = useState(false);

  const context = useMemo(() => ({ original, user, mutateUser, isEditing, setIsEditing }), [user, original, isEditing]);

  return (
    <UserPageContext.Provider value={context}>
      <div className={styles.container}>
        <UserPageAvatar />
        <UserPageDetails />
        <UserPageExtra />
        <UserPageMods />
        <UserPageFavourites />
      </div>
    </UserPageContext.Provider>
  );
}
