import clsx from "clsx";
import Sprite, { SpriteProps } from "../Sprite";
import styles from "./index.module.scss";

export type IconProps = Omit<SpriteProps, "src"> & {
  type: IconType;
};
export default function Icon({ type, ...props }: IconProps) {
  return <Sprite src={IconPaths[type]} crisp {...props} />;
}
export type MultiIconProps = Omit<SpriteProps, "src"> & {
  types: IconType[];
  column?: boolean;
};
export function MultiIcon({ types, column, ...props }: MultiIconProps) {
  return (
    <div className={clsx(styles.multiIcon, column && styles.column)}>
      {types.map(t => (
        <Sprite key={t} src={IconPaths[t]} crisp {...props} />
      ))}
    </div>
  );
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
  view_row: "/icons/row.png",
  view_card: "/icons/card.png",
  view_card_small: "/icons/cardSmall.png",
  view_row_small: "/icons/rowSmall.png",
} as const;

export type IconType = keyof typeof IconPaths;
