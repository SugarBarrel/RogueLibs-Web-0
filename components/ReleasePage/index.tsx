import styles from "./index.module.scss";
import ReleasePageHeader from "./Header";
import ReleasePageBody from "./Body";
import ReleasePageSidebar from "./Sidebar";
import { createContext, Dispatch, SetStateAction, useContext, useMemo, useState } from "react";
import { StoreRelease } from "@ducks/releases";
import { ImmerStateSetter, useImmerState } from "@lib/hooks";

export type ReleasePageProps = {
  release: StoreRelease;
};
export type ReleasePageContext = {
  release: StoreRelease;
  original: StoreRelease;
  mutateRelease: ImmerStateSetter<StoreRelease>;
  isEditing: boolean;
  setIsEditing: Dispatch<SetStateAction<boolean>>;
};
const ReleasePageContext = createContext<ReleasePageContext>(null!);
export function useReleasePageContext() {
  return useContext(ReleasePageContext);
}

export default function ReleasePage({ release: original }: ReleasePageProps) {
  const [release, mutateRelease] = useImmerState(original);
  const [isEditing, setIsEditing] = useState(false);

  const context = useMemo(() => ({ original, release, mutateRelease, isEditing, setIsEditing }), [release, isEditing]);

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
