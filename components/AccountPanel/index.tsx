import { useEffect, useState } from "react";
import styles from "./styles.module.scss";
import { CrossIcon, DiscordIcon } from "@components/Common/Icon";
import { Button } from "@components/Common";
import { useSession as useSupabaseSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { DbUser } from "@lib/Database";

export default function AccountPanel() {
  const [loading, setLoading] = useState(false);
  const session = useSupabaseSession();
  const supabase = useSupabaseClient();

  const [username, setUsername] = useState<string | null>(null);
  const [avatar_url, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    if (session) {
      loadProfile();
    }
  }, [session]);

  async function loadProfile() {
    try {
      setLoading(true);

      const { data, error, status } = await supabase.from("users").select<"*", DbUser>("*").eq("id", session?.user.id).single();
      if (error && status !== 406) throw error;

      if (data) {
        setUsername(data.username);
        setAvatarUrl(data.avatar_url);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }
  async function signIn() {
    try {
      setLoading(true);
      const url = location.origin + location.pathname;

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "discord",
        options: { redirectTo: url },
      });

      if (error) throw new Error(error.message);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }
  async function signOut() {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw new Error(error.message);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.container}>
      {session ? (
        <div className={styles.wrapper}>
          <div className={styles.account}>
            <img className={styles.avatar} src={avatar_url ?? undefined} />
            <Button type="icon" title="Sign out" onClick={signOut}>
              <CrossIcon size={16} />
            </Button>
            {/* <span className={styles.signOutTooltip}>Sign Out</span> */}
          </div>
        </div>
      ) : (
        <Button onClick={signIn} size="medium">
          <DiscordIcon size={24} />
          {"Sign In with Discord"}
        </Button>
      )}
    </div>
  );
}
