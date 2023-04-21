import { DragHandle, Avatar, IconButton, Popup, TextInput, Icon } from "@components/Common";
import { OnDragEndResponder, DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { DbMod, DbModAuthor, DbRelease, DbReleaseAuthor, DbUser } from "@lib/Database";
import { useMemo, useCallback, useState, createContext, useContext, useId } from "react";
import { ImmerStateRecipe, ImmerStateSetter, useUser } from "@lib/hooks";
import { reorder, useSupabaseSession } from "@lib/index";
import FindUser from "../FindUser";
import styles from "./index.module.scss";
import clsx from "clsx";

type DbAuthor = DbModAuthor | DbReleaseAuthor;

type AuthorsListContext = {
  listId: string;
  authors: DbAuthor[];
  mutateAuthors: ImmerStateSetter<DbAuthor[]>;
  isEditing: boolean;
  hasChanges: boolean;
  entity?: DbMod | DbRelease;
};
const AuthorsListContext = createContext<AuthorsListContext | null>(null);

export type AuthorsListProps = {
  authors: DbAuthor[];
  mutateAuthors?: ImmerStateSetter<DbAuthor[]>;
  isEditing?: boolean;
  hasChanges?: boolean;
  entity?: DbMod | DbRelease;
};

export default function AuthorsList({
  authors: unsorted,
  mutateAuthors = () => {},
  isEditing = false,
  hasChanges = false,
  entity,
}: AuthorsListProps) {
  const listId = useId();
  const authors = useMemo(() => unsorted.slice().sort((a, b) => a.order - b.order), [unsorted]);

  const context = useMemo<AuthorsListContext>(() => {
    return { listId, authors, mutateAuthors, isEditing, hasChanges, entity };
  }, [authors, mutateAuthors, isEditing, hasChanges, entity]);

  const onDragEnd = useCallback<OnDragEndResponder>(e => mutateAuthors?.(_ => reorder(e, authors, "order")), [authors]);

  return (
    <AuthorsListContext.Provider value={context}>
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="authors-list">
          {provided => (
            <div ref={provided.innerRef} {...provided.droppableProps} className={styles.authorList}>
              {authors.map((author, i) => (
                <Author author={author} index={i} key={author.user_id} />
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
      {isEditing && entity && <AddAuthor />}
    </AuthorsListContext.Provider>
  );
}

export type AuthorProps = {
  author: DbAuthor;
  index: number;
};
export function Author({ author, index }: AuthorProps) {
  const { listId, authors, mutateAuthors, isEditing, hasChanges } = useContext(AuthorsListContext)!;

  const user = useUser(author.user_id)[0];
  const itemId = `${listId}/${author.user_id}`;

  const [editorOpen, setEditorOpen] = useState(false);

  function mutateAuthor(recipe: ImmerStateRecipe<DbAuthor>) {
    mutateAuthors(authors => void recipe(authors.find(a => a.user_id === author.user_id)!));
  }
  function removeAuthor() {
    mutateAuthors(authors => authors.filter(a => a.user_id !== author.user_id));
  }

  const session = useSupabaseSession();
  const [myUser] = useUser(session?.user.id);

  const canEditPermissions = useMemo(() => {
    if (!myUser) return false;
    if (myUser.is_admin) return true;
    if (author.user_id === myUser.id) return false;

    const myAuthor = authors.find(a => a.user_id == myUser?.id);
    if (!myAuthor) return false;
    return myAuthor.is_creator || (!author.is_creator && !author.can_edit);
  }, [authors, author, myUser]);

  const canRemove = canEditPermissions || author.user_id === myUser?.id;

  return (
    <>
      <Draggable draggableId={itemId} index={index} disableInteractiveElementBlocking isDragDisabled={!isEditing}>
        {provided => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            className={styles.authorWrapper}
            data-tooltip-id={itemId}
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
        <Popup id={itemId} place="left" open={[editorOpen, setEditorOpen]}>
          {() => (
            <div>
              <label>{"Credit"}</label>
              <TextInput
                value={author.credit}
                onChange={v => mutateAuthor(a => void (a.credit = v || null))}
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
  const { authors, mutateAuthors, entity } = useContext(AuthorsListContext)!;
  const [term, setTerm] = useState("");

  function addAuthor(user: DbUser) {
    if (!entity) return;

    mutateAuthors(authors => {
      const newAuthor: DbAuthor = Object.assign(
        {
          user_id: user.id,
          is_creator: false,
          can_edit: false,
          can_see: false,
          credit: null,
          order: Math.max(-1, ...authors.map(a => a.order)) + 1,
        },
        "mod_id" in entity ? { release_id: entity.id } : { mod_id: entity.id },
      );
      return void authors.push(newAuthor);
    });
  }

  return (
    <FindUser
      className={styles.addAuthor}
      place="left"
      term={[term, setTerm]}
      disabled={u => authors.some(a => a.user_id === u.id)}
      onClick={addAuthor}
    >
      <Icon type="add" size={16} />
      {"Add an author"}
    </FindUser>
  );
}
