import { DragHandle, Button, Icon, IconButton, Popup, TextInput } from "@components/Common";
import { OnDragEndResponder, DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { useState, useMemo, useCallback, createContext, useId, useContext } from "react";
import { DbReleaseFile, DbReleaseFileType } from "@lib/Database";
import { ImmerStateRecipe, ImmerStateSetter } from "@lib/hooks";
import { useApi, triggerDownload } from "@lib/API";
import { reorder } from "@lib/index";
import styles from "./index.module.scss";

type DownloadsListContext = {
  listId: string;
  files: DbReleaseFile[];
  mutateFiles: ImmerStateSetter<DbReleaseFile[]>;
  isEditing: boolean;
  hasChanges: boolean;
};
const DownloadsListContext = createContext<DownloadsListContext | null>(null);

export type DownloadsListProps = {
  files: DbReleaseFile[];
  mutateFiles?: ImmerStateSetter<DbReleaseFile[]>;
  isEditing?: boolean;
  hasChanges?: boolean;
};

export default function DownloadsList({
  files: unsorted,
  mutateFiles = () => {},
  isEditing = false,
  hasChanges = false,
}: DownloadsListProps) {
  const listId = useId();
  const files = useMemo(() => unsorted.slice().sort((a, b) => a.order - b.order), [unsorted]);

  const api = useApi();
  const [loadingFile, setLoadingFile] = useState<string | null>(null);

  const context = useMemo<DownloadsListContext>(() => {
    return { listId, files, mutateFiles, isEditing, hasChanges };
  }, [files, mutateFiles, isEditing, hasChanges]);

  async function download(file: DbReleaseFile) {
    try {
      setLoadingFile(file.filename);
      const blob = await api.downloadReleaseFile(`${file.release_id}.${file.filename}`);
      triggerDownload(document, blob!, file.filename);
    } catch (error) {
      console.error(error);
    } finally {
      setTimeout(() => setLoadingFile(null), 500);
    }
  }

  const onDragEnd = useCallback<OnDragEndResponder>(e => mutateFiles(_ => reorder(e, files, "order")), [files]);

  return (
    <DownloadsListContext.Provider value={context}>
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="downloads-list">
          {provided => (
            <div ref={provided.innerRef} {...provided.droppableProps} className={styles.downloadList}>
              {files.map((f, i) => (
                <Download
                  file={f}
                  index={i}
                  key={f.filename}
                  onDownload={download}
                  loading={loadingFile == f.filename}
                />
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </DownloadsListContext.Provider>
  );
}

export interface DownloadProps {
  file: DbReleaseFile;
  index: number;
  onDownload: (file: DbReleaseFile) => void;
  loading: boolean;
}
export function Download({ file, index, onDownload, loading }: DownloadProps) {
  const { listId, mutateFiles, isEditing } = useContext(DownloadsListContext)!;

  const itemId = `${listId}/${file.filename}`;
  const [editorOpen, setEditorOpen] = useState(false);

  function mutateFile(recipe: ImmerStateRecipe<DbReleaseFile>) {
    mutateFiles(files => void recipe(files.find(f => f.filename === file.filename)!));
  }
  function removeFile() {
    mutateFiles(files => files.filter(f => f.filename !== file.filename));
  }

  const className = {
    [DbReleaseFileType.Unknown]: undefined,
    [DbReleaseFileType.Plugin]: styles.downloadMain,
    [DbReleaseFileType.PatcherPlugin]: styles.downloadMain,
    [DbReleaseFileType.CorePlugin]: styles.downloadMain,
    [DbReleaseFileType.SpritePack]: styles.downloadMain,
    [DbReleaseFileType.Documentation]: styles.downloadDocumentation,
    [DbReleaseFileType.Extra]: styles.downloadText,
  }[file.type];

  return (
    <>
      <Draggable draggableId={itemId} index={index} disableInteractiveElementBlocking isDragDisabled={!isEditing}>
        {provided => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            className={styles.downloadWrapper}
            data-tooltip-id={itemId}
          >
            {isEditing && <DragHandle />}
            <div className={styles.download}>
              <Button className={className} onClick={() => onDownload(file)}>
                <Icon type={loading ? "loading" : "download"} size={24} />
                {file.title || file.filename}
              </Button>
              {file.tooltip && <div className={styles.tooltip}>{file.tooltip}</div>}
            </div>
            {isEditing && (
              <div className={styles.downloadEditControls}>
                <IconButton type="edit" size={16} onClick={() => setEditorOpen(true)} />
                <IconButton type="cross" size={16} onClick={removeFile} />
              </div>
            )}
          </div>
        )}
      </Draggable>
      {isEditing && (
        <Popup id={itemId} place="left" open={[editorOpen, setEditorOpen]}>
          {() => (
            <div>
              <label>{"Title"}</label>
              <TextInput
                value={file.title}
                onChange={v => mutateFile(f => void (f.title = v || null))}
                placeholder={file.filename}
              />
              <label>{"Tooltip"}</label>
              <TextInput
                value={file.tooltip}
                onChange={v => mutateFile(f => void (f.tooltip = v || null))}
                placeholder={"Not specified"}
              />
            </div>
          )}
        </Popup>
      )}
    </>
  );
}
