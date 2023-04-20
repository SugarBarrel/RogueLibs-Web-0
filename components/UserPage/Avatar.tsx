import { Avatar, IconButton, Tooltip } from "@components/Common";
import { useUser } from "@lib/hooks";
import { useSupabaseSession } from "@lib/index";
import { useUserPageContext } from ".";
import styles from "./Avatar.module.scss";

export default function UserPageAvatar() {
  const { user } = useUserPageContext();

  const session = useSupabaseSession();
  const myUser = useUser(session?.user.id)[0];
  const canEdit = user.uid === myUser?.uid || myUser?.is_admin;

  return (
    <div className={styles.wrapper}>
      <Avatar src={user.avatar_url} size="100%">
        {canEdit && (
          <IconButton
            data-tooltip-id="upload-avatar"
            type="upload"
            size={64}
            style={{ width: "100%", height: "100%" }}
          />
        )}
      </Avatar>
      {canEdit && <Tooltip id="upload-avatar" content="Upload avatar" place="bottom" />}
    </div>
  );
}
