import { useState } from "react";
import styles from "./styles.module.scss";
import { Icon, Button } from "@components/Common";
import { useSession as useSupabaseSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { useUser } from "@lib/hooks";

export default function AccountPanel() {
  const [authorizing, setAuthorizing] = useState(false);
  const session = useSupabaseSession();
  const supabase = useSupabaseClient();

  const [user] = useUser(session?.user.id);

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
            <img className={styles.avatar} src={user?.avatar_url ?? undefined} />
            <Button title="Sign out" onClick={signOut} disabled={authorizing}>
              <Icon type={authorizing ? "loading" : "cross"} size={16} />
            </Button>
            {/* <span className={styles.signOutTooltip}>Sign Out</span> */}
          </div>
        </div>
      ) : (
        <Button onClick={signIn} disabled={authorizing}>
          <Icon type={authorizing ? "loading" : "discord"} size={24} />
          {"Sign In with Discord"}
        </Button>
      )}
    </div>
  );
}
