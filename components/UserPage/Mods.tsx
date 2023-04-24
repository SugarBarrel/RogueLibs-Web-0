import { Button, Icon, Popup } from "@components/Common";
import { useUserPageContext } from ".";
import styles from "./Mods.module.scss";
import { useId, useState } from "react";
import { useRouter } from "next/router";
import { RestMod } from "@lib/API";

export default function UserPageMods() {
  const { isMe } = useUserPageContext();
  const id = useId();
  const popupState = useState(false);
  const [creating, setCreating] = useState(false);
  const router = useRouter();

  async function createMod() {
    if (creating) return;
    try {
      setCreating(true);

      const response = await fetch(`${location.origin}/api/create_mod`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      const newMod = (await response.json()) as RestMod;
      router.push(`/mods/${newMod.slug ?? newMod.id}`);
    } catch (error) {
      console.error(error);
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className={styles.wrapper}>
      {isMe && (
        <>
          <Button data-tooltip-id={id} onClick={() => popupState[1](true)}>
            <Icon type="add" />
            {"Create a new mod"}
          </Button>
          <Popup id={id} open={popupState} place="bottom">
            {() => (
              <div className={styles.createModPopup}>
                {"Are you sure you want to create a new mod?"}
                <Button onClick={createMod}>
                  <Icon type="add" />
                  {"Yes, I'm sure"}
                </Button>
              </div>
            )}
          </Popup>
        </>
      )}
    </div>
  );
}
