import styles from "./index.module.scss";
import ReleasePageHeader from "./Header";
import ReleasePageBody from "./Body";
import ReleasePageSidebar from "./Sidebar";
import { createContext, Dispatch, SetStateAction, useContext, useMemo, useState } from "react";
import { StoreRelease } from "@ducks/releases";
import { ImmerStateSetter, useImmerState, useMod } from "@lib/hooks";
import { StoreMod } from "@ducks/mods";

export type ReleasePageProps = {
  release: StoreRelease;
};
export type ReleasePageContext = {
  release: StoreRelease;
  original: StoreRelease;
  mutateRelease: ImmerStateSetter<StoreRelease>;
  mod: StoreMod | null;
  isEditing: boolean;
  setIsEditing: Dispatch<SetStateAction<boolean>>;
};
const ReleasePageContext = createContext<ReleasePageContext>(null!);
export function useReleasePageContext() {
  return useContext(ReleasePageContext);
}

export default function ReleasePage({ release: original }: ReleasePageProps) {
  const [release, mutateRelease] = useImmerState(original);
  const mod = useMod(release?.mod_id)[0] ?? null;
  const [isEditing, setIsEditing] = useState(false);

  const context = useMemo(
    () => ({ original, release, mutateRelease, mod, isEditing, setIsEditing }),
    [release, isEditing],
  );

  return (
    <ReleasePageContext.Provider value={context}>
      <div className={styles.container}>
        <ReleasePageHeader />
        <div className={styles.inner}>
          <ReleasePageBody />
          <ReleasePageSidebar />
        </div>
      </div>
    </ReleasePageContext.Provider>
  );
}
