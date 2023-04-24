import { Avatar, IconButton, Tooltip } from "@components/Common";
import { useUserPageContext } from ".";
import styles from "./Avatar.module.scss";

export default function UserPageAvatar() {
  const { user, canEdit } = useUserPageContext();

  return (
    <div className={styles.wrapper}>
      <Avatar src={user.avatar_url} size="100%">
        {/* {canEdit && (
          <IconButton
            data-tooltip-id="upload-avatar"
            type="upload"
            size={64}
            style={{ width: "100%", height: "100%" }}
          />
        )} */}
      </Avatar>
      {/* {canEdit && <Tooltip id="upload-avatar" content="Upload avatar" place="bottom" />} */}
    </div>
  );
}
