import { useCallback, useMemo, useState } from "react";
import { Button, DragHandle, Icon, IconButton, Popup, TextInput } from "@components/Common";
import { triggerDownload, useApi } from "@lib/API";
import { useReleasePageContext } from "..";
import { DragDropContext, Draggable, Droppable, OnDragEndResponder } from "@hello-pangea/dnd";
import { DbReleaseFile, DbReleaseFileType } from "@lib/Database";
import { reorder } from "@lib/index";
import styles from "./Download.module.scss";
import { Draft } from "immer";

export default function ReleasePageDownload() {
  const { release } = useReleasePageContext();

  return (
    <div className={styles.container}>
      <label>{release.files.length === 1 ? "Download" : "Downloads"}</label>
      <DownloadList />
    </div>
  );
}

export function DownloadList() {
  const { release, mutateRelease, isEditing } = useReleasePageContext();
  const [loadingFile, setLoadingFile] = useState<string | null>(null);
  const api = useApi();

  const files = useMemo(() => {
    return release.files.slice().sort((a, b) => a.order - b.order);
  }, [release.files]);

  async function download(file: DbReleaseFile) {
    try {
      setLoadingFile(file.filename);
      const blob = await api.downloadReleaseFile(`${release.mod_id}.${release.id}.${file.filename}`);
      triggerDownload(document, blob!, file.filename);
    } catch (error) {
      console.error(error);
    } finally {
      setTimeout(() => setLoadingFile(null), 500);
    }
  }

  const onDragEnd = useCallback<OnDragEndResponder>(
    e => mutateRelease(r => (r.files = reorder(e, files, "order"))),
    [files],
  );

  return (
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
                isLoading={loadingFile == f.filename}
              />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
}

export interface DownloadProps {
  file: DbReleaseFile;
  index: number;
  onDownload: (file: DbReleaseFile) => void;
  isLoading: boolean;
}
export function Download({ file, index, onDownload, isLoading }: DownloadProps) {
  const { release, mutateRelease, isEditing } = useReleasePageContext();

  const id = "file-" + file.filename;
  const [editorOpen, setEditorOpen] = useState(false);

  function mutateFile(recipe: (draft: Draft<DbReleaseFile>) => void) {
    mutateRelease(release => {
      recipe(release.files.find(f => f.filename === file.filename)!);
    });
  }
  function removeFile() {
    mutateRelease(release => {
      release.files = release.files.filter(f => f.filename !== file.filename);
    });
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
      <Draggable draggableId={id} index={index} disableInteractiveElementBlocking isDragDisabled={!isEditing}>
        {provided => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            className={styles.downloadWrapper}
            data-tooltip-id={id}
          >
            {isEditing && <DragHandle />}
            <div className={styles.download}>
              <Button className={className} onClick={() => onDownload(file)}>
                <Icon type={isLoading ? "loading" : "download"} size={24} />
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
        <Popup
          id={id}
          place="left"
          open={[editorOpen, setEditorOpen]}
          render={() => (
            <div>
              <label>{"Title"}</label>
              <TextInput
                value={file.title}
                onChange={v => mutateFile(f => (f.title = v || null))}
                placeholder={file.filename}
              />
              <label>{"Tooltip"}</label>
              <TextInput
                value={file.tooltip}
                onChange={v => mutateFile(f => (f.tooltip = v || null))}
                placeholder={"Not specified"}
              />
            </div>
          )}
        />
      )}
    </>
  );
}
