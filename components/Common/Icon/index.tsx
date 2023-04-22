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
  checkSmall: "/icons/checkSmall.png",
  crossSmall: "/icons/crossSmall.png",
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
