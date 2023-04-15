import { Avatar, IconButton } from "@components/Common";
import { useSupabaseSession } from "@lib/index";
import { Tooltip } from "react-tooltip";
import { useUserPageContext } from ".";
import styles from "./Avatar.module.scss";

export default function UserPageAvatar() {
  const { user } = useUserPageContext();

  const session = useSupabaseSession();
  const isMe = user.uid === session?.user.id;

  return (
    <div className={styles.wrapper}>
      <Avatar data-tooltip-id="upload-avatar" src={user.avatar_url} size="100%">
        {isMe && <IconButton type="upload" size={64} style={{ width: "100%", height: "100%" }} />}
      </Avatar>
      {isMe && <Tooltip id="upload-avatar" content="Upload avatar" place="bottom" />}
    </div>
  );
}
