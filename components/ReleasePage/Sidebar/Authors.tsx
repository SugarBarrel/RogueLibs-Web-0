import { useThrottle, useUser } from "@lib/hooks";
import { useReleasePageContext } from "..";
import { useCallback, useMemo, useState } from "react";
import { DragDropContext, Draggable, Droppable, OnDragEndResponder } from "@hello-pangea/dnd";
import { DbModAuthor, DbReleaseAuthor, DbUser } from "@lib/Database";
import { reorder, useSupabaseSession } from "@lib/index";
import { Avatar, IconButton, TextInput, DragHandle, Button, Icon, Popup, Separator } from "@components/Common";
import { WritableDraft } from "immer/dist/internal";
import { useApi, UserSearchResult } from "@lib/API";
import styles from "./Authors.module.scss";
import clsx from "clsx";

export default function ReleasePageAuthors() {
  const { release } = useReleasePageContext();

  return (
    <div className={styles.container}>
      <label>{release.authors.length === 1 ? "Author" : "Authors"}</label>
      <AuthorList />
      <AddAuthor />
    </div>
  );
}

export function AuthorList() {
  const { release, mutateRelease } = useReleasePageContext();

  const authors = useMemo(() => {
    return release.authors.slice().sort((a, b) => a.order - b.order);
  }, [release.authors]);

  const onDragEnd = useCallback<OnDragEndResponder>(
    e => mutateRelease(r => (r.authors = reorder(e, authors, "order"))),
    [authors],
  );

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="authors-list">
        {provided => (
          <>
            <div ref={provided.innerRef} {...provided.droppableProps} className={styles.authorList}>
              {authors.map((author, i) => (
                <Author author={author} index={i} key={author.user_id} />
              ))}
              {provided.placeholder}
            </div>
          </>
        )}
      </Droppable>
    </DragDropContext>
  );
}

export type AuthorProps = {
  author: DbReleaseAuthor | DbModAuthor;
  index: number;
};
export function Author({ author, index }: AuthorProps) {
  const { release, isEditing, mutateRelease, hasChanges } = useReleasePageContext();

  const user = useUser(author.user_id)[0];
  const id = "author-" + author.user_id;

  const [editorOpen, setEditorOpen] = useState(false);

  function mutateAuthor(recipe: (draft: WritableDraft<DbReleaseAuthor | DbModAuthor>) => void) {
    mutateRelease(release => {
      recipe(release.authors.find(a => a.user_id === author.user_id)!);
    });
  }
  function removeAuthor() {
    mutateRelease(release => {
      release.authors = release.authors.filter(a => a.user_id !== author.user_id);
    });
  }

  const session = useSupabaseSession();
  const [myUser] = useUser(session?.user.id);

  const canEditPermissions = (() => {
    if (!myUser) return false;
    if (myUser.is_admin) return true;
    if (author.user_id === myUser.id) return false;

    const myAuthor = release.authors.find(a => a.user_id == myUser?.id);
    if (!myAuthor) return false;
    return myAuthor.is_creator || (!author.is_creator && !author.can_edit);
  })();

  const canRemove = canEditPermissions || author.user_id === myUser?.id;

  return (
    <>
      <Draggable draggableId={id} index={index} disableInteractiveElementBlocking isDragDisabled={!isEditing}>
        {provided => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            className={styles.authorWrapper}
            data-tooltip-id={id}
          >
            {isEditing && <DragHandle />}
            <div className={styles.author}>
              <Avatar src={user?.avatar_url} size={48} href={`/user/${user?.slug ?? user?.id}`} blank={hasChanges} />

              <div className={clsx(styles.userInfo, author.credit && styles.withCredits)}>
                <span className={styles.username}>{user?.username ?? "..."}</span>
                {author.credit && (
                  <div className={styles.credits}>
                    {author.credit.split("\n").map((line, i) => (
                      <p key={i}>{line}</p>
                    ))}
                  </div>
                )}
              </div>
            </div>
            {isEditing && (
              <div className={styles.authorEditControls}>
                <IconButton type="edit" size={16} onClick={() => setEditorOpen(true)} />
                <IconButton type="cross" size={16} disabled={!canRemove} onClick={removeAuthor} />
              </div>
            )}
          </div>
        )}
      </Draggable>
      {isEditing && (
        <Popup
          id={id}
          place="left"
          open={[editorOpen, setEditorOpen]}
          render={() => (
            <div>
              <label>{"Credit"}</label>
              <TextInput
                value={author.credit}
                onChange={v => mutateAuthor(a => (a.credit = v || null))}
                placeholder={"Not specified"}
              />
            </div>
          )}
        />
      )}
    </>
  );
}

export function AddAuthor() {
  const { release, isEditing, mutateRelease } = useReleasePageContext();

  const api = useApi();

  const [isOpen, setIsOpen] = useState(false);
  const [term, setTerm] = useState("");
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
  function addAuthor(user: DbUser) {
    mutateRelease(release => {
      const newAuthor: DbReleaseAuthor = {
        user_id: user.id,
        release_id: release.id,
        is_creator: false,
        can_edit: false,
        can_see: true,
        credit: null,
        order: Math.max(0, ...release.authors.map(a => a.order)) + 1,
      };
      release.authors.push(newAuthor);
    });
  }

  if (!isEditing) return null;

  return (
    <>
      <Button data-tooltip-id="author-add" className={styles.addAuthor} onClick={openSearch}>
        <Icon type="upload" size={16} />
        {"Add an author"}
      </Button>
      <Popup
        id="author-add"
        place="left"
        open={[isOpen, setIsOpen]}
        render={() => (
          <div className={styles.authorSearch}>
            <TextInput value={term} onChange={setTerm} />
            <Separator bold />
            <div className={styles.authorSearchResults}>
              {searchResults.length === 0 && (
                <span className={styles.authorSearchNoResults}>
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
                  className={styles.authorSearchResult}
                  disabled={release.authors.some(a => a.user_id === user.id)}
                  onClick={() => addAuthor(user)}
                >
                  <Avatar src={user.avatar_url} size={32} />
                  {user.username}
                </Button>
              ))}
            </div>
          </div>
        )}
      />
    </>
  );
}
