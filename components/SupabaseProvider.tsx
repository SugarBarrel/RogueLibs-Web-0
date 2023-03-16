import { createBrowserSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { SessionContextProvider } from "@supabase/auth-helpers-react";
import { Session } from "@supabase/gotrue-js";
import { useState } from "react";

export type SupabaseProviderProps = {
  initialSession: Session;
};
export function SupabaseProvider({ initialSession, children }: React.PropsWithChildren<SupabaseProviderProps>) {
  const [supabaseClient] = useState(() => createBrowserSupabaseClient());

  return (
    <SessionContextProvider supabaseClient={supabaseClient} initialSession={initialSession}>
      {children}
    </SessionContextProvider>
  );
}
