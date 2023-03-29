import styles from "./index.module.scss";
import ReleasePageHeader from "./Header";
import ReleasePageBody from "./Body";
import ReleasePageSidebar from "./Sidebar";
import { createContext, useContext } from "react";
import { StoreRelease } from "@ducks/releases";

export type ReleasePageProps = {
  release: StoreRelease;
};
export type ReleasePageContext = Required<ReleasePageProps>;
const ReleasePageContext = createContext<ReleasePageContext>(null!);
export function useReleasePageContext() {
  return useContext(ReleasePageContext);
}

export default function ReleasePage({ release }: ReleasePageProps) {
  const context: ReleasePageContext = { release };

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
