import { useState } from "react";
import styles from "./styles.module.scss";
import { Avatar, Button, Icon, IconButton } from "@components/Common";
import { useSession as useSupabaseSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { useUser } from "@lib/hooks";
import { Tooltip } from "react-tooltip";
import { useRouter } from "next/router";

export default function AccountPanel() {
  const [authorizing, setAuthorizing] = useState(false);
  const session = useSupabaseSession();
  const supabase = useSupabaseClient();

  const [user] = useUser(session?.user.id);

  const router = useRouter();
  const profileLink = `/user/${user?.slug ?? user?.id}`;

  async function signIn() {
    try {
      setAuthorizing(true);

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "discord",
        options: { redirectTo: location.origin + location.pathname },
      });

      if (error) throw new Error(error.message);
    } catch (error) {
      console.error(error);
    } finally {
      setTimeout(() => setAuthorizing(false), 1000);
    }
  }
  async function signOut() {
    try {
      setAuthorizing(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw new Error(error.message);
    } catch (error) {
      console.error(error);
    } finally {
      setTimeout(() => setAuthorizing(false), 1000);
    }
  }

  return (
    <div className={styles.container}>
      {session ? (
        <div className={styles.wrapper}>
          <div className={styles.account}>
            <Avatar src={user?.avatar_url} href={router.asPath.startsWith(profileLink) ? undefined : profileLink} />
            <div className={styles.buttons}>
              <IconButton data-tooltip-id="sign-out" onClick={signOut} disabled={authorizing}>
                <Icon type={authorizing ? "loading" : "cross"} size={16} />
              </IconButton>
              <Tooltip id="sign-out" place="left">
                {"Sign out"}
              </Tooltip>
            </div>
          </div>
        </div>
      ) : (
        <Button onClick={signIn} disabled={authorizing}>
          <Icon type={authorizing ? "loading" : "discord"} />
          {"Sign In with Discord"}
        </Button>
      )}
    </div>
  );
}
