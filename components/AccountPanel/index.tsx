import { useEffect, useState } from "react";
import styles from "./styles.module.scss";
import { DiscordIcon } from "@components/Common/Icon";
import { Button } from "@components/Common";
import { useSession as useSupabaseSession, useSupabaseClient } from "@supabase/auth-helpers-react";

export default function AccountPanel() {
  const [loading, setLoading] = useState(false);
  const session = useSupabaseSession();
  const supabase = useSupabaseClient();

  // const [username, setUsername] = useState(null);
  // const [avatar_url, setAvatarUrl] = useState(null);

  // useEffect(() => {
  //   loadProfile();
  // }, [session]);

  // async function loadProfile() {
  //   try {
  //     setLoading(true);

  //     const { data, error, status } = await supabase.from("users").select("*").eq("id", session?.user.id).single();
  //     if (error && status !== 406) throw error;

  //     if (data) {
  //       setUsername(data.username);
  //       setAvatarUrl(data.avatar_url);
  //     }
  //   } catch (error) {
  //     alert("Error loading user data!");
  //     console.log(error);
  //   } finally {
  //     setLoading(false);
  //   }
  // }
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
      alert(error.error_description || error.message);
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
      alert(error.error_description || error.message);
    } finally {
      setLoading(false);
    }
  }

  const metadata = session?.user?.user_metadata as any;

  return (
    <div className={styles.container}>
      {session ? (
        <div className={styles.wrapper}>
          <div className={styles.account}>
            <img className={styles.avatar} src={metadata.avatar_url ?? undefined} />
            <div className={styles.info}>
              <span>{metadata.name}</span>
              <Button className={styles.signOut} onClick={signOut} size="small">
                {"Sign out"}
              </Button>
            </div>
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
