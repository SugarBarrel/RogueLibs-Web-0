import styles from "./index.module.scss";
import ModPageHeader from "./Header";
import ModPageBody from "./Body";
import ModPageSidebar from "./Sidebar";
import { createContext, Dispatch, SetStateAction, useContext, useMemo, useState } from "react";
import { StoreRelease } from "@ducks/releases";
import { ImmerStateSetter, useImmerState, useMod } from "@lib/hooks";
import { StoreMod } from "@ducks/mods";

export type ModPageContext = {
  mod: StoreMod;
  original: StoreMod;
  mutateMod: ImmerStateSetter<StoreMod>;
  releases: StoreRelease[];
  isEditing: boolean;
  setIsEditing: Dispatch<SetStateAction<boolean>>;
  hasChanges: boolean;
  setHasChanges: Dispatch<SetStateAction<boolean>>;
};
const ModPageContext = createContext<ModPageContext>(null!);

export function useModPageContext() {
  return useContext(ModPageContext);
}

export type ModPageProps = {
  mod: StoreMod;
  releases: StoreRelease[];
};
export default function ModPage({ mod: initial, releases }: ModPageProps) {
  const [mod, mutateMod] = useImmerState(initial);
  const original = useMod(initial.id)[0] ?? initial;
  const [isEditing, setIsEditing] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const context = useMemo(
    () => ({ mod, mutateMod, original, releases, isEditing, setIsEditing, hasChanges, setHasChanges }),
    [mod, original, releases, isEditing, hasChanges],
  );

  return (
    <ModPageContext.Provider value={context}>
      <div className={styles.container}>
        <ModPageHeader />
        <div className={styles.inner}>
          <ModPageBody />
          <ModPageSidebar />
        </div>
      </div>
    </ModPageContext.Provider>
  );
}
