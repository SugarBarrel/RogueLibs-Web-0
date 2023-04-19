import { useUser } from "@lib/hooks";
import { useReleasePageContext } from "..";
import { useCallback, useMemo, useState } from "react";
import { DragDropContext, Draggable, Droppable, OnDragEndResponder } from "@hello-pangea/dnd";
import { DbModAuthor, DbReleaseAuthor, DbUser } from "@lib/Database";
import { reorder, useSupabaseSession } from "@lib/index";
import { Avatar, IconButton, TextInput, DragHandle, Icon, Popup } from "@components/Common";
import { FindUser } from "@components/Editor";
import { Draft } from "immer";
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

  function mutateAuthor(recipe: (draft: Draft<DbReleaseAuthor | DbModAuthor>) => void) {
    mutateRelease(release => recipe(release.authors.find(a => a.user_id === author.user_id)!));
  }
  function removeAuthor() {
    mutateRelease(release => (release.authors = release.authors.filter(a => a.user_id !== author.user_id)));
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
        <Popup id={id} place="left" open={[editorOpen, setEditorOpen]}>
          {() => (
            <div>
              <label>{"Credit"}</label>
              <TextInput
                value={author.credit}
                onChange={v => mutateAuthor(a => (a.credit = v || null))}
                placeholder={"Not specified"}
              />
            </div>
          )}
        </Popup>
      )}
    </>
  );
}

export function AddAuthor() {
  const { release, isEditing, mutateRelease } = useReleasePageContext();
  const [term, setTerm] = useState("");

  function addAuthor(user: DbUser) {
    mutateRelease(release => {
      const newAuthor: DbReleaseAuthor = {
        user_id: user.id,
        release_id: release.id,
        is_creator: false,
        can_edit: false,
        can_see: true,
        credit: null,
        order: Math.max(-1, ...release.authors.map(a => a.order)) + 1,
      };
      release.authors.push(newAuthor);
    });
  }

  if (!isEditing) return null;

  return (
    <FindUser
      className={styles.addAuthor}
      place="left"
      term={[term, setTerm]}
      disabled={u => release.authors.some(a => a.user_id === u.id)}
      onClick={addAuthor}
    >
      <Icon type="upload" size={16} />
      {"Add an author"}
    </FindUser>
  );
}
