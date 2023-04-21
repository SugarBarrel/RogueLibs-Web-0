import Sprite, { SpriteProps } from "../Sprite";

export type IconProps = Omit<SpriteProps, "src"> & {
  type: IconType;
};
export default function Icon({ type, ...props }: IconProps) {
  return <Sprite src={IconPaths[type]} crisp {...props} />;
}

export const IconPaths = {
  loading: "/icons/loading.gif",
  check: "/icons/check.png",
  cross: "/icons/cross.png",
  visibility: "/icons/visibility.png",
  visibilityOff: "/icons/visibilityOff.png",
  nugget: "/icons/nugget.png",
  upload: "/icons/upload.png",
  download: "/icons/download.png",
  discord: "/icons/discord.png",
  copy: "/icons/copy.png",
  edit: "/icons/edit.png",
  save: "/icons/save.png",
  link: "/icons/link.png",
  door: "/icons/door.png",
  undo: "/icons/undo.png",
  add: "/icons/add.png",
} as const;

export type IconType = keyof typeof IconPaths;

export function MakeIcon(type: IconType) {
  const src = IconPaths[type];
  return function Icon(props: Omit<SpriteProps, "src">) {
    return <Sprite src={src} crisp {...props} />;
  };
}

export const LoadingIcon = MakeIcon("loading");
export const CheckIcon = MakeIcon("check");
export const CrossIcon = MakeIcon("cross");
export const VisibilityIcon = MakeIcon("visibility");
export const VisibilityOffIcon = MakeIcon("visibilityOff");
export const NuggetIcon = MakeIcon("nugget");
export const UploadIcon = MakeIcon("upload");
export const DownloadIcon = MakeIcon("download");
export const DiscordIcon = MakeIcon("discord");
export const CopyIcon = MakeIcon("copy");
export const EditIcon = MakeIcon("edit");
export const SaveIcon = MakeIcon("save");
export const LinkIcon = MakeIcon("link");
export const DoorIcon = MakeIcon("door");
export const UndoIcon = MakeIcon("undo");
export const AddIcon = MakeIcon("add");
