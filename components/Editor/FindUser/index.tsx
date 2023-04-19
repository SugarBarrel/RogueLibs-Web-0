import { Button, Popup, TextInput, Separator, Avatar, PopupProps } from "@components/Common";
import { useApi, UserSearchResult } from "@lib/API";
import { DbUser } from "@lib/Database";
import { useThrottle } from "@lib/hooks";
import { useId, useState } from "react";
import styles from "./index.module.scss";

export type FindUserProps = React.PropsWithChildren<{
  term: [string, (newTerm: string) => void];
  className?: string;
  disabled?: (user: DbUser) => boolean;
  onClick?: (user: DbUser) => void;
}> &
  Omit<PopupProps, "id" | "open" | "render">;

export default function FindUser({
  className,
  term: [term, setTerm],
  disabled,
  onClick,
  children,
  ...popupProps
}: FindUserProps) {
  const api = useApi();

  const id = useId();
  const [isOpen, setIsOpen] = useState(false);
  const [searching, setSearching] = useState(false);
  const [searchResultTerm, setSearchResultTerm] = useState("");
  const [searchResults, setSearchResults] = useState<UserSearchResult[]>([]);

  useThrottle(() => {
    const ac = new AbortController();

    if (term.trim()) {
      (async () => {
        try {
          setSearching(true);
          const data = await api.searchUsers(term.trim(), 4, ac.signal);
          setSearchResults(data);
          setSearchResultTerm(term);
        } catch (err) {
        } finally {
          setSearching(false);
        }
      })();
    } else {
      setSearchResults([]);
    }

    return () => ac.abort();
  }, [500, term]);

  function openSearch() {
    if (isOpen) return;
    setTerm("");
    setIsOpen(true);
  }

  return (
    <>
      <Button data-tooltip-id={id} className={className} onClick={openSearch}>
        {children}
      </Button>
      <Popup
        id={id}
        open={[isOpen, setIsOpen]}
        render={() => (
          <div className={styles.search}>
            <TextInput value={term} onChange={setTerm} />
            <Separator bold />
            <div className={styles.results}>
              {searchResults.length === 0 && (
                <span className={styles.noResults}>
                  {term.length === 0
                    ? "Start searching!"
                    : searching || term != searchResultTerm
                    ? "Searching..."
                    : "No results :("}
                </span>
              )}
              {searchResults.map(user => (
                <Button
                  key={user.id}
                  className={styles.result}
                  disabled={disabled?.(user)}
                  onClick={() => onClick?.(user)}
                >
                  <Avatar src={user.avatar_url} size={32} />
                  {user.username}
                </Button>
              ))}
            </div>
          </div>
        )}
        {...popupProps}
      />
    </>
  );
}
