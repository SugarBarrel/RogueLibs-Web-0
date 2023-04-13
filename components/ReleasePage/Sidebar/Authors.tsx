import { useUser } from "@lib/hooks";
import { useReleasePageContext } from "..";
import { useCallback, useMemo } from "react";
import { DragDropContext, Draggable, Droppable, OnDragEndResponder } from "@hello-pangea/dnd";
import { DbModAuthor, DbReleaseAuthor } from "@lib/Database";
import { reorder } from "@lib/index";
import styles from "./Authors.module.scss";
import clsx from "clsx";

export default function ReleasePageAuthors() {
  const { release } = useReleasePageContext();

  return (
    <div className={styles.container}>
      <label>{release.authors.length === 1 ? "Author" : "Authors"}</label>
      <AuthorList />
    </div>
  );
}

export function AuthorList() {
  const { release, mutateRelease, isEditing } = useReleasePageContext();

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
                <Author author={author} index={i} key={author.user_id} canDrag={isEditing} />
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
  canDrag: boolean;
};
export function Author({ author, canDrag, index }: AuthorProps) {
  const user = useUser(author.user_id)[0];

  return (
    <Draggable
      draggableId={"author-" + author.user_id}
      index={index}
      disableInteractiveElementBlocking
      isDragDisabled={!canDrag}
    >
      {provided => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={styles.author}
        >
          <img className={styles.avatar} src={user?.avatar_url ?? undefined} alt="" />
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
      )}
    </Draggable>
  );
}
