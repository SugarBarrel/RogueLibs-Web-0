import { useCallback, useMemo, useState } from "react";
import { Button, Icon } from "@components/Common";
import { triggerDownload, useApi } from "@lib/API";
import { useReleasePageContext } from "..";
import { DragDropContext, Draggable, Droppable, OnDragEndResponder } from "@hello-pangea/dnd";
import styles from "./Download.module.scss";
import { DbReleaseFile, DbReleaseFileType } from "@lib/Database";
import { reorder } from "@lib/index";

export default function ReleasePageDownload() {
  const { release, isEditing } = useReleasePageContext();

  return (
    <div className={styles.container}>
      <label>{release.files.length === 1 ? "Download" : "Downloads"}</label>
      <DownloadList canEdit={isEditing} />
    </div>
  );
}

export interface DownloadListProps {
  canEdit: boolean;
}
export function DownloadList({ canEdit }: DownloadListProps) {
  const { release, mutateRelease } = useReleasePageContext();
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
                canDrag={canEdit}
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
  canDrag: boolean;
  onDownload: (file: DbReleaseFile) => void;
  isLoading: boolean;
}
export function Download({ file, index, canDrag, onDownload, isLoading }: DownloadProps) {
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
    <Draggable
      draggableId={"file-" + file.filename}
      index={index}
      disableInteractiveElementBlocking
      isDragDisabled={!canDrag}
    >
      {provided => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={styles.download}
        >
          <Button className={className} onClick={() => onDownload(file)}>
            <Icon type={isLoading ? "loading" : "download"} size={24} />
            {file.title || file.filename}
          </Button>
          {file.tooltip && <div className={styles.tooltip}>{file.tooltip}</div>}
        </div>
      )}
    </Draggable>
  );
}
